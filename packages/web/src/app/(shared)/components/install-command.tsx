"use client";

import BunIcon from "@/components/icons/bun";
import DenoIcon from "@/components/icons/deno";
import NPMIcon from "@/components/icons/npm";
import PNPMIcon from "@/components/icons/pnpm";
import YarnIcon from "@/components/icons/yarn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
} from "@/components/ui/code-block";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export const INSTALL_COMMANDS = [
  {
    id: "deno",
    name: "Deno",
    icon: DenoIcon,
    code: 'import { Drift } from "https://deno.land/x/drift/mod.ts";',
    language: "typescript",
  },
  {
    id: "bun",
    name: "Bun",
    icon: BunIcon,
    code: "bun add drift-kv",
    language: "bash",
  },
  {
    id: "npm",
    name: "NPM",
    icon: NPMIcon,
    code: "npm install drift-kv",
    language: "bash",
  },
  {
    id: "pnpm",
    name: "PNPM",
    icon: PNPMIcon,
    code: "pnpm add drift-kv",
    language: "bash",
  },
  {
    id: "yarn",
    name: "Yarn",
    icon: YarnIcon,
    code: "yarn add drift-kv",
    language: "bash",
  },
] as const;

const BUTTON_VARIANTS = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
} as const;

const CODE_BLOCK_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
} as const;

export function InstallCommand() {
  const [selectedTech, setSelectedTech] =
    useState<(typeof INSTALL_COMMANDS)[number]["id"]>("deno");

  const technologies = useMemo(() => {
    const tech = INSTALL_COMMANDS.find((t) => t.id === selectedTech);
    if (!tech) return [];

    return [
      {
        id: tech.id,
        name: tech.name,
        icon: <tech.icon className="w-4 h-4" />,
        code: tech.code,
      },
    ];
  }, [selectedTech]);

  const handleTechSelect = (techId: typeof selectedTech) => {
    setSelectedTech(techId);
  };

  const renderTechButton = (
    tech: (typeof INSTALL_COMMANDS)[number],
    index: number,
  ) => (
    <motion.div
      key={tech.id}
      variants={BUTTON_VARIANTS}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.1 * index }}
    >
      <Button
        onClick={() => handleTechSelect(tech.id)}
        variant={selectedTech === tech.id ? "outline" : "ghost"}
        className="flex items-center transition-all duration-300 ease-in-out"
      >
        <tech.icon className="w-4 h-4 mr-2" />
        {tech.name}
      </Button>
    </motion.div>
  );

  return (
    <Card className="p-6 mb-8 bg-gradient-to-b from-background to-secondary/5">
      <motion.div
        className="flex flex-wrap gap-2 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {INSTALL_COMMANDS.map(renderTechButton)}
      </motion.div>

      <motion.div
        key={selectedTech}
        variants={CODE_BLOCK_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        <CodeBlock technologies={technologies}>
          <CodeBlockHeader />
          <CodeBlockContent
            language={selectedTech === "deno" ? "typescript" : "bash"}
            code={technologies[0]?.code || ""}
          />
        </CodeBlock>
      </motion.div>
    </Card>
  );
}
