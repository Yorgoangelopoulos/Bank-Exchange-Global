"use client"

import { useState, useEffect } from "react"
import Login from "../login"
import Dashboard from "../dashboard"

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Global error handler to suppress ResizeObserver errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("ResizeObserver loop completed with undelivered notifications")) {
        event.preventDefault()
        return false
      }
    }

    // Add error handlers immediately
    window.addEventListener("error", handleError, true)
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true)

    // Also suppress console errors for ResizeObserver
    const originalConsoleError = console.error
    console.error = (...args) => {
      if (args.some((arg) => typeof arg === "string" && arg.includes("ResizeObserver loop completed"))) {
        return
      }
      originalConsoleError.apply(console, args)
    }

    return () => {
      window.removeEventListener("error", handleError, true)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
      console.error = originalConsoleError
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return <>{isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}</>
}
