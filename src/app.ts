import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
// Routes
import engRoutes from "./routes/eng.routes.ts";
import logger from "./utils/logger.ts";

const app = express();

// Midlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/eng", engRoutes);

app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof SyntaxError) {
      if ("status" in err && err.status === 400 && "body" in err) {
        return res.status(400).send(err.message);
      }
    }

    logger.error(err);
    return res.status(500).json("Internal server error!");
  }
);

app.use((req, res) => {
  res.status(404).json(`Route ${req.method} ${req.path} not found!`);
});

export default app;
