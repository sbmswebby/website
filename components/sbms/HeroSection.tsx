"use client";
import React from "react";
import Image from "next/image"

const Hero = () => {
  return (
    <section className="hero " id="home" >
      <div className="h-11"></div>
    
      {/* Background Particles */}
      <div className="hero-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Hero Content */}
      
      <div className="hero-content ">
        <div className="flex fade-in mb-10 mx-auto justify-center items-center">
        <Image 
          src="/images/sbms_logo.svg" 
          alt="SBMS" 
          width={300} 
          height={300}
          className="block mx-auto" />
        </div>
        <div className="subtitle  fade-in">
          South India Bridal Makeup Studio
        </div>
        <p className="hero-description fade-in">
          At SBMS, we create artistry that narrates your individual journey.
          With skilful hands and meticulous attention to detail, we craft a look
          that leaves you exuding confidence, radiance, and feeling your
          absolute best. The moment you enter our studio or connect with us
          online youre more than a client, youre a cherished member of our SBMS
          family.
        </p>

        <div className="hero-buttons  fade-in">
          <a href="#academy" className="cta-button">
            Explore Academy
          </a>
          <a href="#contact" className="cta-button cta-secondary">
            Book Consultation
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
