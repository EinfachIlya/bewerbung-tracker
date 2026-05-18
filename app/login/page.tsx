"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Briefcase, Mail, Lock, Loader2, CheckCircle } from "lucide-react";

type Mode = "magic" | "password";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("E-Mail oder Passwort falsch.");
      else router.push("/board");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Bewerbungs-Tracker</h1>
              <p className="text-sm text-slate-500">Deine Bewerbungen im Überblick</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Link gesendet!</h2>
              <p className="text-slate-600 text-sm">
                Wir haben einen Magic Link an <strong>{email}</strong> gesendet.
              </p>
              <button onClick={() => setSent(false)} className="mt-4 text-sm text-blue-600 hover:underline">
                Zurück
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Anmelden</h2>

              <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setMode("password")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mode === "password" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Passwort
                </button>
                <button
                  onClick={() => setMode("magic")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mode === "magic" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Magic Link
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail-Adresse</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="du@beispiel.de"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {mode === "password" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || (mode === "password" && !password)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Wird geladen…</>
                  ) : mode === "password" ? "Anmelden" : "Magic Link senden"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
