"use client";
import React, { useEffect, useState } from "react";
import { Menu, X , User} from "lucide-react";
import Image from "next/image";

import { supabase } from "@/lib/supabaseClient";
import { getUserProfile, UserProfile } from "@/lib/supabaseHelpers"

const Navbar = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  

const handleProfileClick = async () => {
  setprofile_Open(!profile_open) // toggle dropdown
  if (!profile_open) {           // fetch only when opening
    const data = await getUserProfile()
    setProfile(data)
  }
}

  const [isOpen, setIsOpen] = useState(false);
  const [profile_open, setprofile_Open] = useState(false)

  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Error logging out:", error.message)
  } else {
    setProfile(null)
    console.log('log out sucess')
    // Optional: redirect to homepage or login
    //window.location.href = "/"
  }
}


  return (
    <nav
      id="navbar"
      className="sticky top-0 h-20 w-full z-50 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-b border-[rgba(255,107,157,0.2)] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <a href="#home">
            <Image
              src="/images/logo.png"
              alt="SBMS"
              width={50}
              height={50}
            />
          </a>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center space-x-8 nav-links">
            <li><a href="#about" className="hover:text-pink-400">About Us</a></li>
            <li><a href="#competitions" className="hover:text-pink-400">Competitions</a></li>
            <li><a href="#seminars" className="hover:text-pink-400">Seminars</a></li>
            <li><a href="#academy" className="hover:text-pink-400">Academy</a></li>
            <li><a href="#events" className="hover:text-pink-400">Events</a></li>
            <li><a href="#awards" className="hover:text-pink-400">Awards</a></li>
            <li><a href="#contact" className="hover:text-pink-400">Contact</a></li>
            <li><a href="#gallery" className="hover:text-pink-400">Gallery</a></li>
            <li><a href="#magazine" className="hover:text-pink-400">Magazine</a></li>
          </ul>

          {/* Right side - Profile */}
      <div className="relative">
        <button
          onClick={handleProfileClick}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        >
          <User className="w-6 h-6" />
        </button>

        {/* Dropdown */}
        {profile_open && (
          <div className="absolute right-0 mt-2 w-auto bg-white border rounded-xl shadow-lg overflow-hidden">
            {profile ? (
              <div>
                <span>Hello, {profile.full_name} 👋</span>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Edit Profile
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            ) : (
              <a href="#signIn">sign in</a>
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
            <li><a href="#home" onClick={() => setIsOpen(false)}>Home</a></li>
            <li><a href="#about" onClick={() => setIsOpen(false)}>About Us</a></li>
            <li><a href="#competitions" onClick={() => setIsOpen(false)}>Competitions</a></li>
            <li><a href="#seminars" onClick={() => setIsOpen(false)}>Seminars</a></li>
            <li><a href="#academy" onClick={() => setIsOpen(false)}>Academy</a></li>
            <li><a href="#events" onClick={() => setIsOpen(false)}>Events</a></li>
            <li><a href="#awards" onClick={() => setIsOpen(false)}>Awards</a></li>
            <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact</a></li>
            <li><a href="#gallery" onClick={() => setIsOpen(false)}>Gallery</a></li>
            <li><a href="#magazine" onClick={() => setIsOpen(false)}>Magazine</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
