"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function EmotionDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<"button" | "auto">("button"); // toggle state
  const [emotion, setEmotion] = useState<string>("");

  // Initialize webcam
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);

  // Auto mode: send every 5s
  useEffect(() => {
    if (mode === "auto") {
      const interval = setInterval(() => {
        captureAndSend();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const captureAndSend = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(videoRef.current, 0, 0, 224, 224);
    const dataUrl = canvasRef.current.toDataURL("image/jpeg");

    try {
      const res = await fetch("https://603ae4b56b8a.ngrok-free.app/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      const json = await res.json();
      setEmotion(json.status);
    } catch (err) {
      console.error(err);
      setEmotion("Error connecting to server");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4 text-amber-50">
      <h1 className="text-2xl font-bold">Real-Time Stress/Emotion Detector</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="448"
        height="448"
        className="rounded-xl shadow-lg"
      />
      <canvas ref={canvasRef} width="448" height="448" className="hidden" />

      {/* Toggle Button */}
      <Button
        variant="secondary"
        onClick={() => setMode(mode === "button" ? "auto" : "button")}
        className="bg-cyan-800 hover:bg-cyan-300 text-black"
      >
        Switch to {mode === "button" ? "Auto (5s)" : "Manual (Button)"} Mode
      </Button>

      {/* Capture Button (only in button mode) */}
      {mode === "button" && (
        <Button variant="default" onClick={captureAndSend} className="bg-emerald-700 hover:bg-emerald-300 text-black">
          Check Emotion
        </Button>
      )}

      <p className="text-lg font-semibold text-amber-50">Detected: {emotion}</p>
    </div>
  );
}
