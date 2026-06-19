import { useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getCourse } from "../content/academies";
import { useAuthStore } from "../store/useAuthStore";
import { useProgressStore } from "../store/useProgressStore";
import { isEligibleForCertificate, buildCertificate } from "../domain/certification";

export default function CertificatePage() {
  const { courseId } = useParams();
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user)!;
  const course = getCourse(courseId!);
  const progress = useProgressStore((s) => s.get(courseId!));
  const certificates = useProgressStore((s) => s.certificates);
  const saveCertificate = useProgressStore((s) => s.saveCertificate);

  if (!course || !progress) return <Navigate to="/dashboard" replace />;
  if (!isEligibleForCertificate(course, progress))
    return <Navigate to="/dashboard" replace />;

  let cert = certificates.find((c) => c.courseId === course.id);
  if (!cert) {
    cert = buildCertificate(user, course, progress);
    saveCertificate(course.id, cert);
  }

  async function download() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`certificate-${course!.id}.pdf`);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Your Certificate 🎓</h1>
      <div
        ref={ref}
        className="rounded-xl border-4 border-primary bg-card p-10 text-center"
      >
        <p className="uppercase tracking-widest text-xs opacity-60">
          Certificate of Completion
        </p>
        <h2 className="text-3xl font-bold mt-4">{cert.userName}</h2>
        <p className="mt-2 opacity-80">has successfully completed</p>
        <p className="text-xl font-semibold mt-1">{cert.courseTitle}</p>
        <p className="mt-4">Final score: {cert.score}%</p>
        <p className="text-sm opacity-60 mt-1">
          Issued {new Date(cert.issuedAt).toLocaleDateString()}
        </p>
        <p className="text-[10px] opacity-50 mt-4">Verification ID: {cert.id}</p>
      </div>

      <div className="rounded-xl border border-muted bg-card p-4 text-sm">
        <h3 className="font-semibold mb-2">Completion statistics</h3>
        <p>Result: <strong>{cert.score >= course.finalExam.passThreshold! ? "PASS" : "FAIL"}</strong></p>
        <p>Days completed: {course.days.length}/{course.days.length}</p>
        <p>Final exam score: {cert.score}%</p>
      </div>

      <button onClick={download} className="px-5 py-2 rounded-md bg-primary text-white">
        Download PDF
      </button>
    </div>
  );
}