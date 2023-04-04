import express from "express";
import cors from "cors";
import helmet from "helmet";
// Routes
import engRoutes from "./routes/eng.routes.ts";

const app = express();

// Midlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/eng", engRoutes);

app.use((req, res) => {
  res.status(404).json(`Route ${req.method} ${req.path} not found!`);
});

export default app;
