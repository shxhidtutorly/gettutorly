import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { useNavigate } from "react-router-dom";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js`;

const ACCEPTED = ".pdf,.docx,.txt,.md,.html";

export default function FileUploader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function extractText(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      return text;
    }
    if (ext === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      return value;
    }
    if (["txt", "md"].includes(ext)) {
      return await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => res(e.target.result);
        reader.onerror = rej;
        reader.readAsText(file);
      });
    }
    if (ext === "html") {
      return await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(e.target.result, "text/html");
          res(doc.body.innerText || "");
        };
        reader.onerror = rej;
        reader.readAsText(file);
      });
    }
    throw new Error("Unsupported file type");
  }

  async function handleFile(e) {
    setError("");
    setLoading(true);
    try {
      const file = e.target.files[0];
      const text = await extractText(file);
      // Store in sessionStorage only, not localStorage, to keep privacy and allow next step
      sessionStorage.setItem("uploadedText", text);
      navigate("/notes");
    } catch (err) {
      setError("Failed to extract text: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="bg-neutral-900 dark:bg-neutral-100 rounded-2xl p-8 shadow-lg animate-fade-in flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold">Upload a file to generate notes</h2>
      <input
        type="file"
        accept={ACCEPTED}
        onChange={handleFile}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
          transition-all"
      />
      {loading && <div className="loader mx-auto my-4"></div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="text-xs text-gray-400 mt-2">
        <li>Accepted: PDF, DOCX, TXT, MD, HTML</li>
        <li>No file or text is ever uploaded to any server.</li>
      </ul>
    </div>
  );
}
