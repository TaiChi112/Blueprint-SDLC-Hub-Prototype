"use client";
import {
  BookOpen,
  CheckSquare,
  ChevronDown,
  Database,
  Edit3,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import type { Artifact, RequirementSection } from '../types';
import MermaidDiagram from './MermaidDiagram';
import RequirementViewer from './RequirementViewer';

const ArtifactViewer = ({
  artifact,
  isOwner,
  onAction,
  onUpdateStructuredSection,
}: {
  artifact: Artifact;
  isOwner: boolean;
  onAction: (artifact: Artifact, mode: 'edit' | 'suggest') => void;
  onUpdateStructuredSection?: (updatedSection: RequirementSection) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (artifact.contentFormat === 'structured' && artifact.structuredContent) {
    return (
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4 border-b border-slate-200 pb-2">
          <div className="bg-orange-100 p-2 rounded-lg">
            <FileText className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {artifact.title}
            </h2>
            <p className="text-xs text-slate-500">
              Comprehensive Software Requirements Specification
            </p>
          </div>
        </div>
        <RequirementViewer
          sections={artifact.structuredContent}
          isOwner={isOwner}
          onUpdateSection={(updated) =>
            onUpdateStructuredSection && onUpdateStructuredSection(updated)
          }
        />
      </div>
    );
  }

  const getIcon = () => {
    switch (artifact.type) {
      case 'requirement':
        return <FileText className="text-orange-500" />;
      case 'diagram':
        return <Database className="text-purple-500" />;
      case 'testing':
        return <CheckSquare className="text-green-500" />;
      default:
        return <BookOpen />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg mb-4 overflow-hidden shadow-sm hover:border-blue-200 transition">
      <div
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition ${
          isExpanded ? 'border-b border-slate-100' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 select-none">
          <div
            className={`text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
          >
            <ChevronDown size={20} />
          </div>
          {getIcon()}
          <h4 className="font-bold text-slate-800">{artifact.title}</h4>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {artifact.type}
          </span>
        </div>

        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          {isOwner && artifact.contentFormat !== 'structured' && (
            <button
              onClick={() => onAction(artifact, 'edit')}
              className="p-2 text-slate-400 hover:text-green-600 rounded-full hover:bg-green-50 transition"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-white animate-in slide-in-from-top-2 duration-200">
          {artifact.externalLinks && (
            <div className="flex flex-wrap gap-2 mb-4">
              {artifact.externalLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
                >
                  <ExternalLink size={12} />
                  <span>{link.title}</span>
                </a>
              ))}
            </div>
          )}
          {artifact.contentFormat === 'mermaid' ? (
            <div className="relative">
              <MermaidDiagram code={artifact.content} />
            </div>
          ) : (
            <div className="prose prose-sm text-slate-600 whitespace-pre-line">
              {artifact.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtifactViewer;
