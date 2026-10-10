import { cn } from "@/lib/utils";
import styles from "./AudioWaveform.module.css";

const BAR_HEIGHTS = [19, 26, 16, 29, 22, 34, 18, 30, 24, 33, 17, 28, 21, 35, 25, 30, 19, 27, 34, 22, 29, 16, 32, 24, 35, 20, 28, 17, 31, 24, 34, 18, 27, 22, 32, 19, 29, 16, 26, 34, 20, 30, 23, 28, 18, 25, 32, 21, 27];

type AudioWaveformProps = {
  isPlaying?: boolean;
  size?: "standard" | "compact";
  tone?: "sky" | "indigo" | "rose";
  progress?: number;
  onSeek?: (progress: number) => void;
  decorative?: boolean;
  className?: string;
};

/** State-driven bar visualizer for spoken audio across practice exercises. */
export default function AudioWaveform({
  isPlaying = false,
  size = "standard",
  tone = "sky",
  progress,
  onSeek,
  decorative = false,
  className,
}: AudioWaveformProps) {
  const heights = size === "compact" ? BAR_HEIGHTS.slice(15, 34) : BAR_HEIGHTS;
  const position = Math.max(0, Math.min(100, progress ?? 0));
  if (onSeek) {
    const bars = heights.map((height, index) => (
      <rect key={index} x={index * 10 + 2.5} y={(36 - height) / 2} width={5} height={height} rx={2.5} className={styles.seekBar} />
    ));
    return (
      <span className={cn(styles.seekWaveform, isPlaying && styles.playing, className)}>
        <svg viewBox={`0 0 ${heights.length * 10} 36`} preserveAspectRatio="none" aria-hidden="true" className={styles.seekBars}>
          {bars}
        </svg>
        <svg viewBox={`0 0 ${heights.length * 10} 36`} preserveAspectRatio="none" aria-hidden="true" className={cn(styles.seekBars, styles.seekPlayed)} style={{ clipPath: `inset(0 ${100 - position}% 0 0)`, color: tone === "sky" ? "#38bdf8" : tone === "indigo" ? "#6366f1" : "#f43f5e" }}>
          {bars}
        </svg>
        <input
          type="range"
          min={0}
          max={100}
          step="any"
          value={position}
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Audio position"
          aria-valuetext={`${Math.round(position)}% played`}
          className={styles.seekInput}
        />
      </span>
    );
  }
  const playedBars = progress === undefined ? 0 : Math.ceil((Math.max(0, Math.min(100, progress)) / 100) * heights.length);

  return (
    <span
      className={cn(styles.waveform, size === "compact" && styles.compact, isPlaying && styles.playing, isPlaying && tone === "indigo" && progress === undefined && styles.indigoPlaying, isPlaying && tone === "rose" && progress === undefined && styles.rosePlaying, progress !== undefined && styles.progressMode, className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : isPlaying ? "Audio playing" : "Audio waveform"}
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className={cn(styles.bar, index < playedBars && styles.played)}
          style={{ height, animationDelay: `${index * -95}ms` }}
        />
      ))}
    </span>
  );
}
