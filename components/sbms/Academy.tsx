"use client";
import React, { JSX } from "react";

/**
 * SBMS Makeup Academy Page
 * Cleaned version — fixed nested sections, responsive grids, and layout overflow.
 */
export default function Academy(): JSX.Element {
  return (
    <>
      {/* =====================================================
          SBMS MAKEUP ACADEMY SECTION
      ===================================================== */}
      <section className="section fade-in" id="academy">
        {/* Section Title */}
        <h2 className="section-title text-center">SBMS MAKEUP ACADEMY</h2>
        <p className="section-subtitle text-center max-w-2xl mx-auto">
          SBMS MAKEUP ACADEMY offers specialized training and education 
          for aspiring <strong>Professional Makeup Artists</strong>, teaching a 
          wide range of techniques, skills, and industry knowledge to prepare 
          students for a successful career in the beauty industry.
        </p>

        {/* About Description */}
        <p className="mt-4 text-center max-w-3xl mx-auto">
          SBMS MAKEUP ACADEMY provides <strong>hands-on experience</strong> and practical training 
          in Bridal, Fashion, and Special Effects Makeup, often including skincare, 
          color theory, and portfolio building — ensuring the best education 
          directly from seasoned experts.
        </p>

        {/* Offered Courses */}
        <div className="academy-grid mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              num: "1",
              title: "Professional Bridal Makeup",
              desc:
                "Master the art of flawless bridal makeup — from skin prep, colour theory, and product knowledge to real-world bridal looks and cultural variations.",
            },
            {
              num: "2",
              title: "Fashion & Editorial Makeup",
              desc:
                "Explore fashion and editorial makeup styles used in runway shows and magazines. Learn to express creativity through modern makeup design.",
            },
            {
              num: "3",
              title: "Special Effects Makeup",
              desc:
                "Dive into fantasy, stage, and film makeup using prosthetics, textures, and advanced transformation techniques.",
            },
            {
              num: "4",
              title: "Hair Styling & Care",
              desc:
                "Comprehensive training on Hair Cuts, Styles, and Treatments — mastering both creative and professional techniques.",
            },
            {
              num: "5",
              title: "Nail Art & Extensions",
              desc:
                "Learn intricate nail art, gel techniques, and nail extensions — combining creativity with precision.",
            },
            {
              num: "6",
              title: "Beauty & Traditional Arts",
              desc:
                "Covering Beauty, Saree Draping, Mehandi, Flower Making, and more — essential for complete professional beauticians.",
            },
          ].map((course) => (
            <div key={course.num} className="course-card bg-base-200 p-6 rounded-xl text-center shadow-md">
              <div className="course-number text-2xl font-bold text-primary mb-2">
                {course.num}
              </div>
              <h4 className="font-semibold text-lg mb-2">{course.title}</h4>
              <p className="text-sm leading-relaxed">{course.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          SBMS ACADEMY BRANCHES SECTION
      ===================================================== */}
      <section className="section fade-in" id="academy-branches">
        <h2 className="section-title text-center">Our Branches</h2>
        <div className="academy-grid mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "SBMS MAKEUP ACADEMY – Habsiguda, Hyderabad",
            "SBMS ACADEMY – Vijayawada",
            "SBMS ACADEMY – Chittoor",
            "SBMS ACADEMY – Bangalore",
            "SBMS ACADEMY – Telangana",
            "SBMS ACADEMY – Andhra Pradesh",
          ].map((branch, index) => (
            <div key={index} className="course-card bg-base-200 p-6 rounded-xl text-center shadow-md">
              <div className="course-number text-2xl font-bold text-primary mb-2">{index + 1}</div>
              {branch}
            </div>
          ))}
        </div>

        <p className="section-subtitle text-center mt-6 max-w-2xl mx-auto">
          Join <strong>SBMS MAKEUP ACADEMY</strong> and discover the perfect course to 
          match your passion and career goals.
        </p>

        <a
          href="#contact"
          className="cta-button block w-fit mx-auto mt-4 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary/80 transition"
        >
          Enroll Now
        </a>
      </section>

      {/* =====================================================
          SBMS ACADEMY FEATURES SECTION
      ===================================================== */}
      <section className="section slide-in-right" id="academy-features">
        <h2 className="section-title text-center">Why Choose SBMS?</h2>
        <p className="section-subtitle text-center max-w-2xl mx-auto">
          Real-world industry exposure, expert mentorship, and hands-on training 
          for every aspiring artist.
        </p>

        <div className="services-grid mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Live Classes",
              desc:
                "Interactive live sessions with expert trainers and personalized feedback to refine your artistry.",
            },
            {
              title: "Rapid & Intensive Courses",
              desc:
                "Fast-track your skills while maintaining the highest professional standards.",
            },
            {
              title: "Hands-On Demos",
              desc:
                "Learn practical application through live demonstrations by industry professionals.",
            },
            {
              title: "Fashion Shows & Live Stages",
              desc:
                "Work backstage at real events to build confidence and a professional portfolio.",
            },
            {
              title: "Sessions with Industry Experts",
              desc:
                "Gain insights directly from established artists and beauty professionals.",
            },
          ].map((feature, index) => (
            <div key={index} className="service-card bg-base-200 p-6 rounded-xl text-center shadow-md">
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
