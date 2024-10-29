"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";

const logoVariants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.15,
    rotate: 5,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.9,
  },
};

export function Logo({
  className,
  size = "default",
  colors = {
    dark: {
      primary: "#00FFFF", // Base color
      secondary: "#008F8F", // Darker shade for 3D effect
      stroke: "#666666", // Neutral gray that works in both themes
    },
    light: {
      primary: "#00FFFF", // Base color
      secondary: "#008F8F", // Darker shade for 3D effect
      stroke: "#666666", // Same neutral gray for consistency
    },
  },
}: {
  className?: string;
  size?: "small" | "default" | "large";
  colors?: {
    dark: {
      primary: string;
      secondary: string;
      stroke: string;
    };
    light: {
      primary: string;
      secondary: string;
      stroke: string;
    };
  };
}) {
  const { theme } = useTheme();

  const currentColors = theme === "dark" ? colors.dark : colors.light;

  const sizes = {
    small: {
      container: "w-10 h-10",
      text: "text-md",
      subtext: "text-xs",
      gap: "gap-0",
      logo: {
        padding: "p-0",
        strokeWidth: "stroke-[1.5]",
      },
    },
    default: {
      container: "w-16 h-16",
      text: "text-md",
      subtext: "text-xs",
      gap: "gap-0",
      logo: {
        padding: "p-2",
        strokeWidth: "stroke-[1.75]",
      },
    },
    large: {
      container: "w-24 h-24",
      text: "text-xl",
      subtext: "text-xs",
      gap: "gap-0",
      logo: {
        padding: "p-1.5",
        strokeWidth: "stroke-[2]",
      },
    },
  };

  const currentSize = sizes[size];

  return (
    <Link
      href="/"
      className={cn(`flex items-center ${currentSize.gap} group`, className)}
      suppressContentEditableWarning
      suppressHydrationWarning
    >
      <motion.div
        className={cn("relative", currentSize.container)}
        initial="hidden"
        animate="visible"
        whileTap="tap"
        variants={logoVariants}
      >
        {/* Logo Icon - Solid 3D Hexagon Representation */}
        <motion.svg
          viewBox="0 0 24 24"
          className={cn(
            "absolute inset-0 w-full h-full",
            currentSize.logo.padding,
            currentSize.logo.strokeWidth,
          )}
          style={{ stroke: currentColors.stroke }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Solid Hexagon with 3D Effect */}
          <motion.polygon
            points="12,2 20,7 20,17 12,22 4,17 4,7"
            fill="url(#grad1)"
            strokeLinecap="round"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: currentColors.primary, stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: currentColors.secondary, stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          {/* Shading for 3D Effect */}
          <motion.line
            x1="12"
            y1="2"
            x2="12"
            y2="22"
            stroke="#000000"
            strokeOpacity="0.3"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut", delay: 0.5 }}
          />
        </motion.svg>
      </motion.div>

      {/* Logo Text */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
        className="flex items-baseline space-x-1"
      >
        <motion.span
          className={cn("font-semibold tracking-tight", currentSize.text)}
          style={{ color: currentColors.primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Drift
        </motion.span>
        <motion.span
          className={cn(
            "text-muted-foreground font-light",
            currentSize.subtext,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          ORM
        </motion.span>
      </motion.div>
    </Link>
  );
}
