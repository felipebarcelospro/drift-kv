import { ContentSection } from "@/lib/docs";

export const menu: ContentSection[] = [
  {
    title: "Introduction",
    items: [
      {
        title: "Introduction",
        type: "docs",
        category: "introduction",
        date: new Date().toISOString(),
        description: "Introduction to Drift KV",
        slug: "/docs/",
      },
      {
        title: "Getting Started",
        type: "docs",
        category: "getting-started",
        date: new Date().toISOString(),
        description: "Getting Started with Drift KV",
        slug: "/docs/getting-started-with-drift-kv",
      },
      {
        title: "Setup your Drift KV",
        type: "docs",
        category: "setup",
        date: new Date().toISOString(),
        description: "Setup your Drift KV",
        slug: "/docs/setup-your-drift-kv",
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Contributing",
        type: "docs",
        category: "contributing",
        date: new Date().toISOString(),
        description: "Contributing to Drift KV",
        slug: "/docs/contributing",
      },
      {
        title: "Migrating from Deno KV",
        type: "docs",
        category: "migrating-from-deno-kv",
        date: new Date().toISOString(),
        description: "Migrating from Deno KV to Drift KV",
        slug: "/docs/migrating-from-deno-kv",
      },
    ],
  },
  {
    title: "ORM",
    items: [
      {
        title: "Introduction",
        type: "docs",
        category: "orm",
        date: new Date().toISOString(),
        description: "Introduction to Drift KV ORM",
        slug: "/docs/orm",
      },
    ],
  },
  {
    title: "Queues",
    items: [
      {
        title: "Introduction",
        type: "docs",
        category: "queues",
        date: new Date().toISOString(),
        description: "Introduction to Drift KV Queues",
        slug: "/docs/queues",
      },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      {
        title: "Introduction",
        type: "docs",
        category: "subscriptions",
        date: new Date().toISOString(),
        description: "Introduction to Drift KV Subscriptions",
        slug: "/docs/real-time",
      },
    ],
  },
];
