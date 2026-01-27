"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { verifyAdminPassword } from "./admin_auth";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("bbn_admin_auth");
    setIsAuthorized(session === "true");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(false);

    try {
      const result = await verifyAdminPassword(password);

      if (result.success) {
        localStorage.setItem("bbn_admin_auth", "true");
        setIsAuthorized(true);
      } else {
        setError(true);
        setPassword("");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthorized === null) return <div className="min-h-screen bg-black" />;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
              <p className="text-gray-500 text-sm mt-2">Enter credentials to manage BBN Directors</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Access Password"
                  disabled={isLoading}
                  className={`w-full bg-black border ${
                    error ? "border-red-500" : "border-gray-800"
                  } focus:border-blue-500 text-white pl-10 pr-4 py-3 rounded-xl outline-none transition-all placeholder:text-gray-600 disabled:opacity-50`}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium text-center animate-pulse">
                  Invalid access password.
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group disabled:bg-gray-400"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
          <p className="text-center mt-8 text-gray-600 text-xs uppercase tracking-[0.2em]">
            BBN Internal Systems © 2026
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}