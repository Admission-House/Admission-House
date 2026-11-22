"use client";

import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Space login (21st.dev "space-login"), adapted for this site: it uses the site's own `cn` and `motion/react`,
 * has no built-in astronaut image (pass `astronautSrc` to show one), and keeps the liquid glass inputs,
 * the twinkling canvas starfield and the glowing horizon.
 */

// Liquid glass presets
export const GLASS_PRESETS = {
  subtle: {
    backgroundOpacity: 0.06,
    saturation: 1.1,
    brightness: 55,
    blur: 8,
    displace: 0.3,
    distortionScale: -20,
    redOffset: -1,
    greenOffset: 1,
    blueOffset: 3,
    mixBlendMode: "difference",
  },
  default: {
    backgroundOpacity: 0.1,
    saturation: 1.4,
    brightness: 55,
    blur: 10,
    displace: 0.4,
    distortionScale: -35,
    redOffset: 0,
    greenOffset: 2,
    blueOffset: 4,
    mixBlendMode: "difference",
  },
  bold: {
    backgroundOpacity: 0.18,
    saturation: 1.8,
    brightness: 60,
    blur: 12,
    displace: 0.6,
    distortionScale: -55,
    redOffset: 1,
    greenOffset: 3,
    blueOffset: 6,
    mixBlendMode: "screen",
  },
  ghost: {
    backgroundOpacity: 0,
    saturation: 1,
    brightness: 55,
    blur: 6,
    displace: 0,
    distortionScale: 0,
    redOffset: 0,
    greenOffset: 0,
    blueOffset: 0,
    mixBlendMode: "difference",
  },
};

export type GlassVariant = keyof typeof GLASS_PRESETS;

export const GLASS_DEFAULTS = {
  width: "auto",
  height: "auto",
  borderRadius: 16,
  borderWidth: 0.03,
  opacity: 0.93,
  xChannel: "R",
  yChannel: "G",
};

export interface GlassProps {
  variant?: GlassVariant;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B" | "A";
  yChannel?: "R" | "G" | "B" | "A";
  mixBlendMode?: string;
}

/** True only in Chromium, the one engine that accepts an SVG filter as a backdrop-filter. */
function supportsSvgBackdrop() {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent;
  const webkitOnly = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  return !webkitOnly && !/Firefox/.test(ua);
}

export const Glass: React.FC<GlassProps> = (props) => {
  const { variant = "default", children, className = "", style = {} } = props;

  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const [svgFilterSupported, setSvgFilterSupported] = useState(true);
  useEffect(() => {
    // Browser sniffing has to wait for the client, so the server and first client render agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSvgFilterSupported(supportsSvgBackdrop());
  }, []);

  const {
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    backgroundOpacity,
    saturation,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
  } = props;

  const v = useMemo(() => {
    const preset = GLASS_PRESETS[variant] ?? GLASS_PRESETS.default;
    const overrides = {
      width,
      height,
      borderRadius,
      borderWidth,
      brightness,
      opacity,
      blur,
      displace,
      backgroundOpacity,
      saturation,
      distortionScale,
      redOffset,
      greenOffset,
      blueOffset,
      xChannel,
      yChannel,
      mixBlendMode,
    };
    const defined = Object.fromEntries(Object.entries(overrides).filter(([, val]) => val !== undefined));
    return { ...GLASS_DEFAULTS, ...preset, ...defined } as typeof GLASS_DEFAULTS &
      (typeof GLASS_PRESETS)["default"] & { xChannel: string; yChannel: string };
  }, [
    variant,
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    backgroundOpacity,
    saturation,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
  ]);

  // Rebuild the displacement map whenever the glass changes size or settings.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const buildMap = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width || 400;
      const h = rect.height || 200;
      const edge = Math.min(w, h) * (v.borderWidth * 0.5);
      const svg = `
        <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="red"/>
            </linearGradient>
            <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${w}" height="${h}" fill="black"></rect>
          <rect x="0" y="0" width="${w}" height="${h}" rx="${v.borderRadius}" fill="url(#${redGradId})" />
          <rect x="0" y="0" width="${w}" height="${h}" rx="${v.borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${v.mixBlendMode}" />
          <rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${v.borderRadius}" fill="hsl(0 0% ${v.brightness}% / ${v.opacity})" style="filter:blur(${v.blur}px)" />
        </svg>`;
      feImageRef.current?.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(svg)}`);
    };

    buildMap();
    const observer = new ResizeObserver(buildMap);
    observer.observe(el);
    return () => observer.disconnect();
  }, [v.borderRadius, v.borderWidth, v.brightness, v.opacity, v.blur, v.mixBlendMode, redGradId, blueGradId]);

  useEffect(() => {
    (
      [
        [redChannelRef, v.redOffset],
        [greenChannelRef, v.greenOffset],
        [blueChannelRef, v.blueOffset],
      ] as const
    ).forEach(([ref, offset]) => {
      ref.current?.setAttribute("scale", String(v.distortionScale + offset));
      ref.current?.setAttribute("xChannelSelector", v.xChannel);
      ref.current?.setAttribute("yChannelSelector", v.yChannel);
    });
    gaussianBlurRef.current?.setAttribute("stdDeviation", String(v.displace));
  }, [v.distortionScale, v.redOffset, v.greenOffset, v.blueOffset, v.xChannel, v.yChannel, v.displace]);

  const containerStyle: React.CSSProperties = {
    ...style,
    ...(v.width && v.width !== "auto" ? { width: typeof v.width === "number" ? `${v.width}px` : v.width } : null),
    ...(v.height && v.height !== "auto" ? { height: typeof v.height === "number" ? `${v.height}px` : v.height } : null),
    borderRadius: `${v.borderRadius}px`,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    ...(svgFilterSupported
      ? {
          background: `hsl(0 0% 0% / ${v.backgroundOpacity})`,
          backdropFilter: `url(#${filterId}) saturate(${v.saturation})`,
          boxShadow: "0 0 1px 0 rgba(255, 255, 255, 0.1) inset, 0px 4px 16px rgba(17, 17, 26, 0.05)",
        }
      : {
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }),
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center overflow-hidden transition-all duration-[260ms] ease-out", className)}
      style={containerStyle}
    >
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage
              ref={feImageRef}
              href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E"
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
            <feDisplacementMap ref={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
            <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[inherit] p-0">{children}</div>
    </div>
  );
};

export interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: GlassVariant;
  containerClassName?: string;
  rightElement?: React.ReactNode;
  borderRadius?: number;
  height?: number | string;
  glassProps?: Partial<GlassProps>;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(function GlassInput(
  { variant = "default", className = "", containerClassName = "", rightElement, borderRadius = 14, height = 52, glassProps, ...inputProps },
  ref,
) {
  return (
    <Glass
      variant={variant}
      borderRadius={borderRadius}
      height={height}
      className={cn("h-[52px] min-h-[52px] w-full transition-all duration-200", containerClassName)}
      {...glassProps}
    >
      <div className="relative flex h-[52px] min-h-[52px] w-full items-center px-4">
        <input
          ref={ref}
          className={cn(
            "glass-input h-full w-full border-none bg-transparent text-[15px] font-medium leading-none text-neutral-100 outline-none placeholder:text-neutral-400/70",
            rightElement ? "pr-10" : "pr-0",
            className,
          )}
          {...inputProps}
        />
        {rightElement && <div className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center">{rightElement}</div>}
      </div>
    </Glass>
  );
});

export interface SpaceLoginProps {
  title?: string;
  subtitle?: string;
  /** Optional floating illustration shown to the left of the form on desktop. */
  astronautSrc?: string;
  onSubmit?: (data: {
    mode: "login" | "signup";
    email: string;
    password: string;
    rememberMe: boolean;
    /** Only in sign up mode. */
    name?: string;
    /** Only in sign up mode: a 10 digit mobile number, digits only. */
    phone?: string;
  }) => Promise<void> | void;
  /** Turns on the built in "Sign Up" mode: the same form gains Name and Phone number fields and a "Create account" button. */
  allowSignUp?: boolean;
  signUpTitle?: string;
  signUpSuccessText?: string;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  onSocialLogin?: (provider: "google" | "github" | "facebook" | "windows" | "passkey") => void;
  /** When given, shows a wide "Continue with Google" button. Throw an Error to show a message under the form. */
  onGoogle?: () => Promise<void> | void;
  className?: string;
  defaultEmail?: string;
  showSocialButtons?: boolean;
  glassVariant?: GlassVariant;
  /** Text under the form's submit button once it succeeds. */
  successText?: string;
}

function SparkleStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("pointer-events-none h-4 w-4 select-none", className)} aria-hidden>
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4", className)} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.75-1.551L24 0v11.551h-13.25V1.898zM0 12.449h9.75v9.451L0 20.551v-8.102zm10.75 0H24V24l-13.25-1.898v-9.653z" />
    </svg>
  );
}

/** Twinkling stars, sparkles, the odd shooting star, and a slight drift that follows the pointer. */
function CosmicStarfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;

    interface Star {
      x: number;
      y: number;
      size: number;
      baseOpacity: number;
      twinkleSpeed: number;
      color: string;
      isSparkle: boolean;
    }
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      life: number;
    }

    const colors = ["#ffffff", "#e0f2fe", "#fdf4ff", "#fbcfe8", "#bae6fd"];
    let stars: Star[] = [];
    const shooting: ShootingStar[] = [];

    const initStars = () => {
      const count = Math.floor((width * height) / 3200);
      stars = Array.from({ length: count }, () => {
        const isSparkle = Math.random() < 0.08;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: isSparkle ? Math.random() * 1.8 + 1.2 : Math.random() * 1.3 + 0.5,
          baseOpacity: isSparkle ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.7,
          twinkleSpeed: 0.008 + Math.random() * 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
          isSparkle,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };
    resize();
    window.addEventListener("resize", resize);

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX - width / 2) * 0.03;
      targetY = (e.clientY - height / 2) * 0.03;
    };
    window.addEventListener("mousemove", onMove);

    let tick = 0;
    const draw = () => {
      tick++;
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star, i) => {
        const opacity = Math.max(0.1, Math.min(1, star.baseOpacity + Math.sin(tick * star.twinkleSpeed + i) * 0.35));
        const px = star.x + curX * (star.size * 0.8);
        const py = star.y + curY * (star.size * 0.8);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity;
        if (star.isSparkle) {
          const s = star.size * 2.2;
          ctx.beginPath();
          ctx.moveTo(px, py - s);
          ctx.lineTo(px + s * 0.25, py - s * 0.25);
          ctx.lineTo(px + s, py);
          ctx.lineTo(px + s * 0.25, py + s * 0.25);
          ctx.lineTo(px, py + s);
          ctx.lineTo(px - s * 0.25, py + s * 0.25);
          ctx.lineTo(px - s, py);
          ctx.lineTo(px - s * 0.25, py - s * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, star.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      if (!reduced) {
        if (Math.random() < 0.012 && shooting.length < 2) {
          shooting.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.5),
            length: Math.random() * 80 + 40,
            speed: Math.random() * 9 + 7,
            angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
            life: 1,
          });
        }
        for (let i = shooting.length - 1; i >= 0; i--) {
          const s = shooting[i];
          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.life -= 0.015;
          if (s.life <= 0 || s.x > width + 100 || s.y > height + 100) {
            shooting.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${s.life * 0.8})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
          ctx.stroke();
        }
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden />;
}

const SOCIALS: {
  id: "google" | "github" | "facebook" | "windows" | "passkey";
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "google", label: "Google", icon: <GoogleIcon /> },
  { id: "github", label: "GitHub", icon: <GitHubIcon /> },
  { id: "facebook", label: "Facebook", icon: <FacebookIcon /> },
  { id: "windows", label: "Windows", icon: <WindowsIcon className="h-3.5 w-3.5" /> },
  { id: "passkey", label: "Passkey", icon: <KeyRound className="h-4 w-4 -rotate-45" /> },
];

export function SpaceLogin({
  title = "Sign In",
  subtitle,
  astronautSrc,
  onSubmit,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
  onGoogle,
  allowSignUp = false,
  signUpTitle = "Create account",
  signUpSuccessText = "Account created!",
  className,
  defaultEmail = "",
  showSocialButtons = true,
  glassVariant = "default",
  successText = "Welcome Back!",
}: SpaceLoginProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    let phoneDigits: string | undefined;
    if (mode === "signup") {
      if (!name.trim()) return setError("Please enter your name.");
      // Accept +91, 91 or a leading 0 in front of the 10 digit number.
      phoneDigits = phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
      if (!/^[6-9]\d{9}$/.test(phoneDigits)) return setError("Enter a 10 digit mobile number.");
      if (password.length < 6) return setError("Use at least 6 characters for the password.");
    }

    setIsLoading(true);
    setError("");
    try {
      if (onSubmit) await onSubmit({ mode, email, password, rememberMe, ...(mode === "signup" ? { name: name.trim(), phone: phoneDigits } : null) });
      else await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : mode === "signup" ? "We could not create your account. Please try again." : "We could not sign you in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const handleGoogle = async () => {
    if (!onGoogle || googleBusy) return;
    setGoogleBusy(true);
    setError("");
    try {
      await onGoogle();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Google sign in did not finish. Please try again.");
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex min-h-screen w-full select-none flex-col items-center justify-center overflow-hidden bg-[#03060f] px-4 py-10 text-white",
        className,
      )}
    >
      <CosmicStarfield />

      {/* Horizon glow */}
      <div className="pointer-events-none absolute -bottom-48 left-1/2 z-0 h-[480px] w-[160vw] max-w-[1900px] -translate-x-1/2 sm:-bottom-56 sm:h-[550px] md:-bottom-64 md:h-[620px]">
        <div
          className="h-full w-full rounded-[100%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(224, 102, 70, 0.95) 0%, rgba(199, 81, 58, 0.75) 20%, rgba(67, 142, 145, 0.5) 42%, rgba(20, 48, 70, 0.25) 60%, transparent 80%)",
            filter: "blur(32px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-[100%] opacity-40 mix-blend-screen"
          style={{
            background: "radial-gradient(ellipse at 50% 100%, rgba(255, 170, 110, 0.6) 0%, rgba(94, 219, 210, 0.4) 30%, transparent 65%)",
            filter: "blur(48px)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center">
        {astronautSrc && (
          <motion.div
            animate={{ x: mouse.x * 1.5, y: mouse.y * 1.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 60 }}
            className="pointer-events-none absolute left-2 top-1/2 z-20 hidden -translate-y-[65%] md:block lg:left-12 xl:left-20"
          >
            <motion.div
              animate={{ y: [-12, 14, -12], rotate: [-2, 3, -2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={astronautSrc} alt="" className="h-auto w-40 select-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] sm:w-44 lg:w-52" draggable={false} />
              <motion.div
                animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-3 top-1/2 -translate-y-1/2"
              >
                <SparkleStar className="h-6 w-6 text-[#ff4bb8] drop-shadow-[0_0_12px_#ff4bb8]" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 mx-auto flex w-full max-w-[420px] flex-col items-center"
        >
          <h1 className="mb-8 text-center font-sans text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:mb-9 sm:text-[42px]">{mode === "signup" ? signUpTitle : title}</h1>

          {subtitle && <p className="-mt-6 mb-7 text-center text-sm text-neutral-300">{subtitle}</p>}

          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5" noValidate={mode === "signup"}>
            {mode === "signup" && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                <label htmlFor="space-name" className="select-none text-base font-semibold tracking-wide text-neutral-200">
                  Name
                </label>
                <GlassInput
                  id="space-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant={glassVariant}
                  borderRadius={14}
                />
              </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="space-email" className="select-none text-base font-semibold tracking-wide text-neutral-200">
                Email
              </label>
              <GlassInput
                id="space-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant={glassVariant}
                borderRadius={14}
              />
            </div>

            {mode === "signup" && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                <label htmlFor="space-phone" className="select-none text-base font-semibold tracking-wide text-neutral-200">
                  Phone number
                </label>
                <GlassInput
                  id="space-phone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  variant={glassVariant}
                  borderRadius={14}
                />
              </motion.div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="space-password" className="select-none text-base font-semibold tracking-wide text-neutral-200">
                Password
              </label>
              <GlassInput
                id="space-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder={mode === "signup" ? "Enter a password (6+ characters)" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant={glassVariant}
                borderRadius={14}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="p-1 text-neutral-400 transition-colors hover:text-neutral-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 active:scale-90" /> : <Eye className="h-5 w-5 active:scale-90" />}
                  </button>
                }
              />
            </div>

            {mode === "login" && (
            <div className="flex items-center justify-between pt-1 text-xs sm:text-[13px]">
              <label className="group flex cursor-pointer select-none items-center gap-2">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-white/60",
                    rememberMe ? "border-neutral-200 bg-neutral-200 text-black" : "border-neutral-600 bg-white/5 group-hover:border-neutral-400",
                  )}
                >
                  {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span className="text-neutral-300 transition-colors group-hover:text-white">Remember me</span>
              </label>

              <button
                type="button"
                onClick={onForgotPassword}
                className="select-none font-medium text-neutral-300 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Forgot password?
              </button>
            </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="-mb-1 text-center text-[13px] font-medium text-[#ff8f8f]"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading || isSuccess}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative mt-2 flex h-12 w-full select-none items-center justify-center overflow-hidden rounded-xl text-sm font-bold tracking-wide shadow-lg transition-all duration-200",
                isSuccess
                  ? "bg-emerald-600 text-white shadow-emerald-500/25"
                  : "border border-white/10 bg-[#252831] text-neutral-100 shadow-black/40 hover:border-white/20 hover:bg-[#2d313c] hover:text-white active:bg-[#22252e]",
              )}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                    <span>{mode === "signup" ? "Creating account..." : "Signing in..."}</span>
                  </motion.div>
                ) : isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-white"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>{mode === "signup" ? signUpSuccessText : successText}</span>
                  </motion.div>
                ) : (
                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {mode === "signup" ? "Create account" : "Sign In"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {onGoogle && mode === "login" && (
              <>
                <div className="my-1 flex w-full items-center gap-3 text-xs text-neutral-400">
                  <div className="h-px flex-1 bg-white/[0.12]" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-white/[0.12]" />
                </div>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogle}
                  disabled={googleBusy}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] text-sm font-bold tracking-wide text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.12] disabled:opacity-60"
                >
                  {googleBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
                  <span>Continue with Google</span>
                </motion.button>
              </>
            )}

            <div className="mt-1 text-center text-xs text-neutral-300 sm:text-[13px]">
              <span>{mode === "signup" ? "Already have an account? " : "Don\u2019t have an account? "}</span>
              <button
                type="button"
                onClick={() => (mode === "signup" ? switchMode("login") : allowSignUp ? switchMode("signup") : onSignUp?.())}
                className="font-bold text-white underline-offset-4 transition-colors hover:underline"
              >
                {mode === "signup" ? "Login" : "Sign Up"}
              </button>
            </div>

            {showSocialButtons && (
              <>
                <div className="my-1 flex w-full items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.08]" />
                </div>
                <div className="flex w-full items-center justify-center gap-2.5 sm:gap-3">
                  {SOCIALS.map((s) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      whileHover={{ y: -2, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSocialLogin?.(s.id)}
                      aria-label={`Sign in with ${s.label}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#242730]/80 text-neutral-300 shadow-md backdrop-blur-md transition-colors hover:border-white/20 hover:bg-[#2e323e] hover:text-white"
                    >
                      {s.icon}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default SpaceLogin;
