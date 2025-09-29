"use client";
import React from "react";
import { ImageGallery } from "@/components/ImageGallery";

export default function Gallery() {
  return (
    <section className="section fade-in w-full" id="gallery">
      <h2 className="section-title">Gallery</h2>
      <p className="section-subtitle">
        Explore our stunning portfolio of bridal transformations, showcasing the
        artistry and skill of our talented makeup artists.
      </p>

      <div className="services-grid">
        <div className="service-card">
          <h3>Bridal Transformations</h3>
          <p>
            Witness the magical transformation of our beautiful brides, each
            look carefully crafted to enhance their unique features and personal
            style.
          </p>
        </div>

        <div className="service-card">
          <h3>Behind the Scenes</h3>
          <p>
            Get an exclusive look at our creative process, from initial
            consultation to the final stunning result, showcasing the meticulous
            attention to detail.
          </p>
        </div>

        <div className="service-card">
          <h3>Student Work</h3>
          <p>
            Celebrate the achievements of our academy students with a showcase
            of their exceptional work and artistic growth throughout their
            learning journey.
          </p>
        </div>
      </div>
      <div className="h-10"></div>
      <ImageGallery/>
    </section>
  );
}
