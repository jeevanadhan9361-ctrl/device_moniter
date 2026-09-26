/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { audioAlertService } from './audioAlertService';

class NotificationService {
  private hasRequestedPermission = false;
  private voiceEnabled = true;

  public async requestDesktopPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      this.hasRequestedPermission = true;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  /**
   * Fires a native OS Windows desktop toast notification.
   * Works even when the browser or PWA is minimized or running in the background.
   */
  public triggerDesktopAlert(
    title: string,
    body: string,
    options?: {
      tag?: string;
      critical?: boolean;
      requireInteraction?: boolean;
    }
  ) {
    // 1. Play audio klaxon
    audioAlertService.playSecurityWarning(options?.critical ? 'CRITICAL' : 'HIGH');

    // 2. Synthesize voice speech warning
    if (this.voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const speechText = options?.critical
          ? 'Security warning. Your camera is actively being viewed by a remote device.'
          : 'Warning. Suspicious remote endpoint activity detected.';
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis skipped', e);
      }
    }

    // 3. Issue Native Windows Desktop Notification Toast
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: options?.tag || 'vigilance-threat',
          requireInteraction: options?.requireInteraction !== false, // Stays on screen until user clicks
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('Native notification spawn error', err);
      }
    }
  }
}

export const notificationService = new NotificationService();
