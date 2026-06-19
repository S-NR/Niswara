import { Link } from "react-router-dom";
import { academies } from "../content/academies";

export default function Landing() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Learning Academies</h1>
      <p className="opacity-70">Pick an academy to begin.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {academies.map((a) => (
          <div key={a.id} className="rounded-xl border border-muted bg-card p-5">
            <div className="text-2xl">{a.icon}</div>
            <h2 className="text-xl font-semibold mt-2">{a.title}</h2>
            <p className="opacity-70 text-sm mt-1">{a.description}</p>
            <Link
              to="/dashboard"
              className="inline-block mt-4 px-4 py-2 rounded-md bg-primary text-white text-sm"
            >
              Enter
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}