"use client";

import * as React from "react";
import {
  HTMLMotionProps,
  MotionValue,
  Variants,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
}

const SPRING_CONFIG = {
  type: "spring",
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
  duration: 0.3,
} as const;

const blurVariants: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

const ContainerScrollContext = React.createContext<ContainerScrollContextValue | undefined>(undefined);

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) {
    throw new Error("useContainerScrollContext must be used within a ContainerScroll Component");
  }
  return context;
}

/**
 * Tall wrapper that measures scroll progress for everything inside it.
 * `offset` decides when progress is 0 and 1; the default runs from the wrapper entering the screen to leaving it.
 */
export const ContainerScroll = ({
  children,
  className,
  style,
  offset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { offset?: ScrollOffset }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-[120vh]", className)}
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center top",
          transformStyle: "preserve-3d",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};
ContainerScroll.displayName = "ContainerScroll";

export const ContainerSticky = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("sticky top-0 left-0 min-h-[30rem] w-full overflow-hidden", className)}
      style={{
        perspective: "1000px",
        perspectiveOrigin: "center top",
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50%",
        ...style,
      }}
      {...props}
    />
  );
};
ContainerSticky.displayName = "ContainerSticky";

/** The grid that starts tilted back and flattens as the page scrolls. */
export const GalleryContainer = ({ children, className, style, ...props }: HTMLMotionProps<"div">) => {
  const { scrollYProgress } = useContainerScrollContext();
  const reduced = useReducedMotion();
  const rotateX = useTransform(scrollYProgress, [0, 0.4], reduced ? [0, 0] : [28, 0]);
  const scale = useTransform(scrollYProgress, [0.3, 0.6], reduced ? [1, 1] : [1.04, 1]);

  return (
    <motion.div
      className={cn("relative grid size-full rounded-2xl", className)}
      style={{
        rotateX,
        scale,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
GalleryContainer.displayName = "GalleryContainer";

/** One column of the grid. Columns drift by different amounts so the grid feels layered. */
export const GalleryCol = ({
  className,
  style,
  yRange = ["0%", "-10%"],
  ...props
}: HTMLMotionProps<"div"> & { yRange?: string[] }) => {
  const { scrollYProgress } = useContainerScrollContext();
  const reduced = useReducedMotion();
  const y = useTransform(scrollYProgress, [0.3, 0.8], reduced ? ["0%", "0%"] : yRange);

  return <motion.div className={cn("relative flex w-full flex-col gap-2", className)} style={{ y, ...style }} {...props} />;
};
GalleryCol.displayName = "GalleryCol";

export const ContainerStagger = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, viewport, transition, ...props }, ref) => {
    return (
      <motion.div
        className={cn("relative", className)}
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, ...viewport }}
        transition={{ staggerChildren: transition?.staggerChildren || 0.2, ...transition }}
        {...props}
      />
    );
  }
);
ContainerStagger.displayName = "ContainerStagger";

export const ContainerAnimated = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, transition, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={blurVariants}
        transition={{ ...SPRING_CONFIG, ...transition }}
        {...props}
      />
    );
  }
);
ContainerAnimated.displayName = "ContainerAnimated";
