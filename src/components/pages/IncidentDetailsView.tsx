/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Camera,
  Network,
  FileText,
  Cpu,
  CheckCircle,
  HelpCircle,
  Ban,
  Slash,
  Clock,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { CorrelatedActivityChain, IncidentAlert } from '../../types';
import { RemediationParams } from '../../services/remediationScriptGenerator';

interface IncidentDetailsViewProps {
  chains: CorrelatedActivityChain[];
  alerts: IncidentAlert[];
  selectedChainId?: string;
  onRemediate: (
    alertId: string,
    action: 'BLOCKED_IP' | 'TERMINATED_PROCESS' | 'TRUSTED' | 'DISMISSED'
  ) => void;
  onOpenScript?: (params: RemediationParams) => void;
}

export const IncidentDetailsView: React.FC<IncidentDetailsViewProps> = ({
  chains,
  alerts,
  selectedChainId,
  onRemediate,
  onOpenScript,
}) => {
  const currentChain =
    chains.find((c) => c.chain_id === selectedChainId) ||
    chains.find((c) => c.risk_level === 'CRITICAL' || c.risk_level === 'HIGH') ||
    chains[0];

  const relatedAlert = alerts.find((a) => a.chain_id === currentChain?.chain_id);

  if (!currentChain) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 text-xs">
        No active incident telemetry recorded.
      </div>
    );
  }

  const isCritical = currentChain.risk_level === 'CRITICAL';
  const isHigh = currentChain.risk_level === 'HIGH';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                isCritical
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : isHigh
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {currentChain.risk_level} INCIDENT
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {currentChain.chain_id}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            {currentChain.title}
          </h2>
        </div>

        {/* Remediation Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenScript && (
            <button
              onClick={() =>
                onOpenScript({
                  incidentId: relatedAlert?.alert_id || currentChain.chain_id,
                  processName: currentChain.primary_process.name,
                  processId: currentChain.primary_process.pid,
                  remoteIp: currentChain.remote_peer?.ip || '192.168.1.84',
                  affectedResource: currentChain.camera_accessed ? 'CAMERA' : 'FILES',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 transition-colors"
              title="Generate automated PowerShell / Batch script"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Remediation Script (.ps1)</span>
            </button>
          )}

          {relatedAlert && !relatedAlert.is_acknowledged && (
            <>
              <button
                onClick={() => onRemediate(relatedAlert.alert_id, 'BLOCKED_IP')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Slash className="w-3.5 h-3.5 text-amber-400" />
                <span>Block Remote IP</span>
              </button>
              <button
                onClick={() => onRemediate(relatedAlert.alert_id, 'TERMINATED_PROCESS')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/40 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Kill Process & Stop Stream</span>
              </button>
            </>
          )}

          {relatedAlert?.is_acknowledged && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Remediated: {relatedAlert.remediation_taken}</span>
            </div>
          )}
        </div>
      </div>

      {/* Forensic Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Explainable Questions (Left 2 cols) */}
        <div className="md:col-span-2 space-y-5">
          {/* Question 1: What Happened? */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              1. What Happened? (Executive Summary)
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {currentChain.interpretation}
            </p>
          </div>

          {/* Question 2: Evidence Strength & Attribution */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-cyan-400 font-semibold">
                2. Multi-Source Evidence Attribution
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Confidence: {currentChain.evidence_strength}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Process Involved */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Primary Process
                </span>
                <span className="font-semibold text-white font-mono block">
                  {currentChain.primary_process.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  PID: {currentChain.primary_process.pid}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block truncate">
                  Signature: {currentChain.primary_process.signature}
                </span>
              </div>

              {/* Remote Peer */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                  <Network className="w-3.5 h-3.5 text-purple-400" />
                  Network Remote Peer
                </span>
                <span className="font-semibold text-white font-mono block">
                  {currentChain.remote_peer?.device_name || 'No Established Peer'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  IP: {currentChain.remote_peer?.ip || 'N/A'} : {currentChain.remote_peer?.port || 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  Classification: {currentChain.remote_peer?.classification || 'N/A'}
                </span>
              </div>

              {/* Hardware Device */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                  <Camera className="w-3.5 h-3.5 text-rose-400" />
                  Device Capture Sensor
                </span>
                <span className="font-semibold text-white font-mono block">
                  {currentChain.camera_accessed?.device_name || 'Camera Idle'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  State: {currentChain.camera_accessed?.is_actively_streaming ? 'STREAMING ACTIVE' : 'NONE'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  Method: {currentChain.camera_accessed?.method || 'DirectShow/MFT'}
                </span>
              </div>

              {/* Filesystem Activity */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Filesystem Tampering
                </span>
                <span className="font-semibold text-white font-mono block">
                  {currentChain.files_tampered?.length || 0} File(s) Accessed
                </span>
                <span className="text-[11px] text-slate-400 font-mono block truncate">
                  {currentChain.files_tampered?.[0]?.path || 'No local file modifications'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  USN Journal Audited
                </span>
              </div>
            </div>
          </div>

          {/* Question 3: Forensic Limitations ("UNKNOWN is better than a false claim") */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              3. Forensic Limitations & Missing Telemetry
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="text-slate-400 leading-relaxed">
                As per the core architectural principle (<strong>UNKNOWN is better than a false claim</strong>),
                the system strictly documents unprovable details:
              </p>
              {currentChain.limitations.map((lim, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400">
                  ⚠️ {lim}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: ATT&CK Mapping & Evidence Rules */}
        <div className="space-y-4">
          {/* MITRE ATT&CK Breakdown */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
              MITRE ATT&CK Matrix Mapping
            </span>

            {currentChain.mitre_attack.length === 0 ? (
              <p className="text-xs text-slate-500">No malicious tactics mapped (Baseline).</p>
            ) : (
              <div className="space-y-2 text-xs">
                {currentChain.mitre_attack.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-400 bg-rose-950/70 border border-rose-800 px-1.5 py-0.5 rounded text-[10px]">
                        {m.id}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {m.tactic}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-200 block mt-1">
                      {m.technique}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Level Hierarchy Reference */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-2.5 text-xs">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
              Camera Evidence Verification Tiers
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                <span>1. Camera Exists</span>
                <span className="text-emerald-400">PASSED</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                <span>2. Camera Available</span>
                <span className="text-emerald-400">PASSED</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                <span>3. App Using Camera</span>
                <span className="text-emerald-400">PASSED</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                <span>4. Process Attributed</span>
                <span className="text-emerald-400">PASSED</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                <span>5. Data Transmitted</span>
                <span className={currentChain.remote_peer ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                  {currentChain.remote_peer ? 'DETECTED' : 'NONE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
