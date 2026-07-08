require('dotenv').config();
const { defineConfig, env } = require('prisma/config');

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL") || "postgresql://postgres:mhenik123@localhost:5432/mhenik_inventory?schema=public",
  },
});