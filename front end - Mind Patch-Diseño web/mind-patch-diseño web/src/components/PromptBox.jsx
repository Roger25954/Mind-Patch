import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as DialogPrimitive from "@radix-ui/react-dialog"

function cn(...inputs) { return inputs.filter(Boolean).join(" ") }

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset}
      style={{ background: '#1a1a1a', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100 }}
      {...props}>
      {props.children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset}
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', zIndex: 100, minWidth: '220px' }}
      {...props} />
  </PopoverPrimitive.Portal>
))

const Dialog = DialogPrimitive.Root
const DialogPortal = DialogPrimitive.Portal
const DialogTrigger = DialogPrimitive.Trigger
const DialogOverlay = React.forwardRef(({ ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 50 }}
    {...props} />
))
const DialogContent = React.forwardRef(({ children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref}
      style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 51, background: '#111', borderRadius: '24px', padding: '8px', maxWidth: '90vw', border: '1px solid rgba(255,255,255,0.1)' }}
      {...props}>
      {children}
      <DialogPrimitive.Close style={{ position: 'absolute', right: '12px', top: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
        <XIcon style={{ width: '16px', height: '16px' }} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))

// Icons
const PlusIcon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}><path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>)
const Settings2Icon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>)
const SendIcon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}><path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>)
const XIcon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>)
const MicIcon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>)
const SummaryIcon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>)
const QuizIcon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>)
const CardIcon = (props) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>)

const toolsList = [
  { id: 'resumen',    name: 'Hacer resumen',       shortName: 'Resumen',   icon: SummaryIcon },
  { id: 'quiz',       name: 'Cuestionario',         shortName: 'Quiz',      icon: QuizIcon },
  { id: 'tarjetas',  name: 'Tarjetas didácticas',  shortName: 'Tarjetas',  icon: CardIcon },
]

export const PromptBox = React.forwardRef(({ ...props }, ref) => {
  const internalRef = React.useRef(null)
  const fileInputRef = React.useRef(null)
  const [value, setValue] = React.useState("")
  const [imagePreview, setImagePreview] = React.useState(null)
  const [selectedTool, setSelectedTool] = React.useState(null)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false)

  React.useImperativeHandle(ref, () => internalRef.current)

  React.useLayoutEffect(() => {
    const textarea = internalRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const hasValue = value.trim().length > 0 || imagePreview
  const activeTool = selectedTool ? toolsList.find(t => t.id === selectedTool) : null
  const ActiveToolIcon = activeTool?.icon

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: '28px', padding: '8px',
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 0 40px rgba(0,0,0,0.4)',
    }}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />

      {/* Preview imagen */}
      {imagePreview && (
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <div style={{ position: 'relative', marginBottom: '4px', width: 'fit-content', padding: '4px' }}>
            <button type="button" onClick={() => setIsImageDialogOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <img src={imagePreview} alt="preview" style={{ width: '58px', height: '58px', borderRadius: '16px', objectFit: 'cover' }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setImagePreview(null) }}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
              <XIcon style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
          <DialogContent>
            <img src={imagePreview} alt="full" style={{ width: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '20px' }} />
          </DialogContent>
        </Dialog>
      )}

      {/* Textarea */}
      <textarea
        ref={internalRef}
        rows={1}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault() } }}
        placeholder="Pregúntale algo a tu IA de estudio..."
        style={{
          width: '100%', resize: 'none', border: 'none', background: 'transparent',
          padding: '12px', color: 'white', fontSize: '15px', lineHeight: 1.6,
          outline: 'none', minHeight: '48px', fontFamily: 'inherit',
        }}
      />

      {/* Barra de herramientas */}
      <div style={{ padding: '4px', paddingTop: 0 }}>
        <TooltipProvider delayDuration={100}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* + Adjuntar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <PlusIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>Adjuntar imagen</p></TooltipContent>
            </Tooltip>

            {/* Tools popover */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button type="button"
                      style={{ height: '32px', borderRadius: '999px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px', fontSize: '13px', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Settings2Icon style={{ width: '16px', height: '16px' }} />
                      {!selectedTool && <span>Herramientas</span>}
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Herramientas de estudio</p></TooltipContent>
              </Tooltip>

              <PopoverContent side="top" align="start">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {toolsList.map(tool => (
                    <button key={tool.id}
                      onClick={() => { setSelectedTool(tool.id); setIsPopoverOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: selectedTool === tool.id ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedTool === tool.id ? 'rgba(255,255,255,0.1)' : 'transparent'}>
                      <tool.icon style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                      <span>{tool.name}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Tool activa */}
            {activeTool && (
              <>
                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.15)' }} />
                <button onClick={() => setSelectedTool(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 10px', borderRadius: '999px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'rgba(150,200,255,1)', fontSize: '13px', cursor: 'pointer' }}>
                  {ActiveToolIcon && <ActiveToolIcon style={{ width: '14px', height: '14px' }} />}
                  {activeTool.shortName}
                  <XIcon style={{ width: '14px', height: '14px' }} />
                </button>
              </>
            )}

            {/* Botones derecha */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <MicIcon style={{ width: '18px', height: '18px' }} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Voz</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="submit" disabled={!hasValue}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: hasValue ? 'white' : 'rgba(255,255,255,0.15)', color: hasValue ? 'black' : 'rgba(255,255,255,0.3)', cursor: hasValue ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <SendIcon style={{ width: '18px', height: '18px' }} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Enviar</p></TooltipContent>
              </Tooltip>
            </div>

          </div>
        </TooltipProvider>
      </div>
    </div>
  )
})

PromptBox.displayName = "PromptBox"