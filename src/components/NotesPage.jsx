import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function logActivity(event) {
  const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
  logs.push({ event, ts: Date.now() });
  localStorage.setItem("activityLogs", JSON.stringify(logs));
}

export default function NotesPage() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [flashcardsGenerated, setFlashcardsGenerated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const text = sessionStorage.getItem("uploadedText");
    if (text) {
      if (!notes) generateNotes(text);
    } else {
      navigate("/");
    }
    // eslint-disable-next-line
  }, []);

  async function generateNotes(text) {
    setLoading(true);
    try {
      const response = await together.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Summarize these study materials as clean, brief notes for a student:\n\n${text.slice(0, 12000)}`
          }
        ],
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
      });
      setNotes(response.choices[0].message.content);
      logActivity("notes_generated");
    } catch (e) {
      setNotes("Error generating notes: " + e.message);
    }
    setLoading(false);
  }

async function generateNotes(text) {
  setLoading(true);
  try {
    const res = await fetch("/api/generate-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, type: "notes" }),
    });
    const data = await res.json();
    setNotes(data.content);
    logActivity("notes_generated");
  } catch (e) {
    setNotes("Error generating notes: " + e.message);
  }
  setLoading(false);
}

async function generateFlashcards() {
  setLoading(true);
  try {
    const res = await fetch("/api/generate-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: notes, type: "flashcards" }),
    });
    const data = await res.json();
    // This assumes the API returns flashcards as a single string in data.content
    // and each flashcard is in the form:
    // Question: ...\nAnswer: ...
    const cards =
      (data.content.match(/Question:(.*)\nAnswer:(.*)/g) || []).map(line => {
        const m = line.match(/Question:(.*)\nAnswer:(.*)/);
        return { q: m?.[1]?.trim(), a: m?.[2]?.trim() };
      });
    localStorage.setItem("flashcards", JSON.stringify(cards));
    setFlashcardsGenerated(true);
    logActivity("flashcards_generated");
  } catch (e) {
    // handle error
  }
  setLoading(false);
}

  return (
    <div>
      {/* ... show notes ... */}
      {loading && <div className="loader my-8"></div>}
      {!loading && notes && (
        <div className="bg-neutral-800 dark:bg-zinc-200 text-white dark:text-black rounded-xl p-4 mb-6 shadow-md animate-fade-in whitespace-pre-line transition-all">
          {notes}
        </div>
      )}
      {!flashcardsGenerated && notes && (
        <button onClick={generateFlashcards}>
          {loading ? "Generating Flashcards..." : "Generate Flashcards"}
        </button>
      )}
      {flashcardsGenerated && (
        <div>
          <span>✅ Generated flashcards – </span>
          <button onClick={() => navigate("/flashcards")}>View</button>
        </div>
      )}
    </div>
  );
}
