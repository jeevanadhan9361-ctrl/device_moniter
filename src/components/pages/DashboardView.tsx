/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  Camera,
  Radio,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';
import {
  CorrelatedActivityChain,
  IncidentAlert,
  EndpointDeviceHardware,
  NormalizedEvent,
} from '../../types';
import { RealHardwareSensorMonitor } from '../common/RealHardwareSensorMonitor';
import { RealDirectoryWatcherPanel } from '../common/RealDirectoryWatcherPanel';
import { WatchedFileRecord } from '../../services/realDirectoryWatcherService';

interface DashboardViewProps {
  chains: CorrelatedActivityChain[];
  alerts: IncidentAlert[];
  hardwareDevices: EndpointDeviceHardware[];
  events: NormalizedEvent[];
  onSelectChain: (chainId: string) => void;
  onOpenAlertModal: (alert: IncidentAlert) => void;
  onNavigateTab: (tab: string) => void;
  onTriggerMonectCamera: () => void;
  onTriggerMonectFile: () => void;
  onRealCameraChange?: (isActive: boolean, deviceName: string) => void;
  onRealFileModified?: (file: WatchedFileRecord, summary: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  chains,
  alerts,
  hardwareDevices,
  events,
  onSelectChain,
  onOpenAlertModal,
  onNavigateTab,
  onTriggerMonectCamera,
  onTriggerMonectFile,
  onRealCameraChange,
  onRealFileModified,
}) => {
  const webcam = hardwareDevices.find((d) => d.type === 'WEBCAM');
  const isCameraStreaming = webcam?.current_state === 'ACTIVE_STREAMING';

  const criticalAlerts = alerts.filter((a) => !a.is_acknowledged && a.severity === 'CRITICAL');
  const highAlerts = alerts.filter((a) => !a.is_acknowledged && a.severity === 'HIGH');
  const activeAlerts = alerts.filter((a) => !a.is_acknowledged);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Active Remote Threat Banner (if critical remote surveillance active) */}
      {criticalAlerts.length > 0 && (
        <div className="rounded-xl bg-rose-950/70 border-2 border-rose-600/80 p-5 shadow-xl shadow-rose-950/40 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-rose-600/30 border border-rose-500 text-rose-400 shrink-0 mt-0.5 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700">
                    CRITICAL PRIVACY WARNING
                  </span>
                  <span className="text-xs text-rose-300 font-mono">
                    {criticalAlerts.length} Unacknowledged Incident(s)
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  Remote Device is Actively Accessing Laptop Hardware
                </h2>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  Device{' '}
                  <strong className="text-white font-mono">
                    {criticalAlerts[0].remote_device_info} ({criticalAlerts[0].remote_ip})
                  </strong>{' '}
                  is receiving active camera frames via process{' '}
                  <strong className="text-white font-mono">
                    {criticalAlerts[0].process_name} (PID {criticalAlerts[0].process_id})
                  </strong>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenAlertModal(criticalAlerts[0])}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span>View Threat & Remediate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Camera Privacy Posture */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Camera Privacy State</span>
            <Camera
              className={`w-4 h-4 ${
                isCameraStreaming ? 'text-rose-400 animate-pulse' : 'text-slate-500'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-bold font-mono ${
                isCameraStreaming ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isCameraStreaming ? 'ACTIVE STREAM' : 'IDLE / SECURE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {isCameraStreaming
              ? `Bound to PID ${webcam?.associated_pid || 'Unknown'} (${webcam?.associated_process || 'App'})`
              : 'DirectShow / Media Foundation idle'}
          </p>
        </div>

        {/* Metric 2: Remote Peer Connections */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Remote Peers</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              {chains.filter((c) => c.remote_peer && c.remote_peer.classification !== 'LOOPBACK').length}
            </span>
            <span className="text-xs text-slate-400">Connected</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {chains.find((c) => c.remote_peer)?.remote_peer?.device_name || 'No phone/external peers'}
          </p>
        </div>

        {/* Metric 3: Active Incidents / Alerts */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Threat Alerts</span>
            <AlertTriangle
              className={`w-4 h-4 ${activeAlerts.length > 0 ? 'text-rose-400' : 'text-slate-500'}`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                activeAlerts.length > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {activeAlerts.length}
            </span>
            <span className="text-xs text-slate-400">requiring action</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {criticalAlerts.length} Critical · {highAlerts.length} High
          </p>
        </div>

        {/* Metric 4: Normalized Event Telemetry */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Normalized Events</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              {events.length}
            </span>
            <span className="text-xs text-emerald-400 font-mono">6 Collectors</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            ETW · DirectShow · MFT · USN Journal
          </p>
        </div>
      </div>

      {/* Live Physical Hardware & Directory Integrity Auditing Section */}
      <div className="space-y-4">
        <RealHardwareSensorMonitor onCameraStateChange={onRealCameraChange} />
        <RealDirectoryWatcherPanel onFileModifiedAlert={onRealFileModified} />
      </div>

      {/* Central 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Correlated Activity Chains */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Correlated Endpoint Activity Chains
              </h3>
              <p className="text-xs text-slate-400">
                Multi-source correlation linking Processes ↔ Camera ↔ Network Peers ↔ Files
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('correlation')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>Full Correlation Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {chains.length === 0 ? (
              <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-8 text-center text-slate-500 text-xs">
                No active activity chains detected.
              </div>
            ) : (
              chains.map((chain) => {
                const isCritical = chain.risk_level === 'CRITICAL';
                const isHigh = chain.risk_level === 'HIGH';

                return (
                  <div
                    key={chain.chain_id}
                    onClick={() => onSelectChain(chain.chain_id)}
                    className={`rounded-xl p-4 transition-all cursor-pointer border ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-600'
                        : isHigh
                        ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border-rose-700'
                              : isHigh
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {chain.risk_level}
                        </span>
                        <h4 className="text-sm font-semibold text-white tracking-tight">
                          {chain.title}
                        </h4>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono shrink-0">
                        {new Date(chain.last_updated).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                      {chain.interpretation}
                    </p>

                    {/* Correlation Chain Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                        <span className="text-cyan-400">PID {chain.primary_process.pid}</span>
                        <span>{chain.primary_process.name}</span>
                      </span>

                      {chain.remote_peer && (
                        <span className="text-rose-300 bg-rose-950/50 px-2 py-1 rounded border border-rose-800/60 flex items-center gap-1.5">
                          <Smartphone className="w-3 h-3 text-rose-400" />
                          <span>Peer: {chain.remote_peer.ip}</span>
                        </span>
                      )}

                      {chain.camera_accessed?.is_actively_streaming && (
                        <span className="text-amber-300 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/60 flex items-center gap-1.5">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>Camera Streaming</span>
                        </span>
                      )}

                      {chain.files_tampered && chain.files_tampered.length > 0 && (
                        <span className="text-amber-300 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/60 flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span>{chain.files_tampered.length} File(s) Modified</span>
                        </span>
                      )}

                      <span className="ml-auto text-slate-500">
                        Evidence:{' '}
                        <strong className="text-slate-300">{chain.evidence_strength}</strong>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1/3): Quick Threat Scenario Launcher & Hardware Telemetry */}
        <div className="space-y-4">
          {/* Hardware Sensor Status Box */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              Endpoint Hardware Telemetry
            </h3>

            <div className="space-y-2.5 text-xs">
              {hardwareDevices.map((dev) => {
                const isActive = dev.current_state === 'ACTIVE_STREAMING';
                return (
                  <div
                    key={dev.device_id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block truncate max-w-[190px]">
                        {dev.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {dev.hardware_id}
                      </span>
                      {dev.associated_process && (
                        <span className="text-[11px] text-rose-400 font-mono block mt-1">
                          In Use By: {dev.associated_process} (PID {dev.associated_pid})
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        isActive
                          ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {dev.current_state}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Scenario Testing Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                Monect Scenario Verification
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validate endpoint privacy behavior when your phone connects to your laptop via Monect
              and attempts to open the webcam or edit local files.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={onTriggerMonectCamera}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-600/50 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-400" />
                  <span>Test Monect Camera Access</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
              </button>

              <button
                onClick={onTriggerMonectFile}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-600/50 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Test Monect File Edit</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
