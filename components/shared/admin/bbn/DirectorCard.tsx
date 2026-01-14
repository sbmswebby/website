"use client";

import React from "react";
import type { BBNDirector } from "./bbnTypes";
import { Phone, MapPin } from "lucide-react";

interface DirectorCardProps {
  director: BBNDirector;
}

export const DirectorCard: React.FC<DirectorCardProps> = ({ director }) => {
  return (
    <div
      className="
        bg-gray-900 border border-gray-800 rounded-2xl
        shadow-lg hover:shadow-xl transition-shadow
        overflow-hidden
      "
    >
      {/* Image */}
      <div className="w-full h-48 bg-gray-800 overflow-hidden">
        <img
          src={director.photo_url}
          alt={director.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="text-lg font-semibold text-white leading-tight">
          {director.name}
        </h3>

        {/* Phone */}
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{director.phone_number}</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-gray-400 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
          <span>
            {director.city}, {director.state}
            {director.district && (
              <span className="text-gray-500">
                {" "}
                • {director.district}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
