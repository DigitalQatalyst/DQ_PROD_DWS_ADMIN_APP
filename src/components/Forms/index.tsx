import React from 'react';
// Export main components
export { ServiceRequestForm } from './ServiceRequestForm';
export { AppLayout } from './AppLayout';
// Export types
export type { ServiceRequestFormProps, FormSchema, FormStep, FormGroup, FormField } from './ServiceRequestForm';
// Export schema examples
export { generalServiceRequestSchema } from './schemas/singleStepSchema';
export { fundingApplicationSchema } from './schemas/multiStepSchema';
// Export global options (simplified)
export { getGlobalOptions } from './globalOptions';
export type { GlobalOptionSet } from './globalOptions';
// Export services (optional - only if persistence is enabled)
export { FormDataService } from './storage/indexedDB';
export { FormGraphQLService } from './services/graphql';
export type { StoredFormData, FormCompletionStatus } from './storage/indexedDB';
export type { GraphQLFormData } from './services/graphql';