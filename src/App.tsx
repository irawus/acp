import { useState, useEffect } from "react";
import { 
  Download, 
  Layers, 
  Sparkles, 
  School,
  Calendar,
  Undo
} from "lucide-react";
import { getOfficialCPData, getSubjectLegalBasis, SUBJECTS_LIST, PHASES_LIST, DEFAULT_SAMPLE_DATA, CPTPRow } from "./data";

export default function App() {
  // Document Identity States
  const [namaSekolah, setNamaSekolah] = useState("SMK Negeri 1 Surabaya");
  const [tahunPelajaran, setTahunPelajaran] = useState("2026/2027");
  const [kelas, setKelas] = useState("Kelas X");
  
  // Selection States
  const [selectedSubject, setSelectedSubject] = useState("Pendidikan Agama Islam dan Budi Pekerti");
  const [selectedPhase, setSelectedPhase] = useState("Fase E");

  // Signature Block States
  const [tempat, setTempat] = useState("Jember");
  const [tanggal, setTanggal] = useState("9 Juli 2026");
  const [kepalaSekolah, setKepalaSekolah] = useState("Dr. Drs. H. Achmad Fauzi, M.Pd.");
  const [guruPengampu, setGuruPengampu] = useState("Suwari, S.Pd., M.M.");

  // Table Data State (Initialized with default PAI Fase E)
  const [tableData, setTableData] = useState<CPTPRow[]>(DEFAULT_SAMPLE_DATA);

  // Inline Editing State for bullets (Kompetensi, Lingkup Materi, Tujuan Pembelajaran)
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: "kompetensi" | "lingkupMateri" | "tujuanPembelajaran" } | null>(null);

  // App UI States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-adjust Kelas and Table Data when Subject or Phase changes
  useEffect(() => {
    let targetKelas = "Kelas X";
    if (selectedPhase === "Fase A") targetKelas = "Kelas I";
    else if (selectedPhase === "Fase B") targetKelas = "Kelas III";
    else if (selectedPhase === "Fase C") targetKelas = "Kelas V";
    else if (selectedPhase === "Fase D") targetKelas = "Kelas VII";
    else if (selectedPhase === "Fase E") targetKelas = "Kelas X";
    else if (selectedPhase === "Fase F") targetKelas = "Kelas XI";
    
    setKelas(targetKelas);
    
    // Automatically load the official government CP data for selected subject and phase
    const officialData = getOfficialCPData(selectedSubject, selectedPhase);
    setTableData(officialData);
  }, [selectedSubject, selectedPhase]);

  // Loading steps animation simulation
  const legalBasis = getSubjectLegalBasis(selectedSubject);
  const steps = [
    `Menyelaraskan dengan Keputusan Pemerintah (${legalBasis})...`,
    "Memetakan Elemen Kurikulum Pemerintah...",
    "Menyusun Struktur Kompetensi & Lingkup Materi...",
    "Merumuskan Tujuan Pembelajaran yang Berurutan...",
    `Menyajikan Analisis CP ${selectedSubject} Resmi...`
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, 1000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Run official generator
  const handleGenerate = () => {
    setLoading(true);
    setSuccessMsg(null);
    setLoadingStep(0);

    // Simulate official compilation of government document data
    setTimeout(() => {
      const officialData = getOfficialCPData(selectedSubject, selectedPhase);
      setTableData(officialData);
      setLoading(false);
      setSuccessMsg(`Peta analisis Capaian Pembelajaran ${selectedSubject} berhasil disinkronkan!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 5000);
  };

  // Handle Editing State Elements
  const updateTableCell = (rowIndex: number, field: keyof CPTPRow, value: any) => {
    const updated = [...tableData];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [field]: value
    };
    setTableData(updated);
  };

  // Reset to default
  const handleResetToSample = () => {
    setSelectedSubject("Pendidikan Agama Islam dan Budi Pekerti");
    setSelectedPhase("Fase E");
    setNamaSekolah("SMK Negeri 1 Surabaya");
    setTahunPelajaran("2026/2027");
    setKelas("Kelas X");
    setTempat("Jember");
    setTanggal("9 Juli 2026");
    setKepalaSekolah("Dr. Drs. H. Achmad Fauzi, M.Pd.");
    setGuruPengampu("Suwari, S.Pd., M.M.");
    const officialData = getOfficialCPData("Pendidikan Agama Islam dan Budi Pekerti", "Fase E");
    setTableData(officialData);
    setSuccessMsg("Data berhasil disetel ulang sesuai dokumen BKPDM.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Export to Microsoft Word .doc (natively parsed by MS Word)
  const handleExportWord = () => {
    const mapel = selectedSubject;
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Analisis Capaian Pembelajaran</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: black; }
          h2 { text-align: center; margin-bottom: 25px; font-size: 13pt; text-transform: uppercase; font-weight: bold; }
          .identity-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .identity-table td { padding: 3px 0; border: none; font-size: 11pt; vertical-align: middle; }
          .main-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          .main-table th { background-color: #f2f2f2; border: 1px solid #000000; padding: 8px; text-align: center; font-size: 10pt; font-weight: bold; }
          .main-table td { border: 1px solid #000000; padding: 8px; vertical-align: top; font-size: 10pt; }
          .signature-table { width: 100%; border-collapse: collapse; margin-top: 40px; page-break-inside: avoid; }
          .signature-table td { border: none; padding: 5px; text-align: center; font-size: 11pt; width: 50%; }
          ul, ol { margin: 0; padding-left: 18px; }
          li { margin-bottom: 3px; }
        </style>
      </head>
      <body>
    `;
    
    const footer = `
      </body>
      </html>
    `;

    let content = `
      <h2>ANALISIS CAPAIAN PEMBELAJARAN</h2>
      
      <table class="identity-table">
        <tr>
          <td style="width: 18%;"><b>Nama Sekolah</b></td>
          <td style="width: 3%;">:</td>
          <td style="width: 79%;">${namaSekolah}</td>
        </tr>
        <tr>
          <td><b>Mata Pelajaran</b></td>
          <td>:</td>
          <td style="font-weight: bold; color: black;">${mapel}</td>
        </tr>
        <tr>
          <td><b>Fase / Kelas</b></td>
          <td>:</td>
          <td>${selectedPhase} / ${kelas}</td>
        </tr>
        <tr>
          <td><b>Tahun Pelajaran</b></td>
          <td>:</td>
          <td>${tahunPelajaran}</td>
        </tr>
      </table>

      <table class="main-table">
        <thead>
          <tr>
            <th style="width: 5%;">No.</th>
            <th style="width: 15%;">Elemen</th>
            <th style="width: 25%;">Capaian Pembelajaran (CP)</th>
            <th style="width: 15%;">Kompetensi</th>
            <th style="width: 18%;">Lingkup Materi</th>
            <th style="width: 22%;">Tujuan Pembelajaran (TP)</th>
          </tr>
        </thead>
        <tbody>
    `;

    tableData.forEach((row, idx) => {
      const compList = row.kompetensi.filter(comp => comp.trim() !== "").map(comp => `<li>${comp}</li>`).join('');
      const matList = row.lingkupMateri.filter(mat => mat.trim() !== "").map(mat => `<li>${mat}</li>`).join('');
      const tpList = row.tujuanPembelajaran.filter(tp => tp.trim() !== "").map(tp => `<li>${tp}</li>`).join('');
      content += `
        <tr>
          <td style="text-align: center; vertical-align: top;">${idx + 1}</td>
          <td><b>${row.elemen}</b></td>
          <td style="text-align: justify; line-height: 1.3;">${row.capaianPembelajaran}</td>
          <td>
            <ul style="margin: 0; padding-left: 14px; list-style-type: disc;">
              ${compList}
            </ul>
          </td>
          <td>
            <ul style="margin: 0; padding-left: 14px; list-style-type: disc;">
              ${matList}
            </ul>
          </td>
          <td>
            <ol style="margin: 0; padding-left: 14px;">
              ${tpList}
            </ol>
          </td>
        </tr>
      `;
    });

    content += `
        </tbody>
      </table>

      <table class="signature-table">
        <tr>
          <td></td>
          <td>${tempat}, ${tanggal}</td>
        </tr>
        <tr>
          <td>Mengetahui,<br>Kepala Sekolah</td>
          <td>Guru Mata Pelajaran</td>
        </tr>
        <tr style="height: 70px;">
          <td colspan="2"></td>
        </tr>
        <tr>
          <td><b><u>${kepalaSekolah}</u></b></td>
          <td><b><u>${guruPengampu}</u></b></td>
        </tr>
      </table>
    `;

    const html = header + content + footer;
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const fileNameSubject = selectedSubject.toUpperCase().replace(/\s+/g, '_');
    a.download = `ANALISIS_CP_${fileNameSubject}_${selectedPhase.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      
      {/* HEADER NAVIGATION - GEOMETRIC BALANCE THEME */}
      <nav className="no-print h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Geometric Diamond Accent Icon */}
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-slate-800 underline decoration-indigo-500 decoration-2 font-display">
            Analisis CP
          </span>
        </div>
        
        {/* Actions bar top-right */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToSample}
            title="Sajikan Contoh Pendidikan Agama Islam"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors border border-slate-200 cursor-pointer"
          >
            <Undo className="w-3.5 h-3.5 text-slate-400" />
            Setel Ulang Dokumen
          </button>
          
          <div className="h-5 w-px bg-slate-200"></div>
          
          <button 
            onClick={handleExportWord}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-100" />
            Unduh Dokumen (.DOC)
          </button>
        </div>
      </nav>

      {/* CORE FRAMEWORK GRID - GEOMETRIC DIVISION */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        
        {/* SIDEBAR SELECTION (Hidden in print) */}
        <aside className="no-print w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto max-h-[none] lg:max-h-[calc(100vh-64px)]">
          
          {/* Card 1: Mapel & Fase */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                1. Pilih Mata Pelajaran & Fase
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mata Pelajaran
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md bg-slate-50 text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden cursor-pointer"
              >
                {SUBJECTS_LIST.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Pilih Fase & Kelas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="p-2.5 border border-slate-300 rounded-md bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden transition cursor-pointer"
                >
                  {PHASES_LIST.map((p) => (
                    <option key={p.value} value={p.value}>{p.value}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Kelas"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="p-2.5 border border-slate-300 rounded-md bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden text-center font-medium transition"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Card 2: Identitas Sekolah & Dokumen */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-600" />
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                2. Identitas Sekolah
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Nama Sekolah</label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Th Pelajaran</label>
                  <input
                    type="text"
                    value={tahunPelajaran}
                    onChange={(e) => setTahunPelajaran(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs focus:outline-hidden focus:border-indigo-500 text-center transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Dok. Tempat</label>
                  <input
                    type="text"
                    value={tempat}
                    onChange={(e) => setTempat(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs focus:outline-hidden focus:border-indigo-500 text-center transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Dokumen</label>
                <input
                  type="text"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Card 3: Penandatangan */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                3. Tanda Tangan
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Kepala Sekolah</label>
                <input
                  type="text"
                  value={kepalaSekolah}
                  onChange={(e) => setKepalaSekolah(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Guru Pengampu</label>
                <input
                  type="text"
                  value={guruPengampu}
                  onChange={(e) => setGuruPengampu(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Sync Government CP Data */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition animate-pulse" />
            Generate Analisis CP
          </button>
        </aside>

        {/* MAIN PREVIEW CONTENT - GEOMETRIC PREVIEW PANEL */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col bg-slate-100/60 max-h-[none] lg:max-h-[calc(100vh-64px)]">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden flex flex-col mx-auto max-w-4xl w-full relative">
            
            {/* Status alerts */}
            {successMsg && (
              <div className="no-print bg-indigo-50 border-b border-indigo-100 text-indigo-800 p-3.5 text-xs flex items-center gap-2.5">
                <span className="flex-1 font-medium">{successMsg}</span>
                <button onClick={() => setSuccessMsg(null)} className="text-indigo-400 hover:text-indigo-900 font-bold ml-2">×</button>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="no-print absolute inset-0 bg-white/95 backdrop-blur-xs z-30 rounded-lg flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                
                <h4 className="text-lg font-bold text-slate-900 mb-1 font-display">Sinkronisasi Dokumen Negara</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                  Memuat data resmi Capaian Pembelajaran {selectedSubject} berdasarkan keputusan legal {getSubjectLegalBasis(selectedSubject)}...
                </p>

                <div className="w-full max-w-xs bg-slate-100 h-1 rounded-full overflow-hidden mb-4">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500" 
                    style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                  />
                </div>

                <span className="text-xs font-semibold text-indigo-700 animate-pulse bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-100">
                  {steps[loadingStep]}
                </span>
              </div>
            )}

            {/* DOCUMENT TITLE / HEADER SECTION */}
            <header className="p-6 md:p-8 pb-4 border-b border-slate-100 flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-snug uppercase font-display max-w-2xl">
                ANALISIS CAPAIAN PEMBELAJARAN
              </h2>
              <div className="h-1 w-24 bg-indigo-600 rounded-full mt-2 mb-6"></div>
              
              {/* Identity Block */}
              <div className="w-full max-w-md text-left text-xs text-slate-700 space-y-1.5 bg-slate-50/50 p-4 rounded-lg border border-slate-200/50 self-start no-print-bg">
                <div className="grid grid-cols-[120px_10px_1fr] items-center">
                  <span className="font-semibold text-slate-500">Nama Sekolah</span>
                  <span>:</span>
                  <input
                    type="text"
                    value={namaSekolah}
                    onChange={(e) => setNamaSekolah(e.target.value)}
                    className="font-bold text-slate-800 bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded px-1.5 py-0.5 outline-hidden transition print-input-clean w-full"
                  />
                </div>
                <div className="grid grid-cols-[120px_10px_1fr] items-center">
                  <span className="font-semibold text-slate-500">Mata Pelajaran</span>
                  <span>:</span>
                  <span className="font-bold text-slate-800 px-1.5 py-0.5 truncate" title={selectedSubject}>
                    {selectedSubject}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_10px_1fr] items-center">
                  <span className="font-semibold text-slate-500">Fase / Kelas</span>
                  <span>:</span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 font-bold text-slate-800">
                    <span>{selectedPhase}</span>
                    <span>/</span>
                    <input
                      type="text"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded outline-hidden w-24 transition print-input-clean"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-[120px_10px_1fr] items-center">
                  <span className="font-semibold text-slate-500">Tahun Pelajaran</span>
                  <span>:</span>
                  <input
                    type="text"
                    value={tahunPelajaran}
                    onChange={(e) => setTahunPelajaran(e.target.value)}
                    className="font-bold text-slate-800 bg-transparent focus:bg-white focus:ring-1 focus:ring-indigo-100 rounded px-1.5 py-0.5 outline-hidden w-32 transition print-input-clean"
                  />
                </div>
              </div>
            </header>

            {/* SCROLLABLE TABLE AREA */}
            <div className="flex-1 p-6 md:p-8 pt-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-300 print-table-border">
                <thead className="bg-slate-50 print-th">
                  <tr className="text-center font-bold">
                    <th className="border border-slate-300 p-2.5 w-8 text-slate-700 print-table-cell">No.</th>
                    <th className="border border-slate-300 p-2.5 w-24 text-slate-700 text-left print-table-cell">Elemen</th>
                    <th className="border border-slate-300 p-2.5 text-slate-700 text-left print-table-cell">Capaian Pembelajaran (CP)</th>
                    <th className="border border-slate-300 p-2.5 w-32 text-slate-700 text-left print-table-cell">Kompetensi</th>
                    <th className="border border-slate-300 p-2.5 w-36 text-slate-700 text-left print-table-cell">Lingkup Materi</th>
                    <th className="border border-slate-300 p-2.5 text-slate-700 text-left print-table-cell">Tujuan Pembelajaran (TP)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {tableData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/40 transition">
                      {/* Number Column */}
                      <td className="border border-slate-300 p-2.5 text-center align-top font-medium text-slate-500 print-table-cell">
                        <span>{rIdx + 1}</span>
                      </td>

                      {/* Element Name */}
                      <td className="border border-slate-300 p-2.5 align-top font-semibold text-slate-900 print-table-cell">
                        <textarea
                          value={row.elemen}
                          onChange={(e) => updateTableCell(rIdx, "elemen", e.target.value)}
                          className="w-full bg-transparent resize-y focus:outline-hidden focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100 p-1 rounded transition border border-transparent font-semibold text-slate-900 print-input-clean"
                          rows={2}
                        />
                      </td>

                      {/* CP text */}
                      <td className="border border-slate-300 p-2.5 align-top text-justify leading-relaxed print-table-cell">
                        <textarea
                          value={row.capaianPembelajaran}
                          onChange={(e) => updateTableCell(rIdx, "capaianPembelajaran", e.target.value)}
                          className="w-full bg-transparent resize-y focus:outline-hidden focus:bg-slate-50 focus:ring-1 focus:ring-indigo-100 p-1 rounded transition border border-transparent text-slate-700 text-xs print-input-clean"
                          rows={5}
                        />
                      </td>

                      {/* Kompetensi Column (Edit-by-Enter, Display as clean Bullets) */}
                      <td className="border border-slate-300 p-2.5 align-top print-table-cell">
                        {editingCell?.rowIndex === rIdx && editingCell?.field === "kompetensi" ? (
                          <textarea
                            value={row.kompetensi.join("\n")}
                            onChange={(e) => {
                              const lines = e.target.value.split("\n");
                              updateTableCell(rIdx, "kompetensi", lines);
                            }}
                            onBlur={() => setEditingCell(null)}
                            autoFocus
                            placeholder="Tulis setiap kompetensi di baris baru..."
                            className="w-full bg-white p-1.5 border border-indigo-400 rounded-md text-[11px] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                            rows={Math.max(4, row.kompetensi.length)}
                          />
                        ) : (
                          <div 
                            onClick={() => setEditingCell({ rowIndex: rIdx, field: "kompetensi" })}
                            className="min-h-[60px] cursor-text hover:bg-slate-50 p-1 rounded-md transition"
                            title="Klik untuk mengedit kompetensi"
                          >
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                              {row.kompetensi.filter(c => c.trim() !== "").map((comp, cIdx) => (
                                <li key={cIdx}>{comp}</li>
                              ))}
                              {row.kompetensi.filter(c => c.trim() !== "").length === 0 && (
                                <span className="text-slate-400 italic">Klik untuk mengisi...</span>
                              )}
                            </ul>
                          </div>
                        )}
                      </td>

                      {/* Lingkup Materi Column (Edit-by-Enter, Display as clean Bullets) */}
                      <td className="border border-slate-300 p-2.5 align-top print-table-cell">
                        {editingCell?.rowIndex === rIdx && editingCell?.field === "lingkupMateri" ? (
                          <textarea
                            value={row.lingkupMateri.join("\n")}
                            onChange={(e) => {
                              const lines = e.target.value.split("\n");
                              updateTableCell(rIdx, "lingkupMateri", lines);
                            }}
                            onBlur={() => setEditingCell(null)}
                            autoFocus
                            placeholder="Tulis setiap lingkup materi di baris baru..."
                            className="w-full bg-white p-1.5 border border-indigo-400 rounded-md text-[11px] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                            rows={Math.max(4, row.lingkupMateri.length)}
                          />
                        ) : (
                          <div 
                            onClick={() => setEditingCell({ rowIndex: rIdx, field: "lingkupMateri" })}
                            className="min-h-[60px] cursor-text hover:bg-slate-50 p-1 rounded-md transition"
                            title="Klik untuk mengedit lingkup materi"
                          >
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                              {row.lingkupMateri.filter(m => m.trim() !== "").map((mat, mIdx) => (
                                <li key={mIdx}>{mat}</li>
                              ))}
                              {row.lingkupMateri.filter(m => m.trim() !== "").length === 0 && (
                                <span className="text-slate-400 italic">Klik untuk mengisi...</span>
                              )}
                            </ul>
                          </div>
                        )}
                      </td>

                      {/* Tujuan Pembelajaran Column (Edit-by-Enter, Display as clean Numbers) */}
                      <td className="border border-slate-300 p-2.5 align-top print-table-cell">
                        {editingCell?.rowIndex === rIdx && editingCell?.field === "tujuanPembelajaran" ? (
                          <textarea
                            value={row.tujuanPembelajaran.join("\n")}
                            onChange={(e) => {
                              const lines = e.target.value.split("\n");
                              updateTableCell(rIdx, "tujuanPembelajaran", lines);
                            }}
                            onBlur={() => setEditingCell(null)}
                            autoFocus
                            placeholder="Tulis setiap TP di baris baru..."
                            className="w-full bg-white p-1.5 border border-indigo-400 rounded-md text-[11px] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                            rows={Math.max(5, row.tujuanPembelajaran.length)}
                          />
                        ) : (
                          <div 
                            onClick={() => setEditingCell({ rowIndex: rIdx, field: "tujuanPembelajaran" })}
                            className="min-h-[60px] cursor-text hover:bg-slate-50 p-1 rounded-md transition"
                            title="Klik untuk mengedit tujuan pembelajaran"
                          >
                            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-700">
                              {row.tujuanPembelajaran.filter(tp => tp.trim() !== "").map((tp, tpIdx) => (
                                <li key={tpIdx}>{tp}</li>
                              ))}
                              {row.tujuanPembelajaran.filter(tp => tp.trim() !== "").length === 0 && (
                                <span className="text-slate-400 italic">Klik untuk mengisi...</span>
                              )}
                            </ol>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DOCUMENT FOOTER BLOCK */}
            <footer className="p-6 md:p-8 pt-0 flex justify-between items-start text-xs text-slate-700 page-break-inside-avoid">
              
              {/* Left Signee (Kepala Sekolah) */}
              <div className="flex flex-col items-center text-center w-1/2">
                <span className="mb-14 text-slate-600">Mengetahui,<br />Kepala Sekolah</span>
                <input
                  type="text"
                  value={kepalaSekolah}
                  onChange={(e) => setKepalaSekolah(e.target.value)}
                  className="font-bold text-slate-900 border-b border-dashed border-slate-300 hover:border-slate-500 text-center w-full max-w-[200px] bg-transparent focus:outline-hidden focus:border-indigo-500 focus:bg-slate-50 rounded px-1 py-0.5 print-input-clean"
                />
                <span className="text-[10px] text-slate-400 mt-1">NIP. (opsional)</span>
              </div>

              {/* Right Signee (Guru Pengampu) */}
              <div className="flex flex-col items-center text-center w-1/2">
                <div className="flex gap-1 items-center font-medium text-slate-700 mb-1">
                  <input
                    type="text"
                    value={tempat}
                    onChange={(e) => setTempat(e.target.value)}
                    className="text-right w-16 bg-transparent hover:bg-slate-50 focus:bg-white focus:outline-hidden border-b border-transparent focus:border-slate-300 rounded px-1 text-xs print-input-clean"
                  />
                  <span>,</span>
                  <input
                    type="text"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="text-left w-24 bg-transparent hover:bg-slate-50 focus:bg-white focus:outline-hidden border-b border-transparent focus:border-slate-300 rounded px-1 text-xs print-input-clean"
                  />
                </div>
                <span className="mb-11 text-slate-600 font-medium">Guru Mata Pelajaran</span>
                <input
                  type="text"
                  value={guruPengampu}
                  onChange={(e) => setGuruPengampu(e.target.value)}
                  className="font-bold text-slate-900 border-b border-dashed border-slate-300 hover:border-slate-500 text-center w-full max-w-[200px] bg-transparent focus:outline-hidden focus:border-indigo-500 focus:bg-slate-50 rounded px-1 py-0.5 print-input-clean"
                />
                <span className="text-[10px] text-slate-400 mt-1">NIP. (opsional)</span>
              </div>

            </footer>
          </div>
        </main>

      </div>

      {/* FOOTER BAR (Hidden in print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            © 2026 ATP Merdeka Generator — Didesain untuk Guru Hebat Indonesia.
          </p>
          <p className="flex items-center gap-1.5">
            Berlandaskan Hukum Resmi <span className="font-semibold text-indigo-600 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> {getSubjectLegalBasis(selectedSubject)}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
