"use client";
import React from "react";

export default function Academy() {
  return (
    <>

{/* =====================================================
     SBMS MAKEUP ACADEMY SECTION
===================================================== */}
<section className="section fade-in" id="academy">
  {/* Section Title */}
  <h2 className="section-title">SBMS MAKEUP ACADEMY</h2>
  <p className="section-subtitle">
    SBMS MAKEUP ACADEMY is an institution that offers specialized training and education 
    for aspiring <strong>Professional Makeup Artists</strong>, teaching a wide range of 
    techniques, skills, and industry knowledge to prepare students for a successful career 
    in the beauty industry.
  </p>

  {/* About Description */}
  <p className="mt-4 text-center max-w-3xl mx-auto">
    SBMS MAKEUP ACADEMY provides <strong>hands-on experience</strong> and practical training 
    in Bridal, Fashion, and Special Effects Makeup, often including curriculum on skincare, 
    color theory, and portfolio building. SBMS ensures that students receive the 
    <strong>best education and industry knowledge</strong> directly from seasoned experts.
  </p>

  {/* Offered Courses / Categories */}
  <div className="academy-grid mt-10">
    <div className="course-card">
      <div className="course-number">1</div>
      <h4>Professional Bridal Makeup</h4>
      <p>
        Master the art of flawless bridal makeup — from skin prep, colour theory, 
        and product knowledge to real-world bridal looks and cultural variations.
      </p>
    </div>

    <div className="course-card">
      <div className="course-number">2</div>
      <h4>Fashion & Editorial Makeup</h4>
      <p>
        Explore fashion and editorial makeup styles used in runway shows and 
        magazine shoots. Learn how to express creativity through modern makeup design.
      </p>
    </div>

    <div className="course-card">
      <div className="course-number">3</div>
      <h4>Special Effects Makeup</h4>
      <p>
        Dive into fantasy, stage, and film makeup using prosthetics, textures, and 
        advanced transformation techniques for creative visual effects.
      </p>
    </div>

    <div className="course-card">
      <div className="course-number">4</div>
      <h4>Hair Styling & Care</h4>
      <p>
        Comprehensive training on <strong>Hair Cuts, Hair Styles, Hair Care, 
        and Hair Treatments</strong> — ensuring students master both creative 
        and professional techniques.
      </p>
    </div>

    <div className="course-card">
      <div className="course-number">5</div>
      <h4>Nail Art & Extensions</h4>
      <p>
        Learn intricate nail art, gel techniques, and nail extensions — combining 
        creativity with precision for stunning nail designs.
      </p>
    </div>

    <div className="course-card">
      <div className="course-number">6</div>
      <h4>Beauty & Traditional Arts</h4>
      <p>
        Covering <strong>Beauty, Saree Draping, Mehandi, Flower Making</strong> 
        and many more creative skills that complete a professional beautician’s expertise.
      </p>
    </div>
  </div>

  {/* Academy Branches */}
  <section className="section fade-in" id="academy">
    <h2 className="section-title">SBMS MAKEUP ACADEMY</h2>
    <div className="academy-grid mt-10">
    

    <div className="course-card"><div className="course-number">1</div> SBMS MAKEUP ACADEMY – Habsiguda, Hyderabad</div>
    <div className="course-card"><div className="course-number">2</div> SBMS ACADEMY – Vijayawada</div>
    <div className="course-card"><div className="course-number">3</div> SBMS ACADEMY – Chittoor</div>
    <div className="course-card"><div className="course-number">4</div> SBMS ACADEMY – Bangalore</div>
    <div className="course-card"><div className="course-number">5</div> SBMS ACADEMY – Telangana</div>
    <div className="course-card"><div className="course-number">6</div> SBMS ACADEMY – Andhra Pradesh</div>


    <p className="section-subtitle col-span-2 mt-6">
      Join <strong>SBMS MAKEUP ACADEMY</strong> and discover the perfect course to 
      match your passion and career goals.
    </p>
    <a href="#contact" className="cta-button col-span-2">
      Enroll Now
    </a>
    </div>

  </section>
</section>

{/* =====================================================
     SBMS ACADEMY FEATURES SECTION
===================================================== */}
<section className="section slide-in-right" id="academy-features">
  <h2 className="section-title">Why Choose SBMS?</h2>
  <p className="section-subtitle">
    We bring real-world industry exposure, expert mentorship, and advanced hands-on training 
    to every aspiring artist.
  </p>

  {/* Features Grid */}
  <div className="services-grid">
    <div className="service-card">
      <h3>Live Classes</h3>
      <p>
        Participate in interactive live sessions with our expert trainers and receive 
        personalized feedback to improve your artistry.
      </p>
    </div>

    <div className="service-card">
      <h3>Rapid & Intensive Courses</h3>
      <p>
        Designed for fast learners, our rapid courses help you gain professional 
        skills quickly while maintaining the highest quality standards.
      </p>
    </div>

    <div className="service-card">
      <h3>Hands-On Demos</h3>
      <p>
        Watch live demonstrations by industry professionals, learning practical 
        application methods and product handling techniques.
      </p>
    </div>

    <div className="service-card">
      <h3>Fashion Shows & Live Stages</h3>
      <p>
        Build your confidence and portfolio by working backstage in real fashion 
        shows, competitions, and photo shoots.
      </p>
    </div>

    <div className="service-card">
      <h3>Sessions with Industry Experts</h3>
      <p>
        Learn directly from established makeup artists and beauty professionals 
        who bring their insider knowledge and success tips to you.
      </p>
    </div>
  </div>
</section>
    </>
  );
}
