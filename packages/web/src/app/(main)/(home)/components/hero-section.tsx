"use client";

import { InstallCommand } from "@/app/(shared)/components/install-command";
import { TechBadge } from "@/app/(shared)/components/tech-badge";
import { FlipWords } from "@/components/ui/flip-words";
import { config } from "@/configs/application";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <motion.section
      className="text-center mb-12 sm:mb-16 md:mb-24"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <motion.p
        className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 text-muted-foreground"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        Powerful ORM for <TechBadge /> and{" "}
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://vercel.com/edge"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mx-1 sm:mx-2 px-2 sm:px-3 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors text-sm sm:text-md"
        >
          Edge
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 sm:ml-2 hidden sm:inline"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </motion.a>{" "}
        environments
      </motion.p>

      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 !leading-snug md:max-w-3xl mx-auto text-background-foreground"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <FlipWords>{config.projectTagline}</FlipWords>
      </motion.h1>

      <motion.p
        className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 md:mb-12 text-muted-foreground max-w-3xl mx-auto"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        {config.projectDescription}
      </motion.p>

      <motion.div
        className="container mx-auto max-w-screen-md"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <InstallCommand />
      </motion.div>
    </motion.section>
  );
}
