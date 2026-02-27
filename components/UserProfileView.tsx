"use client";
import Image from 'next/image';
import {
  ArrowRight,
  Calendar,
  CheckSquare,
  Database,
  FileText,
  GitCommit,
  User,
} from 'lucide-react';
import { useState } from 'react';
import type { Project, UserProfile } from '../types';
import { MOCK_CONTRIBUTIONS } from '../constants/mockData';
import ActivityHeatmap from './ActivityHeatmap';
import ProjectCard from './ProjectCard';

const UserProfileView = ({
  user,
  projects,
  onBack,
}: {
  user: UserProfile;
  projects: Project[];
  onBack: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'contributions'>(
    'posts'
  );
  const myProjects = projects.filter((p) => p.author === user.name);
  const contributions = MOCK_CONTRIBUTIONS;

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="mb-6 text-slate-500 hover:text-slate-800 flex items-center font-medium"
      >
        <ArrowRight className="rotate-180 mr-2" size={18} /> Back to Home
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 flex flex-col md:flex-row gap-8 items-start">
        <div className="shrink-0">
          <Image
            src={user.avatar}
            alt={user.name}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
        </div>
        <div className="grow">
          <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
          <div className="flex items-center space-x-3 mt-2 text-slate-500">
            <span className="flex items-center">
              <User size={16} className="mr-1" /> {user.role}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Calendar size={16} className="mr-1" /> Joined{' '}
              {user.joinedDate || 'Oct 2023'}
            </span>
          </div>
          <p className="mt-4 text-slate-600 max-w-2xl">
            {user.bio ||
              'Passionate about building scalable software and helping others learn. Currently focusing on System Design.'}
          </p>

          <div className="mt-6 flex space-x-4">
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <span className="block text-2xl font-bold text-blue-600">
                {myProjects.length}
              </span>
              <span className="text-xs text-slate-500 uppercase font-semibold">
                Blueprints
              </span>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <span className="block text-2xl font-bold text-green-600">
                {contributions.length + 12}
              </span>
              <span className="text-xs text-slate-500 uppercase font-semibold">
                Contributions
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center">
          <GitCommit size={16} className="mr-2" /> Contribution Activity (Last
          Year)
        </h3>
        <ActivityHeatmap />
      </div>

      <div className="mb-6 flex space-x-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 font-medium transition ${
            activeTab === 'posts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Blueprints ({myProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('contributions')}
          className={`pb-3 font-medium transition ${
            activeTab === 'contributions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Contributions History
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'posts' ? (
          myProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => {}} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <FileText size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                You haven`t posted any blueprints yet.
              </p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {contributions.map((contrib) => (
              <div
                key={contrib.id}
                className="p-4 flex items-start space-x-4 hover:bg-slate-50 transition"
              >
                <div
                  className={`p-2 rounded-lg ${
                    contrib.type === 'artifact'
                      ? 'bg-purple-100 text-purple-600'
                      : contrib.type === 'code'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {contrib.type === 'artifact' ? (
                    <Database size={20} />
                  ) : contrib.type === 'code' ? (
                    <CheckSquare size={20} />
                  ) : (
                    <FileText size={20} />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {contrib.action}
                  </h4>
                  <p className="text-sm text-slate-500">
                    on{' '}
                    <span className="font-medium text-blue-600">
                      {contrib.projectTitle}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{contrib.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;
