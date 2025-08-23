"use client";
import React from "react";

export default function Competitions() {
  return (
    <section className="section fade-in" id="competitions">
      {/* Section Title */}
      <h2 className="section-title">Competitions</h2>
      <p className="section-subtitle">
        Showcase your talent and gain recognition in the beauty industry through
        our exciting competitions.
      </p>

      {/* Competition Info */}
      <div className="competition-info">
        <h3>Bridal Makeup Competition</h3>
        <p>
          Our bridal makeup competition is the perfect opportunity to showcase
          your talent, connect with fellow makeup enthusiasts, and gain
          recognition in the beauty industry. Don&apos;t miss your chance to
          create makeup magic. Register now and embark on this exciting journey
          to make bridal beauty dreams come true.
        </p>

        {/* Competition Details */}
        <div className="competition-details">
          {/* Detail Item */}
          <div className="detail-item">
            <h5>What</h5>
            <p>
              Our bridal makeup competition challenges makeup artists and beauty
              enthusiasts to create the most stunning bridal makeup look.
            </p>
          </div>

          <div className="detail-item">
            <h5>Why</h5>
            <p>
              Showcase your skills and gain exposure. Our makeup competition is
              your chance to shine and be recognized for your talent.
            </p>
          </div>

          <div className="detail-item">
            <h5>Who Can Participate</h5>
            <p>
              The competition is open to makeup artists, beauty professionals,
              and enthusiasts of all levels, from beginners to seasoned experts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
