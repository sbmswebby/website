"use client";
import React from "react";

export default function About() {
  return (
    <section className="section fade-in" id="about">
      <h2 className="section-title">About Us</h2>
      <p className="section-subtitle">
        We`re here to guide you through the intricate world of makeup with our exceptional team of artists and educators.
      </p>

      <div className="about-grid">
        <div className="about-card shimmer-effect">
          <h3>Our Team</h3>
          <p>
            At SBMS, we`re proud to have an exceptional team of makeup artists and educators who`re passionate about their craft, dedicated to their student`s success, and committed to making every client feel confident and beautiful. Get to know the talented individuals who are the heart and soul of our studio and academy.
          </p>
        </div>

        <div className="about-card shimmer-effect">
          <h3>Vision & Mission</h3>
          <p>
            Our vision is to be the beacon of beauty and artistry in the industry. We strive to empower individuals with the knowledge and skills to discover their unique beauty and express themselves confidently. Our mission is to ensure that the reflection you see in the mirror not only leaves you in awe but also exudes your genuine essence.
          </p>
        </div>

        <div className="about-card shimmer-effect">
          <h3>Media Associates</h3>
          <p>
            We collaborate with leading media partners and industry experts to bring you the latest trends, techniques, and innovations in bridal makeup. Our network includes renowned photographers, fashion designers, and beauty influencers who help showcase our artistry.
          </p>
        </div>
      </div>
    </section>
  );
}
