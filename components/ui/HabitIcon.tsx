import {
  Apple,
  Bike,
  BookOpen,
  Brain,
  Check,
  Coffee,
  Droplet,
  Dumbbell,
  Footprints,
  Heart,
  Moon,
  MoonStar,
  Pill,
  Salad,
  Scale,
  Sun,
  Sunrise,
  Timer,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  check: Check,
  droplet: Droplet,
  scale: Scale,
  dumbbell: Dumbbell,
  footprints: Footprints,
  moon: Moon,
  "moon-star": MoonStar,
  apple: Apple,
  "book-open": BookOpen,
  brain: Brain,
  salad: Salad,
  pill: Pill,
  sun: Sun,
  sunrise: Sunrise,
  heart: Heart,
  coffee: Coffee,
  bike: Bike,
  timer: Timer,
};

export function HabitIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Check;
  return <Icon aria-hidden className={className ?? "size-4"} />;
}
