"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Hexagon, Eye, EyeOff, Lock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const MASTER_PASSWORD = "d$QI*^1%wiqGg2*v6XY5"

  // Component-level error suppression
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

    window.addEventListener("error", handleError, true)

    return () => {
      window.removeEventListener("error", handleError, true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (password === MASTER_PASSWORD) {
      onLogin()
    } else {
      setError("Invalid password. Please try again.")
      setPassword("")
    }

    setIsLoading(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) setError("") // Clear error when user starts typing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-slate-100 relative overflow-hidden flex items-center justify-center">
      {/* Animated background with CSS */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">AUTHENTICATING</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Header - Same as Dashboard */}
          <div className="mb-12">
            <div className="flex items-center space-x-2">
              <Hexagon className="h-12 w-12 text-cyan-500" />
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                BankApp Exchange Global
              </span>
            </div>
          </div>

          {/* Login Card */}
          <Card className="w-full max-w-md bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-700/50 pb-6">
              <div className="text-center">
                <CardTitle className="text-slate-100 flex items-center justify-center mb-2">
                  <Lock className="mr-2 h-6 w-6 text-cyan-500" />
                  Secure Access
                </CardTitle>
                <p className="text-slate-400 text-sm">Enter your master password to continue</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Master Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter master password"
                      className={`bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 pr-10 ${
                        error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-100"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 h-12"
                  disabled={isLoading || !password}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="flex items-start space-x-2">
                  <Lock className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-slate-400">
                    <p className="font-medium text-slate-300 mb-1">Security Notice</p>
                    <p>
                      This system uses advanced encryption to protect your banking data. Your session will automatically
                      expire after 30 minutes of inactivity.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">© 2025 BankApp Exchange Global. All rights reserved.</p>
            <p className="text-slate-600 text-xs mt-1">Secured by advanced encryption technology</p>
          </div>
        </div>
      </div>
    </div>
  )
}
