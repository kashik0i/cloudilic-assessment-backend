import "reflect-metadata";
import "dotenv/config";
import { AppDataSource, initializeDatabase, closeDatabase } from "./config/database";
import { buildApp } from "./app";
import { createLogger } from "./config/logger";

const port = Number(process.env.PORT) || 4000;
const logger = createLogger();

/**
 * Bootstrap Application
 * Initializes database connection before starting the server
 */
async function bootstrap() {
  try {
    // Initialize TypeORM connection
    logger.info("Initializing database connection...");
    await initializeDatabase();

    const { app } = buildApp(AppDataSource);

    app.get("/health", async (req, res) => {
      try {
        // Test database connection with TypeORM
        //TODO: this can be improved with a better health check mechanism to reduce overhead
        await AppDataSource.query("SELECT 1");
        req.log?.debug({ route: "health" }, "Health check OK");
        res.json({ ok: true, database: "connected" });
      } catch (err) {
        req.log?.error({ err }, "Health check failed");
        res.status(500).json({ ok: false, error: "Database connection failed" });
      }
    });

    // Start Express server
    const server = app.listen(port, () => {
      logger.info({ port }, `Server running on port ${port}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.warn({ signal }, "Received signal, starting graceful shutdown...");

      // Stop accepting new connections
      server.close(async () => {
        logger.info("HTTP server closed");

        // Close database connections
        try {
          await closeDatabase();
          logger.info("Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          logger.error({ err: error as Error }, "Error during shutdown");
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Register shutdown handlers
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error({ err: error as Error }, "Failed to start application");
    process.exit(1);
  }
}

// Start the application
bootstrap();
