import AppRouter from "./router";
import Navbar from "../components/layout/Navbar";

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <AppRouter />
      </main>
    </div>
  );
}