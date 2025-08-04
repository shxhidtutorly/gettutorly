"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, ArrowLeft, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth" // your custom hook

export default function SignupPage() {
  const router = useRouter()
  const { user, signUp, signInWithGoogle } = useFirebaseAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const { name, email, password } = formData
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    const result = await signUp(email, password, name)
    if (result.error) {
      setError(result.error.message || "Signup failed")
    }

    setIsSubmitting(false)
  }

  const handleGoogleLogin = async () => {
    setError("")
    setIsSubmitting(true)
    const result = await signInWithGoogle()
    if (result.error) {
      setError(result.error.message || "Google sign-up failed")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black font-mono flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-purple-500 brutal-border flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-8 h-8" /> {/* your logo */}
            </div>
            <div>
              <h1 className="text-3xl font-black">TUTORLY</h1>
              <p className="text-sm font-bold text-gray-600">STUDY SMARTER. LEARN FASTER.</p>
            </div>
          </Link>

          <h2 className="text-4xl font-black mb-4">JOIN TUTORLY</h2>
          <p className="font-bold text-gray-700">Start your AI-powered learning journey today</p>
        </div>

        <div className="bg-white p-8 brutal-border space-y-4">
          {error && (
            <div className="text-red-600 text-sm font-bold">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-black text-sm mb-2">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12 font-bold brutal-border h-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-sm mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 font-bold brutal-border h-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-sm mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 font-bold brutal-border h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-black text-lg py-4 brutal-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "CREATE ACCOUNT"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-600">OR</p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full border font-bold flex items-center justify-center gap-2 brutal-button"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="font-bold text-gray-600 text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-500 hover:text-purple-600 font-black">
              SIGN IN
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" className="font-black brutal-button hover:bg-gray-100 bg-transparent">
              <ArrowLeft className="w-5 h-5 mr-2" />
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
