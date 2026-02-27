"use client";
import { ArrowRight, Code2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import type { Artifact, Project, RequirementSection, UserProfile } from '../types';
import ArtifactViewer from './ArtifactViewer';

const BlueprintDetail = ({
  project,
  onBack,
  user,
  onLoginRequest,
  onUpdateArtifact,
}: {
  project: Project;
  onBack: () => void;
  user: UserProfile | null;
  onLoginRequest: () => void;
  onUpdateArtifact: (artifact: Artifact) => void;
}) => {
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const currentVersion = project.versions[selectedVersionIndex];
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);

  const handleUpdateStructuredSection = (
    artifact: Artifact,
    updatedSection: RequirementSection
  ) => {
    if (!artifact.structuredContent) return;
    const updatedStructuredContent = artifact.structuredContent.map((s) =>
      s.id === updatedSection.id ? updatedSection : s
    );
    onUpdateArtifact({ ...artifact, structuredContent: updatedStructuredContent });
  };

  const isOwner = user?.name === project.author;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="mb-6 text-slate-500 hover:text-slate-800 flex items-center font-medium"
      >
        <ArrowRight className="rotate-180 mr-2" size={18} /> Back to Projects
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {project.title}
            </h1>
            <p className="text-slate-500 text-lg mb-4">{project.summary}</p>
            {project.references && (
              <div className="flex flex-wrap gap-2 mt-4">
                {project.references.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 px-3 py-1.5 rounded-lg transition"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkIcon size={14} />
                    <span>{ref.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Select Blueprint Version
          </h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {project.versions.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVersionIndex(idx)}
                className={`shrink-0 px-5 py-3 rounded-lg border-2 transition-all text-left min-w-50 ${
                  idx === selectedVersionIndex
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-lg font-bold ${
                      idx === selectedVersionIndex
                        ? 'text-blue-700'
                        : 'text-slate-700'
                    }`}
                  >
                    V{v.versionNumber}
                  </span>
                  {idx === selectedVersionIndex && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{v.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-800">
              Engineering Artifacts
            </h2>
            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
              V{currentVersion.versionNumber} Scope
            </span>
          </div>

          {currentVersion.artifacts.map((art) => (
            <ArtifactViewer
              key={art.id}
              artifact={art}
              isOwner={isOwner}
              onAction={() => setEditingArtifact(art)}
              onUpdateStructuredSection={(updated) =>
                handleUpdateStructuredSection(art, updated)
              }
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-slate-900 text-slate-100 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4 text-blue-300">
                <Code2 size={24} />
                <h3 className="text-lg font-bold">Implementations</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Community implementations for this spec.
              </p>
              {currentVersion.implementations.length > 0 ? (
                <div className="space-y-3">
                  {currentVersion.implementations.map((impl, idx) => (
                    <a
                      key={idx}
                      href={impl.repoUrl}
                      className="block bg-slate-800 hover:bg-slate-700 p-3 rounded-lg border border-slate-700 hover:border-blue-500 transition group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white group-hover:text-blue-300">
                          {impl.language}
                        </span>
                        <ExternalLink
                          size={14}
                          className="text-slate-500 group-hover:text-white"
                        />
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {impl.description}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-800 rounded-lg border border-dashed border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">
                    No implementations yet
                  </p>
                  <button
                    onClick={onLoginRequest}
                    className="text-blue-400 text-sm font-medium hover:underline"
                  >
                    Submit implementation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editingArtifact && (
        <div className="fixed inset-0 bg-slate-900/60 z-100 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Edit Artifact
            </h3>
            <p className="text-slate-500 text-sm">
              Inline editing is a prototype placeholder.
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingArtifact(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlueprintDetail;
