import {
  AlertCircle,
  BookOpen,
  Box,
  CheckCircle,
  Lock,
  Shield,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import type { RequirementSection, StandardSectionsData } from '../types';

export const generateStandardSections = (
  data?: StandardSectionsData
): RequirementSection[] => [
  {
    id: 'sec-1',
    title: '1. Project Information (ข้อมูลทั่วไป)',
    icon: <BookOpen size={18} />,
    isExpanded: true,
    fields: [
      {
        id: 'f-1-1',
        label: 'Project Name',
        value: data?.title || '',
        inputType: 'text',
        placeholder: 'Enter project name',
      },
      {
        id: 'f-1-2',
        label: 'Version',
        value: data?.version || '0.1 (Draft)',
        inputType: 'text',
        placeholder: 'e.g. 1.0.0',
      },
      {
        id: 'f-1-3',
        label: 'Last Updated',
        value: new Date().toLocaleDateString(),
        inputType: 'text',
      },
    ],
  },
  {
    id: 'sec-2',
    title: '2. Problem Statement (ที่มาและความสำคัญ)',
    icon: <AlertCircle size={18} />,
    isExpanded: true,
    fields: [
      {
        id: 'f-2-1',
        label: 'Current Problem',
        value: data?.problem || '',
        inputType: 'textarea',
        placeholder: 'Describe the pain point...',
      },
      {
        id: 'f-2-2',
        label: 'Business Goal / Objective',
        value: data?.goal || '',
        inputType: 'textarea',
        placeholder: 'What is the main goal?',
      },
    ],
  },
  {
    id: 'sec-3',
    title: '3. Project Scope (ขอบเขตงาน)',
    icon: <Target size={18} />,
    isExpanded: false,
    fields: [
      {
        id: 'f-3-1',
        label: 'In-Scope',
        value: data?.inScope || [],
        inputType: 'list',
        placeholder: 'Add in-scope item',
      },
      {
        id: 'f-3-2',
        label: 'Out-of-Scope',
        value: data?.outScope || [],
        inputType: 'list',
        placeholder: 'Add out-of-scope item',
      },
    ],
  },
  {
    id: 'sec-4',
    title: '4. Stakeholders & Actors (ผู้เกี่ยวข้อง)',
    icon: <Users size={18} />,
    isExpanded: false,
    fields: [
      {
        id: 'f-4-1',
        label: 'User Personas',
        value: data?.users || [],
        inputType: 'list',
        placeholder: 'Add user persona',
      },
      {
        id: 'f-4-2',
        label: 'System Actors',
        value: data?.systemActors || [],
        inputType: 'list',
        placeholder: 'e.g. Admin, 3rd Party API',
      },
    ],
  },
  {
    id: 'sec-5',
    title: '5. Functional Requirements (ฟังก์ชันการทำงาน)',
    icon: <Zap size={18} />,
    isExpanded: false,
    fields: [
      {
        id: 'f-5-1',
        label: 'Features List',
        value: data?.features || [],
        inputType: 'list',
        placeholder: 'Add feature',
      },
      {
        id: 'f-5-2',
        label: 'User Stories',
        value: data?.userStories || [],
        inputType: 'list',
        placeholder: 'As a [user], I want to...',
      },
    ],
  },
  {
    id: 'sec-6',
    title: '6. Non-Functional Requirements (คุณสมบัติเชิงคุณภาพ)',
    icon: <Shield size={18} />,
    isExpanded: false,
    fields: [
      {
        id: 'f-6-1',
        label: 'Performance',
        value: data?.performance || '',
        inputType: 'text',
        placeholder: 'e.g. < 2s response time',
      },
      {
        id: 'f-6-2',
        label: 'Security',
        value: data?.security || '',
        inputType: 'text',
        placeholder: 'e.g. OAuth2, Encryption',
      },
      {
        id: 'f-6-3',
        label: 'Reliability',
        value: data?.reliability || '',
        inputType: 'text',
        placeholder: 'e.g. 99.9% Uptime',
      },
    ],
  },
  {
    id: 'sec-7',
    title: '7. Constraints (ข้อจำกัด)',
    icon: <Lock size={18} />,
    isExpanded: false,
    fields: [
      {
        id: 'f-7-1',
        label: 'Technical Constraints',
        value: data?.techConstraints || [],
        inputType: 'list',
        placeholder: 'e.g. Tech Stack',
      },
      {
        id: 'f-7-2',
        label: 'Business Constraints',
        value: data?.bizConstraints || [],
        inputType: 'list',
        placeholder: 'e.g. Budget, Timeline',
      },
    ],
  },
  {
    id: 'sec-8',
    title: '8. Assumptions & Dependencies',
    icon: <Box size={18} />,
    isExpanded: false,
    fields: [
      {
        id: 'f-8-1',
        label: 'Assumptions',
        value: data?.assumptions || [],
        inputType: 'list',
        placeholder: 'Add assumption',
      },
      {
        id: 'f-8-2',
        label: 'Dependencies',
        value: data?.dependencies || [],
        inputType: 'list',
        placeholder: 'Add dependency',
      },
    ],
  },
  {
    id: 'sec-9',
    title: '9. Acceptance Criteria',
    icon: <CheckCircle size={18} />,
    isExpanded: false,
    fields: [
      {
        id: 'f-9-1',
        label: 'Definition of Done',
        value: data?.definitionOfDone || [],
        inputType: 'list',
        placeholder: 'Criteria for completion',
      },
    ],
  },
];
