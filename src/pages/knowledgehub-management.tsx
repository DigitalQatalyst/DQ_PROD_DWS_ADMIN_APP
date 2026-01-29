import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { KnowledgeHubManagementPage } from '../components/KnowledgeHubManagementPage';

export default function KnowledgeHubManagementRoute() {
    return (
        <AppLayout activeSection="knowledgehub-management">
            <KnowledgeHubManagementPage />
        </AppLayout>
    );
}
