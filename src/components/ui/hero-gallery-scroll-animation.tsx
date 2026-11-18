"use client";

import * as React from "react";
import { MotionValue, motion, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Hero gallery scroll animation (21st.dev "hero-gallery-scroll-animation"), adapted for this site.
 * The wrapper is tall and its child is pinned. While the page scrolls, the cells grow from half size and slide into
 * place, and the centred content shrinks away. Progress runs from the moment the wrapper pins to the moment it lets go,
 * so the same animation plays on phones and on large screens.
 */

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
}
const ContainerScrollContext = React.createContext<ContainerScrollContextValue | undefined>(undefined);

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) throw new Error("useContainerScrollContext must be used within a ContainerScroll Component");
  return context;
}

export const ContainerScroll = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end end"] });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div ref={scrollRef} className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};

/** The pinned grid. Give it the layout (columns and rows) through className. */
export const BentoGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("grid gap-3 lg:gap-4", className)} {...props} />
));
BentoGrid.displayName = "BentoGrid";

/** One cell of the grid: starts at half size, offset toward the top left, and settles into its slot. */
export const BentoCell = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div"> & { from?: string }>(({ className, style, from = "-35%", ...props }, ref) => {
  const { scrollYProgress } = useContainerScrollContext();
  const reduced = useReducedMotion();
  const translate = useTransform(scrollYProgress, [0.05, 0.6], reduced ? ["0%", "0%"] : [from, "0%"]);
  const scale = useTransform(scrollYProgress, [0, 0.55], reduced ? [1, 1] : [0.5, 1]);
  return <motion.div ref={ref} className={className} style={{ translate, scale, ...style }} {...props} />;
});
BentoCell.displayName = "BentoCell";

/** Content in the middle of the grid. It is fully visible at the start and shrinks and fades as the cells arrive. */
export const ContainerScale = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ className, style, ...props }, ref) => {
  const { scrollYProgress } = useContainerScrollContext();
  const reduced = useReducedMotion();
  const opacity = useTransform(scrollYProgress, [0.06, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.06, 0.4], reduced ? [1, 1] : [1, 0.5]);
  // Once it has faded out it must not block taps on the cells underneath.
  const pointerEvents = useTransform(scrollYProgress, (p) => (p > 0.3 ? "none" : "auto"));
  return (
    <motion.div
      ref={ref}
      className={cn("absolute top-1/2 left-1/2 z-10 size-fit", className)}
      style={{ translate: "-50% -50%", scale, opacity, pointerEvents, ...style }}
      {...props}
    />
  );
});
ContainerScale.displayName = "ContainerScale";
