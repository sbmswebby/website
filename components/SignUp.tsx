'use client';

import React, { useState } from 'react';
// We're replacing '@supabase/auth-helpers-nextjs' with the core '@supabase/supabase-js'
// as the auth-helpers package might not be resolvable in this environment.
import { createClient } from '@supabase/supabase-js';
// Removed the Database type import as it relies on a project-specific types file
// that might not be available in this isolated environment.

// Initialize Supabase client directly.
// In a real Next.js app, you'd typically load these from environment variables.
// For this self-contained component, we use placeholders.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'; // Replace with your actual Supabase URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual Supabase Anon Key

// Define the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Main component for the sign-up form
export default function SignUpForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [instaId, setInstaId] = useState<string>('');
  const [organisation, setOrganisation] = useState<string>('');
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 1. Sign up the user with email and password using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      // You can add redirectTo: '...' for email confirmation if needed
      options: {
        data: {
          full_name: fullName, // Optional: pass initial profile data if your auth setup supports it
          // Note: Full profile details are typically inserted into a separate 'profiles' table after auth.
        },
      },
    });

    if (authError) {
      setMessage({ type: 'error', text: authError.message });
      setLoading(false);
      return;
    }

    // Check if user exists, especially for scenarios where email confirmation is required
    // and user data might not be immediately available in authData.user on first response.
    if (authData.user) {
      // 2. If authentication is successful, insert additional profile details into 'user_profiles' table
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authData.user.id, // Link to the authenticated user's ID
        full_name: fullName,
        number: number,
        insta_id: instaId || null, // Handle optional fields
        organisation: organisation || null, // Handle optional fields
        age: age, // Handle optional number field
        gender: gender || null, // Handle optional fields
      });

      if (profileError) {
        setMessage({ type: 'error', text: `Sign-up successful, but failed to save profile: ${profileError.message}` });
        // Consider handling this scenario where auth is successful but profile saving fails.
        // You might want to log out the user or prompt them to fill in details later.
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Sign-up successful!' });
      // Optionally clear form fields or redirect
      setEmail('');
      setPassword('');
      setFullName('');
      setNumber('');
      setInstaId('');
      setOrganisation('');
      setAge(null);
      setGender('');
    } else {
        // This case might happen if email confirmation is required and user data isn't immediately available
        setMessage({ type: 'success', text: 'Sign-up initiated. Please check your email for a confirmation link to complete your registration.' });
    }

    setLoading(false);
  };

return (
  <div id="signUp">
    <div>
      <div className="text-center">
        <h2>Create Your Account</h2>
        <p>Join us to get started with our services.</p>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/*
          This container now becomes a single column on mobile by default,
          and a two-column grid (md:grid-cols-2) on medium screens and up.
        */}
        <div className='grid gap-10 md:grid-cols-2'>
          {/* First Column */}
          <div className='col-span-1'>
            <div>
              <label htmlFor="email">
                Email address <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Second Column */}
          <div className='col-span-1'>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Number */}
            <div>
              <label htmlFor="number">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  id="number"
                  name="number"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Instagram ID (Optional) */}
            <div>
              <label htmlFor="instaId">Instagram ID (Optional)</label>
              <div>
                <input
                  id="instaId"
                  name="instaId"
                  type="text"
                  autoComplete="off"
                  value={instaId}
                  onChange={(e) => setInstaId(e.target.value)}
                />
              </div>
            </div>

            {/* Organisation (Optional) */}
            <div>
              <label htmlFor="organisation">Organisation (Optional)</label>
              <div>
                <input
                  id="organisation"
                  name="organisation"
                  type="text"
                  autoComplete="organization"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                />
              </div>
            </div>

            {/* Age (Optional) */}
            <div>
              <label htmlFor="age">Age (Optional)</label>
              <div>
                <input
                  id="age"
                  name="age"
                  type="number"
                  autoComplete="age"
                  value={age === null ? '' : age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>

            {/* Gender (Optional) */}
            <div>
              <label htmlFor="gender">Gender (Optional)</label>
              <div>
                <select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <div className='text-center m-4'>
          <a href='/login' className='text-center'>already have an account? Sign In</a>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
