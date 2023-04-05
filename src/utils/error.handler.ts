import { Response } from "express";
import { CError } from "./variables.ts";
import logger from "./logger.ts";

export function httpErrorHandler(res: Response, e: unknown) {
  try {
    if (e instanceof CError) return res.status(500).json(e.msg);
    if (e instanceof Error) {
      logger.error(e.message);
    }
    return res.status(500).json("Internal server error!");
  } catch (e) {
    if (e instanceof Error) logger.error(e.message);
    if (e instanceof CError) {
      logger.error(e.msg);
      return res.status(500).json(e);
    }
    return res.status(500).json("Internal server error!");
  }
}
