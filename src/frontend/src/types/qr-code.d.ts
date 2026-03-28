declare module "qr-code/useQRScanner" {
  import type { RefObject } from "react";

  export interface QRResult {
    data: string;
    timestamp: number;
  }

  export interface QRScannerConfig {
    facingMode?: "user" | "environment";
    scanInterval?: number;
    maxResults?: number;
    jsQRUrl?: string;
  }

  export interface CameraError {
    message: string;
    name?: string;
  }

  export interface UseQRScannerReturn {
    qrResults: QRResult[];
    isScanning: boolean;
    jsQRLoaded: boolean;
    isActive: boolean;
    isSupported: boolean | null;
    error: CameraError | null;
    isLoading: boolean;
    currentFacingMode: "user" | "environment";
    startScanning: () => Promise<boolean>;
    stopScanning: () => Promise<void>;
    switchCamera: () => Promise<boolean>;
    clearResults: () => void;
    reset: () => void;
    retry: () => Promise<boolean>;
    videoRef: RefObject<HTMLVideoElement>;
    canvasRef: RefObject<HTMLCanvasElement>;
    isReady: boolean;
    canStartScanning: boolean;
  }

  export function useQRScanner(config?: QRScannerConfig): UseQRScannerReturn;
}
