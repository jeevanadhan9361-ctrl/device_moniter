/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  Camera,
  FileText,
  ShieldAlert,
  X,
  Radio,
  Ban,
  Slash,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { IncidentAlert } from '../../types';
import { RemediationParams } from '../../services/remediationScriptGenerator';

interface AlertModalProps {
  alert: IncidentAlert | null;
  onClose: () => void;
  onRemediate: (
    alertId: string,
    action: 'BLOCKED_IP' | 'TERMINATED_PROCESS' | 'TRUSTED' | 'DISMISSED'
  ) => void;
  onViewChain: (chainId: string) => void;
  onOpenScript?: (params: RemediationParams) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  alert,
  onClose,
  onRemediate,
  onViewChain,
  onOpenScript,
}) => {
  if (!alert) return null;

  const isCamera = alert.affected_resource === 'CAMERA' || alert.affected_resource === 'CAMERA_AND_FILES';
  const isFiles = alert.affected_resource === 'FILES' || alert.affected_resource === 'CAMERA_AND_FILES';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-xl bg-slate-900 border-2 border-rose-600/90 shadow-2xl shadow-rose-950/50 overflow-hidden text-slate-100 flex flex-col">
        {/* Urgent Alert Banner Header */}
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-600/30 border border-rose-500 text-rose-400 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  CRITICAL PRIVACY WARNING
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {alert.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Warning Content */}
        <div className="p-6 space-y-5">
          {/* Main notification statement */}
          <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-700/50 flex items-start gap-3.5">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed text-slate-200 font-medium">
              <p className="text-rose-200 font-semibold mb-1">
                {alert.warning_message}
              </p>
              <p className="text-xs text-slate-400">
                The Windows Endpoint Correlation Engine has detected an established socket binding
                correlating physical device capture frames to this remote LAN peer.
              </p>
            </div>
          </div>

          {/* Forensic Evidence Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block mb-1">Remote Monitoring Device</span>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white font-mono truncate">
                  {alert.remote_device_info}
                </span>
              </div>
              <span className="text-slate-400 font-mono block mt-1">
                IP: <strong className="text-cyan-300">{alert.remote_ip}</strong>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 block mb-1">Associated Process</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white font-mono">
                  {alert.process_name}
                </span>
                <span className="text-slate-500 font-mono">PID {alert.process_id}</span>
              </div>
              <span className="text-emerald-400 font-mono block mt-1">
                Evidence: <strong>{alert.evidence_strength}</strong>
              </span>
            </div>
          </div>

          {/* Resource Details Box */}
          <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-3 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">Affected Telemetry Sources:</span>
            {isCamera && (
              <div className="flex items-center gap-2 text-rose-300">
                <Camera className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Camera Stream:</strong> Active video capture frames queried via Media Foundation / DirectShow. Frame transmission active.
                </span>
              </div>
            )}
            {isFiles && (
              <div className="flex items-center gap-2 text-amber-300">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Filesystem:</strong> Write/modification events intercepted in user directories via USN Journal & ReadDirectoryChangesW.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onViewChain(alert.chain_id);
              onClose();
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Inspect Correlated Evidence Chain &rarr;
          </button>

          <div className="flex items-center gap-2">
            {onOpenScript && (
              <button
                onClick={() =>
                  onOpenScript({
                    incidentId: alert.alert_id,
                    processName: alert.process_name,
                    processId: alert.process_id,
                    remoteIp: alert.remote_ip,
                    affectedResource: alert.affected_resource,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 transition-colors"
                title="Generate PowerShell (.ps1) or Batch (.bat) remediation script"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Script (.ps1)</span>
              </button>
            )}

            <button
              onClick={() => onRemediate(alert.alert_id, 'BLOCKED_IP')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Slash className="w-3.5 h-3.5 text-amber-400" />
              <span>Block Remote IP</span>
            </button>

            <button
              onClick={() => onRemediate(alert.alert_id, 'TERMINATED_PROCESS')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/50 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Kill Process & Stop Stream</span>
            </button>

            <button
              onClick={() => onRemediate(alert.alert_id, 'TRUSTED')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Mark this device as authorized for remote monitoring"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trust Device</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
