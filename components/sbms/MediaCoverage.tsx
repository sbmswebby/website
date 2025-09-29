"use client";
import React from "react";

export default function MediaCoverage() {
  return (
    <section className="section slide-in-right" id="media">
      <h2 className="section-title">Media Coverage</h2>
      <p className="section-subtitle">
        SBMS has been featured in leading beauty and fashion publications,
        showcasing our expertise and influence in the bridal makeup industry.
      </p>

      <div className="services-grid">
        <div className="service-card">
          <h3>Fashion Magazines</h3>
          <p>
            Our work has been featured in top fashion and beauty magazines,
            highlighting our innovative approaches to bridal makeup and
            trendsetting techniques.
          </p>
        </div>

        <div className="service-card">
          <h3>Television Features</h3>
          <p>
            SBMS has appeared on various television programs, sharing expert
            tips, demonstrating techniques, and discussing the latest trends in
            bridal beauty.
          </p>
        </div>

        <div className="service-card">
          <h3>Industry Publications</h3>
          <p>
            Read about SBMS in leading industry publications that recognize our
            contributions to advancing the standards of bridal makeup artistry.
          </p>
        </div>
      </div>
    </section>
  );
}
