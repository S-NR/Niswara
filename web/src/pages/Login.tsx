import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [name, setName] = useState("");
  const login = useAuthStore((s) => s.login);
  const nav = useNavigate();

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="opacity-70 text-sm">
        Local profile only (no password). Swap for real auth later.
      </p>
      <input
        className="w-full rounded-md border border-muted bg-card px-3 py-2"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        disabled={!name.trim()}
        onClick={() => {
          login(name.trim());
          nav("/dashboard");
        }}
        className="w-full py-2 rounded-md bg-primary text-white disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}