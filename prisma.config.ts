import { defineConfig } from "prisma/config";

export default defineConfig({
  // This path is relative to the 'src' directory where the build runs
  schema: "./prisma/schema.prisma", 
  
  // REMOVE the datasource block entirely
  // This will force Prisma to load the DATABASE_URL 
  // from the environment variables (i.e., from the Render dashboard)
});