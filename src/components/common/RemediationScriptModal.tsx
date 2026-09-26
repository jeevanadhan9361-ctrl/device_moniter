/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, X, ShieldAlert, Cpu, Network } from 'lucide-react';
import { remediationScriptGenerator, RemediationParams } from '../../services/remediationScriptGenerator';

interface RemediationScriptModalProps {
  params: RemediationParams | null;
  onClose: () => void;
}

export const RemediationScriptModal: React.FC<RemediationScriptModalProps> = ({
  params,
  onClose,
}) => {
  const [scriptType, setScriptType] = useState<'ps1' | 'bat'>('ps1');
  const [copied, setCopied] = useState(false);

  if (!params) return null;

  const scriptCode =
    scriptType === 'ps1'
      ? remediationScriptGenerator.generatePowerShellScript(params)
      : remediationScriptGenerator.generateBatchScript(params);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remediate_incident_${params.incidentId}.${scriptType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Windows EDR Automated Remediation Script
              </h3>
              <p className="text-xs text-slate-400">
                Instantly isolates peer <strong className="text-cyan-300 font-mono">{params.remoteIp}</strong> and terminates process <strong className="text-white font-mono">{params.processName} (PID {params.processId})</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch & Actions */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScriptType('ps1')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                scriptType === 'ps1'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              PowerShell (.ps1)
            </button>
            <button
              onClick={() => setScriptType('bat')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                scriptType === 'bat'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Windows Batch (.bat)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{scriptType}</span>
            </button>
          </div>
        </div>

        {/* Script Code Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-[11px] text-slate-300">
          <pre className="whitespace-pre leading-relaxed select-all">
            {scriptCode}
          </pre>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Run script as Administrator on the target Windows laptop.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
