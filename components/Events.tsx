"use client";
import React from "react";

export default function Events() {
  return (
    <section className="section fade-in" id="events">
      <h2 className="section-title">Upcoming Events</h2>
      <p className="section-subtitle">
        Stay updated with our latest workshops, competitions, and special events
        designed to enhance your makeup artistry journey.
      </p>

      <div className="services-grid">
        <div className="service-card">
          <h3>Bridal Makeup Workshops</h3>
          <p>
            Join our upcoming intensive bridal makeup workshops where you`ll
            learn the latest techniques and trends directly from industry
            experts.
          </p>
        </div>

        <div className="service-card">
          <h3>Makeup Artist Meetups</h3>
          <p>
            Network with fellow makeup artists, share experiences, and build
            professional relationships in our regular community meetup events.
          </p>
        </div>

        <div className="service-card">
          <h3>Product Launch Events</h3>
          <p>
            Be among the first to discover and try new makeup products and tools
            at our exclusive product launch and demonstration events.
          </p>
        </div>
      </div>
    </section>
  );
}
