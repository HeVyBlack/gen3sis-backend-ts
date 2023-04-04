import mongoose from "mongoose";
import { dotEnv } from "./initial.setup.ts";
import logger from "../utils/logger.ts";

export async function connectToMongo() {
  const db = await mongoose.connect(dotEnv.MONGO_URI);
  logger.info(`Connected to: ${db.connection.name}`);
}
