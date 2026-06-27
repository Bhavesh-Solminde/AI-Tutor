'use client'

import { useEffect, useRef } from 'react'

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  kind: 0 | 1 // 0 = blue, 1 = green
}

export function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let nodes: Node[] = []
    const mouse = { x: -9999, y: -9999, active: false }

    const BLUE = '59,107,255'
    const GREEN = '16,185,129'

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      width = parent.clientWidth
      height = parent.clientHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(70, Math.max(32, Math.floor((width * height) / 22000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        kind: (Math.random() > 0.7 ? 1 : 0) as 0 | 1,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      const linkDist = 130
      const mouseRadius = 180

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        if (!reduce) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > width) n.vx *= -1
          if (n.y < 0 || n.y > height) n.vy *= -1
        }

        const dxm = n.x - mouse.x
        const dym = n.y - mouse.y
        const distMouse = Math.hypot(dxm, dym)
        const near = mouse.active && distMouse < mouseRadius
        const glow = near ? 1 - distMouse / mouseRadius : 0

        // node-to-node edges
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j]
          const dx = n.x - m.x
          const dy = n.y - m.y
          const dist = Math.hypot(dx, dy)
          if (dist < linkDist) {
            const baseAlpha = (1 - dist / linkDist) * 0.18
            const mNear =
              mouse.active &&
              Math.hypot(m.x - mouse.x, m.y - mouse.y) < mouseRadius
            const boost = near || mNear ? 0.4 : 0
            const color = n.kind === 1 || m.kind === 1 ? GREEN : BLUE
            ctx.strokeStyle = `rgba(${color},${baseAlpha + boost * baseAlpha * 4})`
            ctx.lineWidth = near || mNear ? 1 : 0.6
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.stroke()
          }
        }

        // edge to mouse
        if (near) {
          const color = n.kind === 1 ? GREEN : BLUE
          ctx.strokeStyle = `rgba(${color},${glow * 0.5})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }

        // node dot
        const color = n.kind === 1 ? GREEN : BLUE
        const r = 1.6 + glow * 2.4
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},${0.4 + glow * 0.6})`
        ctx.fill()
        if (glow > 0.1) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, r + 6 * glow, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${color},${glow * 0.12})`
          ctx.fill()
        }
      }
    }

    let raf = 0
    function loop() {
      draw()
      raf = requestAnimationFrame(loop)
    }

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    function onLeave() {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    if (reduce) {
      draw()
    } else {
      loop()
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseout', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
