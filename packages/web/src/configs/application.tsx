import { type Config } from "./types";

export const config: Config = {
  // General
  projectName: "Drift KV",
  projectDescription:
    "Drift KV: A high-performance, type-safe ORM for TypeScript, optimized for Deno KV, Node.js, and Edge environments. Features real-time subscriptions, job queues, and a plugin system. ",
  projectTagline:
    'Drift KV: A high-performance, type-safe ORM for {{ words: ["Deno", "Bun", "Node.js"], interval: 2000 }}',

  // Links
  githubUrl: "https://github.com/felipebarcelospro/drift-kv",
  twitterUrl: "https://x.com/feldbarcelospro",
  purchaseUrl: "",

  // Developer Info
  developerName: "Felipe Barcelos",
  developerEmail: "felipebarcelospro@gmail.com",
  developerImage:
    "https://media.licdn.com/dms/image/v2/D4D03AQHvSr_V9EAOjQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1728308774937?e=1734566400&v=beta&t=QAfLIR7Q60F1AEatAqPzGAXUjKTlhGvpFtexpyDki5U",
  developerBio:
    "I'm a passionate software engineer and entrepreneur from 🇧🇷, dedicated to creating powerful and developer-friendly tools for the modern web ecosystem.",

  // Features
  features: [
    {
      title: "Universal TypeScript Support",
      description:
        "Experience seamless integration across platforms with Drift KV's universal TypeScript support. Whether you're building for Deno, Node.js, or Edge environments, maintain complete type safety and consistent execution.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
          <line x1="8" y1="16" x2="8.01" y2="16"></line>
          <line x1="8" y1="20" x2="8.01" y2="20"></line>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
          <line x1="12" y1="22" x2="12.01" y2="22"></line>
          <line x1="16" y1="16" x2="16.01" y2="16"></line>
          <line x1="16" y1="20" x2="16.01" y2="20"></line>
        </svg>
      ),
    },
    {
      title: "Type-Safe Queries",
      description:
        "Write safer database operations with the robust type system in Drift KV. Get full IntelliSense support and type inference that catches errors at compile-time, making your queries more reliable and maintainable.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      ),
    },
    {
      title: "Real-Time Subscriptions",
      description:
        "Transform your applications with the real-time capabilities of Drift KV. Implement instant data synchronization with powerful filtering options and complex event patterns for modern collaborative features.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
      ),
    },
    {
      title: "Edge-Ready Job Queues",
      description:
        "Handle background tasks efficiently in any environment with Drift KV's advanced queue system. Leverage features like delayed execution and retries while maintaining optimal performance at the edge.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      ),
    },
  ],

  // FAQ
  faq: [
    {
      question: "What is Drift KV?",
      answer:
        "Drift KV is a powerful Object-Relational Mapping (ORM) tool designed for Deno KV and Node.js, offering features like type-safe queries, real-time subscriptions, job queues, and a plugin system.",
    },
    {
      question: "How does Drift KV work?",
      answer:
        "Drift KV provides an abstraction layer over your database, allowing you to interact with your data using TypeScript objects. It handles the translation between your code and database operations, ensuring type safety and providing additional features like real-time subscriptions and job queues.",
    },
    {
      question: "Is Drift KV free to use?",
      answer:
        "Yes, Drift KV is open-source and free to use under the MIT license. You can find the source code and contribute on our GitHub repository.",
    },
    {
      question: "Can I use Drift KV with both Deno and Node.js?",
      answer:
        "Yes, Drift KV is designed to work seamlessly in both Deno and Node.js environments, providing a consistent API across platforms.",
    },
    {
      question: "How do I get started with Drift KV?",
      answer:
        "To get started, install Drift KV from npm or import it in Deno. Then, create a Drift instance, define your entities, and start using the ORM in your project. Check our documentation for detailed guides and examples.",
    },
    {
      question: "Does Drift KV support real-time subscriptions?",
      answer:
        "Yes, Drift KV has built-in support for real-time subscriptions, allowing you to react to data changes in real-time in your applications.",
    },
    {
      question: "Can I extend Drift KV's functionality?",
      answer:
        "Absolutely! Drift KV comes with a plugin system that allows you to extend its functionality. You can create custom plugins to add new features or modify existing behaviors.",
    },
    {
      question: "How does Drift KV handle database migrations?",
      answer:
        "Drift KV provides tools for managing database schema changes and migrations. You can define your schema changes in TypeScript and use Drift's migration system to apply them to your database.",
    },
    {
      question: "How can I contribute to Drift KV?",
      answer:
        "We welcome contributions! You can contribute by submitting bug reports, feature requests, or pull requests on our GitHub repository. Check our Contributing Guide for more details on how to get involved.",
    },
  ],

  // Legal
  termsOfUseUrl: "/terms-of-use",
  privacyPolicyUrl: "/privacy-policy",
};
