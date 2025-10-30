/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import React from "react";
import Image from "next/image";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 md:px-16 py-12 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-screen-xl mx-auto w-full">
        {/* Logo & Trademark */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/sbms_logo.svg"
            alt="SBMS Logo"
            width={150}
            height={50}
            className="object-contain"
          />
          <p className="text-sm">© SBMS @ 2025</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="/about" className="hover:text-white transition">
                About
              </a>
            </li>
            <li>
              <a href="/gallery" className="hover:text-white transition">
                Gallery
              </a>
            </li>
            <li>
              <a href="/events" className="hover:text-white transition">
                Events
              </a>
            </li>
            <li>
              <a href="/registrations" className="hover:text-white transition">
                Registrations
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <div className="flex flex-col gap-2">
            <a href="mailto:sbmswebby@gmail.com" className="hover:text-white transition flex items-center gap-2">
              <Mail size={18} /> sbmswebby@gmail.com
            </a>
            <a href="https://wa.me/918897955253" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2">
              <FaWhatsapp size={18} /> WhatsApp
            </a>
            <div className="flex items-center gap-2">
              <MapPin size={18} /> Hyderabad, India
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Phone</h4>
          <div className="flex flex-col gap-2">
            <a href="tel:+918897955253" className="hover:text-white transition flex items-center gap-2">
                <Phone size={18} /> +91 8897955253
            </a>
            <a href="tel:+918897955253" className="hover:text-white transition flex items-center gap-2">
                <Phone size={18} /> +91 7204531214
            </a>
            <a href="tel:+918897955253" className="hover:text-white transition flex items-center gap-2">
                <Phone size={18} /> +91 7337214128
            </a>
            <a href="tel:+918897955253" className="hover:text-white transition flex items-center gap-2">
                <Phone size={18} /> +91 6361030769
            </a>
            <a href="tel:+918897955253" className="hover:text-white transition flex items-center gap-2">
                <Phone size={18} /> +91 7995514547
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex flex-col gap-2">
            <a href="https://instagram.com/sbms999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition">
              <FaInstagram size={18} className="text-pink-500" /> Instagram
            </a>
            <a href="https://www.facebook.com/profile.php?id=61579087620200" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition">
              <FaFacebook size={18} className="text-blue-500" /> Facebook
            </a>
            <a href="https://sbms.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition">
              <FiGlobe size={18} className="text-sky-400" /> Website
            </a>
          </div>
        </div>

        {/* Google Map */}
        <div className="flex flex-col col-span-5 h-48 rounded-lg w-full overflow-hidden border border-white/20">
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.921083441193!2d78.54100287516552!3d17.415574483476405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb998e2623063f%3A0xe3f1464785e4ea45!2sSBMS!5e0!3m2!1sen!2sin!4v1756804469286!5m2!1sen!2sin"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="rounded-lg"
            ></iframe>
        </div>

      </div>


    </footer>
  );
}
