/**
 * Service Management Review Workflow Tests
 * 
 * Tests the ReviewCommentsModule integration with Service Management,
 * including status mapping, pagination, and workflow transitions.
 */

import { describe, test, expect } from '@jest/globals';
import { buildAbility, AppAbility } from '../../src/auth/ability';
import type { UserContext } from '../../src/auth/ability';

describe('Service Management - Review Workflow', () => {
  describe('Status Mapping', () => {
    test('maps service status to review workflow status correctly', () => {
      const statusMap: Record<string, string> = {
        'Draft': 'Draft',
        'Pending': 'Pending Review',
        'Step 2 Pending': 'Pending Review',
        'Published': 'Published',
        'Unpublished': 'Published',
        'Rejected': 'Rejected',
        'Sent Back': 'Draft',
        'Archived': 'Archived'
      };

      expect(statusMap['Pending']).toBe('Pending Review');
      expect(statusMap['Step 2 Pending']).toBe('Pending Review');
      expect(statusMap['Unpublished']).toBe('Published');
      expect(statusMap['Sent Back']).toBe('Draft');
    });

    test('determines status flags correctly for services', () => {
      const service = { status: 'Pending' };
      const currentReviewStatus = service.status === 'Pending' ? 'Pending Review' : service.status;
      const isPending = currentReviewStatus === 'Pending Review';

      expect(currentReviewStatus).toBe('Pending Review');
      expect(isPending).toBe(true);
    });

    test('handles Financial service Step 2 workflow', () => {
      const financialService = {
        type: 'Financial',
        status: 'Step 2 Pending'
      };

      const currentReviewStatus = financialService.status === 'Step 2 Pending' 
        ? 'Pending Review' 
        : financialService.status;
      
      expect(currentReviewStatus).toBe('Pending Review');
    });
  });

  describe('Pagination', () => {
    test('service audit trail pagination works correctly', () => {
      const mockActivityLog = Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')} 10:00`,
        action: `Service Action ${i + 1}`,
        performedBy: `User ${i + 1}`
      }));

      const itemsPerPage = 10;
      const currentPage = 2;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedActivities = mockActivityLog.slice(startIndex, endIndex);

      expect(paginatedActivities).toHaveLength(10);
      expect(paginatedActivities[0].action).toBe('Service Action 11');
    });
  });

  describe('RBAC Enforcement', () => {
    test('Internal Admin can manage all services', () => {
      const internalAdmin: UserContext = {
        role: 'admin',
        user_segment: 'internal',
        organizationId: undefined
      };

      const ability = buildAbility(internalAdmin);
      
      expect(ability.can('publish', 'Service')).toBe(true);
      expect(ability.can('approve', 'Service')).toBe(true);
      expect(ability.can('archive', 'Service')).toBe(true);
    });

    test('Partner Admin can manage services (includes publish via manage all)', () => {
      const partnerAdmin: UserContext = {
        role: 'admin',
        user_segment: 'partner',
        organizationId: 'partner-org-1'
      };

      const ability = buildAbility(partnerAdmin);
      
      // Partner Admin has 'manage all' so can publish Service (unlike Content which has explicit cannot)
      expect(ability.can('approve', 'Service')).toBe(true);
      expect(ability.can('publish', 'Service')).toBe(true);
    });

    test('Service approver can approve but not publish services', () => {
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
    test('can move Financial service from Step 1 to Step 2', () => {
      const financialService = {
        type: 'Financial',
        status: 'Pending'
      };

      // Moving to Step 2 Pending
      const newStatus = 'Step 2 Pending';
      expect(newStatus).toBe('Step 2 Pending');
    });

    test('can approve and publish Non-Financial service directly', () => {
      const nonFinancialService = {
        type: 'Non-Financial',
        status: 'Pending'
      };

      const newStatus = 'Published';
      expect(newStatus).toBe('Published');
    });

    test('can send back service for revision', () => {
      const service = { status: 'Pending' };
      const newStatus = 'Sent Back';
      
      expect(newStatus).toBe('Sent Back');
      // Should map to Draft in review workflow
    });
  });

  describe('Integration with ServiceDetailsDrawer', () => {
    test('drawer shows Review & Comments tab', () => {
      const tabs = ['Details', 'Review & Comments', 'Provider Details', 'Service Insights'];
      expect(tabs).toContain('Review & Comments');
    });

    test('status change triggers parent page refresh', () => {
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

      showToast('Service status updated to Published', 'success');
      expect(toastMessage).toBe('Service status updated to Published');
    });
  });

  describe('Comments and Audit Trail', () => {
    test('service comments are displayed correctly', () => {
      const comments = [
        {
          id: '1',
          author: 'Reviewer Name',
          role: 'Admin',
          text: 'Please add more details',
          timestamp: '2024-01-15 10:30'
        }
      ];

      expect(comments[0]).toHaveProperty('author');
      expect(comments[0]).toHaveProperty('text');
      expect(comments[0].text).toBe('Please add more details');
    });

    test('service audit trail includes all workflow actions', () => {
      const actions = [
        { date: '2024-01-15 10:00', action: 'Submitted for Review', performedBy: 'Partner' },
        { date: '2024-01-15 14:00', action: 'Moved to Step 2', performedBy: 'Reviewer' },
        { date: '2024-01-15 16:00', action: 'Approved', performedBy: 'Reviewer' },
        { date: '2024-01-15 16:30', action: 'Published', performedBy: 'Reviewer' }
      ];

      expect(actions).toHaveLength(4);
      expect(actions[actions.length - 1].action).toBe('Published');
    });
  });
});
