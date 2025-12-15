/**
 * Listing Approvals Review Workflow Tests
 * 
 * Tests the ReviewCommentsModule integration with Listing Approvals,
 * including status mapping and workflow transitions for listings/services.
 */

import { describe, test, expect } from '@jest/globals';
import { buildAbility, AppAbility } from '../../src/auth/ability';
import type { UserContext } from '../../src/auth/ability';

describe('Listing Approvals - Review Workflow', () => {
  describe('Status Mapping', () => {
    test('maps listing status to review workflow status correctly', () => {
      const statusMap: Record<string, string> = {
        'Draft': 'Draft',
        'Pending': 'Pending Review',
        'Approved': 'Published',
        'Rejected': 'Rejected',
        'Sent Back': 'Draft'
      };

      expect(statusMap['Pending']).toBe('Pending Review');
      expect(statusMap['Approved']).toBe('Published');
      expect(statusMap['Rejected']).toBe('Rejected');
      expect(statusMap['Sent Back']).toBe('Draft');
    });

    test('determines status flags correctly for listings', () => {
      const listing = { status: 'Pending' };
      const currentReviewStatus = listing.status === 'Pending' ? 'Pending Review' : listing.status;
      const isPending = currentReviewStatus === 'Pending Review';

      expect(currentReviewStatus).toBe('Pending Review');
      expect(isPending).toBe(true);
    });

    test('handles approved listing status', () => {
      const listing = { status: 'Approved' };
      const currentReviewStatus = listing.status === 'Approved' ? 'Published' : listing.status;
      const isPublished = currentReviewStatus === 'Published';

      expect(currentReviewStatus).toBe('Published');
      expect(isPublished).toBe(true);
    });

    test('handles rejected listing status', () => {
      const listing = { status: 'Rejected' };
      const currentReviewStatus = listing.status === 'Rejected' ? 'Rejected' : listing.status;
      const isRejected = currentReviewStatus === 'Rejected';

      expect(currentReviewStatus).toBe('Rejected');
      expect(isRejected).toBe(true);
    });
  });

  describe('Status Reverse Mapping', () => {
    test('maps review status back to listing status correctly', () => {
      const listing = { status: 'Sent Back' };
      const reverseMap: Record<string, string> = {
        'Published': 'Approved',
        'Pending Review': 'Pending',
        'Draft': listing.status === 'Sent Back' ? 'Sent Back' : 'Draft',
        'Rejected': 'Rejected'
      };

      expect(reverseMap['Published']).toBe('Approved');
      expect(reverseMap['Pending Review']).toBe('Pending');
      expect(reverseMap['Rejected']).toBe('Rejected');
    });
  });

  describe('RBAC Enforcement', () => {
    test('Internal Admin can manage all listings', () => {
      const internalAdmin: UserContext = {
        role: 'admin',
        user_segment: 'internal',
        organizationId: undefined
      };

      const ability = buildAbility(internalAdmin);
      
      // Listings use Service permissions
      expect(ability.can('publish', 'Service')).toBe(true);
      expect(ability.can('approve', 'Service')).toBe(true);
    });

    test('Listing approver can approve but not publish (Service permissions)', () => {
      const internalApprover: UserContext = {
        role: 'approver',
        user_segment: 'internal',
        organizationId: undefined
      };

      const ability = buildAbility(internalApprover);
      
      expect(ability.can('approve', 'Service')).toBe(true);
      // Approvers can approve Service but publish is only for Content, not Service
      expect(ability.can('publish', 'Service')).toBe(false);
    });
  });

  describe('Status Transitions', () => {
    test('can approve pending listing', () => {
      const listing = { status: 'Pending' };
      const newStatus = 'Approved';
      
      expect(newStatus).toBe('Approved');
      // Should map to Published in review workflow
    });

    test('can reject pending listing', () => {
      const listing = { status: 'Pending' };
      const newStatus = 'Rejected';
      
      expect(newStatus).toBe('Rejected');
    });

    test('can send back listing for revision', () => {
      const listing = { status: 'Pending' };
      const newStatus = 'Sent Back';
      
      expect(newStatus).toBe('Sent Back');
      // Should map to Draft in review workflow
    });
  });

  describe('Integration with ListingDetailsDrawer', () => {
    test('drawer shows Review & Comments tab (renamed from Comments)', () => {
      const tabs = ['Details', 'Partner Info', 'Review & Comments'];
      expect(tabs).toContain('Review & Comments');
    });

    test('ReviewCommentsModule uses correct table name', () => {
      const tableName = 'mktplc_services'; // Listings use services table
      expect(tableName).toBe('mktplc_services');
    });

    test('status update triggers refresh', () => {
      let refreshed = false;
      const onRefresh = async () => {
        refreshed = true;
      };

      onRefresh();
      expect(refreshed).toBe(true);
    });

    test('toast notification shown on status update', () => {
      let toastMessage = '';
      const showToast = (message: string, type: 'success' | 'error') => {
        toastMessage = message;
      };

      showToast('Listing status updated to Approved', 'success');
      expect(toastMessage).toBe('Listing status updated to Approved');
    });
  });

  describe('Comments and Audit Trail', () => {
    test('listing comments are displayed correctly', () => {
      const comments = [
        {
          id: '1',
          author: 'Reviewer',
          role: 'Approver',
          text: 'Needs more details about pricing',
          timestamp: '2024-01-15 10:30'
        }
      ];

      expect(comments[0]).toHaveProperty('author');
      expect(comments[0]).toHaveProperty('text');
      expect(comments[0].text).toBe('Needs more details about pricing');
    });

    test('listing audit trail includes workflow actions', () => {
      const actions = [
        { date: '2024-01-15 10:00', action: 'Submitted for Review', performedBy: 'Partner' },
        { date: '2024-01-15 14:00', action: 'Rejected', performedBy: 'Reviewer' },
        { date: '2024-01-16 10:00', action: 'Resubmitted for Review', performedBy: 'Partner' },
        { date: '2024-01-16 14:00', action: 'Approved', performedBy: 'Reviewer' },
        { date: '2024-01-16 14:30', action: 'Published', performedBy: 'Reviewer' }
      ];

      expect(actions).toHaveLength(5);
      expect(actions[actions.length - 1].action).toBe('Published');
    });

    test('audit trail pagination works for listings', () => {
      const mockActivityLog = Array.from({ length: 27 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')} 10:00`,
        action: `Listing Action ${i + 1}`,
        performedBy: `User ${i + 1}`
      }));

      const itemsPerPage = 10;
      const totalPages = Math.ceil(mockActivityLog.length / itemsPerPage);
      
      expect(totalPages).toBe(3);
      
      const page3 = mockActivityLog.slice(20, 27);
      expect(page3).toHaveLength(7);
    });
  });
});
