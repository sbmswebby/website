"use client";

import React, { useState } from "react";
import type { BBNDirector } from "./bbnTypes";
import { Phone, MapPin, CheckCircle2, XCircle, Loader2, Ban } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface DirectorCardProps {
  director: BBNDirector;
  isAdminMode?: boolean; 
}

export const DirectorCard: React.FC<DirectorCardProps> = ({ director, isAdminMode = false }) => {
  const [isApproved, setIsApproved] = useState(director.is_approved);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleApproval = async () => {
    setIsUpdating(true);
    const newStatus = !isApproved;
    
    const { error } = await supabase
      .from("bbn_directors") // Fixed typo from direct_ors
      .update({ is_approved: newStatus })
      .eq("id", director.id);

    if (!error) {
      setIsApproved(newStatus);
    }
    setIsUpdating(false);
  };

  return (
    <div
      className="
        group bg-gray-900/40 border border-gray-800 rounded-xl
        hover:border-blue-500/50 transition-all duration-300
        overflow-hidden flex flex-col h-full
      "
    >
      {/* Image Container */}
      <div className="aspect-[4/5] bg-gray-800 overflow-hidden relative">
        <img
          src={director.photo_url}
          alt={director.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight uppercase">
            {director.name}
          </h3>
          <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mt-1">
            {director.region} Region
          </p>
        </div>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Phone className="w-3.5 h-3.5" />
            <span className="tabular-nums">{director.phone_number}</span>
          </div>

          <div className="flex items-start gap-2 text-gray-500 text-xs italic">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              {director.city}, {director.district || director.state}
            </span>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdminMode && (
          <div className="mt-5 pt-4 border-t border-gray-800">
            <button
              onClick={toggleApproval}
              disabled={isUpdating}
              className={`
                w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all border group/btn
                ${isApproved 
                  ? "bg-transparent text-green-500 border-green-500/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50" 
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                }
                ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isApproved ? (
                <>
                  {/* Show LIVE by default, DISAPPROVE on hover */}
                  <CheckCircle2 className="w-4 h-4 group-hover/btn:hidden" />
                  <Ban className="w-4 h-4 hidden group-hover/btn:block" />
                  <span className="group-hover/btn:hidden">Approved</span>
                  <span className="hidden group-hover/btn:block">Disapprove</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Pending</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};