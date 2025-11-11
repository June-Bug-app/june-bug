import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { PanelLeft, Search, Plus } from 'lucide-react'
import { useResizableSidebar } from '@/hooks/use-resizable-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export const Route = createFileRoute('/_authed/entries')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    sidebarWidth,
    isCollapsed,
    sidebarRef,
    startResizing,
    toggleCollapse,
  } = useResizableSidebar()

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Left Button Group - Show single button when open, group when collapsed */}
      {isCollapsed ? (
        <div className="absolute top-[0.5rem] left-[0.5rem] z-10 flex gap-1 bg-background rounded-md p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleCollapse}
          >
            <PanelLeft className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-[0.75rem] left-[0.75rem] z-10 h-8 w-8"
          onClick={toggleCollapse}
        >
          <PanelLeft className="h-3 w-3" />
        </Button>
      )}

      {/* Right Theme Toggle - Show in button group style when collapsed, standalone when open */}
      {isCollapsed ? (
        <div className="absolute top-[0.5rem] right-[0.5rem] z-10 flex gap-1 bg-background rounded-md p-1">
          <div className="h-8 w-8 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      ) : (
        <div className="absolute top-[0.75rem] right-[0.75rem] z-10">
          <ThemeToggle />
        </div>
      )}

      {/* Sidebar - Resizable width on left */}
      <aside
        ref={sidebarRef}
        className="bg-background transition-[width,padding] duration-300 ease-in-out overflow-hidden"
        style={{
          width: isCollapsed ? '0px' : `${sidebarWidth}px`,
          padding: isCollapsed ? '0' : '1rem',
        }}
      ></aside>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="w-1 bg-background cursor-col-resize transition-opacity duration-500"
          onMouseDown={startResizing}
        />
      )}

      {/* Main Content Area with Background */}
      <main
        className={`flex-1 ${isCollapsed ? 'bg-card' : 'bg-background pt-3'}`}
      >
        <div
          className={`bg-card h-full relative ${isCollapsed ? '' : 'rounded-tl-lg shadow-sm border-l'}`}
        >
          {/* Top border that stops before the notch */}
          {!isCollapsed && (
            <div
              className="absolute top-0 left-0 right-0 h-[0.5px] bg-border transition-opacity duration-500 ease-in-out"
              style={{ right: '65px', left: '8px' }}
            />
          )}

          {/* Notch background - Only visible when sidebar is open */}
          {!isCollapsed && (
            <div className="absolute top-0 right-0 transition-opacity duration-500 ease-in-out">
              <svg
                className="absolute top-0 right-0 w-21 h-10 pointer-events-none"
                viewBox="0 0 96 48"
                preserveAspectRatio="none"
              >
                <path
                  d="M 96,0 L 0,0 C 20,0 32,9 32,24 C 32,39 44,48 64,48 L 96,48 Z"
                  className="fill-background"
                />
                <path
                  d="M 0,0 C 20,0 32,9 32,24 C 32,39 44,48 64,48 L 96,48"
                  className="stroke-border fill-none"
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          )}
          <div className="p-6 pt-16">Main</div>
        </div>
      </main>
    </div>
  )
}
