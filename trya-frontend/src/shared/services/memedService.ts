import { platformApi } from "./platformApi";
import { MdHubService, MdHubPatientData } from "./mdHubService";
import {
  prescriptionService,
  CreatePrescriptionRequest,
} from "./prescriptionService";
import type {
  SyncMemedRequest,
  SyncMemedResponse,
  GetTokenResponse,
  MemedBeneficiaryData,
} from "@/app/(platform-authenticated)/medico/types/memed";

/**
 * Helper function to convert MemedBeneficiaryData to MdHub PatientData format
 * Note: CPF is passed complete (not anonymized) as required by Memed integration
 */
function beneficiaryToMemedPatient(
  beneficiary: MemedBeneficiaryData
): MdHubPatientData {
  return {
    idExterno: beneficiary.id,
    nome: beneficiary.name,
    cpf: MdHubService.formatCPF(beneficiary.cpf), // Complete CPF for Memed
    sexo: MdHubService.formatGender(beneficiary.gender || "Masculino"),
    telefone: beneficiary.phone
      ? MdHubService.formatPhone(beneficiary.phone)
      : undefined,
    email: beneficiary.email,
    data_nascimento: beneficiary.birthDate
      ? MdHubService.formatBirthDate(beneficiary.birthDate)
      : undefined,
    nome_mae: beneficiary.mother_name,
    nome_social: beneficiary.social_name,
  };
}

class MemedService {
  private onModuleShownCallback?: () => void;
  private currentBeneficiary?: MemedBeneficiaryData;
  private currentDoctorId?: string;
  private currentSessionId?: string;
  private currentRequestId?: string;
  private currentMemedToken?: string;

  /**
   * Set callback to be called when module is shown
   */
  setOnModuleShownCallback(callback: () => void): void {
    this.onModuleShownCallback = callback;
  }

  /**
   * Clear the callback
   */
  clearOnModuleShownCallback(): void {
    this.onModuleShownCallback = undefined;
  }

  /**
   * Set current context for prescription saving
   */
  setCurrentContext(
    doctorId: string,
    beneficiary: MemedBeneficiaryData,
    sessionId?: string,
    requestId?: string
  ): void {
    this.currentDoctorId = doctorId;
    this.currentBeneficiary = beneficiary;
    this.currentSessionId = sessionId;
    this.currentRequestId = requestId;
  }

  /**
   * Get Memed token for widget initialization
   */
  async getMemedToken(doctorId: string): Promise<string> {
    try {
      const response = await this.getDoctorToken(doctorId);
      return response.memedToken;
    } catch (error) {
      console.error("Error getting Memed token:", error);
      throw new Error("Failed to get Memed token for prescription");
    }
  }

  /**
   * Initialize Memed script in embedded mode
   */
  async initMemedEmbedded(
    doctorId: string,
    beneficiary: MemedBeneficiaryData,
    containerId: string = "memed-prescription-container",
    sessionId?: string,
    requestId?: string
  ): Promise<void> {
    try {
      // Set current context for prescription saving
      this.setCurrentContext(doctorId, beneficiary, sessionId, requestId);

      // Get token first
      const token = await this.getMemedToken(doctorId);
      this.currentMemedToken = token;
      await this.initMemedWithScriptElement(token, beneficiary, containerId);
    } catch (error) {
      console.error("Error initializing Memed embedded:", error);
      throw error;
    }
  }

  /**
   * Initialize Memed using script element
   */
  private async initMemedWithScriptElement(
    token: string,
    beneficiary: MemedBeneficiaryData,
    containerId: string
  ): Promise<void> {
    // Remove existing script if any
    const existingScript = document.querySelector('script[data-memed="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create script element with proper attributes
    const script = document.createElement("script");
    script.src =
      process.env.NEXT_PUBLIC_MEMED_SCRIPT_URL ||
      "https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js";
    script.dataset.token = token;
    script.dataset.container = containerId;
    script.dataset.memed = "true";
    script.type = "text/javascript";

    // Set up the prescription function globally before loading the script
    (window as any).prescricaoMemed = () => {
      this.prescricaoMemed(beneficiary, containerId);
    };

    // Add load event listener
    script.addEventListener("load", () => {
      console.log("Memed script loaded");
      if (typeof (window as any).prescricaoMemed === "function") {
        (window as any).prescricaoMemed();
      }
    });

    // Add error handler
    script.addEventListener("error", (error) => {
      console.error("Failed to load Memed script:", error);
      throw new Error("Failed to load Memed script");
    });

    document.head.appendChild(script);
  }

  /**
   * Setup patient data and show prescription module
   */
  private async setupPrescriptionModule(
    beneficiary: MemedBeneficiaryData,
    containerId: string
  ): Promise<void> {
    try {
      if (!MdHubService.isAvailable()) {
        console.error("❌ MdHub not available");
        return;
      }

      // Configure features
      await MdHubService.prescription.setFeatureToggle({
        guidesOnboarding: false,
        removePatient: false,
        conclusionModalEdit: false,
      });

      // Convert beneficiary to Memed format
      const patientData = beneficiaryToMemedPatient(beneficiary);

      // Set patient data
      await MdHubService.prescription.setPatient(patientData);

      // Show in container
      MdHubService.showModuleInContainer("plataforma.prescricao", containerId);

      // Notify callbacks
      if (this.onModuleShownCallback) {
        this.onModuleShownCallback();
      }

      if ((window as any).onMemedModuleShown) {
        (window as any).onMemedModuleShown();
      }
    } catch (error) {
      console.error(`❌ Error setting up prescription module:`, error);
      throw error;
    }
  }

  /**
   * Function triggered after script load
   */
  private prescricaoMemed(
    beneficiary: MemedBeneficiaryData,
    containerId: string
  ): void {
    if (typeof (window as any).MdSinapsePrescricao === "undefined") {
      console.error("MdSinapsePrescricao not loaded");
      return;
    }

    const MdSinapsePrescricao = (window as any).MdSinapsePrescricao;

    MdSinapsePrescricao.event.add("core:moduleInit", async (module: any) => {
      if (module.name === "plataforma.prescricao") {
        await this.setupPrescriptionModule(beneficiary, containerId);
        this.setupPrescriptionListener();
      }
    });
  }

  /**
   * Set up prescription completion listener
   */
  private setupPrescriptionListener(): void {
    if (typeof (window as any).MdHub === "undefined") {
      console.error("MdHub not available for prescription listener");
      return;
    }

    const MdHub = (window as any).MdHub;

    MdHub.event.add("prescricaoImpressa", async (prescriptionData: any) => {
      try {
        await this.handlePrescriptionCreated(prescriptionData);
      } catch (error) {
        console.error("❌ Error handling prescription creation:", error);
      } finally {
        // Hide the Memed module
        MdHub.module.hide("plataforma.prescricao");
        
        // Dispatch event to close modal and show approval buttons
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('prescriptionCompleted', {
            detail: { 
              requestId: this.currentRequestId,  // MAR ID for comparison
              sessionId: this.currentSessionId,  // Session ID for reference
              prescriptionData 
            }
          }));
        }
      }
    });
  }

  /**
   * Handle prescription creation - only save prescription, don't auto-approve
   */
  private async handlePrescriptionCreated(
    prescriptionData: any
  ): Promise<void> {
    if (
      !this.currentDoctorId ||
      !this.currentBeneficiary ||
      !this.currentMemedToken
    ) {
      console.error("❌ Missing context for prescription saving");
      return;
    }

    try {
      const memedPrescriptionId = prescriptionData?.prescricao?.id;
      if (!memedPrescriptionId) {
        return;
      }

      const prescriptionRequest: CreatePrescriptionRequest = {
        memedToken: this.currentMemedToken,
        memedPrescriptionId: String(memedPrescriptionId),
        doctorId: this.currentDoctorId,
        patientId: this.currentBeneficiary.id,
        patientName: this.currentBeneficiary.name,
        sessionId: this.currentSessionId,
      };

      await prescriptionService.savePrescription(prescriptionRequest);
    } catch (error) {
      console.error("❌ Error saving prescription:", error);
    }
  }

  /**
   * Cleanup Memed integration
   */
  cleanup(): void {
    try {
      const script = document.querySelector('script[data-memed="true"]');
      if (script) {
        script.remove();
      }

      if (typeof (window as any).prescricaoMemed !== "undefined") {
        delete (window as any).prescricaoMemed;
      }

      if (MdHubService.isAvailable()) {
        try {
          MdHubService.hideModule("plataforma.prescricao");
        } catch (error) {
          console.warn("Error hiding Memed module:", error);
        }
      }

      // Clear callback and context
      this.clearOnModuleShownCallback();
      this.currentBeneficiary = undefined;
      this.currentDoctorId = undefined;
      this.currentSessionId = undefined;
      this.currentRequestId = undefined;
      this.currentMemedToken = undefined;
    } catch (error) {
      console.error("Error cleaning up Memed:", error);
    }
  }

  // Sync-related methods
  async syncDoctor(data: SyncMemedRequest): Promise<SyncMemedResponse> {
    const response = await platformApi.post<SyncMemedResponse>(
      "/prescriptors/sync",
      data
    );
    return response;
  }

  async getDoctorToken(doctorId: string): Promise<GetTokenResponse> {
    const response = await platformApi.get<GetTokenResponse>(
      `/prescriptors/${doctorId}/token`
    );
    return response;
  }

  async checkSyncStatus(doctorId: string): Promise<boolean> {
    try {
      await this.getDoctorToken(doctorId);
      return true;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response: { status: number } };
        if (
          axiosError.response?.status === 400 ||
          axiosError.response?.status === 404
        ) {
          return false;
        }
      }
      throw error;
    }
  }
}

export const memedService = new MemedService();
