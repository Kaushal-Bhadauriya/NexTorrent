import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://tiny-phones-argue.loca.lt";  // your LocalTunnel URL

function P2PFileShare() {
  const [magnetLink, setMagnetLink] = useState("");
  const [torrentId, setTorrentId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!magnetLink.startsWith("magnet:?")) {
      setError("Invalid magnet link.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ magnet: magnetLink })
      });

      const data = await res.json();

      if (!data.success) {
        setError("Backend failed to start download.");
        return;
      }

      setTorrentId(data.torrentId);
      setStatus("starting…");
    } catch (err) {
      setError("Cannot reach backend.");
    }
  }

  // Poll backend for progress
  useEffect(() => {
    if (!torrentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/status/${torrentId}`);
        const data = await res.json();

        setProgress(data.progress);
        setStatus(
          `Downloading… ${(data.progress * 100).toFixed(1)}% | ${(
            data.downloadSpeed / 1024 / 1024
          ).toFixed(2)} MB/s`
        );
      } catch (e) {
        setError("Lost connection to backend.");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [torrentId]);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">NexTorrent Downloader</h1>

      <input
        type="text"
        placeholder="Paste magnet link"
        value={magnetLink}
        onChange={(e) => setMagnetLink(e.target.value)}
        className="w-full p-3 rounded bg-gray-900 border border-gray-700"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 p-3 rounded w-full"
      >
        Start Download
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {status && (
        <div className="p-4 bg-gray-800 rounded">
          <p>{status}</p>
          <div className="w-full bg-gray-700 h-2 rounded mt-2">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${progress * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default P2PFileShare;
