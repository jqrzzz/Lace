import Image from "next/image";

interface VelaAvatarProps {
  size?: number;
  pulse?: boolean;
  /** Render the full character instead of a face-cropped circle. */
  whole?: boolean;
  /** Drop the gold ring when the avatar sits on a colored background. */
  ring?: boolean;
  className?: string;
  alt?: string;
}

export default function VelaAvatar({
  size = 32,
  pulse = false,
  whole = false,
  ring = true,
  className = "",
  alt = "Vela",
}: VelaAvatarProps) {
  const ringClass = ring ? "ring-1 ring-gold/30" : "";
  const pulseClass = pulse ? "animate-pulse" : "";
  const bgClass = whole ? "" : "bg-gold/10";

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 ${bgClass} ${ringClass} ${pulseClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/vela-ai-avatar.png"
        alt={alt}
        fill
        sizes={`${size}px`}
        className={whole ? "object-contain" : "object-cover"}
        style={whole ? undefined : { objectPosition: "center 22%" }}
        priority={size >= 48}
      />
    </div>
  );
}
