"use client";

import React, { useState } from "react";
import { BBNRegion } from "./bbnTypes";
import { supabase } from "@/lib/supabaseClient";
import { ImageValue, ImageInput } from "../form/inputs/ImageInput";
import { TextInput } from "../form/inputs/TextInput";
import { DropdownInput } from "../form/inputs/DropdownInput";
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
  const [region, setRegion] = useState<BBNRegion | undefined>(undefined);

  const [location, setLocation] = useState<CityStateValue>({
    city: "",
    district: "",
    state: "",
    userInput: "",
  });

  const [image, setImage] = useState<ImageValue | null>(null);
  const [loading, setLoading] = useState(false);

  // UX State
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    location: false,
    image: false,
    region: false,
  });

  // Validation
  const nameError =
    touched.name && (!name.trim() || !isValidName(name))
      ? "Please enter your full name (letters only)."
      : "";

  const phoneError =
    touched.phone && !normalizeIndianPhone(phoneNumber)
      ? "Mobile number must be 10 digits and start with 6, 7, 8, or 9."
      : "";

  const locationError =
    touched.location && (!location.city || !location.state)
      ? "Please select a city from the suggestions."
      : "";

  const imageError =
    touched.image && !image?.file
      ? "Please upload a profile photo."
      : "";

  const regionError =
    touched.region && !region
      ? "Please select a region."
      : "";

  const handleSubmit = async () => {
    setTouched({
      name: true,
      phone: true,
      location: true,
      image: true,
      region: true,
    });

    const normalizedPhone = normalizeIndianPhone(phoneNumber);

    if (
      nameError ||
      phoneError ||
      locationError ||
      imageError ||
      regionError ||
      !normalizedPhone ||
      !image?.file ||
      !region
    ) {
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
        return;
      }

      const photoUrl = await CloudinaryService.uploadFile(
        image.file,
        "bbn_directors"
      );

      const { error } = await supabase.from("bbn_directors").insert({
        name: name.trim(),
        phone_number: normalizedPhone,
        city: location.city,
        district: location.district,
        state: location.state,
        region,
        photo_url: photoUrl,
      });

      if (error) throw error;

      // Reset
      setName("");
      setPhoneNumber("");
      setRegion(undefined);
      setLocation({ city: "", district: "", state: "", userInput: "" });
      setImage(null);
      setTouched({
        name: false,
        phone: false,
        location: false,
        image: false,
        region: false,
      });

      alert("Director added successfully!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-8 space-y-8">
        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold text-center">
          Profile Creation Form
        </p>

        {/* Image */}
        <ImageInput
          label="Upload Profile Photo"
          value={image}
          onChange={(val) => {
            setImage(val);
            setTouched(t => ({ ...t, image: true }));
          }}
        />
        {imageError && <p className="text-xs text-red-400">⚠️ {imageError}</p>}

        {/* Name */}
        <div onBlur={() => setTouched(t => ({ ...t, name: true }))}>
          <TextInput
            value={name}
            onChange={(v) => setName(v.replace(/[^a-zA-Z\s]/g, ""))}
            placeholder="Full Name"
          />
          {nameError && <p className="text-xs text-red-400">⚠️ {nameError}</p>}
        </div>

        {/* Phone */}
        <div onBlur={() => setTouched(t => ({ ...t, phone: true }))}>
          <TextInput
            value={phoneNumber}
            onChange={(v) => setPhoneNumber(v.replace(/\D/g, "").slice(0, 10))}
            placeholder="Phone Number"
          />
          {phoneError && <p className="text-xs text-red-400">⚠️ {phoneError}</p>}
        </div>

        {/* Location */}
        <div onBlur={() => setTouched(t => ({ ...t, location: true }))}>
          <CityStateInput value={location} onChange={setLocation} />
          {locationError && <p className="text-xs text-red-400">⚠️ {locationError}</p>}
        </div>

        {/* ✅ Region Dropdown (NEW) */}
        <div onBlur={() => setTouched(t => ({ ...t, region: true }))}>
          <DropdownInput<BBNRegion>

            value={region}
            placeholder="Select Region from dropdown"
            options={[
              { label: "Uttarandhra", value: "uttarandhra" },
              { label: "Andhra", value: "andhra" },
              { label: "Rayalaseema", value: "rayalaseema" },
              { label: "Telangana", value: "telangana" },
            ]}
            onChange={setRegion}
          />
          {regionError && <p className="text-xs text-red-400">⚠️ {regionError}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
        >
          {loading ? "Processing..." : "Register as Director"}
        </button>
      </div>
    </div>
  );
}
