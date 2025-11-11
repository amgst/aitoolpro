import "../env";
import "dotenv/config";
import { createApp } from "./app";
import { createHttpServer } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { log } from "./logger";

(async () => {
  const app = createApp();
  const server = createHttpServer(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // reusePort is only supported on Linux, so we conditionally use it
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } else {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();
