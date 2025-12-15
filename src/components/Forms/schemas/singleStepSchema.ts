import { FormSchema } from '../ServiceRequestForm';
export const generalServiceRequestSchema: FormSchema = {
  formId: 'general-service-request',
  formTitle: 'General Service Request',
  formDescription: 'Submit your service request and we will get back to you within 24 hours.',
  multiStep: false,
  allowSaveAndContinue: true,
  autoSaveInterval: 15000,
  // Auto-save every 15 seconds
  submitEndpoint: '/api/service-requests',
  groups: [{
    groupTitle: 'Contact Information',
    groupDescription: 'Please provide your contact details so we can reach you.',
    fields: [{
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      validation: {
        minLength: 2,
        message: 'First name must be at least 2 characters'
      }
    }, {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
      validation: {
        minLength: 2,
        message: 'Last name must be at least 2 characters'
      }
    }, {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'your.email@example.com'
    }, {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+971 50 123 4567'
    }, {
      id: 'country',
      label: 'Country',
      type: 'select',
      placeholder: 'Select your country',
      globalOptionSet: 'countries'
    }]
  }, {
    groupTitle: 'Service Details',
    groupDescription: 'Tell us about the service you need.',
    fields: [{
      id: 'serviceType',
      label: 'Service Type',
      type: 'select',
      placeholder: 'Select a service type',
      globalOptionSet: 'serviceTypes'
    }, {
      id: 'customServiceType',
      label: 'Please specify',
      type: 'text',
      placeholder: 'Describe the service you need',
      conditionalLogic: {
        dependsOn: 'serviceType',
        showWhen: 'other'
      }
    }, {
      id: 'priority',
      label: 'Priority Level',
      type: 'radio',
      globalOptionSet: 'priorities'
    }, {
      id: 'description',
      label: 'Service Description',
      type: 'textarea',
      placeholder: 'Please provide detailed information about your service request...',
      validation: {
        minLength: 20,
        maxLength: 1000,
        message: 'Description must be between 20 and 1000 characters'
      }
    }, {
      id: 'preferredDate',
      label: 'Preferred Start Date',
      type: 'date'
    }]
  }, {
    groupTitle: 'Additional Information',
    fields: [{
      id: 'budget',
      label: 'Budget Range',
      type: 'select',
      placeholder: 'Select your budget range',
      globalOptionSet: 'budgetRanges'
    }, {
      id: 'currency',
      label: 'Preferred Currency',
      type: 'select',
      placeholder: 'Select currency',
      globalOptionSet: 'currencies',
      defaultValue: 'AED'
    }, {
      id: 'attachments',
      label: 'Supporting Documents',
      type: 'file'
    }, {
      id: 'newsletter',
      label: 'Subscribe to our newsletter for updates',
      type: 'checkbox',
      defaultValue: false
    }, {
      id: 'terms',
      label: 'I agree to the Terms of Service and Privacy Policy',
      type: 'consent',
      required: true
    }]
  }]
};