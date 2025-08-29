// /src/lib/youtubeTranscript.js
export async function fetchYoutubeTranscript(youtubeUrl) {
  const res = await fetch(`/api/youtube-transcript?url=${encodeURIComponent(youtubeUrl)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Transcript API failed (${res.status})`);
  }
  const data = await res.json();
  if (!data?.success || !data?.transcriptText) {
    throw new Error('Transcript not available or empty.');
  }
  return data; // { success, transcriptText, videoId, url, language, raw }
}
