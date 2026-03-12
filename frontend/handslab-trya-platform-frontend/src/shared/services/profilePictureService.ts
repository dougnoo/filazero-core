/**
 * Profile Picture Service
 * 
 * Service for handling profile picture uploads using presigned URLs
 */

import { platformApi } from './platformApi';

interface GenerateUploadUrlRequest {
  fileExtension: 'jpg' | 'png';
}

interface GenerateUploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

interface ConfirmUploadRequest {
  fileKey: string;
}

interface ConfirmUploadResponse {
  profilePictureUrl: string;
  message: string;
}

/**
 * Profile Picture Service
 */
class ProfilePictureService {
  /**
   * Generate presigned URL for profile picture upload
   */
  async generateUploadUrl(fileExtension: 'jpg' | 'png'): Promise<GenerateUploadUrlResponse> {
    const response = await platformApi.post<GenerateUploadUrlResponse>(
      '/users/profile-picture/upload-url',
      { fileExtension },
      'Erro ao gerar URL de upload'
    );
    return response;
  }

  /**
   * Upload file to S3 using presigned URL
   */
  async uploadFile(file: File, uploadUrl: string): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da imagem');
    }
  }

  /**
   * Confirm profile picture upload and update user profile
   */
  async confirmUpload(fileKey: string): Promise<ConfirmUploadResponse> {
    const response = await platformApi.post<ConfirmUploadResponse>(
      '/users/profile-picture/confirm',
      { fileKey },
      'Erro ao confirmar upload da imagem'
    );
    return response;
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(): Promise<void> {
    await platformApi.delete(
      '/users/profile-picture',
      'Erro ao remover foto de perfil'
    );
  }

  /**
   * Complete profile picture upload process
   * This method handles the entire flow: generate URL, upload file, confirm upload
   */
  async uploadProfilePicture(file: File): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Get file extension
    const fileExtension = this.getFileExtension(file);

    // Generate presigned URL
    const { uploadUrl, fileKey, publicUrl } = await this.generateUploadUrl(fileExtension);

    // Upload file to S3
    await this.uploadFile(file, uploadUrl);

    // Confirm upload and update profile
    await this.confirmUpload(fileKey);

    return publicUrl;
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Apenas arquivos JPG e PNG são permitidos');
    }
  }

  /**
   * Get file extension from file
   */
  private getFileExtension(file: File): 'jpg' | 'png' {
    if (file.type === 'image/png') {
      return 'png';
    }
    return 'jpg'; // Default to jpg for jpeg/jpg files
  }
}

export const profilePictureService = new ProfilePictureService();
export type {
  GenerateUploadUrlRequest,
  GenerateUploadUrlResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
};