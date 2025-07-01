import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Bot,
  AlertTriangle,
  Settings,
  Zap,
  CheckCircle,
  FileText,
  Play,
  Code,
  Lightbulb
} from 'lucide-react'
import toast from 'react-hot-toast'
import ApiService from '../services/ApiService'

const VideoGenerator = ({ onVideoGenerated, aiStatus, backendStatus }) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [useAi, setUseAi] = useState(true)
  const [quality, setQuality] = useState('medium')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const textareaRef = useRef(null)

  const qualityOptions = [
    { value: 'low', label: 'Low (480p)', description: 'Fast generation, smaller file' },
    { value: 'medium', label: 'Medium (720p)', description: 'Good balance of quality and speed' },
    { value: 'high', label: 'High (1080p)', description: 'Best quality, longer generation time' }
  ]

  const examplePrompts = [
    "A sine wave transforming into a cosine wave with colorful gradient",
    "Mathematical equation solving animation with step-by-step visualization",
    "Geometric shapes morphing into each other in 3D space",
    "Data visualization showing growth over time with animated charts",
    "Physics simulation of pendulum motion with equations",
    "Abstract mathematical concept visualization with particles"
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (backendStatus !== 'connected') {
      toast.error('Backend is not connected. Please check your server.')
      return
    }

    setIsGenerating(true)
    setCurrentStep('Initializing...')
    setGenerationProgress(0)
    
    try {
      // Simulate progress steps
      const steps = [
        { step: 'Processing prompt...', progress: 20 },
        { step: 'Generating code...', progress: 40 },
        { step: 'Rendering animation...', progress: 70 },
        { step: 'Finalizing video...', progress: 90 }
      ]

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i].step)
        setGenerationProgress(steps[i].progress)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const response = await ApiService.generateVideo(prompt, quality, useAi)
      
      setCurrentStep('Complete!')
      setGenerationProgress(100)
      setGeneratedVideo(response)
      onVideoGenerated(response)
      
      toast.success('Video generated successfully!')
      
      // Reset form
      setPrompt('')
      
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error.message || 'Failed to generate video')
    } finally {
      setIsGenerating(false)
      setCurrentStep('')
      setGenerationProgress(0)
      setTimeout(() => setGeneratedVideo(null), 5000) // Clear success state after 5s
    }
  }

  const handlePromptChange = (e) => {
    setPrompt(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const handleExampleClick = (example) => {
    setPrompt(example)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Success State */}
      <AnimatePresence>
        {generatedVideo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-green-600/20 border border-green-500/50 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-green-400 font-semibold">Video Generated Successfully!</h3>
                <p className="text-green-300 text-sm">
                  Your video has been created and added to your library. Check the Video Library tab to view it.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Generator Form */}
      <div className="glass rounded-2xl p-8 mb-8">
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="mb-4"
          >
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Generate Your Video
          </h2>
          <p className="text-slate-400">
            Describe what you want to animate and let AI create it for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label className="block text-white font-medium mb-3">
              <FileText className="w-5 h-5 inline mr-2" />
              Animation Description
            </label>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe the animation you want to create... For example: 'A sine wave transforming into a cosine wave with colorful gradient'"
              className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[120px] transition-all"
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-slate-400 text-sm">
                {prompt.length}/1000 characters
              </span>
              {prompt.length > 800 && (
                <span className="text-yellow-400 text-sm">
                  Consider keeping it concise for better results
                </span>
              )}
            </div>
          </div>

          {/* Example Prompts */}
          {!isGenerating && prompt.length === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-white font-medium mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Example Prompts
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {examplePrompts.map((example, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all text-sm text-slate-300 hover:text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    "{example}"
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Advanced Settings</span>
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.div>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {/* Quality Selection */}
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Video Quality
                    </label>
                    <div className="space-y-2">
                      {qualityOptions.map((option) => (
                        <motion.label
                          key={option.value}
                          className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            quality === option.value
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <input
                            type="radio"
                            name="quality"
                            value={option.value}
                            checked={quality === option.value}
                            onChange={(e) => setQuality(e.target.value)}
                            className="mt-1"
                            disabled={isGenerating}
                          />
                          <div>
                            <div className="text-white font-medium">{option.label}</div>
                            <div className="text-slate-400 text-sm">{option.description}</div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* AI Enhancement */}
                  <div>
                    <label className="block text-white font-medium mb-3">
                      AI Enhancement
                    </label>
                    <motion.label
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        useAi && aiStatus?.ready_for_ai
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-slate-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <input
                        type="checkbox"
                        checked={useAi}
                        onChange={(e) => setUseAi(e.target.checked)}
                        className="mt-1"
                        disabled={isGenerating || !aiStatus?.ready_for_ai}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-green-400" />
                          <span className="text-white font-medium">Use AI Enhancement</span>
                        </div>
                        <div className="text-slate-400 text-sm mt-1">
                          {aiStatus?.ready_for_ai 
                            ? 'Enhance prompts and generate better code'
                            : 'AI enhancement is currently unavailable'
                          }
                        </div>
                      </div>
                    </motion.label>

                    {!aiStatus?.ready_for_ai && (
                      <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-500/50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-300 text-sm">
                            AI features are limited. Fallback mode will be used.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generation Progress */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{currentStep}</span>
                  <span className="text-slate-400">{generationProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>This may take a few minutes...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isGenerating || !prompt.trim() || backendStatus !== 'connected'}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
              isGenerating || !prompt.trim() || backendStatus !== 'connected'
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
            }`}
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Video...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Generate Video</span>
              </>
            )}
          </motion.button>

          {/* Status Warning */}
          {backendStatus !== 'connected' && (
            <div className="p-4 bg-red-600/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">
                  Backend is not connected. Please check if the server is running.
                </span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          className="glass rounded-xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Bot className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
          <p className="text-slate-400 text-sm">
            Advanced AI enhances your prompts and generates optimized animation code
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Code className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Manim Engine</h3>
          <p className="text-slate-400 text-sm">
            Powered by Manim for professional-quality mathematical animations
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Play className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">HD Quality</h3>
          <p className="text-slate-400 text-sm">
            Generate videos in multiple quality options up to 1080p resolution
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default VideoGenerator