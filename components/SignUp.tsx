'use client';

import React, { useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  const insertOrUpdateProfile = async (user: User) => {
    const { error } = await supabase.from('user_profiles').upsert(
      {
        id: user.id,
        full_name: fullName,
        number: number,
        insta_id: instaId || null,
        organisation: organisation || null,
        age: age,
        gender: gender || null,
      },
      { onConflict: 'id' } // Ensures existing rows are updated instead of duplicated
    );

    if (error) throw new Error(error.message);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 2. Insert or update the user profile
        await insertOrUpdateProfile(authData.user);

        setMessage({ type: 'success', text: 'Sign-up successful!' });
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        setNumber('');
        setInstaId('');
        setOrganisation('');
        setAge(null);
        setGender('');
      } else {
        // Happens if email confirmation is required
        setMessage({
          type: 'success',
          text: 'Sign-up initiated. Please check your email to confirm your account.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="signUp" className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Create Your Account</h2>
          <p className="text-gray-600">Join us to get started with our services.</p>
        </div>

        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Column 1 */}
            <div>
              <label htmlFor="email" className="block font-medium">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />

              <label htmlFor="password" className="block mt-4 font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            {/* Column 2 */}
            <div>
              <label htmlFor="fullName" className="block font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />

              <label htmlFor="number" className="block mt-4 font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="number"
                type="tel"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />

              <label htmlFor="instaId" className="block mt-4 font-medium">
                Instagram ID (Optional)
              </label>
              <input
                id="instaId"
                type="text"
                value={instaId}
                onChange={(e) => setInstaId(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />

              <label htmlFor="organisation" className="block mt-4 font-medium">
                Organisation (Optional)
              </label>
              <input
                id="organisation"
                type="text"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              />

              <label htmlFor="age" className="block mt-4 font-medium">
                Age (Optional)
              </label>
              <input
                id="age"
                type="number"
                value={age ?? ''}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full mt-1 border rounded-lg p-2"
              />

              <label htmlFor="gender" className="block mt-4 font-medium">
                Gender (Optional)
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 border rounded-lg p-2"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="text-center mt-6">
            <a href="/login" className="block mb-2 text-blue-600 hover:underline">
              Already have an account? Sign In
            </a>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
