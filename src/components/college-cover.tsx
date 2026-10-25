import Image from "next/image";
import type { College } from "@/lib/data";

/** Campus photo for a college. Parent decides the size; the photo fills it. */
export function CollegeCover({
  college,
  className = "",
  priority,
  sizes = "(min-width: 1024px) 400px, 100vw",
}: {
  college: College;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Image
        src={college.image}
        alt={`${college.name} campus`}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectPosition: college.imagePosition ?? "center 55%" }}
        className="object-cover [filter:saturate(1.12)_contrast(1.04)_brightness(1.03)]"
      />
    </div>
  );
}

export function Monogram({ college, size = "md" }: { college: College; size?: "sm" | "md" | "lg" }) {
  const first = college.short.split(" ")[0];
  const letters =
    first.length <= 4
      ? first
      : college.name
          .split(" ")
          .filter((w) => /^[A-Z]/.test(w))
          .map((w) => w[0])
          .join("")
          .slice(0, 3);
  const dims = {
    sm: "size-7 text-[0.625rem] rounded-full",
    md: "size-12 text-sm rounded-xl",
    lg: "size-18 text-lg rounded-xl",
  }[size];
  return (
    <span
      className={`grid shrink-0 place-items-center bg-white font-display font-extrabold ring-1 ring-black/5 ${dims}`}
      style={{ color: college.hue }}
      aria-hidden
    >
      {letters}
    </span>
  );
}
