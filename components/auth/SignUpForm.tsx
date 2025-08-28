"use client"
import { useState } from "react"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"

export default function SignUpForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    number: "",
    instaId: "",
    organisation: "",
    age: "",
    gender: "",
    marketingConsent: false,
    termsAccepted: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError("")
  setIsLoading(true)

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match")
    setIsLoading(false)
    return
  }

  try {
    console.log("🆕 Attempting sign up with:", form.email)

    // 1. Sign up the user in Supabase Auth
    const result = await signUp(form.email, form.password)
    console.log("🆕 Auth Sign Up result:", result)

    if (!result?.user) {
      throw new Error("Sign up failed: No user returned from Supabase")
    }

    const userId = result.user.id

    // 2. Insert profile via API route
    const profileData = {
      user_id: userId, // 👈 required
      full_name: form.fullName,
      number: form.number,
      insta_id: form.instaId,
      organisation: form.organisation,
      age: form.age ? Number(form.age) : null,
      gender: form.gender,
      marketing_consent: form.marketingConsent,
      terms_accepted: form.termsAccepted,
    }

    console.log("📤 Sending profile data:", profileData)

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    })

    console.log("📥 Profile API response status:", res.status)

    if (!res.ok) {
      let errMsg = "Failed to save profile"
      try {
        const errJson = await res.json()
        errMsg = errJson.error || errMsg
        console.error("❌ Profile API error:", errJson)
      } catch (jsonErr) {
        console.error("❌ Failed to parse error JSON:", jsonErr)
      }
      throw new Error(errMsg)
    }

    const { profile } = await res.json()
    console.log("✅ Profile saved:", profile)

    // 3. Redirect
    router.push("/profile/setup")
  } catch (err: unknown) {
    console.error("❌ Sign up flow error:", err)
    if (err instanceof Error) setError(err.message)
    else setError("Registration failed due to unknown error")
  } finally {
    setIsLoading(false)
  }
}



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-2xl bg-white border border-gray-200 shadow-md rounded-xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Join us today and start your journey!
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-4 text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              required
              value={form.fullName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              placeholder="John Doe"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              name="number"
              type="tel"
              required
              value={form.number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              placeholder="+91 9876543210"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Instagram ID
            </label>
            <input
              name="instaId"
              type="text"
              value={form.instaId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              placeholder="@username"
            />
          </div>

          {/* Organisation */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Organisation
            </label>
            <input
              name="organisation"
              type="text"
              value={form.organisation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              placeholder="Company / School / College"
            />
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                name="age"
                type="number"
                min="1"
                max="120"
                value={form.age}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              placeholder="********"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-0 focus:border-gray-400"
              placeholder="********"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center text-gray-700 text-base">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={form.marketingConsent}
                onChange={handleChange}
                className="mr-3 h-5 w-5 border-gray-300 rounded"
              />
              I agree to receive marketing updates
            </label>
            <label className="flex items-center text-gray-700 text-base">
              <input
                type="checkbox"
                name="termsAccepted"
                required
                checked={form.termsAccepted}
                onChange={handleChange}
                className="mr-3 h-5 w-5 border-gray-300 rounded"
              />
              I accept the terms and conditions
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-lg bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  )
}
