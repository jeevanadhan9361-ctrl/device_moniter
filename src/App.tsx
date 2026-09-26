/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useEndpointMonitor } from './hooks/useEndpointMonitor';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ScenarioBar } from './components/common/ScenarioBar';
import { AlertModal } from './components/common/AlertModal';
import { RemediationScriptModal } from './components/common/RemediationScriptModal';
import { storageService } from './services/storageService';
import { auditReportGenerator } from './services/auditReportGenerator';

// Pages
import { DashboardView } from './components/pages/DashboardView';
import { CorrelationGraphView } from './components/pages/CorrelationGraphView';
import { EventsTimelineView } from './components/pages/EventsTimelineView';
import { IncidentDetailsView } from './components/pages/IncidentDetailsView';
import { DevicesView } from './components/pages/DevicesView';
import { ProcessesView } from './components/pages/ProcessesView';
import { NetworkView } from './components/pages/NetworkView';
import { DiagnosticsView } from './components/pages/DiagnosticsView';
import { SettingsView } from './components/pages/SettingsView';
import { AboutArchitectureView } from './components/pages/AboutArchitectureView';
import { SigmaRulesView } from './components/pages/SigmaRulesView';
import { CameraEvent, FileEvent, NetworkEvent, ProcessEvent } from './types';

export default function App() {
  const {
    events,
    chains,
    alerts,
    collectors,
    hardwareDevices,
    activeModalAlert,
    setActiveModalAlert,
    remediationModalParams,
    setRemediationModalParams,
    soundEnabled,
    toggleSound,
    voiceEnabled,
    toggleVoiceAlerts,
    autoKillEnabled,
    setAutoKillEnabled,
    desktopNotifStatus,
    requestDesktopNotifications,
    triggerMonectCameraScenario,
    triggerMonectFileScenario,
    triggerZoomBaselineScenario,
    triggerStealthHookScenario,
    handleRemediateAlert,
    handleRealFileAlert,
    handleRealCameraToggle,
    resetAllTelemetry,
    ingestEvent,
  } = useEndpointMonitor();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedChainId, setSelectedChainId] = useState<string | undefined>(undefined);

  const handleSelectChain = (chainId: string) => {
    setSelectedChainId(chainId);
    setActiveTab('correlation');
  };

  const handleInspectIncident = (chainId: string) => {
    setSelectedChainId(chainId);
    setActiveTab('incidents');
  };

  const handleExportDb = () => {
    const sqlDump = storageService.exportDatabaseDump(events, chains, alerts);
    const blob = new Blob([sqlDump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vigilance_evidence_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAuditReport = () => {
    const mdReport = auditReportGenerator.generateMarkdownReport(chains, alerts, events);
    const blob = new Blob([mdReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VigilanceEye_Forensic_Audit_Report_${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Custom injection handler from ScenarioBar
  const handleCustomInject = (customData: {
    processName: string;
    pid: number;
    remoteIp: string;
    action: 'CAMERA' | 'FILE';
    deviceHint: string;
  }) => {
    const ts = new Date().toISOString();

    const procEvt: ProcessEvent = {
      event_id: `evt_proc_custom_${Date.now()}`,
      timestamp: ts,
      event_type: 'PROCESS',
      source: 'ProcessTracker_ETW',
      process_id: customData.pid,
      process_name: customData.processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      action: 'START',
      executable_path: 'C:\\Users\\Admin\\AppData\\Local\\' + customData.processName,
      parent_process_name: 'explorer.exe',
      parent_process_id: 1140,
      command_line: customData.processName + ' --active',
      signature_status: 'UNSIGNED',
      publisher: 'Unknown Publisher',
      evidence_summary: `Custom process ${customData.processName} spawned.`,
      raw_payload: { IntegrityLevel: 'Medium' },
    };

    const netEvt: NetworkEvent = {
      event_id: `evt_net_custom_${Date.now()}`,
      timestamp: new Date(Date.now() + 100).toISOString(),
      event_type: 'NETWORK',
      source: 'ETW_WFP',
      process_id: customData.pid,
      process_name: customData.processName,
      user_session: 'DESKTOP-WIN11\\Admin',
      protocol: 'TCP',
      local_ip: '192.168.1.102',
      local_port: 9000,
      remote_ip: customData.remoteIp,
      remote_port: 54100,
      state: 'ESTABLISHED',
      classification: 'LAN',
      peer_device_hint: customData.deviceHint,
      evidence_summary: `Established TCP connection to remote peer ${customData.remoteIp}.`,
      raw_payload: { Direction: 'Inbound' },
    };

    ingestEvent(procEvt);
    setTimeout(() => ingestEvent(netEvt), 120);

    if (customData.action === 'CAMERA') {
      const camEvt: CameraEvent = {
        event_id: `evt_cam_custom_${Date.now()}`,
        timestamp: new Date(Date.now() + 200).toISOString(),
        event_type: 'CAMERA',
        source: 'MediaFoundation_MFT',
        process_id: customData.pid,
        process_name: customData.processName,
        user_session: 'DESKTOP-WIN11\\Admin',
        device: 'Integrated HD Webcam (Wide Vision)',
        camera_device_name: 'Integrated HD Webcam (Wide Vision)',
        driver_source: 'MediaFoundation',
        capture_state: 'CAPTURING',
        resolution: '1280x720',
        fps: 30,
        evidence_summary: `Media Foundation video stream delivering frames to ${customData.processName}.`,
        raw_payload: { Stream: 'Video', FPS: 30 },
      };
      setTimeout(() => ingestEvent(camEvt), 250);
    } else {
      const fileEvt: FileEvent = {
        event_id: `evt_file_custom_${Date.now()}`,
        timestamp: new Date(Date.now() + 200).toISOString(),
        event_type: 'FILE',
        source: 'USN_Journal_Watcher',
        process_id: customData.pid,
        process_name: customData.processName,
        user_session: 'DESKTOP-WIN11\\Admin',
        action: 'MODIFY',
        file_path: 'C:\\Users\\Admin\\Documents\\Project_Source.ts',
        file_extension: '.ts',
        is_sensitive_dir: true,
        evidence_summary: `Remote file write detected by PID ${customData.pid}.`,
        raw_payload: { BytesWritten: 12040 },
      };
      setTimeout(() => ingestEvent(fileEvt), 250);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoiceAlerts}
        desktopNotifStatus={desktopNotifStatus}
        onRequestDesktopNotifs={requestDesktopNotifications}
        onExportDb={handleExportDb}
        onExportAuditReport={handleExportAuditReport}
        hardwareDevices={hardwareDevices}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Scenario Bar: 1-Click Scenario Testing */}
      <ScenarioBar
        onTriggerMonectCamera={triggerMonectCameraScenario}
        onTriggerMonectFile={triggerMonectFileScenario}
        onTriggerZoomBaseline={triggerZoomBaselineScenario}
        onTriggerStealthHook={triggerStealthHookScenario}
        onReset={resetAllTelemetry}
        onCustomInject={handleCustomInject}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          alerts={alerts}
        />

        {/* Center Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/60">
          {activeTab === 'dashboard' && (
            <DashboardView
              chains={chains}
              alerts={alerts}
              hardwareDevices={hardwareDevices}
              events={events}
              onSelectChain={handleSelectChain}
              onOpenAlertModal={setActiveModalAlert}
              onNavigateTab={setActiveTab}
              onTriggerMonectCamera={triggerMonectCameraScenario}
              onTriggerMonectFile={triggerMonectFileScenario}
              onRealCameraChange={handleRealCameraToggle}
              onRealFileModified={handleRealFileAlert}
            />
          )}

          {activeTab === 'correlation' && (
            <CorrelationGraphView
              chains={chains}
              events={events}
              selectedChainId={selectedChainId}
              onSelectChain={setSelectedChainId}
              onInspectIncident={handleInspectIncident}
            />
          )}

          {activeTab === 'events' && (
            <EventsTimelineView events={events} />
          )}

          {activeTab === 'incidents' && (
            <IncidentDetailsView
              chains={chains}
              alerts={alerts}
              selectedChainId={selectedChainId}
              onRemediate={handleRemediateAlert}
              onOpenScript={setRemediationModalParams}
            />
          )}

          {activeTab === 'devices' && (
            <DevicesView hardwareDevices={hardwareDevices} />
          )}

          {activeTab === 'sigma' && (
            <SigmaRulesView />
          )}

          {activeTab === 'processes' && (
            <ProcessesView events={events} />
          )}

          {activeTab === 'network' && (
            <NetworkView events={events} />
          )}

          {activeTab === 'diagnostics' && (
            <DiagnosticsView collectors={collectors} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              autoKillEnabled={autoKillEnabled}
              onToggleAutoKill={() => setAutoKillEnabled((prev) => !prev)}
              onResetAll={resetAllTelemetry}
            />
          )}

          {activeTab === 'about' && (
            <AboutArchitectureView />
          )}
        </main>
      </div>

      {/* Intrusive Security Warning Modal (The exact Monect Camera/File pop up) */}
      <AlertModal
        alert={activeModalAlert}
        onClose={() => setActiveModalAlert(null)}
        onRemediate={handleRemediateAlert}
        onOpenScript={setRemediationModalParams}
        onViewChain={(chainId) => {
          setSelectedChainId(chainId);
          setActiveTab('correlation');
        }}
      />

      {/* Automated PowerShell & Batch Remediation Script Generator Modal */}
      <RemediationScriptModal
        params={remediationModalParams}
        onClose={() => setRemediationModalParams(null)}
      />
    </div>
  );
}
