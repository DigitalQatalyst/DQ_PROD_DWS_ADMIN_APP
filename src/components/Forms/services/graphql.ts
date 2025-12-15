// GraphQL service for form data persistence
export interface GraphQLFormData {
  id: string;
  formId: string;
  formTitle: string;
  formData: any;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  submittedAt?: Date;
  lastModified: Date;
  userId?: string;
  version: number;
}
// Mock GraphQL client - replace with your actual GraphQL client
class GraphQLClient {
  private endpoint: string;
  private headers: Record<string, string>;
  constructor(endpoint: string = '/graphql', headers: Record<string, string> = {}) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }
  async query(query: string, variables: any = {}): Promise<any> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables
        })
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data;
    } catch (error) {
      console.error('GraphQL query failed:', error);
      throw error;
    }
  }
  async mutation(mutation: string, variables: any = {}): Promise<any> {
    return this.query(mutation, variables);
  }
}
// Create GraphQL client instance
export const graphqlClient = new GraphQLClient();
// GraphQL operations
export class FormGraphQLService {
  // Save form as draft
  static async saveDraft(formData: Omit<GraphQLFormData, 'id' | 'lastModified'>): Promise<string> {
    const mutation = `
      mutation SaveFormDraft($input: FormDataInput!) {
        saveFormDraft(input: $input) {
          id
          status
          lastModified
        }
      }
    `;
    try {
      const result = await graphqlClient.mutation(mutation, {
        input: {
          ...formData,
          status: 'draft'
        }
      });
      return result.saveFormDraft.id;
    } catch (error) {
      console.error('Failed to save draft:', error);
      // Fallback to local storage if GraphQL fails
      localStorage.setItem(`draft_${formData.formId}`, JSON.stringify({
        ...formData,
        status: 'draft',
        lastModified: new Date().toISOString()
      }));
      throw error;
    }
  }
  // Submit form
  static async submitForm(formData: Omit<GraphQLFormData, 'id' | 'lastModified' | 'submittedAt'>): Promise<string> {
    const mutation = `
      mutation SubmitForm($input: FormDataInput!) {
        submitForm(input: $input) {
          id
          status
          submittedAt
          referenceNumber
        }
      }
    `;
    try {
      const result = await graphqlClient.mutation(mutation, {
        input: {
          ...formData,
          status: 'submitted'
        }
      });
      return result.submitForm.referenceNumber;
    } catch (error) {
      console.error('Failed to submit form:', error);
      throw error;
    }
  }
  // Load form data
  static async loadForm(formId: string): Promise<GraphQLFormData | null> {
    const query = `
      query GetForm($formId: String!) {
        form(formId: $formId) {
          id
          formId
          formTitle
          formData
          status
          submittedAt
          lastModified
          userId
          version
        }
      }
    `;
    try {
      const result = await graphqlClient.query(query, {
        formId
      });
      return result.form;
    } catch (error) {
      console.error('Failed to load form:', error);
      // Fallback to local storage
      const localDraft = localStorage.getItem(`draft_${formId}`);
      if (localDraft) {
        return JSON.parse(localDraft);
      }
      return null;
    }
  }
  // Get user's forms
  static async getUserForms(userId?: string): Promise<GraphQLFormData[]> {
    const query = `
      query GetUserForms($userId: String) {
        userForms(userId: $userId) {
          id
          formId
          formTitle
          status
          submittedAt
          lastModified
          version
        }
      }
    `;
    try {
      const result = await graphqlClient.query(query, {
        userId
      });
      return result.userForms;
    } catch (error) {
      console.error('Failed to get user forms:', error);
      return [];
    }
  }
}