declare module 'html5-qrcode' {
  export const Html5QrcodeSupportedFormats: any;

  export class Html5Qrcode {
    constructor(elementIdOrElement: string | HTMLElement, config?: any);
    start(
      cameraConfig: any,
      config?: any,
      qrCodeSuccessCallback?: (decodedText: string) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    isScanning?: boolean;
    static getCameras?(): Promise<Array<{ id: string; label?: string }>>;
  }

  export default Html5Qrcode;
}
