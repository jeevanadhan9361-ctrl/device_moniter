/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cpu,
  Camera,
  Network,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { CorrelatedActivityChain, NormalizedEvent } from '../../types';

interface CorrelationGraphViewProps {
  chains: CorrelatedActivityChain[];
  events: NormalizedEvent[];
  selectedChainId?: string;
  onSelectChain: (chainId: string) => void;
  onInspectIncident: (chainId: string) => void;
}

export const CorrelationGraphView: React.FC<CorrelationGraphViewProps> = ({
  chains,
  events,
  selectedChainId,
  onSelectChain,
  onInspectIncident,
}) => {
  const activeChain = chains.find((c) => c.chain_id === selectedChainId) || chains[0];

  const relatedEvents = activeChain
    ? events.filter((e) => activeChain.related_event_ids.includes(e.event_id))
    : [];

  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'INFO'>('ALL');

  const filteredChains = chains.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.risk_level === filterType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Activity Correlation & Evidence Graph
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Module 3 & 4: Multi-source temporal correlation connecting Processes ↔ Device Handles ↔ Network Sockets ↔ Filesystem
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterType === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Chains ({chains.length})
          </button>
          <button
            onClick={() => setFilterType('CRITICAL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterType === 'CRITICAL'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterType('HIGH')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterType === 'HIGH'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            High
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chain List */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold block">
            Correlated Chains ({filteredChains.length})
          </span>

          <div className="space-y-2">
            {filteredChains.map((c) => {
              const isSelected = activeChain?.chain_id === c.chain_id;
              const isCrit = c.risk_level === 'CRITICAL';
              return (
                <div
                  key={c.chain_id}
                  onClick={() => onSelectChain(c.chain_id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                      : isCrit
                      ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                        c.risk_level === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : c.risk_level === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {c.risk_level}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(c.last_updated).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="font-semibold text-white tracking-tight mb-1 truncate">
                    {c.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>PID: {c.primary_process.pid}</span>
                    <span>
                      Strength: <strong className="text-cyan-300">{c.evidence_strength}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2/3): Interactive Evidence Chain Visual Graph */}
        <div className="lg:col-span-2 space-y-5">
          {activeChain ? (
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
              {/* Chain Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        activeChain.risk_level === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {activeChain.risk_level} SEVERITY
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Evidence Strength: <strong>{activeChain.evidence_strength}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {activeChain.title}
                  </h3>
                </div>

                <button
                  onClick={() => onInspectIncident(activeChain.chain_id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Detailed Forensic Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Visual Node Flow / Chain Diagram */}
              <div>
                <span className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-3">
                  Correlated Execution Sequence
                </span>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                  {/* Step 1: Process Node */}
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                        1. Process Node
                      </span>
                      <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-xs font-semibold text-white block truncate">
                      {activeChain.primary_process.name}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                      <div>PID: {activeChain.primary_process.pid}</div>
                      <div className="truncate text-slate-500">{activeChain.primary_process.signature}</div>
                    </div>
                  </div>

                  {/* Step 2: Camera Hardware Access Node */}
                  <div
                    className={`rounded-xl p-3.5 space-y-2 border relative ${
                      activeChain.camera_accessed
                        ? 'bg-rose-950/30 border-rose-600/70'
                        : 'bg-slate-950 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">
                        2. Device Capture
                      </span>
                      <Camera className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-xs font-semibold text-white block truncate">
                      {activeChain.camera_accessed?.device_name || 'Camera Idle'}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                      <div>State: {activeChain.camera_accessed?.is_actively_streaming ? 'STREAMING' : 'NONE'}</div>
                      <div className="text-slate-500">{activeChain.camera_accessed?.method || 'DirectShow/MFT'}</div>
                    </div>
                  </div>

                  {/* Step 3: Network Socket / Remote Peer */}
                  <div
                    className={`rounded-xl p-3.5 space-y-2 border relative ${
                      activeChain.remote_peer
                        ? 'bg-rose-950/30 border-rose-600/70'
                        : 'bg-slate-950 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                        3. Remote Peer Socket
                      </span>
                      <Network className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-xs font-semibold text-white block truncate">
                      {activeChain.remote_peer?.device_name || 'No Socket'}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                      <div>IP: {activeChain.remote_peer?.ip || 'N/A'}</div>
                      <div className="text-slate-500">Port: {activeChain.remote_peer?.port || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Step 4: Filesystem Modification */}
                  <div
                    className={`rounded-xl p-3.5 space-y-2 border relative ${
                      activeChain.files_tampered && activeChain.files_tampered.length > 0
                        ? 'bg-amber-950/30 border-amber-600/70'
                        : 'bg-slate-950 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                        4. File Operations
                      </span>
                      <FileText className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold text-white block truncate">
                      {activeChain.files_tampered?.length || 0} Files Accessed
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                      <div className="truncate">
                        {activeChain.files_tampered?.[0]?.path.split('\\').pop() || 'No File Mod'}
                      </div>
                      <div className="text-slate-500">USN Journal Audited</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Interpretation Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Engine Interpretation
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeChain.interpretation}
                </p>
              </div>

              {/* MITRE ATT&CK Matrix Mapping */}
              {activeChain.mitre_attack.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-slate-500 font-semibold block">
                    MITRE ATT&CK Framework Mapping
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeChain.mitre_attack.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5"
                      >
                        <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-950/70 border border-rose-800 px-1.5 py-0.5 rounded">
                          {m.id}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200 block">{m.technique}</span>
                          <span className="text-[10px] text-slate-400">Tactic: {m.tactic}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Limitations ("UNKNOWN is better than a false claim") */}
              {activeChain.limitations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Evidence Bounds & Forensic Limitations:</span>
                  </div>
                  {activeChain.limitations.map((lim, idx) => (
                    <p key={idx} className="text-slate-400 text-[11px] pl-5 list-disc leading-relaxed">
                      • {lim}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-500 text-xs">
              Select an activity chain from the left to visualize the correlation graph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
