"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CodeBlock,
  CodeBlockHeader,
  ConnectedCodeBlockContent,
} from "@/components/ui/code-block";
import { motion } from "framer-motion";
import { CodeIcon, ListIcon, PenToolIcon, ZapIcon } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { INSTALL_COMMANDS } from "./install-command";

type TechnologyOption = {
  id: string;
  name: string;
  icon: ReactNode;
  code: string;
  language: string;
};

const basicUsageCode = `
import { Drift } from "drift-kv";
import { z } from "zod";

// Initialize the database client
const client = Deno.openKv();

// Set up Drift KV instance
const drift = new Drift({
  client,
  schemas: {
    entities: {
      user: {
        name: "user",
        schema: z.object({
          id: z.string().uuid(),
          name: z.string().min(3).max(100),
          email: z.string().email(),
        }),
      },
    },
  },
});

// Create a new user
await drift.entities.user.create({
  data: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Felipe",
    email: "felipe@example.com",
  },
});

// Query users
const users = await drift.entities.user.findMany({
  where: { name: { contains: "Felipe" } },
});

console.log(users);
`;

const queuesUsageCode = `
import { DriftQueue } from "drift-kv";
import { z } from "zod";

// Define a queue for processing emails
const emailQueue = new DriftQueue({
  name: "email",
  schema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  handler: async (job) => {
    // Process the email job
    await sendEmail(job.data);
  },
});

// Add a job to the queue
await emailQueue.enqueue({
  to: "user@example.com",
  subject: "Welcome to Drift KV",
  body: "Thank you for using Drift KV!",
});

// Process the queue
await emailQueue.process({
  concurrency: 10,
});
`;

const realTimeUsageCode = `
import { Drift } from "drift-kv";

// Watch for changes on the User entity
const unsubscribe = drift.entities.user.watchAll(
  { where: { age: { gte: 18 } } },
  (users) => {
    console.log("Adult users changed:", users);
  }
);

// Later, unsubscribe from the changes
unsubscribe();
`;

const migrateUsageCode = `
import { Drift } from "drift-kv";

// Migrate database schema
await drift.migrate({
  path: "./migrations",
});
`;

export function QuickSteps() {
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedInstaller, setSelectedInstaller] = useState<string>("deno");

  // Memoize install technologies to prevent unnecessary re-renders
  const installTechnologies = useMemo(() => {
    const command = INSTALL_COMMANDS.find(
      (cmd) => cmd.id === selectedInstaller,
    );
    if (!command) return [];

    return [
      {
        id: command.id,
        name: command.name,
        icon: command.icon({ className: "w-4 h-4" }),
        code: command.code,
      },
    ];
  }, [selectedInstaller]);

  // Memoize tabs configuration
  const tabs = useMemo(
    () => [
      {
        id: "basic",
        label: "Basic Usage",
        icon: <CodeIcon className="w-4 h-4 mr-2" />,
        code: basicUsageCode,
        language: "typescript",
      },
      {
        id: "queues",
        label: "Job Queues",
        icon: <ListIcon className="w-4 h-4 mr-2" />,
        code: queuesUsageCode,
        language: "typescript",
      },
      {
        id: "realtime",
        label: "Real-Time",
        icon: <ZapIcon className="w-4 h-4 mr-2" />,
        code: realTimeUsageCode,
        language: "typescript",
      },
      {
        id: "utils",
        label: "Utilities",
        icon: <PenToolIcon className="w-4 h-4 mr-2" />,
        code: migrateUsageCode,
        language: "typescript",
      },
    ],
    [],
  );

  // Memoize technologies to prevent unnecessary re-renders
  const technologies = useMemo(
    () => [
      {
        id: "typescript",
        name: "TypeScript",
        icon: <CodeIcon className="w-4 h-4" />,
        code: tabs.find((tab) => tab.id === activeTab)?.code || "",
        language: "typescript",
      },
    ],
    [activeTab, tabs],
  );

  return (
    <motion.section
      className="mb-12 sm:mb-16 md:mb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Get Started with Drift
      </motion.h2>

      <Card className="p-6 sm:p-8 bg-gradient-to-b from-background to-secondary/5">
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Button
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "outline" : "ghost"}
              >
                {tab.icon}
                {tab.label}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          <motion.div
            key={`install-${selectedInstaller}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Installation
            </h3>
            <CodeBlock
              technologies={INSTALL_COMMANDS.map((command) => ({
                id: command.id,
                name: command.name,
                icon: command.icon({ className: "w-4 h-4" }) as ReactNode,
                code: command.code,
                language: command.id === "deno" ? "typescript" : "bash",
              }))}
            >
              <CodeBlockHeader />
              <ConnectedCodeBlockContent language="typescript" />
            </CodeBlock>
          </motion.div>

          <motion.div
            key={`usage-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h3>
            <CodeBlock technologies={technologies}>
              <CodeBlockHeader />
              <ConnectedCodeBlockContent language="typescript" />
            </CodeBlock>
          </motion.div>
        </motion.div>
      </Card>
    </motion.section>
  );
}
