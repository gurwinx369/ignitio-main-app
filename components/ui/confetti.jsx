"use client";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import confetti from "canvas-confetti"

const ConfettiContext = createContext({})

// Define component first
const ConfettiComponent = forwardRef((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    ...rest
  } = props
  const instanceRef = useRef(null)

  const canvasRef = useCallback((node) => {
    if (node !== null) {
      if (instanceRef.current) return
      instanceRef.current = confetti.create(node, {
        ...globalOptions,
        resize: true,
      })
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset()
        instanceRef.current = null
      }
    }
  }, [globalOptions])

  const fire = useCallback(async (opts = {}) => {
    try {
      await instanceRef.current?.({ ...options, ...opts })
    } catch (error) {
      console.error("Confetti error:", error)
    }
  }, [options])

  const api = useMemo(() => ({
    fire,
  }), [fire])

  useImperativeHandle(ref, () => api, [api])

  useEffect(() => {
    if (!manualstart) {
      ;(async () => {
        try {
          await fire()
        } catch (error) {
          console.error("Confetti effect error:", error)
        }
      })()
    }
  }, [manualstart, fire])

  return (
      <ConfettiContext.Provider value={api}>
        <canvas ref={canvasRef} {...rest} />
        {children}
      </ConfettiContext.Provider>
  );
})

ConfettiComponent.displayName = "Confetti"

export const Confetti = ConfettiComponent

const ConfettiButtonComponent = ({
                                   options,
                                   children,
                                   onClick,
                                   ...props
                                 }) => {
  const [buttonPressed, setButtonPressed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() =>{
      setIsLoaded(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleClick = async (event) => {
    try {
      // Call onClick immediately
      if (onClick) {
        onClick(event)
      }

      // Fire confetti after navigation is triggered
      const rect = event.currentTarget.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      confetti({
        ...options,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      })
    } catch (error) {
      console.error("Confetti button error:", error)
    }
  }

  const handlePressStart = () => setButtonPressed(true)
  const handlePressEnd = () => setButtonPressed(false)

  return (
      <button
          onClick={handleClick}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`w-full max-w-md px-8 py-5 rounded-full text-white text-xl font-bold uppercase tracking-wider transition-all duration-150 ${isLoaded ? 'opacity-100 animate-fade-in-up' : 'opacity-0'}`}
          style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#0EA5E9',
            boxShadow: buttonPressed ? '0 2px 0 #0284C7' : '0 6px 0 #0284C7',
            transform: buttonPressed ? 'translateY(4px)' : 'translateY(0)',
            animationDelay: '0.5s',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none',
          }}
          {...props}
      >
        {children}
      </button>
  );
}

ConfettiButtonComponent.displayName = "ConfettiButton"

export const ConfettiButton = ConfettiButtonComponent
