"use client";
import React, { useState, useEffect } from 'react';
import {
    Sparkles, Send, Loader2, FileText, Bot, User,
    Database, Settings, ChevronRight,
    Copy, Check, Code, LayoutTemplate, Trash2, Edit3, Save, X, AlertCircle
} from 'lucide-react';

// --- โครงสร้างข้อมูล (Types) ---
interface SpecData {
    project_name: string;
    problem_statement: string;
    solution_overview: string;
    functional_requirements: string[];
    non_functional_requirements: string[];
    tech_stack_recommendation: string[];
    status: string;
}

interface SavedSpec {
    id: string; // ในที่นี้ API ส่ง filename มาเป็น ID
    filename: string;
    project_name: string;
    created_at: string;
    status: string;
    content: SpecData;
}

// ตั้งค่า URL ของ Python FastAPI
const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
    // --- States ---
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState<SpecData | null>(null);

    // UI States
    const [activeTab, setActiveTab] = useState<'document' | 'json'>('document');
    const [isCopied, setIsCopied] = useState(false);

    // Database Connection State
    const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

    // State เก็บประวัติ
    const [savedSpecs, setSavedSpecs] = useState<SavedSpec[]>([]);

    // --- Effects (API Connections) ---
    const fetchSpecs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/specs`);
            if (!response.ok) throw new Error('Failed to fetch specs');
            const data = await response.json();
            setSavedSpecs(data);
        } catch (error) {
            console.error("Error fetching specs:", error);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setDbStatus('connecting');
            setApiErrorMessage(null);

            try {
                // 1. เช็ค Health ก่อน
                const healthRes = await fetch(`${API_BASE_URL}/health`);
                if (!healthRes.ok) throw new Error('API server returned error');

                // 2. ถ้า Health ผ่าน ให้ดึงข้อมูลประวัติ
                await fetchSpecs();
                setDbStatus('connected');

            } catch (error) {
                console.warn("⚠️ ไม่สามารถเชื่อมต่อ Python API ได้ กำลังใช้งาน Mock Data แทน", error);
                setDbStatus('error');
                setApiErrorMessage("Cannot connect to http://localhost:8000. Is FastAPI running?");

                // Fallback Mock Data เผื่อเอาไว้เทส UI ตอน API ดับ
                setSavedSpecs([
                    {
                        id: "mock1", filename: "mock_data_1.json", project_name: "[Mock] E-Commerce App", created_at: "2026-02-27 10:30", status: "Draft",
                        content: {
                            project_name: "[Mock] E-Commerce App", problem_statement: "ต้องการระบบขายของออนไลน์ที่มีตะกร้าสินค้า", solution_overview: "ระบบ E-commerce",
                            functional_requirements: ["มีระบบ Login"], non_functional_requirements: ["โหลดเร็ว"], tech_stack_recommendation: ["Next.js"], status: "Draft"
                        }
                    }
                ]);
            }
        };

        initializeData();
    }, []);

    // --- Actions ---

    // โค้ดที่เรียก API ของจริง (ลบฟังก์ชัน simulate ทิ้งไปแล้ว)
    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedData(null);

        try {
            const response = await fetch(`${API_BASE_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                throw new Error('Generation failed');
            }

            const result = await response.json();

            // อัปเดตหน้าจอขวา
            setGeneratedData(result.data);

            // สั่งให้ดึงข้อมูลประวัติทางซ้ายใหม่ เพื่อให้ไฟล์ที่เพิ่งสร้างโผล่ขึ้นมา
            await fetchSpecs();

        } catch (error) {
            console.error("Error generating spec:", error);
            alert("เกิดข้อผิดพลาดในการ Generate กรุณาเช็คว่า FastAPI ทำงานอยู่หรือไม่");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (generatedData) {
            navigator.clipboard.writeText(JSON.stringify(generatedData, null, 2));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleLoadSpec = (spec: SavedSpec) => {
        setGeneratedData(spec.content);
        setPrompt(spec.content.problem_statement);
        setActiveTab('document');
    };

    const handleDeleteSpec = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this spec?")) {
            try {
                // ยิง API ไปลบข้อมูลใน Database ของจริง
                const response = await fetch(`${API_BASE_URL}/specs/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Failed to delete');

                // ถ้าลบสำเร็จ ให้อัปเดต State หน้าจอ
                setSavedSpecs(prev => prev.filter(s => s.id !== id));

                if (generatedData && savedSpecs.find(s => s.id === id)?.content.project_name === generatedData.project_name) {
                    setGeneratedData(null);
                    setPrompt("");
                }
            } catch (error) {
                console.error("Error deleting spec:", error);
                alert("ลบข้อมูลไม่สำเร็จ");
            }
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">

            {/* ---------------- SIDEBAR ---------------- */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
                <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Sparkles size={20} />
                    </div>
                    <h1 className="font-bold text-lg">Auto-Spec</h1>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">

                    {/* Storage Config & DB Status */}
                    <div>
                        <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-3">
                            <Database size={18} className="text-blue-500" />
                            <h3>Storage Backend</h3>
                        </div>

                        {dbStatus === 'connecting' && (
                            <div className="bg-slate-50 border border-slate-200 text-slate-600 text-sm p-3 rounded-lg flex items-center space-x-2 animate-pulse">
                                <Loader2 size={16} className="animate-spin text-slate-400" />
                                <span>Connecting to Python API...</span>
                            </div>
                        )}

                        {dbStatus === 'connected' && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg flex items-start space-x-2">
                                <Check size={16} className="mt-0.5 shrink-0 text-blue-600" />
                                <div>
                                    <span className="font-semibold block">API Connected</span>
                                    <span className="text-xs text-blue-600/80">Fetching live from PostgreSQL</span>
                                </div>
                            </div>
                        )}

                        {dbStatus === 'error' && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg flex items-start space-x-2">
                                <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                                <div>
                                    <span className="font-semibold block">API Disconnected</span>
                                    <span className="text-xs text-amber-600/90 leading-tight block mt-1">
                                        {apiErrorMessage}
                                    </span>
                                    <span className="text-xs font-semibold text-amber-700 mt-2 block">
                                        * Showing Mock Data for UI testing
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Configuration */}
                    <div>
                        <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-3">
                            <Settings size={18} className="text-slate-500" />
                            <h3>Configuration</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Model ID</label>
                                <input
                                    type="text" disabled value="gemini-2.5-flash"
                                    className="w-full text-sm p-2 bg-slate-100 border border-slate-200 rounded text-slate-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Saved Specs List */}
                    <div>
                        <div className="flex items-center space-x-2 text-slate-800 font-semibold mb-3">
                            <FileText size={18} className="text-amber-500" />
                            <h3>Saved Specs ({savedSpecs.length})</h3>
                        </div>

                        {savedSpecs.length === 0 ? (
                            <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                ยังไม่มี specs ที่ saved ให้สร้างตัวแรกได้เลย ✨
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {savedSpecs.map(spec => (
                                    <div
                                        key={spec.id}
                                        className={`group border rounded-lg p-3 transition bg-white ${generatedData?.project_name === spec.project_name
                                            ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                                            : 'border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer'
                                            }`}
                                    >
                                        <div onClick={() => handleLoadSpec(spec)}>
                                            <h4 className="font-semibold text-sm truncate text-slate-800">{spec.project_name}</h4>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-slate-400">{spec.created_at}</p>
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{spec.status}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons (Load / Delete) */}
                                        <div className="mt-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleLoadSpec(spec); }}
                                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1.5 rounded flex items-center justify-center"
                                            >
                                                <Edit3 size={12} className="mr-1" /> Load
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSpec(spec.id); }}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 px-2 rounded flex items-center justify-center"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------------- MAIN CONTENT ---------------- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Main Header */}
                <header className="bg-white border-b border-slate-200 p-4 px-8 shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">🚀 Auto-Spec Generator</h2>
                        <p className="text-sm text-slate-500">เปลี่ยนไอเดียฟุ้งๆ ให้เป็น Software Requirement แบบมืออาชีพ</p>
                    </div>
                </header>

                {/* 2-Column Workspace */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">

                        {/* COLUMN 1: INPUT (ซ้าย) */}
                        <div className="w-full lg:w-5/12 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
                                <User size={18} className="text-blue-500 mr-2" />
                                <h3 className="font-semibold">📥 Raw Idea Input</h3>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="พิมพ์สิ่งที่คิดออกลงไปเลย (ไม่จำเป็นต้องเรียบเรียง)..."
                                    className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none text-slate-700 leading-relaxed"
                                    disabled={isGenerating}
                                />

                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-mono">
                                        {prompt.length} chars
                                    </span>
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => setPrompt("")}
                                            className="px-4 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-100 transition"
                                            disabled={isGenerating || !prompt}
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !prompt.trim()}
                                            className={`inline-flex items-center px-6 py-2.5 rounded-xl font-medium transition-all ${isGenerating || !prompt.trim()
                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                }`}
                                        >
                                            {isGenerating ? (
                                                <><Loader2 size={18} className="animate-spin mr-2" /> Generating...</>
                                            ) : (
                                                <><Send size={18} className="mr-2" /> Generate Spec</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: OUTPUT (ขวา) */}
                        <div className="w-full lg:w-7/12 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

                            {/* Output Header & Tabs */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div className="flex items-center">
                                    <Bot size={18} className="text-emerald-500 mr-2" />
                                    <h3 className="font-semibold">📄 Structured Requirement</h3>
                                </div>

                                {/* Tabs Switcher */}
                                {generatedData && (
                                    <div className="flex items-center space-x-3">
                                        <div className="flex bg-slate-200/60 p-1 rounded-lg">
                                            <button
                                                onClick={() => setActiveTab('document')}
                                                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'document' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                <LayoutTemplate size={14} className="mr-1.5" /> Document
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('json')}
                                                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'json' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                <Code size={14} className="mr-1.5" /> JSON
                                            </button>
                                        </div>
                                        {/* ปุ่ม Close เทียบเท่า st.button("❌ Close") */}
                                        <button
                                            onClick={() => setGeneratedData(null)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
                                            title="Close Document"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Output Content Area */}
                            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6">

                                {isGenerating ? (
                                    // Loading State
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                                            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                        </div>
                                        <p className="animate-pulse font-medium text-slate-500">🤖 AI กำลังวิเคราะห์และเขียน Spec ให้คุณ...</p>
                                    </div>
                                ) : !generatedData ? (
                                    // Empty State
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                        <FileText size={64} className="opacity-20 text-slate-400" />
                                        <p className="text-sm">เลือกเอกสารจากเมนูด้านซ้าย หรือกดปุ่ม Generate เพื่อเริ่ม</p>
                                    </div>
                                ) : (
                                    // Data State
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">

                                        {/* Action Buttons (Copy & Save) */}
                                        <div className="flex justify-end space-x-2 mb-4">
                                            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition border border-emerald-200">
                                                <Save size={14} />
                                                <span>Save to DB</span>
                                            </button>
                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition shadow-sm"
                                            >
                                                {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                <span>{isCopied ? 'Copied!' : 'Copy JSON'}</span>
                                            </button>
                                        </div>

                                        {/* View: Document Format */}
                                        {activeTab === 'document' && (
                                            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm prose prose-slate max-w-none">
                                                <h1 className="text-2xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 mb-6">
                                                    🏗️ {generatedData.project_name}
                                                </h1>

                                                <div className="inline-block bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-8">
                                                    Status: {generatedData.status}
                                                </div>

                                                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-3">
                                                    <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded flex items-center justify-center text-sm mr-2">1</span>
                                                    Problem Statement
                                                </h3>
                                                <p className="text-slate-600 mb-8 leading-relaxed">{generatedData.problem_statement}</p>

                                                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-3">
                                                    <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded flex items-center justify-center text-sm mr-2">2</span>
                                                    Solution Overview
                                                </h3>
                                                <p className="text-slate-600 mb-8 leading-relaxed">{generatedData.solution_overview}</p>

                                                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-3">
                                                    <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded flex items-center justify-center text-sm mr-2">3</span>
                                                    Functional Requirements
                                                </h3>
                                                <ul className="space-y-2 mb-8 text-slate-600">
                                                    {generatedData.functional_requirements.map((req, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <ChevronRight size={16} className="mt-1 mr-2 text-blue-500 shrink-0" />
                                                            <span>{req}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-3">
                                                    <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded flex items-center justify-center text-sm mr-2">4</span>
                                                    Non-Functional Requirements
                                                </h3>
                                                <ul className="space-y-2 mb-8 text-slate-600">
                                                    {generatedData.non_functional_requirements.map((req, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <ChevronRight size={16} className="mt-1 mr-2 text-amber-500 shrink-0" />
                                                            <span>{req}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-3">
                                                    <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded flex items-center justify-center text-sm mr-2">5</span>
                                                    Tech Stack Recommendation
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {generatedData.tech_stack_recommendation.map((tech, i) => (
                                                        <span key={i} className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-md font-mono text-sm">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* View: JSON Format */}
                                        {activeTab === 'json' && (
                                            <div className="bg-slate-900 rounded-xl p-6 shadow-sm overflow-x-auto relative">
                                                <pre className="font-mono text-sm text-emerald-400">
                                                    <code>{JSON.stringify(generatedData, null, 2)}</code>
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}