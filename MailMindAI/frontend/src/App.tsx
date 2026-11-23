import { useState } from "react";
import { NavLink, Route, Routes, useSearchParams } from "react-router-dom";
import { EmailBrowser, type EmailFilters } from "./components/EmailList";
import { SyncControl } from "./components/SyncControl";
import ClaudeAnalysisPage from "./pages/ClaudeAnalysis";
import IntelligencePage from "./pages/Intelligence";
import OverviewPage from "./pages/Overview";
import { CleanupPage, SearchPage } from "./pages/SearchCleanup";
import SettingsPage from "./pages/Settings";
import { ActionsPage, FollowupsPage } from "./pages/Tracking";

const NAV: [string, string][] = [
  ["/", "Overview"],
  ["/emails", "All Emails"],
  ["/work", "Work Intelligence"],
  ["/personal", "Personal Intelligence"],
  ["/actions", "Action Tracker"],
  ["/followups", "Follow-ups"],
  ["/search", "Knowledge Search"],
  ["/cleanup", "Cleanup Center"],
  ["/claude", "Claude Analysis"],
  ["/settings", "Settings"],
];

function AllEmails({ refreshKey }: { refreshKey: number }) {
  const [params] = useSearchParams();
  const initial: EmailFilters = Object.fromEntries([...params.entries()]);
  return (
    <>
      <h1>All Emails</h1>
      <EmailBrowser key={`${params.toString()}-${refreshKey}`} initial={initial} />
    </>
  );
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="app">
      <nav className="sidebar">
        <div className="brand">
          MailMind AI<small>local-first Gmail intelligence</small>
        </div>
        <div className="nav">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="main">
        <div className="topbar">
          <span className="muted small">All analysis runs locally on 127.0.0.1 unless you explicitly request Claude.</span>
          <SyncControl onDone={() => setRefreshKey((k) => k + 1)} />
        </div>
        <Routes>
          <Route path="/" element={<OverviewPage refreshKey={refreshKey} />} />
          <Route path="/emails" element={<AllEmails refreshKey={refreshKey} />} />
          <Route path="/work" element={<IntelligencePage key="work" domain="work" refreshKey={refreshKey} />} />
          <Route path="/personal" element={<IntelligencePage key="personal" domain="personal" refreshKey={refreshKey} />} />
          <Route path="/actions" element={<ActionsPage refreshKey={refreshKey} />} />
          <Route path="/followups" element={<FollowupsPage refreshKey={refreshKey} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cleanup" element={<CleanupPage refreshKey={refreshKey} />} />
          <Route path="/claude" element={<ClaudeAnalysisPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<p>Not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
