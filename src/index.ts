import "dotenv/config";
import app from "./app.ts";
import { createRoles, dotEnv, valiateConfig } from "./config/initial.setup.ts";
import { CError } from "./utils/variables.ts";
import logger from "./utils/logger.ts";
import { connectToMongo } from "./config/mongo.ts";
import { Eng } from "./models/eng.model.ts";

declare global {
  namespace Express {
    interface Request {
      user: Eng;
    }
  }
}

try {
  valiateConfig();

  await connectToMongo();

  await createRoles();

  const PORT = Number(dotEnv.PORT) || 3001;

  const server = app.listen(PORT, () =>
    logger.info(`Server is in: http://localhost:${PORT}`)
  );

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      server.close();
      process.exit(0);
    });
  });
} catch (e) {
  if (e instanceof CError) {
    logger.error(e.msg);
  } else if (e instanceof Error) {
    logger.error(e.message);
  } else console.error(e);
}
