import Image from "next/image";
import Link from "next/link";
import { isExternalImage } from "@/lib/utils";

type LogoProps = {
  href?: string | null;
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  src?: string;
};

const sizes = {
  sm: { width: 160, height: 52, className: "h-8 w-auto md:h-9" },
  md: { width: 220, height: 72, className: "h-10 w-auto md:h-11" },
  lg: { width: 360, height: 118, className: "h-14 w-auto md:h-16" },
};

export function Logo({
  href = "/",
  className = "",
  priority = false,
  size = "md",
  src = "/logo-transparent.png",
}: LogoProps) {
  const s = sizes[size];
  const img = (
    <Image
      src={src}
      alt="Akruti Home Decor"
      width={s.width}
      height={s.height}
      priority={priority}
      unoptimized={isExternalImage(src)}
      className={`${s.className} object-contain`}
    />
  );

  if (href == null || href === "") {
    return <span className={`inline-flex ${className}`}>{img}</span>;
  }
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label="Akruti Home Decor home"
    >
      {img}
    </Link>
  );
}
