import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres.frosty-silence-64784428:tndls2080%21%2F@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  },
});
