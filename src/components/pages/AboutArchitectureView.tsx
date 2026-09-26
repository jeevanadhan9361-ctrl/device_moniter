/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Copy, Check, Download, Code, CheckCircle2, Shield, Layers } from 'lucide-react';
import {
  PYTHON_PYSIDE6_GUI_CODE,
  PYTHON_DIRECTSHOW_TOOL,
  PYTHON_MEDIA_FOUNDATION_TOOL,
  PYTHON_VALIDATE_BLACKBOX,
} from '../../data/nativeSourceCode';
import { SQLITE_SCHEMA_DDL } from '../../services/storageService';

export const AboutArchitectureView: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<'pyside6' | 'directshow' | 'media_foundation' | 'blackbox' | 'sqlite'>('pyside6');
  const [copied, setCopied] = useState(false);

  const scripts = {
    pyside6: {
      name: 'gui/main_pyside6.py',
      code: PYTHON_PYSIDE6_GUI_CODE,
      desc: 'Native PySide6 Desktop GUI and Windows System Tray security monitor application.',
    },
    directshow: {
      name: 'tools/test_directshow.py',
      code: PYTHON_DIRECTSHOW_TOOL,
      desc: 'Diagnostic tool for DirectShow COM camera filter graph enumeration.',
    },
    media_foundation: {
      name: 'tools/test_media_foundation.py',
      code: PYTHON_MEDIA_FOUNDATION_TOOL,
      desc: 'Investigative tool testing Windows Media Foundation device streams.',
    },
    blackbox: {
      name: 'tools/validate_camera_blackbox.py',
      code: PYTHON_VALIDATE_BLACKBOX,
      desc: 'Generic black-box correlation script validating network peers and process handles without hardcoded rules.',
    },
    sqlite: {
      name: 'db/schema.sql',
      code: SQLITE_SCHEMA_DDL,
      desc: 'SQLite DDL evidence storage schema with tables for events, chains, alerts, and collector health.',
    },
  };

  const current = scripts[selectedScript];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.name.split('/').pop() || 'script.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Architecture Specification & Native Windows Implementation
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Local-first architecture, ER data model, development phase audit, and native Python / PySide6 source code
        </p>
      </div>

      {/* Core Principle Banner */}
      <div className="rounded-xl bg-cyan-950/40 border border-cyan-800/80 p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-cyan-300 font-mono text-[11px] uppercase tracking-wider block">
            Core Architectural Law: "UNKNOWN is better than a false claim"
          </span>
          <p className="text-slate-300 leading-relaxed">
            The application must not claim camera active, camera inactive, remote access, malicious activity,
            exploitation, safe, or hacked unless the underlying evidence explicitly supports the conclusion.
            When evidence is ambiguous or incomplete, the system designates it as <strong>UNKNOWN</strong>.
          </p>
        </div>
      </div>

      {/* ER & Architecture Flow Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Core Pipeline Flow
          </h3>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2 leading-relaxed">
            <div>1. Windows Endpoint Sensors</div>
            <div className="text-cyan-400 pl-4">↳ DirectShow · Media Foundation · ETW · USN</div>
            <div>2. Evidence Normalization</div>
            <div className="text-cyan-400 pl-4">↳ Standard Common Event Model</div>
            <div>3. Activity Correlation & Anomaly Engine</div>
            <div className="text-cyan-400 pl-4">↳ Process ↔ Camera ↔ Network ↔ File</div>
            <div>4. Interpretation & ATT&CK Exploitation Analysis</div>
            <div>5. Evidence & Risk Engine (Explainability)</div>
            <div>6. SQLite Storage & Intrusive Alert Engine</div>
            <div>7. PySide6 / Desktop PWA Interface</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">
            Development Phase Checklist (Phase 0 – 18)
          </h3>
          <div className="space-y-1.5 text-xs font-mono max-h-56 overflow-y-auto pr-1">
            {[
              { phase: 'Phase 0', desc: 'Baseline audit & architecture verification', status: 'PASS' },
              { phase: 'Phase 1A', desc: 'DirectShow COM camera enumeration', status: 'PASS' },
              { phase: 'Phase 1B', desc: 'Media Foundation sensor investigation', status: 'PASS' },
              { phase: 'Phase 1C', desc: 'Camera process attribution logic', status: 'PASS' },
              { phase: 'Phase 2', desc: 'Network telemetry foundation (WFP/ETW)', status: 'PASS' },
              { phase: 'Phase 3', desc: 'Process ↔ Network socket correlation', status: 'PASS' },
              { phase: 'Phase 4', desc: 'Filesystem monitoring (USN Journal)', status: 'PASS' },
              { phase: 'Phase 5', desc: 'Windows Event telemetry (4688 / 5156)', status: 'PASS' },
              { phase: 'Phase 6', desc: 'Persistent SQLite event model', status: 'PASS' },
              { phase: 'Phase 7-11', desc: 'Activity correlation & ATT&CK mapping', status: 'PASS' },
              { phase: 'Phase 12-14', desc: 'Desktop GUI, System Tray, & Notifications', status: 'PASS' },
              { phase: 'Phase 15-18', desc: 'Security review & Monect validation', status: 'PASS' },
            ].map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white font-bold">{p.phase}:</span>
                  <span className="text-slate-400">{p.desc}</span>
                </div>
                <span className="text-emerald-400 font-bold shrink-0">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Native Windows Source Code Viewer */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              Native Windows Python / PySide6 Source Code
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Run this natively on Windows with <code className="text-cyan-400">pip install PySide6 comtypes psutil</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Script Selection Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {(['pyside6', 'directshow', 'media_foundation', 'blackbox', 'sqlite'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedScript(key)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                selectedScript === key
                  ? 'bg-slate-800 border-cyan-500 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {scripts[key].name}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 italic">
          {current.desc}
        </p>

        {/* Code Block */}
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
          {current.code}
        </pre>
      </div>
    </div>
  );
};
