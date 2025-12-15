import { FormSchema } from '../ServiceRequestForm';
export const fundingApplicationSchema: FormSchema = {
  formId: 'funding-application',
  formTitle: 'Funding Application',
  formDescription: 'Complete this multi-step application to apply for business funding.',
  multiStep: true,
  allowSaveAndContinue: true,
  autoSaveInterval: 20000,
  // Auto-save every 20 seconds
  submitEndpoint: '/api/funding-applications',
  steps: [{
    stepTitle: 'Applicant Information',
    stepDescription: 'Tell us about yourself and your role in the business.',
    groups: [{
      groupTitle: 'Personal Details',
      fields: [{
        id: 'applicantFirstName',
        label: 'First Name',
        type: 'text',
        validation: {
          minLength: 2
        }
      }, {
        id: 'applicantLastName',
        label: 'Last Name',
        type: 'text',
        validation: {
          minLength: 2
        }
      }, {
        id: 'applicantEmail',
        label: 'Email Address',
        type: 'email'
      }, {
        id: 'applicantPhone',
        label: 'Phone Number',
        type: 'tel' // Fixed: changed from 'phone' to 'tel'
      }, {
        id: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date'
      }, {
        id: 'nationality',
        label: 'Nationality',
        type: 'select',
        globalOptionSet: 'countries' // Use global option set
      }]
    }, {
      groupTitle: 'Role & Experience',
      fields: [{
        id: 'roleInBusiness',
        label: 'Role in Business',
        type: 'select',
        options: [{
          value: 'owner',
          label: 'Owner/Founder'
        }, {
          value: 'ceo',
          label: 'CEO'
        }, {
          value: 'cfo',
          label: 'CFO'
        }, {
          value: 'partner',
          label: 'Partner'
        }, {
          value: 'other',
          label: 'Other'
        }]
      }, {
        id: 'yearsOfExperience',
        label: 'Years of Business Experience',
        type: 'number',
        validation: {
          min: 0,
          max: 50
        }
      }, {
        id: 'previousFunding',
        label: 'Have you received business funding before?',
        type: 'radio',
        options: [{
          value: 'yes',
          label: 'Yes'
        }, {
          value: 'no',
          label: 'No'
        }]
      }, {
        id: 'previousFundingDetails',
        label: 'Previous Funding Details',
        type: 'textarea',
        placeholder: 'Please describe your previous funding experience...',
        conditionalLogic: {
          dependsOn: 'previousFunding',
          showWhen: 'yes'
        }
      }]
    }]
  }, {
    stepTitle: 'Business Details',
    stepDescription: 'Provide information about your business and funding needs.',
    groups: [{
      groupTitle: 'Company Information',
      fields: [{
        id: 'companyName',
        label: 'Company Name',
        type: 'text',
        validation: {
          minLength: 2
        }
      }, {
        id: 'businessType',
        label: 'Business Type',
        type: 'select',
        globalOptionSet: 'businessTypes' // Use global option set
      }, {
        id: 'industry',
        label: 'Industry',
        type: 'select',
        globalOptionSet: 'industries' // Use global option set
      }, {
        id: 'yearEstablished',
        label: 'Year Established',
        type: 'number',
        validation: {
          min: 1900,
          max: new Date().getFullYear()
        }
      }, {
        id: 'numberOfEmployees',
        label: 'Number of Employees',
        type: 'select',
        globalOptionSet: 'companySize' // Use global option set
      }, {
        id: 'annualRevenue',
        label: 'Annual Revenue',
        type: 'select',
        options: [{
          value: 'under-50k',
          label: 'Under $50,000'
        }, {
          value: '50k-100k',
          label: '$50,000 - $100,000'
        }, {
          value: '100k-500k',
          label: '$100,000 - $500,000'
        }, {
          value: '500k-1m',
          label: '$500,000 - $1,000,000'
        }, {
          value: '1m-plus',
          label: '$1,000,000+'
        }]
      }, {
        id: 'operatingCountry',
        label: 'Primary Operating Country',
        type: 'select',
        globalOptionSet: 'countries' // Use global option set
      }]
    }, {
      groupTitle: 'Funding Requirements',
      fields: [{
        id: 'fundingAmount',
        label: 'Funding Amount Requested',
        type: 'currency',
        currency: 'USD',
        validation: {
          min: 1000,
          max: 10000000
        }
      }, {
        id: 'fundingCurrency',
        label: 'Preferred Currency',
        type: 'select',
        globalOptionSet: 'currencies',
        // Use global option set
        defaultValue: 'USD'
      }, {
        id: 'fundingPurpose',
        label: 'Purpose of Funding',
        type: 'checkbox-group',
        options: [{
          value: 'expansion',
          label: 'Business Expansion'
        }, {
          value: 'equipment',
          label: 'Equipment Purchase'
        }, {
          value: 'inventory',
          label: 'Inventory'
        }, {
          value: 'marketing',
          label: 'Marketing & Advertising'
        }, {
          value: 'working-capital',
          label: 'Working Capital'
        }, {
          value: 'debt-consolidation',
          label: 'Debt Consolidation'
        }, {
          value: 'other',
          label: 'Other'
        }]
      }, {
        id: 'businessPlan',
        label: 'Business Plan Summary',
        type: 'textarea',
        placeholder: 'Provide a brief summary of your business plan and how the funding will be used...',
        validation: {
          minLength: 100,
          maxLength: 2000
        }
      }, {
        id: 'expectedROI',
        label: 'Expected Return on Investment (%)',
        type: 'number',
        validation: {
          min: 0,
          max: 1000
        }
      }]
    }]
  }, {
    stepTitle: 'Supporting Documents',
    stepDescription: 'Upload the required documents to complete your application.',
    groups: [{
      groupTitle: 'Required Documents',
      groupDescription: 'Please upload the following documents to support your application.',
      fields: [{
        id: 'businessLicense',
        label: 'Business License',
        type: 'file',
        required: true // Keep some documents required
      }, {
        id: 'taxReturns',
        label: 'Tax Returns (Last 2 Years)',
        type: 'file'
      }, {
        id: 'financialStatements',
        label: 'Financial Statements',
        type: 'file'
      }, {
        id: 'bankStatements',
        label: 'Bank Statements (Last 6 Months)',
        type: 'file'
      }]
    }, {
      groupTitle: 'Optional Documents',
      fields: [{
        id: 'businessPlanDocument',
        label: 'Detailed Business Plan',
        type: 'file'
      }, {
        id: 'collateralDocuments',
        label: 'Collateral Documentation',
        type: 'file'
      }, {
        id: 'referenceLetter',
        label: 'Reference Letters',
        type: 'file'
      }]
    }, {
      groupTitle: 'Agreements',
      fields: [{
        id: 'creditCheck',
        label: 'I authorize a credit check to be performed',
        type: 'consent',
        required: true // Keep legal agreements required
      }, {
        id: 'informationAccuracy',
        label: 'I certify that all information provided is accurate and complete',
        type: 'consent',
        required: true
      }, {
        id: 'termsAndConditions',
        label: 'I agree to the Terms and Conditions',
        type: 'consent',
        required: true
      }]
    }]
  }]
};