import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface FloatingJuneBugProps {
  shouldAnimate: boolean
  isSidebarOpen: boolean
  onAnimationComplete: () => void
  onClick: () => void
}

export function FloatingJuneBug({
  shouldAnimate,
  isSidebarOpen,
  onAnimationComplete,
  onClick,
}: FloatingJuneBugProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldWiggle, setShouldWiggle] = useState(false)

  // Check if user has already seen the prompt
  useEffect(() => {
    if (shouldAnimate) {
      const hasSeenPrompt = localStorage.getItem('juneBugPromptSeen')
      if (!hasSeenPrompt) {
        setIsAnimating(true)
      }
    }
  }, [shouldAnimate])

  // Dismiss animation when sidebar opens and save to localStorage
  useEffect(() => {
    if (isSidebarOpen && isAnimating) {
      setIsAnimating(false)
      localStorage.setItem('juneBugPromptSeen', 'true')
      onAnimationComplete()
    }
  }, [isSidebarOpen, isAnimating, onAnimationComplete])

  // Happy wiggle when sidebar opens
  useEffect(() => {
    if (isSidebarOpen) {
      setShouldWiggle(true)
      const timer = setTimeout(() => {
        setShouldWiggle(false)
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [isSidebarOpen])

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 group',
        'transition-all duration-300 ease-in-out',
        'hover:scale-110 focus:outline-none rounded-full',
        !isSidebarOpen && 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isAnimating && 'animate-bounce',
        shouldWiggle && 'animate-happy-wiggle'
      )}
      aria-label="Open entry prompts"
    >
      <div
        className={cn(
          'relative w-16 h-16 rounded-full',
          'transition-all duration-300',
          !isSidebarOpen && 'bg-background shadow-lg border-2 border-primary/20',
          !isSidebarOpen && 'group-hover:border-primary/40 group-hover:shadow-xl',
          isAnimating && 'animate-pulse'
        )}
      >
        <img
          src="/apple-touch-icon.png"
          alt="June Bug Logo"
          className="w-full h-full rounded-full p-2"
        />
        {isAnimating && (
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        )}
      </div>
      {isAnimating && (
        <div className="absolute bottom-0 right-full mr-3 whitespace-nowrap">
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-lg animate-in fade-in zoom-in-95 duration-300">
            Click me for prompts! 🎯
          </div>
        </div>
      )}
    </button>
  )
}
