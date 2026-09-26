/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FrameStats {
  timestamp: number;
  fps: number;
  luminance: number;
  motionDetected: boolean;
  frameDifferenceScore: number;
  streamResolution: string;
}

export interface AudioStats {
  decibels: number;
  isActiveAudio: boolean;
}

type FrameListener = (stats: FrameStats) => void;
type AudioListener = (stats: AudioStats) => void;

class HardwareSensorService {
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private previousFrameData: Uint8ClampedArray | null = null;
  private animationFrameId: number | null = null;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioDataArray: Uint8Array | null = null;
  private audioIntervalId: number | null = null;

  private frameListeners: Set<FrameListener> = new Set();
  private audioListeners: Set<AudioListener> = new Set();

  private isMonitoringHardware: boolean = false;
  private fpsCounter: number = 0;
  private lastFpsCalcTime: number = Date.now();
  private currentCalculatedFps: number = 0;

  public async requestCameraAndMic(): Promise<{
    success: boolean;
    stream?: MediaStream;
    error?: string;
  }> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { success: false, error: 'WebRTC mediaDevices API is not supported in this browser.' };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      this.mediaStream = stream;
      this.isMonitoringHardware = true;
      this.startHardwareAnalysis(stream);

      return { success: true, stream };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  public async enumeratePhysicalDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      return await navigator.mediaDevices.enumerateDevices();
    } catch (e) {
      console.warn('Could not enumerate physical devices', e);
      return [];
    }
  }

  public isHardwareActive(): boolean {
    return this.isMonitoringHardware && !!this.mediaStream;
  }

  public getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  private startHardwareAnalysis(stream: MediaStream) {
    // 1. Setup Video & Canvas Frame Diff Analyzer
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
        this.videoElement.muted = true;
      }
      this.videoElement.srcObject = stream;
      this.videoElement.play().catch(() => {});

      if (!this.canvasElement) {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.width = 160;
        this.canvasElement.height = 120;
        this.canvasCtx = this.canvasElement.getContext('2d', { willReadFrequently: true });
      }

      this.processVideoFrame();
    }

    // 2. Setup Audio Spectrum Analyzer
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      try {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
          const source = this.audioCtx.createMediaStreamSource(stream);
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);

          const bufferLength = this.analyser.frequencyBinCount;
          this.audioDataArray = new Uint8Array(bufferLength);

          this.audioIntervalId = window.setInterval(() => {
            if (!this.analyser || !this.audioDataArray) return;
            (this.analyser as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(this.audioDataArray);

            let sum = 0;
            for (let i = 0; i < this.audioDataArray.length; i++) {
              sum += this.audioDataArray[i];
            }
            const average = sum / this.audioDataArray.length;
            const decibels = Math.round((average / 255) * 100);

            const stats: AudioStats = {
              decibels,
              isActiveAudio: decibels > 15,
            };

            this.audioListeners.forEach((l) => l(stats));
          }, 200);
        }
      } catch (e) {
        console.warn('Audio analysis setup skipped', e);
      }
    }
  }

  private processVideoFrame = () => {
    if (!this.isMonitoringHardware) return;

    if (
      this.videoElement &&
      this.videoElement.readyState >= 2 &&
      this.canvasElement &&
      this.canvasCtx
    ) {
      const w = this.canvasElement.width;
      const h = this.canvasElement.height;

      this.canvasCtx.drawImage(this.videoElement, 0, 0, w, h);
      const imgData = this.canvasCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Calculate Luminance & Frame Difference
      let totalLuminance = 0;
      let totalDiff = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;

        if (this.previousFrameData) {
          const prevR = this.previousFrameData[i];
          const prevG = this.previousFrameData[i + 1];
          const prevB = this.previousFrameData[i + 2];
          const prevLum = 0.299 * prevR + 0.587 * prevG + 0.114 * prevB;
          totalDiff += Math.abs(lum - prevLum);
        }
      }

      const avgLuminance = Math.round(totalLuminance / pixelCount);
      const avgDiff = Math.round(totalDiff / pixelCount);
      this.previousFrameData = new Uint8ClampedArray(data);

      // FPS tracking
      this.fpsCounter++;
      const now = Date.now();
      if (now - this.lastFpsCalcTime >= 1000) {
        this.currentCalculatedFps = this.fpsCounter;
        this.fpsCounter = 0;
        this.lastFpsCalcTime = now;
      }

      const resolution = `${this.videoElement.videoWidth || 1280}x${this.videoElement.videoHeight || 720}`;

      const stats: FrameStats = {
        timestamp: now,
        fps: this.currentCalculatedFps || 30,
        luminance: avgLuminance,
        motionDetected: avgDiff > 8,
        frameDifferenceScore: avgDiff,
        streamResolution: resolution,
      };

      this.frameListeners.forEach((l) => l(stats));
    }

    this.animationFrameId = requestAnimationFrame(this.processVideoFrame);
  };

  public stopHardwareMonitoring() {
    this.isMonitoringHardware = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioIntervalId) {
      clearInterval(this.audioIntervalId);
      this.audioIntervalId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    this.previousFrameData = null;
  }

  public subscribeFrame(listener: FrameListener): () => void {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }

  public subscribeAudio(listener: AudioListener): () => void {
    this.audioListeners.add(listener);
    return () => this.audioListeners.delete(listener);
  }
}

export const hardwareSensorService = new HardwareSensorService();
