"use client";

import { CanvasRevealEffect } from "@/app/(content)/blog/(main)/components/canvas-reveal-effect";
import { Button } from "@/components/ui/button";
import { config } from "@/configs/application";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export function CTASection() {
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  return (
    <motion.section 
      className="group/spotlight relative my-20 border-y border-border rounded-lg py-12 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.05)] backdrop-blur"
      variants={itemVariants}
      onMouseMove={({ currentTarget, clientX, clientY }) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div
        className="pointer-events-none absolute z-0 -inset-px rounded-md opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          backgroundColor: "hsl(var(--muted))",
          maskImage: useMotionTemplate`
            radial-gradient(
              350px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
        }}
      >
        {isHovering && (
          <CanvasRevealEffect
            animationSpeed={5}
            containerClassName="bg-transparent absolute inset-0 pointer-events-none opacity-50"
            colors={[
              [59, 130, 246],
              [139, 92, 246],
            ]}
            dotSize={3}
          />
        )}
      </motion.div>

      <div className="relative mx-auto w-full max-w-screen-xl px-3 lg:px-10">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="size-4">
              <g fill="currentColor">
                <polyline fill="none" points="5.25 12.5 1.75 9 5.25 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></polyline>
                <polyline fill="none" points="12.75 12.5 16.25 9 12.75 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></polyline>
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="7.5" x2="10.5" y1="15.25" y2="2.75"></line>
              </g>
            </svg>
            Built for Deno KV
          </span>
          <h2 className="text-4xl font-bold text-foreground">
            Start building with Drift KV and Deno KV
          </h2>
          <p className="text-base text-muted-foreground">
            A type-safe ORM with built-in support for real-time subscriptions, job queues, and seamless compatibility with Deno KV, Node.js, Bun.js and Edge environments.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="rounded-full">
              <Link href="/docs/getting-started-with-drift-kv" className="flex items-center gap-2">
                <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="size-4">
                  <g fill="currentColor">
                    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="5.75" x2="5.75" y1="1.75" y2="12.75"></line>
                    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="8.75" x2="12.25" y1="5.25" y2="5.25"></line>
                    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="8.75" x2="12.25" y1="8.25" y2="8.25"></line>
                    <path d="M2.75,14.5V3.75c0-1.105,.895-2,2-2H15.25V12.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    <path d="M5.25,16.25h-.75c-.966,0-1.75-.783-1.75-1.75s.784-1.75,1.75-1.75H15.25c-.641,.844-.734,2.547,0,3.5H5.25Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                  </g>
                </svg>
                Read the docs
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <a href={config.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
                View the code
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
