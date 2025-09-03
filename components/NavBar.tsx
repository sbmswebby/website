"use client"
import React, { useState, useEffect, useRef } from "react"
import { Menu, X, User } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/AuthProvider"
import Link from "next/link"

const Navbar = () => {
  const { user, profile, loading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [profileOpen])

  // Ensure hydration safety
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu when clicking on links
  const closeMobileMenu = () => {
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-b border-[rgba(255,107,157,0.2)] text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12 ml-12 justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <Image 
                src="/images/sbms_logo.svg" 
                alt="SBMS" 
                width={40} 
                height={40}
                className="sm:w-12 sm:h-12"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-4">
            <ul className="flex flex-row gap-16 items-center space-x-4 lg:space-x-6 xl:space-x-8 nav-links">
              <div><Link href="/about" className="nav-link">About Us</Link></div>
              <div><Link href="/competitions" className="nav-link">Competitions</Link></div>
              <div><Link href="/seminars" className="nav-link">Seminars</Link></div>
              <div><Link href="/academy" className="nav-link">Academy</Link></div>
              <div><Link href="/events" className="nav-link">Events</Link></div>
              <div><Link href="/awards" className="nav-link">Awards</Link></div>
              <div><Link href="/contact" className="nav-link">Contact</Link></div>
              <div><Link href="/gallery" className="nav-link">Gallery</Link></div>
              <div><Link href="/magazine" className="nav-link">Magazine</Link></div>
            </ul>
          </div>

          {/* Right side - Profile and Hamburger */}
          <div className="flex items-start gap-4 space-x-4">
            {/* Profile */}
            <div className="relative" ref={profileRef}>
              {!mounted ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-200" />
              ) : loading ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-200 animate-pulse">
                  <span className="text-xs text-gray-500">...</span>
                </div>
              ) : (
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  aria-label="Profile menu"
                >
                  <User className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
                </button>
              )}

              {/* Profile Dropdown */}
              {mounted && profileOpen && !loading && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden z-50 mr-0">
                  <div className="p-4 sm:p-6">
                    {user && profile ? (
                      <div >
                        <div className="flex flex-col items-center mb-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-gray-800">
                            <p className="text-white text-xl sm:text-3xl font-bold">
                              {profile.full_name ? profile.full_name[0] : "U"}
                            </p>
                          </div>
                          <span className="mt-2 text-base sm:text-lg font-bold text-white text-center">
                            {profile.full_name}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-400 text-center break-all">
                            {profile.email}
                          </span>
                        </div>
                        <hr className="my-2 border-gray-700" />
                        <a
                          href="/profile"
                          className="block w-full text-white text-left px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                        >
                          Edit Profile
                        </a>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-md transition-colors duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <a href="/login" className="block">
                        <div className="w-full text-center py-2 px-4 rounded-full text-white hover:bg-gray-700 transition-colors duration-200">
                          Sign In
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white focus:outline-none p-1 rounded-md transition-colors duration-200 hover:bg-gray-800"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'max-h-screen opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-[rgba(10,10,10,0.98)] backdrop-blur-xl border-t border-[rgba(255,107,157,0.2)] px-4 py-4">
          <ul className="flex flex-col space-y-3">
            <div>
              <Link 
                href="/" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Home
              </Link>
            </div>
            <div>
              <Link 
                href="/about" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                About Us
              </Link>
            </div>
            <div>
              <Link 
                href="/competitions" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Competitions
              </Link>
            </div>
            <div>
              <Link 
                href="/seminars" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Seminars
              </Link>
            </div>
            <div>
              <Link 
                href="/academy" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Academy
              </Link>
            </div>
            <div>
              <Link 
                href="/events" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Events
              </Link>
            </div>
            <div>
              <Link 
                href="/awards" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Awards
              </Link>
            </div>
            <div>
              <Link 
                href="/contact" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Contact
              </Link>
            </div>
            <div>
              <Link 
                href="/gallery" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Gallery
              </Link>
            </div>
            <div>
              <Link 
                href="/magazine" 
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-white hover:text-pink-400 hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                Magazine
              </Link>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar