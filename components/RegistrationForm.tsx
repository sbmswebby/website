"use client";

import React, { useState } from "react";
import Image from "next/image";

// ------------------ Types ------------------
type Age = number | "";

type FormErrors = {
  selectedSession?: string;
  name?: string;
  phone?: string;
  age?: string;
  gender?: string;
  photo?: string;
  instagram?: string;
  tnc?: string;
  submit?: string;
};

type SuccessResponse = {
  pdfUrl?: string;
  qrUrl?: string;
  success?: boolean;
};

type Session = {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
};

// ------------------ Dummy Data ------------------
const sessions: Session[] = [
  {
    id: "session1",
    title: "Makeup Masterclass",
    description: "Learn top makeup techniques from professionals.",
    cost: 199,
    image: "/makeup.jpg",
  },
  {
    id: "session2",
    title: "Hair Styling 101",
    description: "Basics of hair styling for beginners.",
    cost: 149,
    image: "/hair.jpg",
  },
];

// ------------------ Component ------------------
export default function RegistrationForm() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<Age>("");
  const [gender, setGender] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [instagram, setInstagram] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [tnc, setTnc] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [progress, setProgress] = useState(0);
  const [successData, setSuccessData] = useState<SuccessResponse | null>(null);

  // ------------------ Helpers ------------------
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedSession) newErrors.selectedSession = "Please select a session.";
    if (!name) newErrors.name = "Name is required.";
    if (!phone) newErrors.phone = "Phone number is required.";
    if (!age || (typeof age === "number" && age <= 0))
      newErrors.age = "Please enter a valid age.";
    if (!gender) newErrors.gender = "Gender is required.";
    if (!photo) newErrors.photo = "Photo is required.";
    if (!tnc) newErrors.tnc = "You must accept the terms and conditions.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const compressImage = async (file: File): Promise<File> => {
    const img = document.createElement("img");
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        if (!e.target?.result) return reject("Failed to load image");
        img.src = e.target.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas not supported");

        const maxWidth = 800;
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });
              resolve(compressedFile);
            } else {
              reject("Image compression failed");
            }
          },
          "image/jpeg",
          0.7
        );
      };
    });
  };

  function uploadWithProgress(formData: FormData): Promise<SuccessResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/register");
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };
      xhr.onload = () => {
        const ok = xhr.status >= 200 && xhr.status < 300;
        try {
          const json = JSON.parse(xhr.responseText) as SuccessResponse;
          ok ? resolve(json) : reject(json);
        } catch {
          reject(xhr.responseText);
        }
      };
      xhr.onerror = () => reject("Network error");
      xhr.send(formData);
    });
  }

  // ------------------ Submit Handler ------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const compressedPhoto = photo ? await compressImage(photo) : null;
      const formData = new FormData();
      formData.append("sessionId", selectedSession!);
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("age", String(age));
      formData.append("gender", gender);
      formData.append("company", company);
      formData.append("role", role);
      formData.append("instagram", instagram);
      if (reference) formData.append("reference", reference);
      if (compressedPhoto) formData.append("photo", compressedPhoto);
      formData.append("consent", String(consent));
      formData.append("tnc", String(tnc));

      const response = await uploadWithProgress(formData);
      setSuccessData(response);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Submission failed. Try again." });
    }
  };

  // ------------------ Render ------------------
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Event Registration</h1>

      {successData ? (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          <p className="mb-2">Registration successful!</p>
          {successData.qrUrl && (
            <div>
              <Image
                src={successData.qrUrl}
                alt="QR Code"
                width={150}
                height={150}
              />
            </div>
          )}
          {successData.pdfUrl && (
            <a
              href={successData.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download Pass
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Choose a Session</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedSession === session.id
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <Image
                    src={session.image}
                    alt={session.title}
                    width={400}
                    height={200}
                    className="rounded-md mb-2"
                  />
                  <h3 className="font-bold">{session.title}</h3>
                  <p className="text-sm text-gray-600">{session.description}</p>
                  <p className="font-semibold mt-1">${session.cost}</p>
                  <button
                    type="button"
                    className={`mt-2 px-3 py-1 rounded ${
                      selectedSession === session.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {selectedSession === session.id ? "Selected" : "Select"}
                  </button>
                </div>
              ))}
            </div>
            {errors.selectedSession && (
              <p className="text-red-600 text-sm">{errors.selectedSession}</p>
            )}
          </div>

          {/* Input Fields */}
          <div>
            <label className="block">Name</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block">Phone</label>
            <input
              type="tel"
              className="border p-2 w-full rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block">Age</label>
            <input
              type="number"
              className="border p-2 w-full rounded"
              value={age}
              onChange={(e) =>
                setAge(e.target.value ? Number(e.target.value) : "")
              }
            />
            {errors.age && <p className="text-red-600 text-sm">{errors.age}</p>}
          </div>

          <div>
            <label className="block">Gender</label>
            <select
              className="border p-2 w-full rounded"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-600 text-sm">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block">Company/Institute</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div>
            <label className="block">Role/Job Title</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label className="block">Instagram ID</label>
            <input
              type="text"
              className="border p-2 w-full rounded"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>

          <div>
            <label className="block">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhoto(e.target.files ? e.target.files[0] : null)
              }
            />
            {errors.photo && (
              <p className="text-red-600 text-sm">{errors.photo}</p>
            )}
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span className="ml-2">
                I agree to receive marketing communications
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tnc}
                onChange={(e) => setTnc(e.target.checked)}
              />
              <span className="ml-2">I accept the Terms & Conditions</span>
            </label>
            {errors.tnc && <p className="text-red-600 text-sm">{errors.tnc}</p>}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>

          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-200 h-2 rounded mt-3">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {errors.submit && (
            <p className="text-red-600 text-sm mt-2">{errors.submit}</p>
          )}
        </form>
      )}
    </div>
  );
}
