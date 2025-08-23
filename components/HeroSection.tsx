"use client";
import React from "react";

const Hero = () => {
  return (
    <section className="hero " id="home" >
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
        <h1>SBMS</h1>
        <div className="subtitle  fade-in">
          South Indian Bridal Makeup Studio & Academy
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
