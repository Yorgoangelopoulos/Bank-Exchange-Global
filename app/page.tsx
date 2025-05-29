"use client"

import { useState, useEffect } from "react"
import Login from "../login"
import Dashboard from "../dashboard"

// Global error suppression - set up immediately
if (typeof window !== "undefined") {
  // Suppress ResizeObserver errors globally
  const originalConsoleError = console.error
  console.error = (...args) => {
    if (
      args.some(
        (arg) =>
          typeof arg === "string" &&
          (arg.includes("ResizeObserver loop completed") || arg.includes("ResizeObserver loop limit exceeded")),
      )
    ) {
      return
    }
    originalConsoleError.apply(console, args)
  }

  // Global error handler
  window.addEventListener(
    "error",
    (event) => {
      if (
        event.message.includes("ResizeObserver loop completed") ||
        event.message.includes("ResizeObserver loop limit exceeded")
      ) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    },
    true,
  )

  // Global unhandled rejection handler
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      if (
        event.reason?.message?.includes("ResizeObserver loop completed") ||
        event.reason?.message?.includes("ResizeObserver loop limit exceeded")
      ) {
        event.preventDefault()
        return false
      }
    },
    true,
  )
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Additional error suppression on component mount
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message.includes("ResizeObserver loop completed") ||
        event.message.includes("ResizeObserver loop limit exceeded")
      ) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes("ResizeObserver loop completed") ||
        event.reason?.message?.includes("ResizeObserver loop limit exceeded")
      ) {
        event.preventDefault()
        return false
      }
    }

    window.addEventListener("error", handleError, true)
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true)

    // Override ResizeObserver to catch errors at source
    if (typeof window !== "undefined" && window.ResizeObserver) {
      const OriginalResizeObserver = window.ResizeObserver
      window.ResizeObserver = class extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
            try {
              callback(entries, observer)
            } catch (error) {
              if (
                error instanceof Error &&
                (error.message.includes("ResizeObserver loop completed") ||
                  error.message.includes("ResizeObserver loop limit exceeded"))
              ) {
                // Silently ignore ResizeObserver errors
                return
              }
              throw error
            }
          }
          super(wrappedCallback)
        }
      }
    }

    return () => {
      window.removeEventListener("error", handleError, true)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
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
