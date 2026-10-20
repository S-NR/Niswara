import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav = useNavigate();

  return (
    <header className="border-b border-muted bg-card">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="font-bold text-lg">
          🎵 Academy
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-sm opacity-70 hidden sm:inline">
                {user.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="text-sm px-3 py-1 rounded-md bg-muted"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm px-3 py-1 rounded-md bg-primary text-white">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}