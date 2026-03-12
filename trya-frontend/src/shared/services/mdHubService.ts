/**
 * MdHub Service
 * Centralized service for MdHub command operations with reusable patterns
 */

declare global {
  interface Window {
    MdHub: {
      command: {
        send: (module: string, command: string, data?: any) => Promise<any>;
      };
      module: {
        show: (moduleName: string) => void;
        hide: (moduleName: string) => void;
        isLoaded: (moduleName: string) => boolean;
      };
    };
  }
}

export interface MdHubFeatureToggles {
  // Patient management
  deletePatient?: boolean;
  removePatient?: boolean;
  editPatient?: boolean;
  setPatientAllergy?: boolean;
  
  // Prescription features
  historyPrescription?: boolean;
  optionsPrescription?: boolean;
  removePrescription?: boolean;
  addPrescriptionDrug?: boolean;
  removePrescriptionDrug?: boolean;
  editPrescriptionDrugTitle?: boolean;
  editPosology?: boolean;
  editQuantity?: boolean;
  
  // UI features
  buttonClose?: boolean;
  guidesOnboarding?: boolean;
  conclusionModalEdit?: boolean;
  showProtocol?: boolean;
  showHelpMenu?: boolean;
  editIdentification?: boolean;
  allowShareModal?: boolean;
  
  // Autocomplete features
  autocompleteManipulated?: boolean;
  autocompleteCompositions?: boolean;
  autocompletePheriperal?: boolean;
  
  // Other features
  setAllowedSignatureProviders?: boolean;
  forceSign?: boolean;
  copyMedicalRecords?: boolean;
  newFormula?: boolean;
  dropdownSync?: boolean;
  enableAlerts?: boolean;
}

export interface MdHubPatientData {
  idExterno: string;
  nome: string;
  cpf: string;
  sexo: "Masculino" | "Feminino" | "M" | "F" | "m" | "f";
  nome_social?: string;
  data_nascimento?: string; // dd/mm/YYYY
  nome_mae?: string;
  telefone?: string;
  email?: string;
  raca?: string;
}

export class MdHubService {
  /**
   * Check if MdHub is available
   */
  static isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.MdHub !== "undefined" &&
      !!window.MdHub.command &&
      !!window.MdHub.module
    );
  }

  /**
   * Generic command sender with error handling and logging
   */
  static async sendCommand(
    module: string,
    command: string,
    data?: any
  ): Promise<any> {
    try {
      if (!this.isAvailable()) {
        throw new Error("MdHub not available");
      }

      console.log(`[MdHub] Sending command: ${module}.${command}`, data);
      const result = await window.MdHub.command.send(module, command, data);
      console.log(`[MdHub] Command result:`, result);

      return result;
    } catch (error) {
      console.error(
        `[MdHub] Error sending command ${module}.${command}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Show a module
   */
  static showModule(moduleName: string): void {
    if (!this.isAvailable()) {
      throw new Error("MdHub is not available");
    }
    window.MdHub.module.show(moduleName);
  }

  /**
   * Show a module in a specific container (embedded mode)
   */
  static showModuleInContainer(moduleName: string, containerId: string): void {
    if (!this.isAvailable()) {
      throw new Error("MdHub is not available");
    }
    
    // Show the module - the container is handled by the script's data-container attribute
    window.MdHub.module.show(moduleName);
    console.log(`[MdHub] Module ${moduleName} shown in container ${containerId}`);
  }

  /**
   * Hide a module
   */
  static hideModule(moduleName: string): void {
    if (!this.isAvailable()) {
      throw new Error("MdHub is not available");
    }
    window.MdHub.module.hide(moduleName);
  }

  /**
   * Check if a module is loaded
   */
  static isModuleLoaded(moduleName: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }
    return window.MdHub.module.isLoaded(moduleName);
  }

  /**
   * Wait for MdHub to be available
   */
  static async waitForAvailability(timeout = 10000): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkAvailability = () => {
        if (this.isAvailable()) {
          resolve();
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error("MdHub not available after timeout"));
          return;
        }

        setTimeout(checkAvailability, 100);
      };

      checkAvailability();
    });
  }

  /**
   * Prescription Module Commands
   */
  static prescription = {
    async initialize(): Promise<void> {
      return MdHubService.sendCommand("plataforma.prescricao", "inicializar");
    },

    async setPatient(patientData: MdHubPatientData): Promise<void> {
      return MdHubService.sendCommand(
        "plataforma.prescricao",
        "setPaciente",
        patientData
      );
    },

    async setFeatureToggle(features: MdHubFeatureToggles): Promise<void> {
      return MdHubService.sendCommand(
        "plataforma.prescricao",
        "setFeatureToggle",
        features
      );
    },
  };

  /**
   * Utility method to format gender for MdHub
   */
  static formatGender(gender: string): "Masculino" | "Feminino" {
    const normalized = gender.toLowerCase();
    if (
      normalized === "male" ||
      normalized === "m" ||
      normalized === "masculino"
    ) {
      return "Masculino";
    }
    if (
      normalized === "female" ||
      normalized === "f" ||
      normalized === "feminino"
    ) {
      return "Feminino";
    }
    return "Masculino"; // Default fallback
  }

  /**
   * Utility method to format date to dd/mm/yyyy
   * Handles multiple input formats: ISO (YYYY-MM-DD), Brazilian (DD/MM/YYYY), American (MM/DD/YYYY)
   */
  static formatBirthDate(birthDate: string): string {
    try {
      // If already in Brazilian format (DD/MM/YYYY), return as is
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
        console.log("[MdHub] Date already in Brazilian format:", birthDate);
        return birthDate;
      }

      // If in ISO format (YYYY-MM-DD) or other formats, convert
      const date = new Date(birthDate);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("[MdHub] Invalid date format:", birthDate);
        return "";
      }

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const formatted = `${day}/${month}/${year}`;
      
      return formatted;
    } catch (error) {
      console.warn("[MdHub] Error formatting birth date:", error);
      return "";
    }
  }

  /**
   * Utility method to format CPF (remove non-digits)
   */
  static formatCPF(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }

  /**
   * Utility method to format phone (remove non-digits)
   */
  static formatPhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }
}

// Export singleton instance for backward compatibility
export const mdHubService = {
  isAvailable: () => MdHubService.isAvailable(),
  sendCommand: (module: string, command: string, data?: any) =>
    MdHubService.sendCommand(module, command, data),
  showModule: (moduleName: string) => MdHubService.showModule(moduleName),
  hideModule: (moduleName: string) => MdHubService.hideModule(moduleName),
  isModuleLoaded: (moduleName: string) =>
    MdHubService.isModuleLoaded(moduleName),
  waitForAvailability: (timeout?: number) =>
    MdHubService.waitForAvailability(timeout),
};
