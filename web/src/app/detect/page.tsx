import StressDetector from "./StressDtector";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">Real-Time Stress Detection</h1>
      <StressDetector />
    </main>
  );
}
