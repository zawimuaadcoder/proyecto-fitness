import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

/** Avatar de perfil: imagen, emoji o inicial sobre su color. */
export function Avatar({
  name,
  color,
  emoji,
  url,
  size = 32,
  className,
  rounded = "lg",
}: {
  name: string;
  color: string;
  emoji?: string | null;
  url?: string | null;
  size?: number;
  className?: string;
  rounded?: "lg" | "full" | "xl";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold text-white select-none",
        rounded === "full" ? "rounded-full" : rounded === "xl" ? "rounded-[22%]" : "rounded-[28%]",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * (emoji ? 0.5 : 0.42),
        background: `linear-gradient(145deg, ${color}, color-mix(in oklab, ${color} 70%, black))`,
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" />
      ) : emoji ? (
        <span className="leading-none">{emoji}</span>
      ) : (
        initials(name)
      )}
    </span>
  );
}
