import React, { useState } from 'react';
import { XIcon, ChevronRightIcon, MessageSquareIcon, UserIcon, FileTextIcon } from 'lucide-react';
import { ReviewCommentsModule } from './ReviewCommentsModule';
import { useAbility } from '../hooks/useAbility';
import { useAuth } from '../context/AuthContext';
type ListingDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  onApprove: () => void;
  onReject: () => void;
  onSendBack: () => void;
  onRefresh?: () => Promise<void>;
  showToast?: (message: string, type: 'success' | 'error') => void;
};
export const ListingDetailsDrawer: React.FC<ListingDetailsDrawerProps> = ({
  isOpen,
  onClose,
  listing,
  onApprove,
  onReject,
  onSendBack,
  onRefresh,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const ability = useAbility();
  const { userSegment } = useAuth();
  
  if (!isOpen) return null;

  // Map listing status to review workflow status
  const mapListingStatusToReviewStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Draft': 'Draft',
      'Pending': 'Pending Review',
      'Approved': 'Published',
      'Rejected': 'Rejected',
      'Sent Back': 'Draft'
    };
    return statusMap[status] || status;
  };

  // Determine status flags for ReviewCommentsModule
  const currentReviewStatus = mapListingStatusToReviewStatus(listing.status);
  const isDraft = currentReviewStatus === 'Draft' || listing.status === 'Draft' || listing.status === 'Sent Back';
  const isPending = currentReviewStatus === 'Pending Review' || listing.status === 'Pending';
  const isPublished = currentReviewStatus === 'Published' || listing.status === 'Approved';
  const isArchived = false;
  const isRejected = currentReviewStatus === 'Rejected' || listing.status === 'Rejected';
  const getStatusStyle = (status: string) => {
    const statusStyles: Record<string, string> = {
      Pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      Approved: 'bg-green-100 text-green-800 border border-green-200',
      Rejected: 'bg-red-100 text-red-800 border border-red-200',
      'Sent Back': 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };
  return <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="relative w-screen max-w-2xl">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
              {/* Drawer Header */}
              <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {listing.title}
                    </h2>
                    <div className="mt-1 flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(listing.status)}`}>
                        {listing.status}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        Submitted on {listing.submittedOn}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}>
                    <span className="sr-only">Close panel</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button className={`${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`} onClick={() => setActiveTab('details')}>
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Details
                  </button>
                  <button className={`${activeTab === 'partner' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`} onClick={() => setActiveTab('partner')}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Partner Info
                  </button>
                  <button className={`${activeTab === 'comments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`} onClick={() => setActiveTab('comments')}>
                    <MessageSquareIcon className="w-4 h-4 mr-2" />
                    Review & Comments
                  </button>
                </nav>
              </div>
              {/* Tab Content */}
              <div className="flex-1 px-4 py-6 sm:px-6 overflow-auto">
                {activeTab === 'details' && <div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-900">{listing.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Price
                        </h3>
                        <p className="text-gray-900">{listing.price}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Duration
                        </h3>
                        <p className="text-gray-900">{listing.duration}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Category
                        </h3>
                        <p className="text-gray-900">{listing.category}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Type
                        </h3>
                        <p className="text-gray-900">{listing.type}</p>
                      </div>
                    </div>
                    {listing.images && listing.images.length > 0 && <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Images
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {listing.images.map((image: string, index: number) => <div key={index} className="relative h-40 rounded-lg overflow-hidden">
                                <img src={image} alt={`Listing image ${index + 1}`} className="w-full h-full object-cover" />
                              </div>)}
                        </div>
                      </div>}
                  </div>}
                {activeTab === 'partner' && <div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Partner Name
                      </h3>
                      <p className="text-gray-900">
                        {listing.partnerInfo.name}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Contact
                      </h3>
                      <p className="text-gray-900">
                        {listing.partnerInfo.contact}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Previous Submissions
                      </h3>
                      <p className="text-gray-900">
                        {listing.partnerInfo.previousSubmissions}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Partner History
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            Approval Rate
                          </span>
                          <span className="text-sm text-gray-500">85%</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{
                        width: '85%'
                      }}></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        View Partner Profile
                        <ChevronRightIcon className="ml-1 w-4 h-4" />
                      </button>
                    </div>
                  </div>}
                {activeTab === 'comments' && (
                  <ReviewCommentsModule
                    itemId={listing.id}
                    itemType="Listing"
                    currentStatus={currentReviewStatus}
                    isDraft={isDraft}
                    isPending={isPending}
                    isPublished={isPublished}
                    isArchived={isArchived}
                    isRejected={isRejected}
                    onApprove={onApprove}
                    onReject={onReject}
                    onSendBack={onSendBack}
                    canApprove={ability.can('publish', 'Service')} // Using Service as listing type
                    canReject={ability.can('approve', 'Service')}
                    canSendBack={ability.can('approve', 'Service')}
                    canUnpublish={ability.can('unpublish', 'Service')}
                    canArchive={ability.can('archive', 'Service')}
                    canFlag={userSegment === 'internal'}
                    comments={listing.comments || []}
                    activityLog={listing.activityLog || []}
                    tableName="mktplc_services" // Assuming listings use same table as services
                    showToast={showToast}
                    onStatusChange={async (newStatus) => {
                      // Update local listing state if available
                      if (listing && listing.status !== newStatus) {
                        // Map back from review status to listing status
                        const reverseMap: Record<string, string> = {
                          'Published': 'Approved',
                          'Pending Review': 'Pending',
                          'Draft': listing.status === 'Sent Back' ? 'Sent Back' : 'Draft',
                          'Rejected': 'Rejected'
                        };
                        listing.status = reverseMap[newStatus] || listing.status;
                        
                        // Refresh parent component's list
                        if (onRefresh) {
                          await onRefresh();
                        }
                        
                        // Show updated status in toast
                        if (showToast) {
                          showToast(`Status updated to ${listing.status}`, 'success');
                        }
                      }
                    }}
                  />
                )}
              </div>
              {/* Drawer Footer */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-between">
                  <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={onClose}>
                    Cancel
                  </button>
                  <div className="flex space-x-3">
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" onClick={onReject}>
                      Reject
                    </button>
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={onSendBack}>
                      Send Back
                    </button>
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" onClick={onApprove}>
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};