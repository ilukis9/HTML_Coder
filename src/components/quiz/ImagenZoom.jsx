import { useState, useEffect, useCallback, useRef } from 'react'

const ESCALA_MIN = 0.5
const ESCALA_MAX = 5
const PASO_BTN   = 0.3

export default function ImagenZoom({ src, width }) {
  const [abierta, setAbierta] = useState(false)
  const [escala,  setEscala]  = useState(1)
  const [pos,     setPos]     = useState({ x: 0, y: 0 })

  const overlayRef = useRef(null)
  const imgRef     = useRef(null)
  const dragRef    = useRef(null)   // { startX, startY, posX, posY }
  const touchDist  = useRef(null)   // distancia entre dedos en pinch

  const abrir  = () => { setAbierta(true); setEscala(1); setPos({ x: 0, y: 0 }) }
  const cerrar = useCallback(() => setAbierta(false), [])
  const resetar = () => { setEscala(1); setPos({ x: 0, y: 0 }) }

  const zoom = useCallback((delta) => {
    setEscala(prev => Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, prev + delta)))
  }, [])

  // Keyboard + scroll lock + mouse drag global
  useEffect(() => {
    if (!abierta) return

    const onKey = (e) => {
      if (e.key === 'Escape')             cerrar()
      if (e.key === '+' || e.key === '=') zoom(PASO_BTN)
      if (e.key === '-')                  zoom(-PASO_BTN)
    }

    // Mover con mouse (global para no perder el drag al salir de la imagen)
    const onMouseMove = (e) => {
      if (!dragRef.current) return
      setPos({
        x: dragRef.current.posX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.posY + (e.clientY - dragRef.current.startY),
      })
    }
    const onMouseUp = () => { dragRef.current = null }

    // Wheel zoom sin scroll de página
    const onWheel = (e) => {
      e.preventDefault()
      zoom(e.deltaY < 0 ? PASO_BTN : -PASO_BTN)
    }

    // Touch: pan de 1 dedo + pinch de 2 dedos
    const onTouchMove = (e) => {
      e.preventDefault()
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        if (touchDist.current !== null) zoom((dist - touchDist.current) * 0.015)
        touchDist.current = dist
      } else if (e.touches.length === 1 && dragRef.current) {
        setPos({
          x: dragRef.current.posX + (e.touches[0].clientX - dragRef.current.startX),
          y: dragRef.current.posY + (e.touches[0].clientY - dragRef.current.startY),
        })
      }
    }
    const onTouchEnd = () => { touchDist.current = null; dragRef.current = null }

    const overlay = overlayRef.current
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    overlay?.addEventListener('wheel', onWheel, { passive: false })
    overlay?.addEventListener('touchmove', onTouchMove, { passive: false })
    overlay?.addEventListener('touchend', onTouchEnd)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      overlay?.removeEventListener('wheel', onWheel)
      overlay?.removeEventListener('touchmove', onTouchMove)
      overlay?.removeEventListener('touchend', onTouchEnd)
      document.body.style.overflow = ''
    }
  }, [abierta, cerrar, zoom])

  // Iniciar drag con mouse
  const handleMouseDown = (e) => {
    e.stopPropagation()
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y }
  }

  // Iniciar drag/pinch con dedo
  const handleTouchStart = (e) => {
    e.stopPropagation()
    if (e.touches.length === 2) {
      touchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      )
    } else {
      dragRef.current = {
        startX: e.touches[0].clientX, startY: e.touches[0].clientY,
        posX: pos.x, posY: pos.y,
      }
    }
  }

  return (
    <>
      <div className="imgzoom-thumb-wrap" onClick={abrir} title="Clic para ampliar">
        <img
          src={src}
          className="rounded imgzoom-thumb"
          style={{ maxWidth: `min(100%, ${width || 400}px)` }}
          alt=""
        />
        <span className="imgzoom-hint">🔍 Ampliar</span>
      </div>

      {abierta && (
        <div className="imgzoom-overlay" ref={overlayRef} onClick={cerrar}>
          <div className="imgzoom-toolbar" onClick={e => e.stopPropagation()}>
            <button className="imgzoom-btn" onClick={() => zoom(PASO_BTN)}>＋</button>
            <button className="imgzoom-btn" onClick={() => zoom(-PASO_BTN)}>－</button>
            <button className="imgzoom-btn" onClick={resetar}>↺</button>
            <button className="imgzoom-btn imgzoom-btn--cerrar" onClick={cerrar}>✕</button>
          </div>

          <div className="imgzoom-escala-label">{Math.round(escala * 100)}%</div>

          <img
            ref={imgRef}
            src={src}
            className="imgzoom-img"
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${escala})` }}
            alt=""
            draggable={false}
            onClick={e => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </div>
      )}
    </>
  )
}
