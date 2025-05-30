"use client"

import { useState, useEffect } from "react"
import Login from "../login"
import Dashboard from "../dashboard"

// More aggressive ResizeObserver error suppression
if (typeof window !== "undefined") {
  // Store original methods
  const originalError = window.onerror
  const originalUnhandledRejection = window.onunhandledrejection
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  // Override console methods
  console.error = (...args: any[]) => {
    const message = args.join(" ")
    if (message.toLowerCase().includes("resizeobserver")) {
      return
    }
    return originalConsoleError.apply(console, args)
  }

  console.warn = (...args: any[]) => {
    const message = args.join(" ")
    if (message.toLowerCase().includes("resizeobserver")) {
      return
    }
    return originalConsoleWarn.apply(console, args)
  }

  // Override window error handlers
  window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === "string" && message.toLowerCase().includes("resizeobserver")) {
      return true // Prevent default error handling
    }
    return originalError ? originalError.call(this, message, source, lineno, colno, error) : false
  }

  window.onunhandledrejection = function (event) {
    const message = event.reason?.message || String(event.reason) || ""
    if (message.toLowerCase().includes("resizeobserver")) {
      event.preventDefault()
      return
    }
    return originalUnhandledRejection ? originalUnhandledRejection.call(this, event) : undefined
  }

  // Override ResizeObserver completely
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver

    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
          window.requestAnimationFrame(() => {
            try {
              callback(entries, observer)
            } catch (e) {
              // Silently ignore all ResizeObserver errors
            }
          })
        }
        super(wrappedCallback)
      }
    } as any
  }

  // Add global event listeners with capture
  const handleError = (event: ErrorEvent) => {
    const message = event.message || event.error?.message || ""
    if (message.toLowerCase().includes("resizeobserver")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      return false
    }
  }

  const handleRejection = (event: PromiseRejectionEvent) => {
    const message = event.reason?.message || String(event.reason) || ""
    if (message.toLowerCase().includes("resizeobserver")) {
      event.stopImmediatePropagation()
      event.preventDefault()
      return false
    }
  }

  window.addEventListener("error", handleError, true)
  window.addEventListener("unhandledrejection", handleRejection, true)
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Additional component-level error suppression
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || ""
      if (message.toLowerCase().includes("resizeobserver")) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return false
      }
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason) || ""
      if (message.toLowerCase().includes("resizeobserver")) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return false
      }
    }

    // Add multiple event listeners
    document.addEventListener("error", errorHandler as any, true)
    document.addEventListener("unhandledrejection", rejectionHandler as any, true)
    window.addEventListener("error", errorHandler, true)
    window.addEventListener("unhandledrejection", rejectionHandler, true)

    return () => {
      document.removeEventListener("error", errorHandler as any, true)
      document.removeEventListener("unhandledrejection", rejectionHandler as any, true)
      window.removeEventListener("error", errorHandler, true)
      window.removeEventListener("unhandledrejection", rejectionHandler, true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </div>
  )
}
