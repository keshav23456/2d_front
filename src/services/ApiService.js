import axios from 'axios'

// Configure base URL - change this to match your backend URL
const BASE_URL = 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 minutes timeout for video generation
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response received from: ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('Response error:', error)
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Backend server is not running. Please start the server first.')
    }
    if (error.response?.status === 500) {
      throw new Error(error.response.data?.detail || 'Internal server error occurred')
    }
    if (error.response?.status === 422) {
      throw new Error('Invalid request data. Please check your input.')
    }
    throw error
  }
)

class ApiService {
  // Get API status
  static async getStatus() {
    const response = await apiClient.get('/')
    return response.data
  }

  // Check AI availability
  static async getAiStatus() {
    const response = await apiClient.get('/ai-status')
    return response.data
  }

  // Generate video from prompt
  static async generateVideo(prompt, quality = 'medium', useAi = true) {
    const response = await apiClient.post('/generate-video', {
      prompt,
      quality,
      use_ai: useAi
    })
    return response.data
  }

  // Download video
  static async downloadVideo(videoId) {
    const response = await apiClient.get(`/download/${videoId}`, {
      responseType: 'blob'
    })
    return response
  }

  // Get video status
  static async getVideoStatus(videoId) {
    const response = await apiClient.get(`/status/${videoId}`)
    return response.data
  }

  // Delete video
  static async deleteVideo(videoId) {
    const response = await apiClient.delete(`/delete/${videoId}`)
    return response.data
  }

  // Generate download URL
  static getDownloadUrl(videoId) {
    return `${BASE_URL}/download/${videoId}`
  }
}

export default ApiService