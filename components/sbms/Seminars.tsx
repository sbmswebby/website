"use client";
import React from "react";

export default function Seminars() {
  return (
    <section className="section slide-in-left" id="seminars">
      {/* Section Title */}
      <h2 className="section-title">Seminars & Workshops</h2>
      <p className="section-subtitle">
        Delve into a treasure trove of the latest and most innovative makeup
        techniques through our interactive events.
      </p>

      {/* Services Grid */}
      <div className="services-grid">
        {/* Card 1 */}
        <div className="service-card  fade-in">
          <h3>Latest Techniques</h3>
          <p>
            In our seminars and workshops, you&apos;ll delve into a treasure
            trove of the latest and most innovative makeup techniques. From the
            basics to advanced tricks, we leave no stone unturned in exploring
            the ever-evolving world of makeup.
          </p>
        </div>

        {/* Card 2 */}
        <div className="service-card  fade-in">
          <h3>Expert Guidance</h3>
          <p>
            Our experienced instructors will guide you through these techniques,
            helping you stay at the cutting edge of beauty industry trends and
            innovations.
          </p>
        </div>

        {/* Card 3 */}
        <div className="service-card  fade-in">
          <h3>Hands-On Learning</h3>
          <p>
            We firmly believe that the best way to learn is by doing. Our events
            are designed to be interactive and hands-on, giving you the chance
            to put your newfound knowledge into practice and gain confidence in
            your application skills.
          </p>
        </div>
      </div>
    </section>
  );
}
