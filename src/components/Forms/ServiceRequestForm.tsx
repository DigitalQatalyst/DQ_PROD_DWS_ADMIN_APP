import React, { useCallback, useEffect, useMemo, useState, useRef, Component } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, flip, shift, size, useClick, useDismiss, useRole, useInteractions, FloatingFocusManager } from '@floating-ui/react';
import { ChevronLeft, ChevronRight, Save, Send, Upload, X, Check, AlertCircle, ChevronDown, ChevronUp, CheckCircle, Eye, EyeOff } from 'lucide-react';
// Types
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'checkbox-group' | 'radio' | 'switch' | 'date' | 'daterange' | 'time' | 'datetime' | 'file' | 'multi-file' | 'image-upload' | 'number' | 'email' | 'tel' | 'password' | 'address' | 'currency' | 'slider' | 'rating' | 'stepper' | 'lookup' | 'autocomplete' | 'tags' | 'signature' | 'consent';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    message?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    fileTypes?: string[];
    maxFileSize?: number;
    strength?: 'weak' | 'medium' | 'strong';
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
  globalOptionSet?: string;
  conditionalLogic?: {
    dependsOn: string;
    showWhen: string | string[];
  };
  defaultValue?: any;
  helperText?: string;
  currency?: string;
  searchEndpoint?: string;
}
export interface FormGroup {
  groupTitle: string;
  groupDescription?: string;
  fields: FormField[];
}
export interface FormStep {
  stepTitle: string;
  stepDescription?: string;
  groups: FormGroup[];
}
export interface FormSchema {
  formId: string;
  formTitle: string;
  formDescription?: string;
  multiStep: boolean;
  steps?: FormStep[];
  groups?: FormGroup[];
  submitEndpoint?: string;
  allowSaveAndContinue?: boolean;
  autoSaveInterval?: number;
}
export interface ServiceRequestFormProps {
  schema?: FormSchema;
  onSubmit?: (data: any) => Promise<void>;
  onSave?: (data: any) => Promise<void>;
  initialData?: any;
  userId?: string;
  'data-id'?: string;
  enablePersistence?: boolean;
  enableAutoSave?: boolean;
}
// Default schema for fallback
const DEFAULT_SCHEMA: FormSchema = {
  formId: 'default-service-request',
  formTitle: 'Service Request Form',
  formDescription: 'Please fill out this form to submit your service request.',
  multiStep: false,
  allowSaveAndContinue: true,
  groups: [{
    groupTitle: 'Contact Information',
    fields: [{
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      required: true
    }, {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
      required: true
    }, {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'your.email@example.com',
      required: true
    }, {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 123-4567'
    }]
  }, {
    groupTitle: 'Service Details',
    fields: [{
      id: 'serviceType',
      label: 'Service Type',
      type: 'select',
      placeholder: 'Select a service type',
      required: true,
      options: [{
        value: 'consultation',
        label: 'Business Consultation'
      }, {
        value: 'funding',
        label: 'Funding & Investment'
      }, {
        value: 'technical',
        label: 'Technical Support'
      }, {
        value: 'other',
        label: 'Other'
      }]
    }, {
      id: 'description',
      label: 'Service Description',
      type: 'textarea',
      placeholder: 'Please describe your service request in detail...',
      required: true,
      validation: {
        minLength: 10,
        maxLength: 1000
      }
    }, {
      id: 'priority',
      label: 'Priority Level',
      type: 'radio',
      required: true,
      options: [{
        value: 'low',
        label: 'Low - Within 1 week'
      }, {
        value: 'medium',
        label: 'Medium - Within 3 days'
      }, {
        value: 'high',
        label: 'High - Within 24 hours'
      }]
    }]
  }, {
    groupTitle: 'Additional Information',
    fields: [{
      id: 'attachments',
      label: 'Supporting Documents',
      type: 'file'
    }, {
      id: 'terms',
      label: 'I agree to the Terms of Service and Privacy Policy',
      type: 'consent',
      required: true
    }]
  }]
};
// Utility functions
const validateField = (field: FormField, value: any): string | null => {
  if (field.required && (!value || Array.isArray(value) && value.length === 0)) {
    return `${field.label} is required`;
  }
  if (!value) return null;
  if (field.validation) {
    const {
      pattern,
      message,
      minLength,
      maxLength,
      min,
      max
    } = field.validation;
    if (pattern && !new RegExp(pattern).test(value)) {
      return message || `${field.label} format is invalid`;
    }
    if (minLength && value.length < minLength) {
      return `${field.label} must be at least ${minLength} characters`;
    }
    if (maxLength && value.length > maxLength) {
      return `${field.label} must not exceed ${maxLength} characters`;
    }
    if (min !== undefined && Number(value) < min) {
      return `${field.label} must be at least ${min}`;
    }
    if (max !== undefined && Number(value) > max) {
      return `${field.label} must not exceed ${max}`;
    }
  }
  // Built-in validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
  }
  if (field.type === 'tel' && value) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
      return 'Please enter a valid phone number';
    }
  }
  return null;
};
const shouldShowSuccessState = (field: FormField): boolean => {
  const criticalFieldTypes = ['email', 'tel', 'password', 'file', 'multi-file', 'image-upload'];
  return criticalFieldTypes.includes(field.type);
};
const getPasswordStrength = (password: string) => {
  if (!password) return {
    score: 0,
    label: '',
    color: ''
  };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const strengthMap = {
    0: {
      label: '',
      color: ''
    },
    1: {
      label: 'Weak',
      color: 'text-red-600'
    },
    2: {
      label: 'Fair',
      color: 'text-orange-600'
    },
    3: {
      label: 'Good',
      color: 'text-blue-600'
    },
    4: {
      label: 'Strong',
      color: 'text-green-600'
    }
  };
  return {
    score,
    ...strengthMap[score as keyof typeof strengthMap]
  };
};
// Simple global options fallback
const getGlobalOptions = (optionSetId: string) => {
  const globalOptions: Record<string, Array<{
    value: string;
    label: string;
  }>> = {
    countries: [{
      value: 'ae',
      label: 'United Arab Emirates'
    }, {
      value: 'us',
      label: 'United States'
    }, {
      value: 'uk',
      label: 'United Kingdom'
    }, {
      value: 'ca',
      label: 'Canada'
    }, {
      value: 'au',
      label: 'Australia'
    }],
    serviceTypes: [{
      value: 'consultation',
      label: 'Business Consultation'
    }, {
      value: 'funding',
      label: 'Funding & Investment'
    }, {
      value: 'technical',
      label: 'Technical Support'
    }, {
      value: 'training',
      label: 'Training & Development'
    }, {
      value: 'other',
      label: 'Other'
    }],
    priorities: [{
      value: 'low',
      label: 'Low - Within 1 week'
    }, {
      value: 'medium',
      label: 'Medium - Within 3 days'
    }, {
      value: 'high',
      label: 'High - Within 24 hours'
    }, {
      value: 'urgent',
      label: 'Urgent - Same day'
    }],
    budgetRanges: [{
      value: 'under-5000',
      label: 'Under $5,000'
    }, {
      value: '5000-25000',
      label: '$5,000 - $25,000'
    }, {
      value: '25000-100000',
      label: '$25,000 - $100,000'
    }, {
      value: '100000-plus',
      label: '$100,000+'
    }],
    currencies: [{
      value: 'AED',
      label: 'UAE Dirham (AED)'
    }, {
      value: 'USD',
      label: 'US Dollar (USD)'
    }, {
      value: 'EUR',
      label: 'Euro (EUR)'
    }, {
      value: 'GBP',
      label: 'British Pound (GBP)'
    }]
  };
  return globalOptions[optionSetId] || [];
};
// Schema validation helper
const validateSchema = (schema: FormSchema | undefined): FormSchema => {
  if (!schema) {
    console.warn('ServiceRequestForm: No schema provided, using default schema');
    return DEFAULT_SCHEMA;
  }
  // Check required fields
  if (!schema.formId || !schema.formTitle) {
    console.warn('ServiceRequestForm: Invalid schema, missing required fields. Using default schema');
    return DEFAULT_SCHEMA;
  }
  // Validate groups/steps structure
  if (schema.multiStep) {
    if (!schema.steps || !Array.isArray(schema.steps) || schema.steps.length === 0) {
      console.warn('ServiceRequestForm: Multi-step schema missing valid steps. Using default schema');
      return DEFAULT_SCHEMA;
    }
    // Validate each step has groups with fields
    const hasValidSteps = schema.steps.every(step => step.groups && Array.isArray(step.groups) && step.groups.some(group => group.fields && Array.isArray(group.fields) && group.fields.length > 0));
    if (!hasValidSteps) {
      console.warn('ServiceRequestForm: Multi-step schema has invalid step structure. Using default schema');
      return DEFAULT_SCHEMA;
    }
  } else {
    if (!schema.groups || !Array.isArray(schema.groups) || schema.groups.length === 0) {
      console.warn('ServiceRequestForm: Single-step schema missing valid groups. Using default schema');
      return DEFAULT_SCHEMA;
    }
    // Validate each group has fields
    const hasValidGroups = schema.groups.some(group => group.fields && Array.isArray(group.fields) && group.fields.length > 0);
    if (!hasValidGroups) {
      console.warn('ServiceRequestForm: Single-step schema has no valid groups with fields. Using default schema');
      return DEFAULT_SCHEMA;
    }
  }
  return schema;
};
// Simplified Custom Select Component
const CustomSelect: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
  error?: boolean;
  success?: boolean;
}> = ({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option',
  error = false,
  success = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    refs,
    floatingStyles,
    context
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift(), size()],
    whileElementsMounted: autoUpdate
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, {
    role: 'listbox'
  });
  const {
    getReferenceProps,
    getFloatingProps
  } = useInteractions([click, dismiss, role]);
  const selectedOption = options.find(opt => opt.value === value);
  const getTriggerClasses = () => {
    const baseClasses = 'w-full h-11 px-4 bg-white border rounded-md transition-all duration-200 focus:outline-none focus:ring-2';
    if (error) return `${baseClasses} border-red-500 focus:ring-red-500`;
    if (success) return `${baseClasses} border-green-500 focus:ring-green-500`;
    return `${baseClasses} border-gray-300 hover:border-gray-400 focus:ring-blue-500`;
  };
  return <div className="relative">
      <button type="button" id={id} ref={refs.setReference} className={getTriggerClasses()} onBlur={onBlur} {...getReferenceProps()}>
        <div className="flex items-center justify-between h-full">
          <span className={`block truncate text-left ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {success && <Check className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />}
      {isOpen && createPortal(<FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} className="rounded-lg bg-white shadow-lg ring-1 ring-gray-200 z-50 max-h-80 overflow-auto" style={floatingStyles} {...getFloatingProps()}>
              {options.map(option => <div key={option.value} className={`px-3 py-2 text-sm cursor-pointer transition-colors ${option.value === value ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-100'}`} onClick={() => {
          onChange(option.value);
          setIsOpen(false);
        }}>
                  {option.label}
                </div>)}
            </div>
          </FloatingFocusManager>, document.body)}
    </div>;
};
// Form Field Component
const FormField: React.FC<{
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isVisible: boolean;
  onBlur?: () => void;
}> = ({
  field,
  value,
  onChange,
  error,
  isVisible,
  onBlur
}) => {
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  if (!isVisible) return null;
  const fieldOptions = useMemo(() => {
    if (field.globalOptionSet) {
      return getGlobalOptions(field.globalOptionSet);
    }
    return field.options || [];
  }, [field.globalOptionSet, field.options]);
  const getFieldClasses = () => {
    const baseClasses = 'w-full h-11 px-4 bg-white border rounded-md transition-all duration-200 focus:outline-none focus:ring-2';
    if (error) return `${baseClasses} border-red-500 focus:ring-red-500`;
    if (value && !error && hasBeenTouched && shouldShowSuccessState(field)) {
      return `${baseClasses} border-green-500 focus:ring-green-500`;
    }
    return `${baseClasses} border-gray-300 hover:border-gray-400 focus:ring-blue-500`;
  };
  const handleBlur = () => {
    setHasBeenTouched(true);
    onBlur?.();
  };
  const fieldId = `field-${field.id}`;
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return <div className="relative">
            <input id={fieldId} type={field.type} value={value || ''} onChange={e => onChange(e.target.value)} onBlur={handleBlur} placeholder={field.placeholder} className={getFieldClasses()} />
            {value && !error && hasBeenTouched && shouldShowSuccessState(field) && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />}
          </div>;
      case 'password':
        const strength = getPasswordStrength(value || '');
        return <div className="space-y-2">
            <div className="relative">
              <input id={fieldId} type={showPassword ? 'text' : 'password'} value={value || ''} onChange={e => onChange(e.target.value)} onBlur={handleBlur} placeholder={field.placeholder} className={getFieldClasses()} />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {value && !error && hasBeenTouched && shouldShowSuccessState(field) && <Check className="w-4 h-4 text-green-500" />}
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {value && strength.score > 0 && <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-300 ${strength.score === 1 ? 'bg-red-500' : strength.score === 2 ? 'bg-orange-500' : strength.score === 3 ? 'bg-blue-500' : 'bg-green-500'}`} style={{
                width: `${strength.score / 4 * 100}%`
              }} />
                </div>
                <span className={`text-sm font-medium ${strength.color}`}>
                  {strength.label}
                </span>
              </div>}
          </div>;
      case 'number':
        return <input id={fieldId} type="number" value={value || ''} onChange={e => onChange(e.target.value)} onBlur={handleBlur} placeholder={field.placeholder} min={field.validation?.min} max={field.validation?.max} step={field.validation?.step} className={getFieldClasses()} />;
      case 'textarea':
        return <div className="space-y-2">
            <textarea id={fieldId} value={value || ''} onChange={e => onChange(e.target.value)} onBlur={handleBlur} placeholder={field.placeholder} rows={4} className={getFieldClasses().replace('h-11', 'min-h-[100px] py-3')} />
            {field.validation?.maxLength && <div className="text-right text-xs text-gray-500">
                {(value || '').length}/{field.validation.maxLength}
              </div>}
          </div>;
      case 'select':
        return <CustomSelect id={fieldId} value={value || ''} onChange={onChange} onBlur={handleBlur} options={fieldOptions} placeholder={field.placeholder} error={!!error} success={value && !error && hasBeenTouched && shouldShowSuccessState(field)} />;
      case 'radio':
        return <div className="space-y-1">
            {fieldOptions.map(option => <div key={option.value} className="flex items-center gap-3 py-2">
                <input id={`${fieldId}-${option.value}`} type="radio" name={field.id} value={option.value} checked={value === option.value} onChange={e => onChange(e.target.value)} onBlur={handleBlur} className="h-4 w-4 text-blue-600" />
                <label htmlFor={`${fieldId}-${option.value}`} className="text-sm text-gray-900">
                  {option.label}
                </label>
              </div>)}
          </div>;
      case 'checkbox-group':
        const selectedValues = Array.isArray(value) ? value : [];
        return <div className="space-y-1">
            {fieldOptions.map(option => <div key={option.value} className="flex items-center gap-3 py-2">
                <input id={`${fieldId}-${option.value}`} type="checkbox" checked={selectedValues.includes(option.value)} onChange={e => {
              const newValues = e.target.checked ? [...selectedValues, option.value] : selectedValues.filter(v => v !== option.value);
              onChange(newValues);
            }} onBlur={handleBlur} className="h-4 w-4 text-blue-600" />
                <label htmlFor={`${fieldId}-${option.value}`} className="text-sm text-gray-900">
                  {option.label}
                </label>
              </div>)}
          </div>;
      case 'consent':
        return <div className="flex items-center gap-3 py-2">
            <input id={fieldId} type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} onBlur={handleBlur} className="h-4 w-4 text-blue-600" />
            <label htmlFor={fieldId} className="text-sm text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>;
      case 'date':
        return <input id={fieldId} type="date" value={value || ''} onChange={e => onChange(e.target.value)} onBlur={handleBlur} className={getFieldClasses()} />;
      case 'file':
      case 'image-upload':
        return <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                </div>
                <input id={fieldId} type="file" className="hidden" onChange={e => onChange(e.target.files?.[0] || null)} onBlur={handleBlur} />
              </label>
            </div>
            {value && <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm text-green-800 font-medium">
                    {value.name}
                  </span>
                </div>
                <button type="button" onClick={() => onChange(null)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>}
          </div>;
      default:
        return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Unsupported field type: {field.type}
            </p>
          </div>;
    }
  };
  return <div className="space-y-2">
      {!['checkbox', 'switch', 'consent'].includes(field.type) && <label htmlFor={fieldId} className="block text-sm font-semibold text-gray-900">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      {renderField()}
      {field.helperText && !error && <p className="text-xs text-gray-500">{field.helperText}</p>}
      {error && <p className="text-sm text-red-600" role="alert">
          {error}
        </p>}
    </div>;
};
// Progress Indicator
const ProgressIndicator: React.FC<{
  steps: FormStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepIndex: number) => void;
}> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}) => {
  const progressPercentage = (currentStep + 1) / steps.length * 100;
  return <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 mb-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300" style={{
          width: `${progressPercentage}%`
        }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => <div key={index} className="flex items-center flex-1">
            <div className="flex items-center">
              <button onClick={() => completedSteps.has(index) && onStepClick(index)} disabled={!completedSteps.has(index) && index !== currentStep} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${completedSteps.has(index) ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' : currentStep === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 cursor-not-allowed'}`}>
                {completedSteps.has(index) ? <Check className="w-5 h-5" /> : index + 1}
              </button>
              <div className="ml-4 hidden sm:block">
                <p className={`text-sm font-medium ${currentStep === index ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.stepTitle}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-6 transition-all duration-300 ${completedSteps.has(index) ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>)}
      </div>
    </div>;
};
// Error Summary
const ErrorSummary: React.FC<{
  errors: Record<string, string>;
  onErrorClick: (fieldId: string) => void;
}> = ({
  errors,
  onErrorClick
}) => {
  const errorEntries = Object.entries(errors);
  if (errorEntries.length === 0) return null;
  return <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6" role="alert">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            Please correct {errorEntries.length} error
            {errorEntries.length !== 1 ? 's' : ''} to continue:
          </h3>
          <ul className="space-y-1">
            {errorEntries.map(([fieldId, error]) => <li key={fieldId}>
                <button type="button" onClick={() => onErrorClick(fieldId)} className="text-sm text-red-700 hover:text-red-900 underline hover:no-underline">
                  {error}
                </button>
              </li>)}
          </ul>
        </div>
      </div>
    </div>;
};
// Success State
const SuccessState: React.FC<{
  onClose?: () => void;
  referenceId?: string;
}> = ({
  onClose,
  referenceId
}) => {
  return <div className="text-center py-16">
      <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Request Submitted Successfully!
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Thank you for your submission. We've received your request and will get
        back to you within 24 hours.
      </p>
      {referenceId && <div className="bg-gray-50 rounded-lg p-4 mb-6 inline-block">
          <p className="text-sm text-gray-500 mb-1">Reference ID</p>
          <p className="font-mono text-lg font-semibold text-gray-900">
            {referenceId}
          </p>
        </div>}
      {onClose && <button onClick={onClose} className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Close
        </button>}
    </div>;
};
// Main ServiceRequestForm Component
export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  schema: providedSchema,
  onSubmit,
  onSave,
  initialData = {},
  'data-id': dataId,
  enablePersistence = false,
  enableAutoSave = false
}) => {
  // Validate and use schema with fallback
  const schema = useMemo(() => validateSchema(providedSchema), [providedSchema]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string>();
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const formRef = useRef<HTMLDivElement>(null);
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        const currentGroups = schema.multiStep ? schema.steps?.[currentStep]?.groups || [] : schema.groups || [];
        const initialCollapsed = new Set<number>();
        currentGroups.forEach((_, index) => {
          if (index > 0) initialCollapsed.add(index);
        });
        setCollapsedSections(initialCollapsed);
      } else {
        setCollapsedSections(new Set());
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [currentStep, schema]);
  // Initialize form data with default values
  useEffect(() => {
    const defaults: any = {};
    const allGroups = schema.multiStep ? schema.steps?.flatMap(step => step.groups) || [] : schema.groups || [];
    allGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.defaultValue !== undefined && !formData[field.id]) {
          defaults[field.id] = field.defaultValue;
        }
      });
    });
    if (Object.keys(defaults).length > 0) {
      setFormData(prev => ({
        ...defaults,
        ...prev
      }));
    }
  }, [schema, formData]);
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = {
          ...prev
        };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  }, [errors]);
  const handleFieldBlur = (fieldId: string) => {
    const allGroups = schema.multiStep ? schema.steps?.flatMap(step => step.groups) || [] : schema.groups || [];
    const field = allGroups.flatMap(group => group.fields).find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, formData[fieldId]);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [fieldId]: error
        }));
      }
    }
  };
  const validateStep = (stepIndex?: number): boolean => {
    const currentGroups = schema.multiStep ? schema.steps?.[stepIndex ?? currentStep]?.groups || [] : schema.groups || [];
    const stepErrors: Record<string, string> = {};
    let isValid = true;
    currentGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.conditionalLogic) {
          const {
            dependsOn,
            showWhen
          } = field.conditionalLogic;
          const dependentValue = formData[dependsOn];
          const isVisible = Array.isArray(showWhen) ? showWhen.includes(dependentValue) : dependentValue === showWhen;
          if (!isVisible) return;
        }
        const error = validateField(field, formData[field.id]);
        if (error) {
          stepErrors[field.id] = error;
          isValid = false;
        }
      });
    });
    setErrors(stepErrors);
    return isValid;
  };
  const handleNext = () => {
    if (validateStep()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
      formRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    formRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
      formRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleSaveAndClose = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };
  const toggleSection = (sectionIndex: number) => {
    setCollapsedSections(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(sectionIndex)) {
        newCollapsed.delete(sectionIndex);
      } else {
        newCollapsed.add(sectionIndex);
      }
      return newCollapsed;
    });
  };
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      const refId = `REQ-${Date.now().toString().slice(-6)}`;
      setReferenceId(refId);
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleErrorClick = (fieldId: string) => {
    const element = document.querySelector(`#field-${fieldId}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      setTimeout(() => (element as HTMLElement).focus(), 300);
    }
  };
  const currentGroups = schema.multiStep ? schema.steps?.[currentStep]?.groups || [] : schema.groups || [];
  const currentStepData = schema.multiStep ? schema.steps?.[currentStep] : null;
  const isLastStep = schema.multiStep ? currentStep === (schema.steps?.length || 1) - 1 : true;
  if (showSuccess) {
    return <div className="min-h-screen bg-gray-50" data-id={dataId}>
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <SuccessState onClose={() => setShowSuccess(false)} referenceId={referenceId} />
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50" ref={formRef} data-id={dataId}>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Progress Indicator for Multi-step */}
        {schema.multiStep && schema.steps && <ProgressIndicator steps={schema.steps} currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />}
        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Step Header for Multi-step */}
          {schema.multiStep && currentStepData && <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Step {currentStep + 1}: {currentStepData.stepTitle}
              </h1>
              {currentStepData.stepDescription && <p className="text-sm text-gray-600 mt-1">
                  {currentStepData.stepDescription}
                </p>}
            </div>}
          {/* Form Title for Single-step */}
          {!schema.multiStep && <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {schema.formTitle}
              </h1>
              {schema.formDescription && <p className="text-sm text-gray-600 mt-1">
                  {schema.formDescription}
                </p>}
            </div>}
          {/* Error Summary */}
          <ErrorSummary errors={errors} onErrorClick={handleErrorClick} />
          {/* Form Sections */}
          <div className="space-y-10">
            {currentGroups.map((group, index) => {
            const isCollapsed = isMobile && collapsedSections.has(index);
            return <div key={index} className="rounded-lg border border-gray-200 bg-white">
                  {/* Section Header */}
                  <div className="px-8 py-6 pb-0">
                    {isMobile ? <button type="button" onClick={() => toggleSection(index)} className="w-full flex items-center justify-between py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                        <h3 className="text-lg font-semibold text-blue-600">
                          {group.groupTitle}
                        </h3>
                        {isCollapsed ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-gray-500" />}
                      </button> : <h3 className="text-lg font-semibold text-blue-600 mb-4">
                        {group.groupTitle}
                      </h3>}
                  </div>
                  {/* Section Divider */}
                  <div className="px-8">
                    <div className="border-t border-gray-200 mt-2" />
                  </div>
                  {/* Fields */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-none opacity-100'}`}>
                    <div className="px-8 pb-6 mt-4 space-y-4">
                      {group.fields.map(field => {
                    const isVisible = field.conditionalLogic ? (() => {
                      const {
                        dependsOn,
                        showWhen
                      } = field.conditionalLogic;
                      const dependentValue = formData[dependsOn];
                      return Array.isArray(showWhen) ? showWhen.includes(dependentValue) : dependentValue === showWhen;
                    })() : true;
                    if (!isVisible) return null;
                    // Handle name fields with 2-column layout
                    const nextField = group.fields[group.fields.indexOf(field) + 1];
                    const isNextFieldLastName = nextField?.id === 'lastName';
                    if (field.id === 'firstName' && isNextFieldLastName) {
                      return <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <FormField field={field} value={formData[field.id]} onChange={value => handleFieldChange(field.id, value)} onBlur={() => handleFieldBlur(field.id)} error={errors[field.id]} isVisible={true} />
                              <FormField field={nextField} value={formData[nextField.id]} onChange={value => handleFieldChange(nextField.id, value)} onBlur={() => handleFieldBlur(nextField.id)} error={errors[nextField.id]} isVisible={true} />
                            </div>;
                    }
                    // Skip lastName if it was already rendered with firstName
                    if (field.id === 'lastName') {
                      const prevField = group.fields[group.fields.indexOf(field) - 1];
                      if (prevField?.id === 'firstName') return null;
                    }
                    return <FormField key={field.id} field={field} value={formData[field.id]} onChange={value => handleFieldChange(field.id, value)} onBlur={() => handleFieldBlur(field.id)} error={errors[field.id]} isVisible={true} />;
                  })}
                    </div>
                  </div>
                </div>;
          })}
          </div>
          {/* Form Actions Footer */}
          <div className="border-t border-gray-200 pt-8 mt-10">
            <div className={`flex gap-4 ${isMobile ? 'flex-col space-y-2' : 'flex-row justify-between items-center'}`}>
              {/* Secondary Actions */}
              <div className={`flex gap-3 ${isMobile ? 'flex-col space-y-2' : 'flex-row'}`}>
                {schema.multiStep && currentStep > 0 && <button type="button" onClick={handleBack} className={`inline-flex items-center justify-center min-h-12 px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${isMobile ? 'w-full' : 'w-full sm:w-auto'}`}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>}
                {schema.allowSaveAndContinue && <button type="button" onClick={handleSaveAndClose} disabled={isSaving} className={`inline-flex items-center justify-center min-h-12 px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isMobile ? 'w-full' : 'w-full sm:w-auto'}`}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save & Close'}
                  </button>}
              </div>
              {/* Primary Action */}
              <div className={isMobile ? 'order-first' : ''}>
                {isLastStep ? <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={`inline-flex items-center justify-center min-h-12 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-semibold text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm ${isMobile ? 'w-full' : 'w-full sm:w-auto'}`}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button> : <button type="button" onClick={handleNext} className={`inline-flex items-center justify-center min-h-12 px-6 py-3 bg-blue-600 text-base font-semibold text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm ${isMobile ? 'w-full' : 'w-full sm:w-auto'}`}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>}
              </div>
            </div>
          </div>
        </div>
        {/* Sticky Mobile Footer */}
        {isMobile && <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl z-50 space-y-2">
            {isLastStep ? <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full inline-flex items-center justify-center min-h-12 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-semibold text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm">
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button> : <button type="button" onClick={handleNext} className="w-full inline-flex items-center justify-center min-h-12 px-6 py-3 bg-blue-600 text-base font-semibold text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>}
            {schema.allowSaveAndContinue && <button type="button" onClick={handleSaveAndClose} disabled={isSaving} className="w-full inline-flex items-center justify-center min-h-12 px-4 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save & Close'}
              </button>}
          </div>}
      </div>
    </div>;
};