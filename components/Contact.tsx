"use client";
import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

export default function Contact() {
  return (
    <section className="section w-full contact fade-in !mx-auto" id="contact">
      <h2 className="section-title">Contact Us</h2>
      <p className="section-subtitle">
        We’d love to hear from you. Choose your preferred method of contact
        below, and our team will respond promptly.
      </p>

      {/* Contact Methods Grid */}
      <div className="contact-grid">
        {/* Phone */}
        <div className="contact-item fade-in">
          <div className="flex flex-row items-center gap-2">
            <Phone size={32} />
            <h4>Call Us</h4>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="p-2 bg-white/5 rounded">
              <a href="tel:+918897955253">+91 8897955253</a>
            </div>
            <div className="p-2 bg-white/5 rounded">
              <a href="tel:+917995514547">+91 7995514547</a>
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="contact-item fade-in">
          <div className="flex flex-row items-center gap-2">
            <FaWhatsapp size={32} className="text-green-500" />
            <h4>WhatsApp</h4>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <a
              href="https://wa.me/918897955253"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              +91 8897955253
            </a>
            <a
              href="https://wa.me/917995514547"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              +91 7995514547
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="contact-item fade-in">
          <div className="flex flex-row items-center gap-2">
            <Mail size={32} />
            <h4>Email</h4>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <a
              href="mailto:info@company.com"
              className="p-2 bg-white/5 rounded hover:bg-white/10 transition"
            >
              info@company.com
            </a>
            <a
              href="mailto:support@company.com"
              className="p-2 bg-white/5 rounded hover:bg-white/10 transition"
            >
              support@company.com
            </a>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="contact-item fade-in">
          <div className="flex flex-row items-center gap-2">
            <Clock size={32} />
            <h4>Opening Hours</h4>
          </div>
          <div className="flex flex-col gap-2 mt-4 text-sm text-gray-300">
            <div className="p-2 bg-white/5 rounded">Mon - Fri: 11:00 AM – 6:00 PM</div>
            <div className="p-2 bg-white/5 rounded">Sun: Closed</div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="contact-item fade-in col-span-full">
          <div className="flex flex-row items-center gap-2">
            <MapPin size={32} />
            <h4>Find Us</h4>
          </div>
          <div className="mt-4 w-full h-[400px] rounded-lg overflow-hidden border border-white/20">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.921083441193!2d78.54100287516552!3d17.415574483476405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb998e2623063f%3A0xe3f1464785e4ea45!2sSBMS!5e0!3m2!1sen!2sin!4v1756804469286!5m2!1sen!2sin"
              width="100%"
              height="100%"
              allowFullScreen={true}
              loading="lazy"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>

        {/* Social Media */}
        <div className="contact-item fade-in col-span-full">
          <div className="flex flex-row items-center gap-2">
            <h4>Connect With Us</h4>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <a
              href="https://instagram.com/company"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition"
            >
              <FaInstagram size={24} className="text-pink-500" />
              <span>@company_insta</span>
            </a>
            <a
              href="https://facebook.com/company"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition"
            >
              <FaFacebook size={24} className="text-blue-500" />
              <span>Company Facebook</span>
            </a>
            <a
              href="https://company.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition"
            >
              <FiGlobe size={24} className="text-sky-400" />
              <span>www.company.com</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
