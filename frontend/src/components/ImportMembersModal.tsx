import { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, LoaderCircle, X } from 'lucide-react';
import apiClient from '../apiClient';

type Report = { created: number; repaired: number; skipped: number; results: { row: number; email: string; status: string; errors: string[]; warnings: string[] }[] };

export default function ImportMembersModal({ onClose }: { onClose: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [repairMissing, setRepairMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true); setError(''); setReport(null);
    const data = new FormData(); data.append('file', file); data.append('repair_missing', String(repairMissing));
    try {
      const response = await apiClient.post('/admin/users/import/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReport(response.data);
    } catch (err: unknown) {
      const response = err as { response?: { data?: { detail?: string } } };
      setError(response.response?.data?.detail || 'Import failed. Check the member list before retrying; some accounts may already have been created.');
    } finally { setBusy(false); }
  }
  return <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="import-title" className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-blue-400/25 rounded-3xl p-5 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white shadow-2xl shadow-blue-950/60">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-cyan-400/10 border border-cyan-300/20 p-3 text-cyan-300"><UploadCloud size={26} /></span>
          <div><p className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-1">Member management</p><h2 id="import-title" className="text-2xl font-bold">Import members</h2></div>
        </div>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close import dialog" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-40"><X size={20} /></button>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">Export your spreadsheet as UTF-8 CSV. Required columns: Email Address, Name, Phone. Maximum 500 members and 2 MB per file.</p>
      <p className="text-slate-400 text-sm leading-relaxed mb-4">Optional columns: Department, Year (study year such as 2nd/3rd, or four-digit graduation year), Position, Primary Domain, Personal email id, LinkedIn profile, Github Id, Instagram id, Your Photo (public image URL or existing uploads filename). All domains are retained; Timestamp is ignored.</p>
      <p className="text-amber-200/90 text-sm leading-relaxed mb-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">Initial passwords are the phone values exactly as shown in the CSV, with outer spaces removed. Existing accounts are skipped unless repair is enabled. Head and lead positions use Head with their original title. Study year is stored separately from graduation year.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${file ? 'border-emerald-400/50 bg-emerald-400/5' : 'border-blue-400/35 bg-blue-400/5'}`}>
          <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${file ? 'bg-emerald-400/15 text-emerald-300' : 'bg-blue-400/15 text-blue-300'}`}>
            {file ? <FileSpreadsheet size={26} /> : <UploadCloud size={26} />}
          </div>
          <p className="font-semibold text-slate-100 mb-1">{file ? 'Your file is ready' : 'Select your member spreadsheet'}</p>
          <p id="csv-help" className="text-xs text-slate-400 mb-4">UTF-8 CSV · Up to 2 MB · 500 members</p>
          <input ref={fileInput} id="members-csv" aria-label="Members CSV" aria-describedby="csv-help" type="file" accept=".csv,text/csv" disabled={busy} onChange={e => { setFile(e.target.files?.[0] || null); setReport(null); setError(''); }} className="hidden" />
          <button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/15 hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <UploadCloud size={18} />{file ? 'Choose another CSV' : 'Choose CSV file'}
          </button>
          <p className={`mt-3 text-sm break-all ${file ? 'text-emerald-300' : 'text-slate-500'}`}>
            {file ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB` : 'No file selected'}
          </p>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-blue-400/20 bg-blue-400/5 p-3 text-sm text-slate-200">
          <input type="checkbox" checked={repairMissing} disabled={busy} onChange={e => { setRepairMissing(e.target.checked); setReport(null); }} className="mt-1 accent-cyan-300" />
          Fill missing fields on existing member accounts. Preserves passwords and filled fields; corrects Associate to Head when the stored title matches a head/lead title. Admin accounts are excluded.
        </label>
        {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button type="button" disabled={busy} onClick={onClose} className="px-5 py-3 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-xl font-medium focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-50">Close</button>
          <button disabled={!file || busy || !!report} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-600/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed">{busy ? <LoaderCircle size={18} className="animate-spin" /> : <UploadCloud size={18} />}{busy ? 'Importing…' : 'Import members'}</button>
        </div>
      </form>
      {report && <div aria-live="polite" className="mt-5">
        <div className="flex flex-wrap gap-3"><p className="flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/25 px-4 py-3 font-semibold text-emerald-300"><CheckCircle2 size={18} />Created {report.created}</p><p className="rounded-xl bg-blue-400/10 border border-blue-400/25 px-4 py-3 font-semibold text-blue-200">Repaired {report.repaired || 0}</p><p className="rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 py-3 font-semibold text-amber-200">Skipped {report.skipped}</p></div>
        <ul className="mt-3 space-y-3 text-sm">
          {report.results.map(r => <li key={r.row} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3 break-words">
            <p>Row {r.row}: {r.email || '(no email)'} — {r.status}</p>
            {r.errors.map((message, i) => <p key={i} className="text-red-400">{message}</p>)}
            {r.warnings.map((message, i) => <p key={i} className="text-amber-300">{message}</p>)}
          </li>)}
        </ul>
      </div>}
    </section>
  </div>;
}
