// Global option sets for consistent options across forms
export interface GlobalOptionSet {
  id: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}
export const globalOptionSets: Record<string, GlobalOptionSet> = {
  countries: {
    id: 'countries',
    label: 'Countries',
    options: [{
      value: 'ae',
      label: 'United Arab Emirates'
    }, {
      value: 'sa',
      label: 'Saudi Arabia'
    }, {
      value: 'kw',
      label: 'Kuwait'
    }, {
      value: 'qa',
      label: 'Qatar'
    }, {
      value: 'bh',
      label: 'Bahrain'
    }, {
      value: 'om',
      label: 'Oman'
    }, {
      value: 'us',
      label: 'United States'
    }, {
      value: 'ca',
      label: 'Canada'
    }, {
      value: 'uk',
      label: 'United Kingdom'
    }, {
      value: 'de',
      label: 'Germany'
    }, {
      value: 'fr',
      label: 'France'
    }, {
      value: 'in',
      label: 'India'
    }, {
      value: 'cn',
      label: 'China'
    }, {
      value: 'jp',
      label: 'Japan'
    }, {
      value: 'au',
      label: 'Australia'
    }, {
      value: 'other',
      label: 'Other'
    }]
  },
  currencies: {
    id: 'currencies',
    label: 'Currencies',
    options: [{
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
    }, {
      value: 'SAR',
      label: 'Saudi Riyal (SAR)'
    }, {
      value: 'KWD',
      label: 'Kuwaiti Dinar (KWD)'
    }, {
      value: 'QAR',
      label: 'Qatari Riyal (QAR)'
    }]
  },
  industries: {
    id: 'industries',
    label: 'Industries',
    options: [{
      value: 'technology',
      label: 'Technology & Software'
    }, {
      value: 'healthcare',
      label: 'Healthcare & Medical'
    }, {
      value: 'finance',
      label: 'Financial Services'
    }, {
      value: 'retail',
      label: 'Retail & E-commerce'
    }, {
      value: 'manufacturing',
      label: 'Manufacturing'
    }, {
      value: 'construction',
      label: 'Construction & Real Estate'
    }, {
      value: 'education',
      label: 'Education & Training'
    }, {
      value: 'hospitality',
      label: 'Hospitality & Tourism'
    }, {
      value: 'transportation',
      label: 'Transportation & Logistics'
    }, {
      value: 'energy',
      label: 'Energy & Utilities'
    }, {
      value: 'agriculture',
      label: 'Agriculture & Food'
    }, {
      value: 'media',
      label: 'Media & Entertainment'
    }, {
      value: 'consulting',
      label: 'Professional Services'
    }, {
      value: 'other',
      label: 'Other'
    }]
  },
  businessTypes: {
    id: 'businessTypes',
    label: 'Business Types',
    options: [{
      value: 'llc',
      label: 'Limited Liability Company (LLC)'
    }, {
      value: 'corporation',
      label: 'Corporation'
    }, {
      value: 'partnership',
      label: 'Partnership'
    }, {
      value: 'sole-proprietorship',
      label: 'Sole Proprietorship'
    }, {
      value: 'nonprofit',
      label: 'Non-Profit Organization'
    }, {
      value: 'freelance',
      label: 'Freelancer/Independent Contractor'
    }, {
      value: 'other',
      label: 'Other'
    }]
  },
  priorities: {
    id: 'priorities',
    label: 'Priority Levels',
    options: [{
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
    }]
  },
  budgetRanges: {
    id: 'budgetRanges',
    label: 'Budget Ranges',
    options: [{
      value: 'under-5000',
      label: 'Under $5,000'
    }, {
      value: '5000-25000',
      label: '$5,000 - $25,000'
    }, {
      value: '25000-100000',
      label: '$25,000 - $100,000'
    }, {
      value: '100000-500000',
      label: '$100,000 - $500,000'
    }, {
      value: '500000-plus',
      label: '$500,000+'
    }]
  },
  companySize: {
    id: 'companySize',
    label: 'Company Size',
    options: [{
      value: '1',
      label: '1 (Just me)'
    }, {
      value: '2-10',
      label: '2-10 employees'
    }, {
      value: '11-50',
      label: '11-50 employees'
    }, {
      value: '51-200',
      label: '51-200 employees'
    }, {
      value: '201-1000',
      label: '201-1000 employees'
    }, {
      value: '1000+',
      label: '1000+ employees'
    }]
  },
  serviceTypes: {
    id: 'serviceTypes',
    label: 'Service Types',
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
      value: 'training',
      label: 'Training & Development'
    }, {
      value: 'marketing',
      label: 'Marketing & Advertising'
    }, {
      value: 'legal',
      label: 'Legal Services'
    }, {
      value: 'accounting',
      label: 'Accounting & Finance'
    }, {
      value: 'hr',
      label: 'Human Resources'
    }, {
      value: 'other',
      label: 'Other'
    }]
  }
};
// Helper function to get options by ID
export const getGlobalOptions = (optionSetId: string) => {
  return globalOptionSets[optionSetId]?.options || [];
};
// Helper function to get all option sets
export const getAllGlobalOptionSets = () => {
  return globalOptionSets;
};