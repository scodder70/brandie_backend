import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // This path is relative to the project root (where package.json is)
  schema: "prisma/schema.prisma", 
  
  // This block ensures Prisma uses the DATABASE_URL 
  // you set in the Render environment dashboard.
  datasource: {
    url: env("DATABASE_URL"),
  },
});