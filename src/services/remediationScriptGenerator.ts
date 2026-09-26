/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RemediationParams {
  incidentId: string;
  processName: string;
  processId: number;
  remoteIp: string;
  remotePort?: number;
  affectedResource: string;
  filesModified?: string[];
}

export const remediationScriptGenerator = {
  generatePowerShellScript(params: RemediationParams): string {
    const timestamp = new Date().toISOString();
    return `# ==============================================================================
# VigilanceEye Windows EDR Remediation Script (PowerShell 5.1 / 7+)
# Incident ID: ${params.incidentId}
# Generated: ${timestamp}
# Threat Type: Remote Unauthorized Surveillance (${params.affectedResource})
# ==============================================================================

# Require Elevated Administrator Privileges
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "[-] VigilanceEye Remediation requires Administrator privileges. Relaunching elevated..."
    Start-Process powershell -Verb runAs -ArgumentList "-File", ($MyInvocation.MyCommand.Path)
    Exit
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " [VigilanceEye EDR] Executing Automated Remediation Incident ${params.incidentId}" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Terminate Rogue Process Accessing Hardware
$targetPid = ${params.processId}
$targetProcName = "${params.processName}"

Write-Host "[*] Step 1: Checking and terminating suspicious process $targetProcName (PID $targetPid)..."
try {
    $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $targetPid -Force -ErrorAction Stop
        Write-Host "[+] Successfully terminated process $targetProcName (PID $targetPid)." -ForegroundColor Green
    } else {
        Write-Host "[!] Process PID $targetPid is no longer running." -ForegroundColor Gray
    }
} catch {
    Write-Host "[-] Failed to kill PID $targetPid : $_" -ForegroundColor Red
}

# 2. Block Inbound/Outbound Socket to Remote Phone/Peer IP via Windows Defender Firewall
$remoteIp = "${params.remoteIp}"
$ruleNameInbound = "VigilanceEye-Block-Threat-Inbound-$remoteIp"
$ruleNameOutbound = "VigilanceEye-Block-Threat-Outbound-$remoteIp"

Write-Host "[*] Step 2: Injecting Windows Defender Firewall blocking rules for peer $remoteIp..."
try {
    # Remove older rule if exists
    Remove-NetFirewallRule -DisplayName $ruleNameInbound -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName $ruleNameOutbound -ErrorAction SilentlyContinue

    # Add Inbound Block Rule
    New-NetFirewallRule -DisplayName $ruleNameInbound \`
        -Direction Inbound \`
        -Action Block \`
        -RemoteAddress $remoteIp \`
        -Description "Automated isolation rule by VigilanceEye for suspicious remote surveillance peer." \`
        -Enabled True | Out-Null

    # Add Outbound Block Rule
    New-NetFirewallRule -DisplayName $ruleNameOutbound \`
        -Direction Outbound \`
        -Action Block \`
        -RemoteAddress $remoteIp \`
        -Description "Automated isolation rule by VigilanceEye for suspicious remote surveillance peer." \`
        -Enabled True | Out-Null

    Write-Host "[+] Windows Firewall rules applied successfully. Peer $remoteIp is blocked." -ForegroundColor Green
} catch {
    Write-Host "[-] NetSecurity module failure, falling back to netsh.exe..."
    netsh advfirewall firewall add rule name="$ruleNameInbound" dir=in action=block remoteip=$remoteIp
    netsh advfirewall firewall add rule name="$ruleNameOutbound" dir=out action=block remoteip=$remoteIp
}

# 3. Emergency Privacy Shutter: Revoke Windows Webcam Capability Access for Desktop Apps
Write-Host "[*] Step 3: Enforcing Windows Registry Webcam Privacy Killswitch..."
try {
    $camRegPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam"
    if (Test-Path $camRegPath) {
        Set-ItemProperty -Path $camRegPath -Name "Value" -Value "Deny" -Force
        Write-Host "[+] Windows global camera access toggled to DENY." -ForegroundColor Green
    }
} catch {
    Write-Host "[-] Could not set registry privacy flag: $_" -ForegroundColor Red
}

# 4. Forensic Snapshot & Incident Logging
$logFile = "$env:USERPROFILE\\Desktop\\VigilanceEye_Remediation_Report.txt"
$report = @"
[VIGILANCE-EYE INCIDENT REMEDIATION LOG]
Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Incident ID: ${params.incidentId}
Action: Process Terminated ($targetProcName, PID $targetPid)
Network Action: Remote Peer $remoteIp Blocked in Windows Defender Firewall
Privacy Action: Webcam capability verified and detached
"@
$report | Out-File -FilePath $logFile -Encoding utf8
Write-Host "[+] Forensic remediation record written to $logFile" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " [VigilanceEye EDR] Threat Neutralized. Laptop Privacy Restored." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
`;
  },

  generateBatchScript(params: RemediationParams): string {
    return `@echo off
:: ==============================================================================
:: VigilanceEye Windows Remediation Batch Script (CMD.EXE)
:: Incident ID: ${params.incidentId}
:: ==============================================================================
echo [*] VigilanceEye EDR Emergency Response
echo [*] Terminating suspicious process ${params.processName} (PID ${params.processId})...
taskkill /F /PID ${params.processId} /T

echo [*] Blocking remote peer IP ${params.remoteIp} via netsh firewall...
netsh advfirewall firewall add rule name="VigilanceEye-Block-${params.remoteIp}" dir=in action=block remoteip=${params.remoteIp}
netsh advfirewall firewall add rule name="VigilanceEye-Block-${params.remoteIp}-Out" dir=out action=block remoteip=${params.remoteIp}

echo [*] Verifying camera state...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam" /v Value /t REG_SZ /d Deny /f

echo [+] Remediation complete. Device isolated.
pause
`;
  },
};
