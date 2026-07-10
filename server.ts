import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy init of GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in your Secrets panel or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to generate CP-TP mapping
app.post("/api/generate", async (req, res) => {
  try {
    const { subject, phase, mode, customCp } = req.body;

    if (!subject || !phase) {
      return res.status(400).json({ error: "Mata Pelajaran dan Fase harus dipilih." });
    }

    if (mode === "custom" && !customCp?.trim()) {
      return res.status(400).json({ error: "Teks Capaian Pembelajaran (CP) kustom tidak boleh kosong jika memilih mode kustom." });
    }

    const ai = getAiClient();

    const prompt = `Anda adalah asisten kurikulum ahli untuk Kurikulum Merdeka di Indonesia.
Tugas Anda adalah memetakan Capaian Pembelajaran (CP) ke dalam tabel analisis CP-TP untuk Mata Pelajaran: "${subject}" dan Fase: "${phase}".

${mode === "custom" ? `Gunakan teks Capaian Pembelajaran (CP) kustom berikut sebagai sumber utama:\n"""\n${customCp}\n"""` : `Gunakan Capaian Pembelajaran (CP) standar Kurikulum Merdeka resmi dari Kemendikbudristek untuk mata pelajaran "${subject}" dan fase "${phase}".`}

Hasilkan analisis CP-TP terstruktur yang membagi mata pelajaran tersebut menjadi beberapa Elemen utama yang sesuai dengan kurikulum resmi.
Untuk SETIAP Elemen yang terdeteksi atau didefinisikan, buatlah entri terstruktur dengan skema berikut:
1. Nama Elemen (misalnya "Al-Qur'an dan Hadis", "Bilangan", "Aljabar", dll.)
2. Teks Capaian Pembelajaran (CP) spesifik untuk Elemen tersebut.
3. Kompetensi utama yang terkandung dalam teks CP tersebut (kata kerja operasional, misalnya "Memahami", "Menganalisis", "Meningkatkan", "Menerapkan").
4. Lingkup Materi (Konten) utama yang harus dipelajari.
5. Daftar Tujuan Pembelajaran (TP) yang diturunkan secara konkret, logis, dan berurutan dari CP tersebut. Turunkan setidaknya 3-6 TP konkret per Elemen, pecah setiap kompetensi dan materi menjadi indikator TP yang operasional, sangat spesifik, dan mudah diukur (contoh: jika CP menyebutkan memahami pentingnya iman, taqwa, toleransi, cinta tanah air, maka TP dijabarkan menjadi: a. Memahami pentingnya iman, b. Memahami pentingnya taqwa, c. Memahami pentingnya toleransi, d. Memahami pentingnya cinta tanah air, dst.).

Pastikan output dalam format JSON valid berupa Array dari Objek dengan struktur yang ditentukan dalam responseSchema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Daftar pemetaan CP ke TP untuk setiap elemen",
          items: {
            type: Type.OBJECT,
            properties: {
              elemen: {
                type: Type.STRING,
                description: "Nama elemen mata pelajaran"
              },
              capaianPembelajaran: {
                type: Type.STRING,
                description: "Teks Capaian Pembelajaran (CP) untuk elemen ini"
              },
              kompetensi: {
                type: Type.STRING,
                description: "Kompetensi utama (kata kerja operasional)"
              },
              lingkupMateri: {
                type: Type.STRING,
                description: "Lingkup materi atau konten utama"
              },
              tujuanPembelajaran: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: "Daftar Tujuan Pembelajaran (TP) yang diturunkan secara rinci"
              }
            },
            required: ["elemen", "capaianPembelajaran", "kompetensi", "lingkupMateri", "tujuanPembelajaran"]
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gagal menerima hasil dari AI.");
    }

    const data = JSON.parse(resultText);
    return res.json({ data });

  } catch (error: any) {
    console.error("Error generating CP-TP:", error);
    return res.status(500).json({ 
      error: error.message || "Terjadi kesalahan internal server saat memproses permintaan." 
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
