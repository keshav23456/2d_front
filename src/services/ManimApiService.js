// import { API_CONFIG, QUALITY_OPTIONS, VIDEO_STATUS } from '../config/apiConfig.js';
// import { ApiError, handleApiResponse, createApiUrl } from '../utils/apiUtils.js';
import { API_CONFIG, QUALITY_OPTIONS, VIDEO_STATUS } from "./apiConfig.js";
import { ApiError, handleApiResponse, createApiUrl } from "./apiUtils.js";
class ManimApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.pollInterval = API_CONFIG.POLL_INTERVAL;
  }

  // Create AbortController for request cancellation
  createAbortController() {
    return new AbortController();
  }

  // Generic fetch wrapper with error handling
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return await handleApiResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  // Get API status and configuration
  async getApiStatus() {
    try {
      const url = createApiUrl(this.baseURL, '/');
      return await this.fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      throw new ApiError(`Failed to get API status: ${error.message}`, error.status || 500);
    }
  }

  // Check AI availability
  async getAiStatus() {
    try {
      const url = createApiUrl('/ai-status');
      return await this.fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      throw new ApiError(`Failed to get AI status: ${error.message}`, error.status || 500);
    }
  }

  // Generate video from prompt
  async generateVideo({ prompt, quality = QUALITY_OPTIONS.MEDIUM, useAi = true, signal = null }) {
    if (!prompt || prompt.trim().length === 0) {
      throw new ApiError('Prompt is required', 400);
    }

    if (!Object.values(QUALITY_OPTIONS).includes(quality)) {
      throw new ApiError(`Invalid quality option: ${quality}`, 400);
    }

    try {
      const url = createApiUrl('/generate-video');
      const requestBody = {
        prompt: prompt.trim(),
        quality,
        use_ai: useAi
      };

      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        signal
      });

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Video generation was cancelled', 499);
      }
      throw new ApiError(`Failed to generate video: ${error.message}`, error.status || 500);
    }
  }

  // Get video status
  async getVideoStatus(videoId) {
    if (!videoId) {
      throw new ApiError('Video ID is required', 400);
    }

    try {
      const url = createApiUrl(`/status/${videoId}`);
      return await this.fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      throw new ApiError(`Failed to get video status: ${error.message}`, error.status || 500);
    }
  }

  // Download video
  async downloadVideo(videoId) {
    if (!videoId) {
      throw new ApiError('Video ID is required', 400);
    }

    try {
      const url = createApiUrl(`/download/${videoId}`);
      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        throw new ApiError(`Download failed: ${response.statusText}`, response.status);
      }

      return response; // Return response for blob handling
    } catch (error) {
      throw new ApiError(`Failed to download video: ${error.message}`, error.status || 500);
    }
  }

  // Delete video
  async deleteVideo(videoId) {
    if (!videoId) {
      throw new ApiError('Video ID is required', 400);
    }

    try {
      const url = createApiUrl(`/delete/${videoId}`);
      return await this.fetchWithTimeout(url, { method: 'DELETE' });
    } catch (error) {
      throw new ApiError(`Failed to delete video: ${error.message}`, error.status || 500);
    }
  }

  // Poll video status until ready or error
  async pollVideoStatus(videoId, onProgress = null, signal = null) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          if (signal?.aborted) {
            reject(new ApiError('Status polling was cancelled', 499));
            return;
          }

          const status = await this.getVideoStatus(videoId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === VIDEO_STATUS.READY) {
            resolve(status);
          } else if (status.status === VIDEO_STATUS.NOT_FOUND) {
            reject(new ApiError('Video not found', 404));
          } else {
            // Continue polling
            setTimeout(poll, this.pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  // Complete video generation workflow with polling
  async generateVideoWithPolling({
    prompt,
    quality = QUALITY_OPTIONS.MEDIUM,
    useAi = true,
    onProgress = null,
    signal = null
  }) {
    try {
      // Step 1: Generate video
      const generateResponse = await this.generateVideo({
        prompt,
        quality,
        useAi,
        signal
      });

      if (generateResponse.status !== 'success' || !generateResponse.video_id) {
        throw new ApiError('Video generation failed', 500, generateResponse);
      }

      // Step 2: Poll for completion
      const finalStatus = await this.pollVideoStatus(
        generateResponse.video_id,
        onProgress,
        signal
      );

      return {
        ...generateResponse,
        finalStatus
      };
    } catch (error) {
      throw error;
    }
  }

  // Download video as blob with proper filename
  async downloadVideoBlob(videoId, filename = null) {
    try {
      const response = await this.downloadVideo(videoId);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `manim_animation_${videoId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, filename: link.download };
    } catch (error) {
      throw new ApiError(`Failed to download video: ${error.message}`, error.status || 500);
    }
  }

  // Batch operations
  async deleteMultipleVideos(videoIds) {
    const results = await Promise.allSettled(
      videoIds.map(id => this.deleteVideo(id))
    );

    return results.map((result, index) => ({
      videoId: videoIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  }

  // Health check with timeout
  async healthCheck() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await this.getApiStatus();
      clearTimeout(timeoutId);
      
      return {
        healthy: true,
        status: response.status,
        version: response.version,
        aiAvailable: response.ai_available
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
export const manimApi = new ManimApiService();

// Export individual methods for convenience
export const {
  getApiStatus,
  getAiStatus,
  generateVideo,
  getVideoStatus,
  downloadVideo,
  deleteVideo,
  pollVideoStatus,
  generateVideoWithPolling,
  downloadVideoBlob,
  deleteMultipleVideos,
  healthCheck
} = manimApi;

// Export service class for custom instances
export { ManimApiService };

// Utility hooks for React (optional)
export const useApiService = () => {
  return manimApi;
};

// Default export
export default manimApi;