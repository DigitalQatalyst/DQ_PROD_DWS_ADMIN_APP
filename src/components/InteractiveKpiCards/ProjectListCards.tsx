import React from 'react';
import { MoreHorizontal } from 'lucide-react';
export interface ProjectData {
  id: string;
  name: string;
  leader: string;
  team: string[];
  progress: number;
  status: 'active' | 'pending' | 'completed';
  dueDate: string;
}
export interface ProjectListCardData {
  id: string;
  title: string;
  subtitle?: string;
  projects: ProjectData[];
}
export interface ProjectListCardsProps {
  cards: ProjectListCardData[];
  className?: string;
  'data-id'?: string;
}
export function ProjectListCards({
  cards,
  className = '',
  'data-id': dataId
}: ProjectListCardsProps) {
  return <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6 ${className}`} data-id={dataId}>
      {cards.map(card => <ProjectListCard key={card.id} card={card} />)}
    </div>;
}
function ProjectListCard({
  card
}: {
  card: ProjectListCardData;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
          {card.subtitle && <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>}
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal size={20} className="text-gray-400" />
        </button>
      </div>
      <div className="space-y-4">
        {card.projects.map(project => <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>Leader: {project.leader}</span>
                <span>Due: {project.dueDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member, index) => <div key={index} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                      {member.charAt(0)}
                    </div>)}
                  {project.team.length > 3 && <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      +{project.team.length - 3}
                    </div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
                  width: `${project.progress}%`
                }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}