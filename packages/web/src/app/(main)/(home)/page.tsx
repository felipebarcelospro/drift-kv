"use client";

import { CTASection } from "@/app/(shared)/components/cta";
import { QuickSteps } from "@/app/(shared)/components/quick-steps";
import { motion } from "framer-motion";
import { DeveloperSection } from "./components/developer-section";
import { FAQSection } from "./components/faq-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";

export default function Home() {
  return (
    <motion.main
      className="container mx-auto px-4 py-8 sm:py-12 md:py-16"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
    >
      <HeroSection />
      <FeaturesSection />

      <motion.div
        className="container mx-auto max-w-5xl"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <QuickSteps />
      </motion.div>

      <motion.section
        className="pt-12 sm:pt-16 md:pt-24"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            className="grid gap-8 sm:gap-12"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <DeveloperSection />
            <FAQSection />
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        className="mt-12"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="container mx-auto max-w-5xl px-4">
          <CTASection />
        </div>
      </motion.section>
    </motion.main>
  );
}
