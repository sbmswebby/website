// lib/supabaseHelpers.ts
import { supabase } from "@/lib/supabaseClient"
import { ReactNode } from "react"

export const getUserProfile = async () => {
  // Step 1: Get the authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    console.error("No user logged in:", error?.message)
    return null
  }

  // Step 2: Query user_profiles table
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Error fetching profile:", profileError.message)
    return null
  }

  return profile
}

export type UserProfile = {
  email: ReactNode
  id: string
  full_name: string
  number: string
  insta_id: string | null
  organisation: string | null
  age: number | null
  gender: string | null
}
