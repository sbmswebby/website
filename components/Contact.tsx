"use client";
import React from "react";
import { Phone, Mail, MapPin, Smartphone } from "lucide-react";

export default function Contact() {
  return (
    <section className="section contact fade-in !mx-auto" id="contact">
      <h2 className="section-title">Contact Us</h2>
      <p className="section-subtitle">
        We`re delighted to hear from you and assist you with any inquiries or
        requests. Whether you`re looking to book an appointment, inquire about
        our services, or want to connect with us, we`re here to help.
      </p>

      {/* Contact Methods Grid */}
      <div className="contact-grid">
        <div className="contact-item  fade-in">
          <div className="contact-icon">
            <Phone size={48} />
          </div>
          <h4>Call</h4>
          <p>
            Speak directly with our team for immediate assistance, booking
            inquiries, and personalized consultations. Our friendly staff is
            ready to help you find the perfect service.
          </p>
        </div>

        <div className="contact-item  fade-in">
          <div className="contact-icon">
            <Mail size={48} />
          </div>
          <h4>Email</h4>
          <p>
            Send us your questions, course inquiries, or service requests, and
            we`ll get back to you promptly with detailed information and
            personalized recommendations.
          </p>
        </div>

        <div className="contact-item  fade-in">
          <div className="contact-icon">
            <MapPin size={48} />
          </div>
          <h4>Visit</h4>
          <p>
            Come to our beautiful studio for a personal consultation, view our
            portfolio, and experience our services firsthand in our welcoming
            environment.
          </p>
        </div>

        <div className="contact-item  fade-in">
          <div className="contact-icon">
            <Smartphone size={48} />
          </div>
          <h4>Social Media</h4>
          <p>
            Follow us on social media platforms for the latest trends,
            behind-the-scenes content, client transformations, and updates on
            courses and events.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className=" mt-16 !p-10  fade-in">
        <p className="text-white/90 text-lg mb-8">
          Please choose your preferred method of contact, and we`ll get back to
          you as promptly as possible.
        </p>

      </div>
      <div className="hero-buttons  fade-in">
        <a href="#" className="cta-button  fade-in">
          Get In Touch
        </a>
      </div>
    </section>
  );
}
