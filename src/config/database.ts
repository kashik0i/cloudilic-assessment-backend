import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { createLogger } from "./logger";

const logger = createLogger();

// Note: Entity imports will be added after creating entity classes
// For now, we'll use entity discovery pattern

// Ensure DATABASE_URL is defined and narrow its type to string
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required but was not provided");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,

  // Entity discovery - will auto-discover entities in src/entities/
  entities: ["src/entities/**/*.entity.{ts,js}"],
  
  // Migrations configuration (for future use)
  migrations: ["src/migrations/**/*.{ts,js}"],
  migrationsTableName: "typeorm_migrations",
  
  // Logging configuration
  logging: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  
  // Synchronization - WARNING: Set to false in production!
  // For now, we'll use false and rely on existing schema.sql
  synchronize: false,
  
  // Connection pool settings
  extra: {
    max: 10, // Maximum number of clients in the pool
    min: 2,  // Minimum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  // Enable pgvector extension support
  // The extension should already be created via schema.sql
  installExtensions: true,
});

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connection established successfully");
    }
    return AppDataSource;
  } catch (error) {
    logger.error({ err: error as Error }, "Error during database initialization");
    throw error;
  }
}

/**
 * Close database connection gracefully
 */
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    logger.info("Database connection closed");
  }
}
