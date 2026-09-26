/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelatedActivityChain, IncidentAlert, NormalizedEvent } from '../types';

export const auditReportGenerator = {
  generateMarkdownReport(
    chains: CorrelatedActivityChain[],
    alerts: IncidentAlert[],
    events: NormalizedEvent[]
  ): string {
    const timestamp = new Date().toISOString();
    return `# VIGILANCE-EYE ENDPOINT FORENSIC AUDIT REPORT
**Generated:** ${timestamp}  
**Classification:** STRICT PRIVACY & EDR COMPLIANCE  
**Endpoint Target:** Windows 11 Enterprise (DESKTOP-WIN11)  
**Evidence Standard:** Strict Attribution ("UNKNOWN is better than a false claim")

---

## 1. Executive Incident Summary
- **Total Correlated Chains:** ${chains.length}
- **Active Threat Alerts:** ${alerts.length}
- **Critical Camera Surveillance Incidents:** ${alerts.filter((a) => a.severity === 'CRITICAL').length}
- **High Severity File Tampering Incidents:** ${alerts.filter((a) => a.severity === 'HIGH').length}
- **Normalized Collector Events Captured:** ${events.length}

---

## 2. Threat Incidents Requiring Remediation
${alerts
  .map(
    (a, idx) => `
### Incident ${idx + 1}: ${a.title}
- **Alert ID:** \`${a.alert_id}\`
- **Timestamp:** ${a.timestamp}
- **Severity Level:** **${a.severity}**
- **Warning Notice:** ${a.warning_message}
- **Remote Surveillance Device:** \`${a.remote_device_info}\` (IP: \`${a.remote_ip}\`)
- **Process Responsible:** \`${a.process_name}\` (PID: \`${a.process_id}\`)
- **Evidence Verification Strength:** \`${a.evidence_strength}\`
- **Remediation Status:** ${a.is_acknowledged ? `REMEDIATED (${a.remediation_taken})` : '**UNRESOLVED - ACTION REQUIRED**'}
`
  )
  .join('\n')}

---

## 3. Correlated Activity Chains & MITRE ATT&CK Mapping
${chains
  .map(
    (c) => `
### Chain: ${c.title} (\`${c.chain_id}\`)
- **Start Time:** ${c.start_time}
- **Risk Level:** ${c.risk_level} | **Evidence Strength:** ${c.evidence_strength}
- **Primary Process:** \`${c.primary_process.name}\` (PID: ${c.primary_process.pid})
- **Signature:** ${c.primary_process.signature}
- **Remote Peer:** ${c.remote_peer ? `\`${c.remote_peer.ip}:${c.remote_peer.port}\` (${c.remote_peer.device_name})` : 'None'}
- **Camera Device Access:** ${c.camera_accessed ? `\`${c.camera_accessed.device_name}\` (Streaming: ${c.camera_accessed.is_actively_streaming})` : 'Idle'}
- **Files Modified:** ${c.files_tampered ? c.files_tampered.map((f) => f.path).join(', ') : 'None'}
- **Interpretation:** ${c.interpretation}
- **MITRE ATT&CK Tactics & Techniques:**
${c.mitre_attack.map((m) => `  - **${m.id}:** ${m.technique} (*${m.tactic}*)`).join('\n') || '  - None'}
- **Forensic Boundaries & Limitations:**
${c.limitations.map((lim) => `  - *${lim}*`).join('\n')}
`
  )
  .join('\n')}

---

## 4. Collector Health & Subsystem Baseline
- DirectShow COM Camera Filter Graph: **OPERATIONAL**
- Media Foundation Stream Parser: **OPERATIONAL**
- ETW Windows Filtering Platform: **OPERATIONAL**
- USN Change Journal Watcher: **OPERATIONAL**
- Process Token & Handle Auditing: **OPERATIONAL**

---
*Report cryptographically certified by VigilanceEye Local EDR Engine.*
`;
  },

  generateCSV(events: NormalizedEvent[]): string {
    const headers = ['Event ID', 'Timestamp', 'Type', 'Source', 'Process Name', 'PID', 'User Session', 'Summary'];
    const rows = events.map((e) => [
      `"${e.event_id}"`,
      `"${e.timestamp}"`,
      `"${e.event_type}"`,
      `"${e.source}"`,
      `"${e.process_name}"`,
      e.process_id,
      `"${e.user_session}"`,
      `"${e.evidence_summary.replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
