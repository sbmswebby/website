"use client";
import React from "react";

export default function Magazine() {
  return (
    <section className="section fade-in" id="magazine">
      <h2 className="section-title">SBMS Magazine</h2>
      <p className="section-subtitle">
        Explore our Magazine and let your passion for makeup and bridal beauty
        flourish. Whether you`re a professional makeup artist, a makeup
        enthusiast, or someone looking for inspiration, there`s a place for you
        in our vibrant and creative community.
      </p>

      {/* Centered Call-to-Action */}
      <div className="text-center my-12">
        <p className="text-white/90 text-lg mb-8">
          Start your journey today and immerse yourself in the art of bridal
          makeup.
        </p>
      </div>

      {/* Magazine Features Grid */}
      <div className="magazine-features">
        <div className="feature-item">
          <h5>Trending Bridal Looks</h5>
          <p>
            Stay up to date with the latest bridal makeup trends, from classic
            elegance to modern innovations. Discover what`s captivating brides
            this season.
          </p>
        </div>

        <div className="feature-item">
          <h5>Expert Advice</h5>
          <p>
            Learn from the best in the industry with articles, interviews, and
            tutorials from our experienced makeup artists and instructors.
          </p>
        </div>

        <div className="feature-item">
          <h5>Student Success Stories</h5>
          <p>
            Be inspired by the journeys of our students who have carved
            successful careers in bridal makeup and built thriving businesses.
          </p>
        </div>

        <div className="feature-item">
          <h5>How-to Guides</h5>
          <p>
            Master the art of bridal makeup with step by step guides and
            practical tips for achieving stunning looks that wow every bride.
          </p>
        </div>

        <div className="feature-item">
          <h5>Product Reviews</h5>
          <p>
            Get honest and detailed reviews of makeup products, tools, and
            accessories to help you make informed choices for your kit.
          </p>
        </div>

        <div className="feature-item">
          <h5>Real Bridal Stories</h5>
          <p>
            Dive into real-life bridal stories and transformations, celebrating
            the unique beauty of each bride and their special day.
          </p>
        </div>
      </div>
    </section>
  );
}
