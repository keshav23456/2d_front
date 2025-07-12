// import axios from 'axios'

// // Configure base URL - change this to match your backend URL
// const BASE_URL = 'http://localhost:8000'

// const apiClient = axios.create({
//   baseURL: BASE_URL,
//   timeout: 300000, // 5 minutes timeout for video generation
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// // Add request interceptor for debugging
// apiClient.interceptors.request.use(
//   (config) => {
//     console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
//     return config
//   },
//   (error) => {
//     console.error('Request error:', error)
//     return Promise.reject(error)
//   }
// )

// // Add response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => {
//     console.log(`Response received from: ${response.config.url}`)
//     return response
//   },
//   (error) => {
//     console.error('Response error:', error)
    
//     if (error.code === 'ECONNREFUSED') {
//       throw new Error('Backend server is not running. Please start the server first.')
//     }
    
//     if (error.response) {
//       // Handle HTTP error statuses
//       switch (error.response.status) {
//         case 400:
//           throw new Error(error.response.data?.detail || 'Bad request')
//         case 401:
//           throw new Error('Unauthorized access')
//         case 403:
//           throw new Error('Forbidden access')
//         case 404:
//           throw new Error('Resource not found')
//         case 422:
//           throw new Error(error.response.data?.detail || 'Invalid request data. Please check your input.')
//         case 500:
//           throw new Error(error.response.data?.detail || 'Internal server error occurred')
//         default:
//           throw new Error(`Request failed with status code ${error.response.status}`)
//       }
//     } else if (error.request) {
//       // The request was made but no response was received
//       throw new Error('No response received from server. The server may be down.')
//     } else {
//       // Something happened in setting up the request
//       throw new Error('Error setting up request: ' + error.message)
//     }
//   }
// )

// class ApiService {
//   // Get API status
//   static async getStatus() {
//     try {
//       const response = await apiClient.get('/')
//       return response.data
//     } catch (error) {
//       console.error('Error getting API status:', error)
//       throw error
//     }
//   }

//   // Check AI availability
//   static async getAiStatus() {
//     try {
//       const response = await apiClient.get('/ai-status')
//       return response.data
//     } catch (error) {
//       console.error('Error getting AI status:', error)
//       throw error
//     }
//   }

//   // Generate video from prompt
//   static async generateVideo(prompt, quality = 'medium', useAi = true) {
//     try {
//       const response = await apiClient.post('/generate-video', {
//         prompt,
//         quality,
//         use_ai: useAi
//       })
//       return response.data
//     } catch (error) {
//       console.error('Error generating video:', error)
//       throw error
//     }
//   }

//   // Download video
//   static async downloadVideo(videoId) {
//     try {
//       const response = await apiClient.get(`/download/${videoId}`, {
//         responseType: 'blob'
//       })
//       return response
//     } catch (error) {
//       console.error('Error downloading video:', error)
//       throw error
//     }
//   }

//   // Get video status
//   static async getVideoStatus(videoId) {
//     try {
//       const response = await apiClient.get(`/status/${videoId}`)
//       return response.data
//     } catch (error) {
//       console.error('Error getting video status:', error)
//       throw error
//     }
//   }

//   // Delete video
//   static async deleteVideo(videoId) {
//     try {
//       const response = await apiClient.delete(`/delete/${videoId}`)
//       return response.data
//     } catch (error) {
//       console.error('Error deleting video:', error)
//       throw error
//     }
//   }

//   // Generate download URL
//   static getDownloadUrl(videoId) {
//     return `${BASE_URL}/download/${videoId}`
//   }
// }

// export default ApiService