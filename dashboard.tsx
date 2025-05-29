"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import {
  Activity,
  Command,
  HardDrive,
  Hexagon,
  type LucideIcon,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Wifi,
  Database,
  Globe,
  Cpu,
  Lock,
  Zap,
  Terminal,
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  CreditCard,
  Trash2,
  AlertTriangle,
  Edit2,
  Save,
  Copy,
  Check,
  X,
  CreditCardIcon as CardIcon,
  Calendar,
  Hash,
  Key,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Import bank data
import bankData from "./bank-data.json"

// Define bank type
interface Bank {
  id: string | number
  name: string
  iban: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardPassword: string
  internetPassword: string
  icon: LucideIcon
  color: "cyan" | "green" | "blue" | "purple"
  status: string
  detail: string
  deletable: boolean
  balance?: number
  currency?: string
  cardType?: string
  category?: string
  iconName?: string
}

// Define credit card type
interface CreditCardType {
  id: string | number
  cardName: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  cardType: "Visa" | "Mastercard" | "American Express" | "Discover"
  color: "cyan" | "green" | "blue" | "purple" | "gold" | "black"
  balance: number
  limit: number
  currency: string
  status: string
}

// localStorage functions
const BANKS_STORAGE_KEY = "bankapp-banks"
const CREDIT_CARDS_STORAGE_KEY = "bankapp-credit-cards"

const saveBanksToStorage = (banks: Bank[]) => {
  try {
    localStorage.setItem(BANKS_STORAGE_KEY, JSON.stringify(banks))
  } catch (error) {
    console.error("Error saving banks to localStorage:", error)
  }
}

const saveCreditCardsToStorage = (cards: CreditCardType[]) => {
  try {
    localStorage.setItem(CREDIT_CARDS_STORAGE_KEY, JSON.stringify(cards))
  } catch (error) {
    console.error("Error saving credit cards to localStorage:", error)
  }
}

const loadBanksFromStorage = (): Bank[] => {
  try {
    const stored = localStorage.getItem(BANKS_STORAGE_KEY)
    if (stored) {
      const parsedBanks = JSON.parse(stored)
      // Convert back to Bank objects with proper icons
      return parsedBanks.map((bank: any) => ({
        ...bank,
        icon: getIconByName(bank.iconName) || Shield,
      }))
    }
  } catch (error) {
    console.error("Error loading banks from localStorage:", error)
  }
  return []
}

const loadCreditCardsFromStorage = (): CreditCardType[] => {
  try {
    const stored = localStorage.getItem(CREDIT_CARDS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error loading credit cards from localStorage:", error)
  }
  return []
}

// Uptime functions
const UPTIME_STORAGE_KEY = "bankapp-uptime"

const getUptimeStart = (): number => {
  try {
    const stored = localStorage.getItem(UPTIME_STORAGE_KEY)
    if (stored) {
      return Number.parseInt(stored, 10)
    } else {
      // İlk kez açılıyorsa şimdiki zamanı kaydet
      const now = Date.now()
      localStorage.setItem(UPTIME_STORAGE_KEY, now.toString())
      return now
    }
  } catch (error) {
    console.error("Error accessing uptime from localStorage:", error)
    return Date.now()
  }
}

const formatUptime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60

  if (days > 0) {
    return `${days}d ${remainingHours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  } else {
    return `${remainingHours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }
}

const getIconByName = (iconName: string): LucideIcon | null => {
  const iconMap: { [key: string]: LucideIcon } = {
    Shield,
    HardDrive,
    Wifi,
    Database,
    Globe,
    Cpu,
    Lock,
    Zap,
    Terminal,
    CreditCard,
  }
  return iconMap[iconName] || null
}

// Map JSON data to our Bank interface
const mapJsonToBank = (jsonBank: any): Bank => {
  // Map color from hex to our color scheme
  const getColorFromHex = (hex: string): "cyan" | "green" | "blue" | "purple" => {
    if (hex.includes("00")) return "green"
    if (hex.includes("ff")) return "purple"
    if (hex.includes("cc") || hex.includes("97")) return "blue"
    return "cyan"
  }

  // Map icon based on category or name
  const getIcon = (category: string, name: string): LucideIcon => {
    if (category === "business") return Globe
    if (category === "savings") return Database
    if (name.includes("Para")) return Terminal
    if (name.includes("Kredi")) return CreditCard
    if (name.includes("Vakıf")) return Shield
    if (name.includes("Ziraat")) return Cpu
    if (name.includes("Garanti")) return HardDrive
    if (name.includes("Finans")) return Zap
    return Shield
  }

  // Get detail based on category and cardType
  const getDetail = (category: string, cardType: string): string => {
    if (category === "business") return "Business Banking"
    if (category === "savings") return "Savings Account"
    if (cardType === "credit") return "Credit Card"
    if (cardType === "debit") return "Debit Card"
    return "Personal Banking"
  }

  const icon = getIcon(jsonBank.category, jsonBank.name)

  return {
    id: jsonBank.id.toString(),
    name: jsonBank.name,
    iban: jsonBank.iban,
    cardNumber: jsonBank.cardNumber,
    expiryDate: jsonBank.expiryDate,
    cvv: jsonBank.cvv,
    cardPassword: jsonBank.cardPin || "****", // Map cardPin to cardPassword
    internetPassword: jsonBank.internetPin || "******", // Map internetPin to internetPassword
    icon,
    iconName: icon.name, // Store icon name for localStorage
    color: getColorFromHex(jsonBank.color),
    status: "Active",
    detail: getDetail(jsonBank.category, jsonBank.cardType),
    deletable: true, // All imported banks are deletable by default
    balance: jsonBank.balance,
    currency: jsonBank.currency,
    cardType: jsonBank.cardType,
    category: jsonBank.category,
  }
}

// Convert JSON data to our Bank interface and merge with localStorage
const storedBanks = loadBanksFromStorage()
const jsonBanks = bankData.map(mapJsonToBank)

// Merge: prioritize stored banks, add new JSON banks that don't exist
const mergedBanks = [...storedBanks]
jsonBanks.forEach((jsonBank) => {
  if (!storedBanks.find((stored) => stored.id === jsonBank.id)) {
    mergedBanks.push(jsonBank)
  }
})

const initialBanks: Bank[] = mergedBanks

// Initial credit cards data
const getInitialCreditCards = (): CreditCardType[] => {
  const storedCards = loadCreditCardsFromStorage()
  if (storedCards.length > 0) {
    return storedCards
  }

  return [
    {
      id: "cc-1",
      cardName: "Premium Card",
      cardNumber: "4532 1234 5678 9012",
      expiryDate: "12/28",
      cvv: "123",
      cardholderName: "JOHN DOE",
      cardType: "Visa",
      color: "blue",
      balance: 2500.75,
      limit: 10000,
      currency: "TRY",
      status: "Active",
    },
    {
      id: "cc-2",
      cardName: "Business Card",
      cardNumber: "5555 4444 3333 2222",
      expiryDate: "08/29",
      cvv: "456",
      cardholderName: "JANE SMITH",
      cardType: "Mastercard",
      color: "gold",
      balance: 1200.5,
      limit: 15000,
      currency: "TRY",
      status: "Active",
    },
    {
      id: "cc-3",
      cardName: "Travel Card",
      cardNumber: "3782 822463 10005",
      expiryDate: "06/30",
      cvv: "789",
      cardholderName: "ALEX JOHNSON",
      cardType: "American Express",
      color: "black",
      balance: 850.25,
      limit: 5000,
      currency: "TRY",
      status: "Active",
    },
  ]
}

// Available icons for new banks
const availableIcons = [Shield, HardDrive, Wifi, Database, Globe, Cpu, Lock, Zap, Terminal, CreditCard]

// Available colors for new banks
const availableColors = ["cyan", "green", "blue", "purple"] as const

export default function Dashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [uptimeStart] = useState<number>(getUptimeStart())
  const [uptime, setUptime] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"dashboard" | "newBank" | "settings" | "editBank" | "creditCards">(
    "dashboard",
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showCardPassword, setShowCardPassword] = useState(false)
  const [banks, setBanks] = useState<Bank[]>(initialBanks)
  const [creditCards, setCreditCards] = useState<CreditCardType[]>(getInitialCreditCards())
  const [currentBankId, setCurrentBankId] = useState<string | number | null>(null)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [selectedCreditCard, setSelectedCreditCard] = useState<CreditCardType | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showCreditCardDetails, setShowCreditCardDetails] = useState(false)
  const [showDetailPassword, setShowDetailPassword] = useState(false)
  const [showDetailCardPassword, setShowDetailCardPassword] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    bankName: "",
    iban: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    internetPassword: "",
    cardPassword: "",
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Update time and uptime
  useEffect(() => {
    const updateTimeAndUptime = () => {
      setCurrentTime(new Date())
      const now = Date.now()
      const uptimeMs = now - uptimeStart
      setUptime(formatUptime(uptimeMs))
    }

    // İlk güncelleme
    updateTimeAndUptime()

    const interval = setInterval(updateTimeAndUptime, 1000)

    return () => clearInterval(interval)
  }, [uptimeStart])

  // Load bank data when editing
  useEffect(() => {
    if (currentView === "editBank" && currentBankId) {
      const bankToEdit = banks.find((bank) => bank.id.toString() === currentBankId.toString())
      if (bankToEdit) {
        setFormData({
          bankName: bankToEdit.name,
          iban: bankToEdit.iban,
          cardNumber: bankToEdit.cardNumber,
          expiryDate: bankToEdit.expiryDate,
          cvv: bankToEdit.cvv,
          internetPassword: bankToEdit.internetPassword,
          cardPassword: bankToEdit.cardPassword,
        })
      }
    }

    // Reset password visibility states when view changes
    setShowPassword(false)
    setShowCardPassword(false)
  }, [currentView, currentBankId, banks])

  // Reset copied field after 2 seconds
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => {
        setCopiedField(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedField])

  // Clear selected bank when searching
  useEffect(() => {
    if (searchTerm && selectedBank) {
      // Check if selected bank is still in filtered results
      const filteredBanks = banks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.iban.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      const isSelectedBankInResults = filteredBanks.some((bank) => bank.id === selectedBank.id)

      if (!isSelectedBankInResults) {
        setSelectedBank(null)
        setShowBankDetails(false)
      }
    }
  }, [searchTerm, banks, selectedBank])

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Particle[] = []
    const particleCount = 100

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.5 + 0.2})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Format time for Istanbul timezone
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      timeZone: "Europe/Istanbul",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Format date for Istanbul timezone
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Ensure we have at most 4 digits
    const trimmed = digits.substring(0, 4)

    // Format as MM/YY if we have at least 2 digits
    if (trimmed.length >= 2) {
      return `${trimmed.substring(0, 2)}/${trimmed.substring(2)}`
    }

    return trimmed
  }

  // Validate expiry date
  const validateExpiryDate = (value: string) => {
    // Check if it matches MM/YY format
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
    if (!regex.test(value)) {
      return false
    }

    // Extract month and year
    const [month, year] = value.split("/")
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100 // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1 // January is 0

    // Convert to numbers
    const monthNum = Number.parseInt(month, 10)
    const yearNum = Number.parseInt(year, 10)

    // Check if the date is in the future
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return false
    }

    return true
  }

  // IBAN formatting and validation
  const formatIBAN = (value: string): string => {
    // Remove all non-alphanumeric characters
    let cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()

    // If it doesn't start with TR, add it
    if (!cleaned.startsWith("TR")) {
      // If user typed numbers first, prepend TR
      if (/^\d/.test(cleaned)) {
        cleaned = "TR" + cleaned
      } else if (cleaned.length > 0 && !cleaned.startsWith("T")) {
        // If user typed something else, replace with TR
        cleaned = "TR" + cleaned.replace(/^[A-Z]*/, "")
      }
    }

    // Ensure we have TR + max 24 digits
    if (cleaned.length > 26) {
      cleaned = cleaned.substring(0, 26)
    }

    // Format as TR00 0000 0000 0000 0000 0000 00
    if (cleaned.length >= 2) {
      let formatted = cleaned.substring(0, 2) // TR
      const numbers = cleaned.substring(2)

      // Add spaces every 4 digits
      for (let i = 0; i < numbers.length; i += 4) {
        if (i > 0) formatted += " "
        formatted += numbers.substring(i, i + 4)
      }

      return formatted
    }

    return cleaned
  }

  const validateIBAN = (value: string): boolean => {
    // Remove spaces and check format
    const cleaned = value.replace(/\s/g, "")

    // Must be TR + exactly 24 digits
    const regex = /^TR\d{24}$/
    return regex.test(cleaned)
  }

  // Filter banks based on search term
  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.iban.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNewBankClick = () => {
    setCurrentView("newBank")
    setCurrentBankId(null)
    setSelectedBank(null)
    setSelectedCreditCard(null)
    setShowBankDetails(false)
    setShowCreditCardDetails(false)
    setSearchTerm("") // Search'ü temizle
    // Reset form data
    setFormData({
      bankName: "",
      iban: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      internetPassword: "",
      cardPassword: "",
    })
  }

  const handleCreditCardsClick = () => {
    setCurrentView("creditCards")
    setCurrentBankId(null)
    setSelectedBank(null)
    setSelectedCreditCard(null)
    setShowBankDetails(false)
    setShowCreditCardDetails(false)
    setSearchTerm("")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setCurrentBankId(null)
    setSelectedCreditCard(null)
    setShowCreditCardDetails(false)
  }

  const handleSettingsClick = () => {
    setCurrentView("settings")
    setCurrentBankId(null)
    setSelectedBank(null)
    setSelectedCreditCard(null)
    setShowBankDetails(false)
    setShowCreditCardDetails(false)
  }

  const handleEditBank = (bankId: string | number) => {
    setCurrentBankId(bankId)
    setCurrentView("editBank")
    setSelectedBank(null)
    setSelectedCreditCard(null)
    setShowBankDetails(false)
    setShowCreditCardDetails(false)
  }

  const handleBankClick = (bank: Bank) => {
    console.log("Bank clicked:", bank.name) // Debug için
    setSelectedBank(bank)
    setSelectedCreditCard(null)
    setShowBankDetails(true)
    setShowCreditCardDetails(false)
    // Reset password visibility
    setShowDetailPassword(false)
    setShowDetailCardPassword(false)
  }

  const handleCreditCardClick = (card: CreditCardType) => {
    console.log("Credit card clicked:", card.cardName)
    setSelectedCreditCard(card)
    setSelectedBank(null)
    setShowCreditCardDetails(true)
    setShowBankDetails(false)
  }

  const handleDeleteCreditCard = (cardId: string | number) => {
    const updatedCards = creditCards.filter((card) => card.id.toString() !== cardId.toString())
    setCreditCards(updatedCards)
    saveCreditCardsToStorage(updatedCards)

    // If the deleted card was selected, clear the selection
    if (selectedCreditCard && selectedCreditCard.id.toString() === cardId.toString()) {
      setSelectedCreditCard(null)
      setShowCreditCardDetails(false)
    }
  }

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    if (id === "iban") {
      const formattedValue = formatIBAN(value)
      setFormData((prev) => ({
        ...prev,
        [id]: formattedValue,
      }))
    } else if (id === "expiryDate") {
      const formattedValue = formatExpiryDate(value)
      setFormData((prev) => ({
        ...prev,
        [id]: formattedValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate IBAN
    if (!validateIBAN(formData.iban)) {
      alert("Please enter a valid IBAN in format: TR00 0000 0000 0000 0000 0000 00")
      return
    }

    // Validate expiry date
    if (!validateExpiryDate(formData.expiryDate)) {
      alert("Please enter a valid expiry date in MM/YY format (e.g., 08/28)")
      return
    }

    let updatedBanks: Bank[]

    if (currentView === "editBank" && currentBankId) {
      // Update existing bank
      updatedBanks = banks.map((bank) =>
        bank.id.toString() === currentBankId.toString()
          ? {
              ...bank,
              name: formData.bankName,
              iban: formData.iban,
              cardNumber: formData.cardNumber,
              expiryDate: formData.expiryDate,
              cvv: formData.cvv,
              internetPassword: formData.internetPassword,
              cardPassword: formData.cardPassword,
            }
          : bank,
      )
    } else {
      // Create new bank
      const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)]
      const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]

      const newBank: Bank = {
        id: `bank-${Date.now()}`,
        name: formData.bankName,
        iban: formData.iban,
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        internetPassword: formData.internetPassword,
        cardPassword: formData.cardPassword,
        icon: randomIcon,
        iconName: randomIcon.name,
        color: randomColor,
        status: "Active",
        detail: "Added Bank",
        deletable: true, // Yeni bankalar da silinebilir
        balance: 0,
        currency: "TRY",
        cardType: "debit",
        category: "personal",
      }

      updatedBanks = [...banks, newBank]
    }

    // Save to localStorage
    saveBanksToStorage(updatedBanks)

    // Update state
    setBanks(updatedBanks)

    // Reset form and go back to dashboard
    setFormData({
      bankName: "",
      iban: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      internetPassword: "",
      cardPassword: "",
    })

    setCurrentView("dashboard")
    setCurrentBankId(null)
  }

  const handleDeleteBank = (bankId: string | number) => {
    const updatedBanks = banks.filter((bank) => bank.id.toString() !== bankId.toString())

    // Save to localStorage
    saveBanksToStorage(updatedBanks)

    // Update state
    setBanks(updatedBanks)

    // If the deleted bank was selected, clear the selection
    if (selectedBank && selectedBank.id.toString() === bankId.toString()) {
      setSelectedBank(null)
      setShowBankDetails(false)
    }
  }

  const handleCloseBankDetails = () => {
    setSelectedBank(null)
    setShowBankDetails(false)
  }

  const handleCloseCreditCardDetails = () => {
    setSelectedCreditCard(null)
    setShowCreditCardDetails(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    // If search is cleared, don't clear selected bank
    if (!value && selectedBank) {
      // Keep the selected bank if search is cleared
      return
    }
  }

  return (
    <div
      className={`${theme} min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden`}
    >
      {/* Background particle effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

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
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">SYSTEM INITIALIZING</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              BankApp Exchange Global
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Bank..."
                className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <NavItem
                    icon={Command}
                    label="Dashboard"
                    active={currentView === "dashboard"}
                    onClick={handleBackToDashboard}
                  />
                  <NavItem
                    icon={Activity}
                    label="New Bank"
                    active={currentView === "newBank"}
                    onClick={handleNewBankClick}
                  />
                  <NavItem
                    icon={CreditCard}
                    label="Credit Card"
                    active={currentView === "creditCards"}
                    onClick={handleCreditCardsClick}
                  />
                  <NavItem
                    icon={Settings}
                    label="Settings"
                    active={currentView === "settings"}
                    onClick={handleSettingsClick}
                  />
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7">
            <div className="grid gap-6">
              {currentView === "dashboard" ? (
                /* Bank List */
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100 flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                        Bank List {searchTerm && `(${filteredBanks.length} results)`}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {filteredBanks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredBanks.map((bank) => (
                          <BankCard
                            key={bank.id}
                            bank={bank}
                            isProtected={false} // Artık hiçbir banka protected değil
                            onClick={() => handleBankClick(bank)}
                            isSelected={selectedBank?.id === bank.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-slate-500 mb-4">
                          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No banks found</p>
                          <p className="text-sm">Try a different search term</p>
                        </div>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            onClick={() => setSearchTerm("")}
                            className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100"
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : currentView === "creditCards" ? (
                /* Credit Cards */
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100 flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-cyan-500" />
                        Credit Cards
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-100"
                          onClick={handleBackToDashboard}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {creditCards.map((card) => (
                        <CreditCardComponent
                          key={card.id}
                          card={card}
                          onClick={() => handleCreditCardClick(card)}
                          onDelete={handleDeleteCreditCard}
                          isSelected={selectedCreditCard?.id === card.id}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : currentView === "settings" ? (
                /* Settings - Bank Management */
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100 flex items-center">
                        <Settings className="mr-2 h-5 w-5 text-cyan-500" />
                        Bank Management {searchTerm && `(${filteredBanks.length} results)`}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-100"
                          onClick={handleBackToDashboard}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-slate-400 text-sm">
                        Manage your banks. You can edit all banks, but only delete original banks.
                      </p>
                    </div>
                    {filteredBanks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredBanks.map((bank) => (
                          <ManageBankCard
                            key={bank.id}
                            bank={bank}
                            onDelete={handleDeleteBank}
                            onEdit={handleEditBank}
                          />
                        ))}
                      </div>
                    ) : searchTerm ? (
                      <div className="text-center py-12">
                        <div className="text-slate-500 mb-4">
                          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No banks found</p>
                          <p className="text-sm">Try a different search term</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm("")}
                          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100"
                        >
                          Clear Search
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-slate-500 mb-4">
                          <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No banks found</p>
                          <p className="text-sm">Add a new bank to get started</p>
                        </div>
                        <Button
                          onClick={handleNewBankClick}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Bank
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* New Bank or Edit Bank Form */
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100 flex items-center">
                        {currentView === "editBank" ? (
                          <>
                            <Edit2 className="mr-2 h-5 w-5 text-cyan-500" />
                            Edit Bank
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-5 w-5 text-cyan-500" />
                            Add New Bank
                          </>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-100"
                          onClick={handleBackToDashboard}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bank Name */}
                        <div className="space-y-2">
                          <Label htmlFor="bankName" className="text-sm font-medium text-slate-300">
                            Bank Name
                          </Label>
                          <Input
                            id="bankName"
                            type="text"
                            placeholder="Enter bank name"
                            className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        {/* IBAN */}
                        <div className="space-y-2">
                          <Label htmlFor="iban" className="text-sm font-medium text-slate-300">
                            IBAN
                          </Label>
                          <Input
                            id="iban"
                            type="text"
                            placeholder="TR00 0000 0000 0000 0000 0000 00"
                            className={`bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 ${
                              formData.iban && !validateIBAN(formData.iban) ? "border-red-500" : ""
                            }`}
                            value={formData.iban}
                            onChange={handleInputChange}
                            required
                          />
                          {formData.iban && !validateIBAN(formData.iban) && (
                            <p className="text-red-500 text-xs mt-1">
                              Please enter a valid IBAN: TR + 24 digits (e.g., TR26 0004 6001 2088 8000 4024 30)
                            </p>
                          )}
                        </div>

                        {/* Card Number */}
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-300">
                            Card Number
                          </Label>
                          <Input
                            id="cardNumber"
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        {/* Expiry Date */}
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate" className="text-sm font-medium text-slate-300">
                            Expiry Date (MM/YY)
                          </Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            placeholder="MM/YY"
                            className={`bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 ${
                              formData.expiryDate && !validateExpiryDate(formData.expiryDate) ? "border-red-500" : ""
                            }`}
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                          {formData.expiryDate && !validateExpiryDate(formData.expiryDate) && (
                            <p className="text-red-500 text-xs mt-1">
                              Please enter a valid expiry date in MM/YY format (e.g., 08/28)
                            </p>
                          )}
                        </div>

                        {/* CVV */}
                        <div className="space-y-2">
                          <Label htmlFor="cvv" className="text-sm font-medium text-slate-300">
                            CVV
                          </Label>
                          <Input
                            id="cvv"
                            type="text"
                            placeholder="000"
                            maxLength={3}
                            className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        {/* Card Password */}
                        <div className="space-y-2">
                          <Label htmlFor="cardPassword" className="text-sm font-medium text-slate-300">
                            Card Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="cardPassword"
                              type={showCardPassword ? "text" : "password"}
                              placeholder="Enter card password"
                              className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 pr-10"
                              value={formData.cardPassword}
                              onChange={handleInputChange}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-100"
                              onClick={() => setShowCardPassword(!showCardPassword)}
                            >
                              {showCardPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Internet Password */}
                        <div className="space-y-2">
                          <Label htmlFor="internetPassword" className="text-sm font-medium text-slate-300">
                            Internet Banking Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="internetPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter internet banking password"
                              className="bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 pr-10"
                              value={formData.internetPassword}
                              onChange={handleInputChange}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-100"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700/50">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackToDashboard}
                          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0"
                        >
                          {currentView === "editBank" ? (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Bank
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {showBankDetails && selectedBank ? (
                /* Bank Details Card */
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100 flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-cyan-500" />
                        Bank Details
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-100"
                        onClick={handleCloseBankDetails}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xl font-bold text-slate-100">{selectedBank.name}</div>
                        <selectedBank.icon className={`h-6 w-6 text-${selectedBank.color}-500`} />
                      </div>
                      <div className="text-sm text-slate-400">{selectedBank.detail}</div>
                      {selectedBank.balance !== undefined && (
                        <div className="mt-3 text-2xl font-mono text-cyan-400">
                          {selectedBank.balance.toLocaleString()} {selectedBank.currency}
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-4">
                      {/* IBAN */}
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-slate-500 flex items-center">
                            <Database className="h-3 w-3 mr-1" /> IBAN
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                            onClick={() => handleCopyToClipboard(selectedBank.iban, "iban")}
                          >
                            {copiedField === "iban" ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="text-sm font-mono text-slate-200 break-all">{selectedBank.iban}</div>
                      </div>

                      {/* Card Number */}
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-slate-500 flex items-center">
                            <CardIcon className="h-3 w-3 mr-1" /> Card Number
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                            onClick={() => handleCopyToClipboard(selectedBank.cardNumber, "cardNumber")}
                          >
                            {copiedField === "cardNumber" ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="text-sm font-mono text-slate-200">{selectedBank.cardNumber}</div>
                      </div>

                      {/* Expiry Date & CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-slate-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> Expiry Date
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => handleCopyToClipboard(selectedBank.expiryDate, "expiryDate")}
                            >
                              {copiedField === "expiryDate" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm font-mono text-slate-200">{selectedBank.expiryDate}</div>
                        </div>

                        <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-slate-500 flex items-center">
                              <Hash className="h-3 w-3 mr-1" /> CVV
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => handleCopyToClipboard(selectedBank.cvv, "cvv")}
                            >
                              {copiedField === "cvv" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm font-mono text-slate-200">{selectedBank.cvv}</div>
                        </div>
                      </div>

                      {/* Card Password */}
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-slate-500 flex items-center">
                            <Key className="h-3 w-3 mr-1" /> Card Password
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => setShowDetailCardPassword(!showDetailCardPassword)}
                            >
                              {showDetailCardPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => handleCopyToClipboard(selectedBank.cardPassword, "cardPassword")}
                            >
                              {copiedField === "cardPassword" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm font-mono text-slate-200">
                          {showDetailCardPassword ? selectedBank.cardPassword : "••••"}
                        </div>
                      </div>

                      {/* Internet Password */}
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-slate-500 flex items-center">
                            <User className="h-3 w-3 mr-1" /> Internet Password
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => setShowDetailPassword(!showDetailPassword)}
                            >
                              {showDetailPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => handleCopyToClipboard(selectedBank.internetPassword, "internetPassword")}
                            >
                              {copiedField === "internetPassword" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm font-mono text-slate-200">
                          {showDetailPassword ? selectedBank.internetPassword : "••••••"}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100"
                          onClick={() => handleEditBank(selectedBank.id)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Bank
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-900/50 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-100 flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                                Delete Bank
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-300">{selectedBank.name}</span>? This action
                                cannot be undone and all bank data will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBank(selectedBank.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete Bank
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : showCreditCardDetails && selectedCreditCard ? (
                /* Credit Card Details */
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100 flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-cyan-500" />
                        Card Details
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-100"
                        onClick={handleCloseCreditCardDetails}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xl font-bold text-slate-100">{selectedCreditCard.cardName}</div>
                        <div
                          className={`text-sm px-2 py-1 rounded-full bg-${selectedCreditCard.color}-500/20 text-${selectedCreditCard.color}-400 border border-${selectedCreditCard.color}-500/30`}
                        >
                          {selectedCreditCard.cardType}
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">{selectedCreditCard.status}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-slate-500">Balance</div>
                          <div className="text-2xl font-mono text-cyan-400">
                            {selectedCreditCard.balance.toLocaleString()} {selectedCreditCard.currency}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Limit</div>
                          <div className="text-lg font-mono text-slate-300">
                            {selectedCreditCard.limit.toLocaleString()} {selectedCreditCard.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Card Number */}
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-slate-500 flex items-center">
                            <CardIcon className="h-3 w-3 mr-1" /> Card Number
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                            onClick={() => handleCopyToClipboard(selectedCreditCard.cardNumber, "cc-cardNumber")}
                          >
                            {copiedField === "cc-cardNumber" ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="text-sm font-mono text-slate-200">{selectedCreditCard.cardNumber}</div>
                      </div>

                      {/* Cardholder Name */}
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-slate-500 flex items-center">
                            <User className="h-3 w-3 mr-1" /> Cardholder Name
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                            onClick={() =>
                              handleCopyToClipboard(selectedCreditCard.cardholderName, "cc-cardholderName")
                            }
                          >
                            {copiedField === "cc-cardholderName" ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="text-sm font-mono text-slate-200">{selectedCreditCard.cardholderName}</div>
                      </div>

                      {/* Expiry Date & CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-slate-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> Expiry Date
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => handleCopyToClipboard(selectedCreditCard.expiryDate, "cc-expiryDate")}
                            >
                              {copiedField === "cc-expiryDate" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm font-mono text-slate-200">{selectedCreditCard.expiryDate}</div>
                        </div>

                        <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-slate-500 flex items-center">
                              <Hash className="h-3 w-3 mr-1" /> CVV
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-100"
                              onClick={() => handleCopyToClipboard(selectedCreditCard.cvv, "cc-cvv")}
                            >
                              {copiedField === "cc-cvv" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm font-mono text-slate-200">{selectedCreditCard.cvv}</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Card
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-900/50 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-100 flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                                Delete Credit Card
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-300">{selectedCreditCard.cardName}</span>?
                                This action cannot be undone and all card data will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCreditCard(selectedCreditCard.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete Card
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* System time */
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-slate-700/50">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1 font-mono">SYSTEM TIME</div>
                        <div className="text-3xl font-mono text-cyan-400 mb-1">{formatTime(currentTime)}</div>
                        <div className="text-sm text-slate-400">{formatDate(currentTime)}</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                          <div className="text-xs text-slate-500 mb-1">Uptime</div>
                          <div className="text-sm font-mono text-slate-200">{uptime}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                          <div className="text-xs text-slate-500 mb-1">Time Zone</div>
                          <div className="text-sm font-mono text-slate-200">UTC+03:00</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for nav items
function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start ${active ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"}`}
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

// Component for bank cards
function BankCard({
  bank,
  isProtected = false,
  onClick,
  isSelected = false,
}: {
  bank: Bank
  isProtected?: boolean
  onClick?: () => void
  isSelected?: boolean
}) {
  const getColor = () => {
    switch (bank.color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("BankCard clicked:", bank.name) // Debug için
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden cursor-pointer hover:bg-slate-700/50 transition-colors ${
        isSelected ? "ring-2 ring-cyan-500 bg-slate-700/50" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{bank.name}</div>
        <bank.icon className={`h-5 w-5 text-${bank.color}-500`} />
      </div>
      <div className="text-lg font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
        {bank.status}
      </div>
      <div className="text-xs text-slate-500">{bank.detail}</div>

      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  )
}

// Component for credit cards
function CreditCardComponent({
  card,
  onClick,
  onDelete,
  isSelected = false,
}: {
  card: CreditCardType
  onClick?: () => void
  onDelete: (cardId: string | number) => void
  isSelected?: boolean
}) {
  const getColor = () => {
    switch (card.color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      case "gold":
        return "from-yellow-500 to-orange-500 border-yellow-500/30"
      case "black":
        return "from-gray-700 to-gray-900 border-gray-700/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden cursor-pointer hover:bg-slate-700/50 transition-colors ${
        isSelected ? "ring-2 ring-cyan-500 bg-slate-700/50" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{card.cardName}</div>
        <div className="flex items-center space-x-2">
          <div
            className={`text-xs px-2 py-1 rounded-full bg-${card.color}-500/20 text-${card.color}-400 border border-${card.color}-500/30`}
          >
            {card.cardType}
          </div>
        </div>
      </div>
      <div className="text-lg font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
        {card.status}
      </div>
      <div className="text-xs text-slate-500 mb-3">
        Balance: {card.balance.toLocaleString()} {card.currency}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 ml-auto">
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implement edit functionality
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-100 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Delete Credit Card
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Are you sure you want to delete <span className="font-semibold text-slate-300">{card.cardName}</span>?
                  This action cannot be undone and all card data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(card.id)} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete Card
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  )
}

// Component for manage bank cards (with delete and edit functionality)
function ManageBankCard({
  bank,
  onDelete,
  onEdit,
}: {
  bank: Bank
  onDelete: (bankId: string | number) => void
  onEdit: (bankId: string | number) => void
}) {
  const getColor = () => {
    switch (bank.color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
    }
  }

  return (
    <div
      className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden hover:bg-slate-700/50 transition-colors`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{bank.name}</div>
        <bank.icon className={`h-5 w-5 text-${bank.color}-500`} />
      </div>
      <div className="text-lg font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
        {bank.status}
      </div>
      <div className="text-xs text-slate-500 mb-3">{bank.detail}</div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 ml-auto">
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => onEdit(bank.id)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-100 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Delete Bank
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Are you sure you want to delete <span className="font-semibold text-slate-300">{bank.name}</span>?
                  This action cannot be undone and all bank data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(bank.id)} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete Bank
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  )
}
