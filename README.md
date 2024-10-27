# Drift KV - Powerful ORM for Deno KV

![GitHub contributors](https://img.shields.io/github/contributors/felipebarcelospro/drift)
![GitHub forks](https://img.shields.io/github/forks/felipebarcelospro/drift)
![GitHub stars](https://img.shields.io/github/stars/felipebarcelospro/drift)
![GitHub issues](https://img.shields.io/github/issues/felipebarcelospro/drift)
![License](https://img.shields.io/github/license/felipebarcelospro/drift)

## About The Project

Drift KV is a powerful ORM designed for Deno KV with built-in support for:

- Database operations
- Real-time subscriptions
- Job queues
- Plugin system
- Type-safe queries

The goal of Drift is to offer a seamless and powerful developer experience, allowing you to focus on what truly matters - building great applications. Drift KV takes care of the complex plumbing required for database interactions and real-time features, saving you significant development time.

## Built With

- [Deno](https://deno.land/)
- [KV Store](https://deno.land/manual/runtime/kv_storage)
- [Zod](https://github.com/colinhacks/zod) for schema validation

## Getting Started

To get a local copy up and running follow these simple steps:

### Prerequisites

- Install [Deno](https://deno.land/):
  ```sh
  curl -fsSL https://deno.land/install.sh | sh
  ```

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/felipebarcelospro/drift.git
   ```
2. Install dependencies:
   ```sh
   deno task install
   ```
3. Initialize Drift KV with your Deno KV client:
   ```typescript
   import { Drift } from "drift-kv";
   const client = Deno.openKv();
   const drift = new Drift({ client });
   ```

## Usage

Drift KV is designed to be intuitive for both beginners and experienced developers. Below are examples demonstrating various features of Drift KV:

### Defining an Entity

```typescript
import { DriftEntity } from "drift-kv";
import { z } from "zod";

const User = new DriftEntity({
  name: "user",
  schema: z.object({
    id: z.string().uuid(),
    name: z.string().min(3).max(100),
    email: z.string().email(),
    age: z.number().min(18).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});
```

### CRUD Operations

```typescript
// Create a new user
const newUser = await drift.entities.user.create({
  data: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Felipe",
    email: "felipe@example.com",
    age: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

// Find a user by ID
const user = await drift.entities.user.findUnique({
  where: { id: "123e4567-e89b-12d3-a456-426614174000" },
});

// Update a user
const updatedUser = await drift.entities.user.update({
  where: { id: "123e4567-e89b-12d3-a456-426614174000" },
  data: { name: "Felipe Barcelos" },
});

// Delete a user
await drift.entities.user.delete({
  where: { id: "123e4567-e89b-12d3-a456-426614174000" },
});
```

### Querying Data

```typescript
// Find all users older than 25
const adultUsers = await drift.entities.user.findMany({
  where: { age: { gt: 25 } },
  orderBy: { age: "desc" },
});

// Count users
const userCount = await drift.entities.user.count({
  where: { age: { gte: 18 } },
});
```

### Real-Time Subscriptions

```typescript
// Watch for changes on the User entity
const unsubscribe = drift.entities.user.watchAll(
  { where: { age: { gte: 18 } } },
  (users) => {
    console.log("Adult users changed:", users);
  },
);

// Later, unsubscribe from the changes
unsubscribe();
```

### Using Plugins

```typescript
import { LoggingPlugin } from "drift-kv/plugins";

// Create a logging plugin
const loggingPlugin = new LoggingPlugin({
  logQueries: true,
  logMutations: true,
});

// Initialize Drift with the plugin
const drift = new Drift({
  client,
  plugins: [loggingPlugin],
});
```

### Working with Queues

```typescript
import { DriftQueue } from "drift-kv";

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
```

These examples showcase the core functionalities of Drift KV. For more detailed information and advanced usage, please refer to our [documentation](https://github.com/felipebarcelospro/drift/docs).

## Features

- **Real-Time Subscriptions**: Watch for changes on entities and receive live updates.
- **Job Queues**: Define and manage background jobs with ease.
- **Plugin System**: Easily extend Drift's functionality by adding your own plugins.
- **Type-Safe Queries**: Validate all operations at compile-time using TypeScript.

## Roadmap

- [ ] Add support for additional database backends.
- [ ] Improve error handling for job queues.
- [ ] Integration with NextAuth adapter for Drift.
- [ ] Develop more comprehensive examples and documentation.

See the [open issues](https://github.com/felipebarcelospro/drift/issues) for a list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact

Felipe - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/felipebarcelospro/drift](https://github.com/felipebarcelospro/drift)

## Acknowledgments

- [Zod](https://github.com/colinhacks/zod)
- [Deno KV](https://deno.land/manual/runtime/kv_storage)
- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

## Links

- [Documentation](https://github.com/felipebarcelospro/drift/docs)
- [Report Bugs](https://github.com/felipebarcelospro/drift/issues)
- [Request Features](https://github.com/felipebarcelospro/drift/issues)

## Development with Turborepo

This project uses Turborepo to manage the monorepo structure and optimize build processes.

### Available Scripts

- `npm run build`: Build all packages
- `npm run dev`: Start development mode for all packages
- `npm run lint`: Lint all packages
- `npm run test`: Run tests for all packages
- `npm run check-types`: Type-check all packages

### Using Turborepo

To run a specific task for all packages:

```bash
turbo run <task-name>
```

To run a task for a specific package:

```bash
turbo run <task-name> --filter=<package-name>
```

For example, to run the build task for the web package:

```bash
turbo run build --filter=@drift/web
```

For more information on using Turborepo, check out the [Turborepo documentation](https://turbo.build/repo/docs).
