import {
  BookOpen,
  Briefcase,
  ChartColumn,
  Cog,
  FlaskConical,
  Laptop,
  Palette,
  Pill,
  Scale,
  Stethoscope,
  type LucideProps,
} from "lucide-react";
import type { Stream } from "@/lib/data";

const ICONS: Record<Stream, React.ComponentType<LucideProps>> = {
  Engineering: Cog,
  Management: Briefcase,
  Medical: Stethoscope,
  "Computer Applications": Laptop,
  Design: Palette,
  Law: Scale,
  Commerce: ChartColumn,
  Science: FlaskConical,
  Pharmacy: Pill,
  Arts: BookOpen,
};

export function StreamIcon({ stream, ...props }: { stream: Stream } & LucideProps) {
  const Icon = ICONS[stream];
  return <Icon aria-hidden {...props} />;
}
