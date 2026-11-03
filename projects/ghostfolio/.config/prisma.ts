import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { join } from 'node:path';

expand(config({ quiet: true }));

export default defineConfig({
  migrations: {
    path: join(__dirname, '..', 'prisma', 'migrations'),
    // Keep path relative for Windows paths with spaces and execute .mts via ts-node loader.
    seed: 'node --loader ts-node/esm prisma/seed.mts'
  },
  schema: join(__dirname, '..', 'prisma', 'schema.prisma')
});
