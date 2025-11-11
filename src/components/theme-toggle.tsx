import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative h-8 w-8"
    >
      <Sun
        className={`absolute h-3 w-3 transition-all duration-500 ${
          theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-180 scale-0 opacity-0'
        }`}
      />
      <Moon
        className={`absolute h-3 w-3 transition-all duration-500 ${
          theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-180 scale-0 opacity-0'
        }`}
      />
    </Button>
  )
}
