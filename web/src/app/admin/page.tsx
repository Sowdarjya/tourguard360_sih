"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./MapEditor"), { ssr: false });

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "admin" }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setRegisterMode(false);
        setName("");
        setEmail("");
        setPassword("");
        setError("Admin registered! You can now login.");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center">
      {!token ? (
        <div className="bg-white p-8 rounded shadow w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4">{registerMode ? "Admin Registration" : "Admin Login"}</h2>
          {registerMode && (
            <input
              type="text"
              className="border p-2 w-full mb-2"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
          )}
          <input
            type="email"
            className="border p-2 w-full mb-2"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            className="border p-2 w-full mb-4"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {!registerMode ? (
            <>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-2"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded w-full"
                onClick={() => { setRegisterMode(true); setError(null); }}
                disabled={loading}
              >
                Register as Admin
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded w-full"
                onClick={() => { setRegisterMode(false); setError(null); }}
                disabled={loading}
              >
                Back to Login
              </button>
            </>
          )}
          {error && <div className="mt-2 text-center text-sm text-red-600">{error}</div>}
        </div>
      ) : (
        <Map token={token} />
      )}
    </div>
  );
}

