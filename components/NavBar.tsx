"use client"
import React, { useState, useEffect } from "react"
import { Menu, X, User } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/AuthProvider"
import Link from "next/link"

const Navbar = () => {
  const { user, profile, loading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Make sure we only render auth-dependent UI after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 h-20 w-full z-50 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-b border-[rgba(255,107,157,0.2)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <Image src="/images/logo.png" alt="SBMS" width={50} height={50} />
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center space-x-8 nav-links">
            <li><Link href="/about" className="hover:text-pink-400">About Us</Link></li>
            <li><Link href="/competitions" className="hover:text-pink-400">Competitions</Link></li>
            <li><Link href="/seminars" className="hover:text-pink-400">Seminars</Link></li>
            <li><Link href="/academy" className="hover:text-pink-400">Academy</Link></li>
            <li><Link href="/events" className="hover:text-pink-400">Events</Link></li>
            <li><Link href="/awards" className="hover:text-pink-400">Awards</Link></li>
            <li><Link href="/contact" className="hover:text-pink-400">Contact</Link></li>
            <li><Link href="/gallery" className="hover:text-pink-400">Gallery</Link></li>
            <li><Link href="/magazine" className="hover:text-pink-400">Magazine</Link></li>
          </ul>

          {/* Right side - Profile */}
          <div className="relative">
            {!mounted ? (
              // Render stable placeholder while waiting for hydration
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200" />
            ) : loading ? (
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 animate-pulse">
                <span className="text-xs text-gray-500">...</span>
              </div>
            ) : (
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                <User className="w-6 h-6" />
              </button>
            )}

            {/* Dropdown */}
            {mounted && profileOpen && !loading && (
              <div className="absolute p-6 left-1/2 -translate-x-1/2 mt-2 w-72 bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden">
                {user && profile ? (
                  <div>
                    <div className="flex flex-col mt-5 items-center mb-4">
                      {/* Profile initials */}
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-800">
                        <p className="text-white text-3xl font-bold">
                          {profile.full_name ? profile.full_name[0] : "U"}
                        </p>
                      </div>
                      <span className="mt-2 text-lg font-bold text-white">
                        {profile.full_name}
                      </span>
                      <span className="text-sm text-gray-400">{profile.email}</span>
                    </div>
                    <hr className="my-2 border-gray-700" />
                    <a
                      href="/profile"
                      className="w-full text-white text-left px-4 py-2 hover:bg-gray-700 rounded-md"
                    >
                      Edit Profile
                    </a>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <a href="/login">
                    <div className="w-full text-center py-2 px-4 rounded-full text-white hover:bg-gray-700 transition">
                      Sign In
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white focus:outline-none p-2 rounded-md"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-t border-[rgba(255,107,157,0.2)] px-6 py-4">
          <ul className="flex flex-col space-y-4">
            <li><Link href="/" onClick={() => setIsOpen(false)}><p>Home</p></Link></li>
            <li><Link href="/about" onClick={() => setIsOpen(false)}>About Us</Link></li>
            <li><Link href="/competitions" onClick={() => setIsOpen(false)}>Competitions</Link></li>
            <li><Link href="/seminars" onClick={() => setIsOpen(false)}>Seminars</Link></li>
            <li><Link href="/academy" onClick={() => setIsOpen(false)}>Academy</Link></li>
            <li><Link href="/events" onClick={() => setIsOpen(false)}>Events</Link></li>
            <li><Link href="/awards" onClick={() => setIsOpen(false)}>Awards</Link></li>
            <li><Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
            <li><Link href="/gallery" onClick={() => setIsOpen(false)}>Gallery</Link></li>
            <li><Link href="/magazine" onClick={() => setIsOpen(false)}>Magazine</Link></li>
          </ul>
        </div>
      )}

    </nav>
  )
}

export default Navbar
