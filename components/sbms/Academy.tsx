"use client";
import React from "react";

export default function Academy() {
  return (
    <>
      {/* Academy Section */}
      <section className="section fade-in" id="academy">
        <h2 className="section-title">SBMS Academy</h2>
        <p className="section-subtitle">
          Carefully crafted courses designed to prepare you for a successful and
          fulfilling career in bridal makeup.
        </p>

        <div className="academy-grid">
          <div className="course-card">
            <div className="course-number">1</div>
            <h4>Bridal Makeup Basics</h4>
            <p>
              This foundational course is perfect for beginners who want to
              learn the essentials of bridal makeup. Covering everything from
              skin preparation and colour theory to application techniques,
              you`ll build a strong foundation in bridal looks with confidence.
            </p>
          </div>

          <div className="course-card">
            <div className="course-number">2</div>
            <h4>Advanced Bridal Makeup Techniques</h4>
            <p>
              For makeup artists looking to take their skills to the next level,
              our Advanced Bridal Makeup Techniques course delves into more
              complex aspects of bridal makeup. You`ll explore intricate bridal
              looks, airbrushing, and specialized techniques for different skin
              types and tones.
            </p>
          </div>

          <div className="course-card">
            <div className="course-number">3</div>
            <h4>Bridal Makeup Business Essentials</h4>
            <p>
              Being a successful makeup artist isn`t just about applying makeup,
              it is also about building a thriving business. Our course covers
              marketing, client management, pricing, and the business aspects of
              the bridal makeup industry.
            </p>
          </div>

          <div className="course-card">
            <div className="course-number">4</div>
            <h4>Bridal Makeup Trends and Innovations</h4>
            <p>
              Bridal makeup trends are ever evolving, and staying updated is
              crucial for your career. In this course, you`ll explore the latest
              trends, innovations, and techniques in bridal makeup. From vintage
              to contemporary looks.
            </p>
          </div>

          <div className="course-card">
            <div className="course-number">5</div>
            <h4>Special Effects Bridal Makeup</h4>
            <p>
              Take bridal makeup to the next level with our Special Effects
              Bridal Makeup course. Ideal for artists looking to offer unique and
              avant-garde bridal looks, this course covers fantasy makeup, theme
              weddings, and out-of-the-box bridal styles.
            </p>
          </div>

          <div className="course-card">
            <div className="course-number">6</div>
            <h4>Personalized Makeup Consultations</h4>
            <p>
              This course focuses on providing personalized makeup consultations
              for brides. Learn how to understand each bride`s unique style and
              needs, and tailor makeup to enhance their individual beauty.
            </p>
          </div>

          <div className="course-card">
            <div className="course-number">7</div>
            <h4>Bridal Makeup Masterclass</h4>
            <p>
              Our most comprehensive course, the Bridal Makeup Masterclass,
              combines advanced techniques, business strategies, and in-depth
              knowledge. Upon successful completion, you`ll receive advanced
              certification, positioning you as a highly skilled and qualified
              bridal makeup artist.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="section-subtitle">
            Join our bridal Makeup Academy and discover the perfect course to
            match your aspirations and career goals.
          </p>
          <a href="#contact" className="cta-button">
            Enroll Now
          </a>
        </div>
      </section>

      {/* Academy Features */}
      <section className="section slide-in-right" id="academy-features">
        <div className="services-grid">
          <div className="service-card">
            <h3>Live Classes</h3>
            <p>
              Participate in interactive live classes with our expert
              instructors, getting real-time feedback and personalized guidance
              for your makeup techniques.
            </p>
          </div>

          <div className="service-card">
            <h3>Rapid Courses</h3>
            <p>
              Fast-track your learning with our intensive rapid courses designed
              for quick skill acquisition without compromising on quality
              education.
            </p>
          </div>

          <div className="service-card">
            <h3>Live Demos</h3>
            <p>
              Watch master artists demonstrate advanced techniques in real-time,
              providing you with insights into professional-level makeup
              application.
            </p>
          </div>

          <div className="service-card">
            <h3>Live Stages & Fashion Shows</h3>
            <p>
              Get hands-on experience working on live stages and fashion shows,
              building your portfolio with real-world professional experience.
            </p>
          </div>

          <div className="service-card">
            <h3>Industry Expert Sessions</h3>
            <p>
              Interact with leading industry professionals who share their
              expertise, insights, and career guidance to help shape your
              success in the beauty industry.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
