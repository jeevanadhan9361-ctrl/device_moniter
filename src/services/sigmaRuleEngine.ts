/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SigmaRule {
  id: string;
  title: string;
  status: 'production' | 'experimental';
  description: string;
  author: string;
  logsource: {
    category: string;
    product: string;
  };
  detection: {
    condition: string;
    selection: Record<string, string | string[]>;
  };
  mitre_technique: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export const PRODUCTION_SIGMA_RULES: SigmaRule[] = [
  {
    id: 'sigma_monect_camera_exfil',
    title: 'Monect Mobile Client Remote Webcam Capture & LAN Socket Binding',
    status: 'production',
    description: 'Detects execution of MonectServer or mobile PC controllers establishing video stream capture pipelines concurrently with LAN peer socket listeners.',
    author: 'VigilanceEye EDR Research Lab',
    logsource: {
      category: 'process_creation & media_capture',
      product: 'windows',
    },
    detection: {
      selection: {
        'Image|endswith': ['\\MonectServer.exe', '\\MonectHost.exe', '\\PC_Remote.exe'],
        'MediaSubsystem': 'DirectShow / MediaFoundation',
        'CaptureState': 'CAPTURING',
        'RemoteAddress|cidr': ['192.168.0.0/16', '10.0.0.0/8', '172.16.0.0/12'],
      },
      condition: 'selection',
    },
    mitre_technique: 'T1125, T1020, T1021',
    severity: 'critical',
  },
  {
    id: 'sigma_unattended_remote_file_tamper',
    title: 'Remote Controller Process Modifying User Workspace Documents',
    status: 'production',
    description: 'Detects active write and edit operations performed by remote management tools in C:\\Users\\*\\Documents without interactive local user window focus.',
    author: 'VigilanceEye EDR Research Lab',
    logsource: {
      category: 'file_change & network_connection',
      product: 'windows',
    },
    detection: {
      selection: {
        'TargetFilename|startswith': 'C:\\Users\\',
        'TargetFilename|endswith': ['.docx', '.xlsx', '.pdf', '.ts', '.py', '.key'],
        'Action': 'MODIFY',
        'ProcessConnectionState': 'ESTABLISHED_LAN_PEER',
      },
      condition: 'selection',
    },
    mitre_technique: 'T1083, T1565',
    severity: 'high',
  },
  {
    id: 'sigma_stealth_camera_hook',
    title: 'Unsigned Binary Querying Video Capture Device Filters',
    status: 'production',
    description: 'Detects unsigned or self-signed binaries spawning from AppData or Temp folders that query DirectShow COM CLSID_VideoInputDeviceCategory.',
    author: 'VigilanceEye EDR Research Lab',
    logsource: {
      category: 'process_creation & com_access',
      product: 'windows',
    },
    detection: {
      selection: {
        'ImagePath|contains': ['\\AppData\\Local\\Temp\\', '\\Windows\\Temp\\'],
        'SignatureStatus': 'UNSIGNED',
        'RequestedCOM': '{860BB310-5D01-11D0-BD3B-00A0C911CE86}',
      },
      condition: 'selection',
    },
    mitre_technique: 'T1125, T1059',
    severity: 'high',
  },
];
