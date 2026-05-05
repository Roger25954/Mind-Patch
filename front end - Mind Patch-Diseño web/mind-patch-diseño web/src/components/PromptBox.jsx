import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as PopoverPrimitive from "@radix-ui/react-popover"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip       = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef(({ sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset}
      style={{ background: '#1a1a1a', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100 }}
      {...props}>
      {props.children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))

const Popover        = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = React.forwardRef(({ align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset}
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', zIndex: 100, minWidth: '220px' }}
      {...props} />
  </PopoverPrimitive.Portal>
))

// ── Iconos ────────────────────────────────────────────────────────────────────
const PlusIcon      = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>)
const Settings2Icon = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>)
const SendIcon      = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>)
const XIcon         = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>)
const MicIcon       = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>)
const SummaryIcon   = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>)
const QuizIcon      = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>)
const CardIcon      = (p) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>)
const FileIcon      = (p) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>)

const toolsList = [
  { id: 'resumen',   name: 'Hacer resumen',      shortName: 'Resumen',  icon: SummaryIcon, prefix: 'Haz un resumen de lo siguiente: ' },
  { id: 'quiz',      name: 'Cuestionario',        shortName: 'Quiz',     icon: QuizIcon,    prefix: 'Crea un cuestionario sobre: ' },
  { id: 'tarjetas',  name: 'Tarjetas didacticas', shortName: 'Tarjetas', icon: CardIcon,    prefix: 'Crea tarjetas didacticas sobre: ' },
]

// ── Componente ────────────────────────────────────────────────────────────────
export const PromptBox = React.forwardRef(({ onSend, disabled, ...props }, ref) => {
  const internalRef  = React.useRef(null)
  const fileInputRef = React.useRef(null)

  const [value,        setValue]        = React.useState("")
  const [pdfFile,      setPdfFile]      = React.useState(null)   // File object
  const [selectedTool, setSelectedTool] = React.useState(null)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  React.useImperativeHandle(ref, () => internalRef.current)

  React.useLayoutEffect(() => {
    const ta = internalRef.current
    if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight, 200)}px` }
  }, [value])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') setPdfFile(file)
    e.target.value = ""
  }

  const handleSubmit = () => {
    if (!hasValue || disabled) return
    const activeTool = toolsList.find(t => t.id === selectedTool)
    const text = activeTool ? activeTool.prefix + value : value
    onSend?.({ text, file: pdfFile, tool: selectedTool })
    setValue("")
    setPdfFile(null)
    setSelectedTool(null)
  }

  const hasValue = value.trim().length > 0 || pdfFile !== null
  const activeTool = toolsList.find(t => t.id === selectedTool)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: '28px', padding: '8px',
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 0 40px rgba(0,0,0,0.4)',
    }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="application/pdf"
      />

      {/* PDF badge */}
      {pdfFile && (
        <div style={{ padding: '4px 6px 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '8px', padding: '6px 10px',
          }}>
            <FileIcon style={{ color: '#6366f1', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pdfFile.name}
            </span>
            <button
              onClick={() => setPdfFile(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '0 0 0 2px', display: 'flex', alignItems: 'center' }}>
              <XIcon style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={internalRef}
        rows={1}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
        placeholder={pdfFile ? "Pregunta algo sobre el PDF..." : "Preguntale algo a tu IA de estudio..."}
        disabled={disabled}
        style={{
          width: '100%', resize: 'none', border: 'none', background: 'transparent',
          padding: '12px', color: 'white', fontSize: '15px', lineHeight: 1.6,
          outline: 'none', minHeight: '48px', fontFamily: 'inherit',
          opacity: disabled ? 0.5 : 1,
        }}
      />

      {/* Barra de herramientas */}
      <div style={{ padding: '4px', paddingTop: 0 }}>
        <TooltipProvider delayDuration={100}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Adjuntar PDF */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', color: pdfFile ? '#6366f1' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <PlusIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>Adjuntar PDF</p></TooltipContent>
            </Tooltip>

            {/* Tools popover */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button type="button" disabled={disabled}
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
                  <activeTool.icon style={{ width: '14px', height: '14px' }} />
                  {activeTool.shortName}
                  <XIcon style={{ width: '14px', height: '14px' }} />
                </button>
              </>
            )}

            {/* Botones derecha */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" disabled={disabled}
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
                  <button type="button" onClick={handleSubmit} disabled={!hasValue || disabled}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: hasValue && !disabled ? 'white' : 'rgba(255,255,255,0.15)', color: hasValue && !disabled ? 'black' : 'rgba(255,255,255,0.3)', cursor: hasValue && !disabled ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
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
