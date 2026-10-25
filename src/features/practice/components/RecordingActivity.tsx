"use client";
export default function RecordingActivity({ level, bands }: { level: number; bands: number[] }) {
  return <div className="flex flex-col items-center gap-2">
    <div aria-hidden="true" className="flex h-8 items-center gap-1.5">
      {bands.map((value, index) => <span key={index} className="w-1.5 rounded-full bg-blue-500 transition-[height] duration-75 motion-reduce:transition-none"
        style={{ height: 4 + value * 28 }} />)}
    </div>
    <p role="status" className="text-base font-medium text-blue-600">{level > 0.03 ? "Recording — voice detected" : "Recording — speak now"}</p>
  </div>;
}
