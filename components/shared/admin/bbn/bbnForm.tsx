"use client";

import React, { useState } from "react";
import { BBNRegion } from "./bbnTypes";
import { supabase } from "@/lib/supabaseClient";
import { ImageValue, ImageInput } from "../form/inputs/ImageInput";
import { TextInput } from "../form/inputs/TextInput";
import { CloudinaryService } from "@/lib/cloudinaryService";
import { CityStateInput, CityStateValue } from "../form/inputs/CityStateInput";

interface AppError {
  message: string;
  code?: string;
  details?: string;
}

const isValidName = (value: string): boolean => {
  return /^[a-zA-Z\s\u00C0-\u017F]+$/.test(value);
};

const normalizeIndianPhone = (value: string): string | null => {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  const isValid = /^[6-9]\d{9}$/.test(digits);
  return isValid ? digits : null;
};

export default function BBNForm() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState<CityStateValue>({
    city: "",
    district: "",
    state: "",
    userInput: "",
  });
  const [image, setImage] = useState<ImageValue | null>(null);
  const [loading, setLoading] = useState(false);

  // UX State: Track interaction for "Punish Late"
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    location: false,
    image: false,
  });

  // Inline Validation Messages (Reward Early)
  const nameError = touched.name && (!name.trim() || !isValidName(name))
    ? "Please enter your full name (letters only)."
    : "";

  const phoneError = touched.phone && !normalizeIndianPhone(phoneNumber)
    ? "Mobile number must be 10 digits and start with 6, 7, 8, or 9."
    : "";

  const locationError = touched.location && (!location.city || !location.state)
    ? "Please select a city from the suggestions."
    : "";

  const imageError = touched.image && !image?.file
    ? "Please upload a profile photo."
    : "";

  const handleSubmit = async () => {
    // Force show all errors
    setTouched({ name: true, phone: true, location: true, image: true });

    const normalizedPhone = normalizeIndianPhone(phoneNumber);
    
    // Stop if any validation fails
    if (nameError || phoneError || locationError || imageError || !normalizedPhone || !image?.file) {
      return;
    }

    try {
      setLoading(true);

      const { data: existing } = await supabase
        .from("bbn_directors")
        .select("id")
        .eq("phone_number", normalizedPhone)
        .maybeSingle();

      if (existing) {
        alert("This phone number is already registered.");
        setLoading(false);
        return;
      }

      // TypeScript now knows image.file is not null because of the validation check above
      const photoUrl = await CloudinaryService.uploadFile(image.file, "bbn_directors");

      const { error: insertError } = await supabase.from("bbn_directors").insert({
        name: name.trim(),
        phone_number: normalizedPhone,
        city: location.city,
        district: location.district,
        state: location.state,
        region: "uttarandhra",
        photo_url: photoUrl,
      });

      if (insertError) throw insertError;

      // Reset
      setName("");
      setPhoneNumber("");
      setLocation({ city: "", district: "", state: "", userInput: "" });
      setImage(null);
      setTouched({ name: false, phone: false, location: false, image: false });
      alert("Director added successfully!");
    } catch (err: unknown) {
      console.error("Submit error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-semibold">
            Profile Creation Form
          </p>
        </div>

        {/* Image Section */}
        <div className="space-y-2">
          <ImageInput 
            label="Upload Profile Photo" 
            value={image} 
            onChange={(val) => {
                setImage(val);
                setTouched(t => ({ ...t, image: true }));
            }} 
          />
          {imageError && <p className="text-xs text-red-400 flex items-center gap-1">⚠️ {imageError}</p>}
        </div>

        <div className="space-y-6">
          {/* Name Field */}
          <div className="space-y-1" onBlur={() => setTouched(t => ({ ...t, name: true }))}>
            <TextInput
              value={name}
              onChange={(val) => setName(val.replace(/[^a-zA-Z\s]/g, ""))}
              placeholder="Full Name"
            />
            {nameError && <p className="text-xs text-red-400 flex items-center gap-1">⚠️ {nameError}</p>}
          </div>

          {/* Phone Field */}
          <div className="space-y-1" onBlur={() => setTouched(t => ({ ...t, phone: true }))}>
            <TextInput
              value={phoneNumber}
              onChange={(val) => setPhoneNumber(val.replace(/\D/g, "").slice(0, 10))}
              placeholder="Phone Number"
            />
            {phoneError && <p className="text-xs text-red-400 flex items-center gap-1">⚠️ {phoneError}</p>}
          </div>

          {/* Location Field */}
          <div className="space-y-1" onBlur={() => setTimeout(() => setTouched(t => ({ ...t, location: true })), 200)}>
            <CityStateInput value={location} onChange={setLocation} />
            {locationError && <p className="text-xs text-red-400 flex items-center gap-1">⚠️ {locationError}</p>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-900/20"
        >
          {loading ? "Processing..." : "Register as Director"}
        </button>
      </div>
    </div>
  );
}