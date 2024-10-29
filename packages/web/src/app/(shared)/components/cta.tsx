"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

{
  /* CTA Section */
}
export function CTASection() {
  return (
    <motion.section variants={itemVariants}>
      <CTACard />
    </motion.section>
  );
}

function CTACard() {
  return (
    <motion.div
      className="relative rounded-lg border border-border bg-card p-8 sm:p-12"
      variants={itemVariants}
    >
      <div className="relative z-10">
        <CTALogo />
        <CTAContent />
        <CTAButtons />
      </div>
    </motion.div>
  );
}

function CTALogo() {
  return (
    <motion.div
      className="flex justify-center mb-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
      }}
    >
      <motion.img
        src="https://mediaresource.sfo2.digitaloceanspaces.com/wp-content/uploads/2024/04/20161105/shadcn-ui-logo-EF735EC0E5-seeklogo.com.png"
        className="w-20 h-20 invert"
        alt="Shadcn/UI UI Logo"
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.3 },
        }}
      />
    </motion.div>
  );
}

function CTAContent() {
  return (
    <>
      <motion.h2
        className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-foreground text-center"
        variants={itemVariants}
      >
        Build something great
      </motion.h2>
      <motion.p
        className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto text-center"
        variants={itemVariants}
      >
        Get started with Drift today and join developers building modern,
        scalable applications.
      </motion.p>
    </>
  );
}

function CTAButtons() {
  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-3 items-center justify-center"
      variants={itemVariants}
    >
      <Button size="lg" className="w-full sm:w-auto font-medium">
        Get Started
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Button>
      <Button
        size="lg"
        variant="ghost"
        className="w-full sm:w-auto font-medium"
      >
        Documentation
      </Button>
    </motion.div>
  );
}
