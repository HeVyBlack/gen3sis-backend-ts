import { validate as validateEmail } from "email-validator";
import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import logger from "../utils/logger.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { dotEnv } from "../config/initial.setup.ts";
import EngModel from "../models/eng.model.ts";

export const schemaValidation =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.params,
      });
      return next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json(e.issues.map((issue) => issue.message));
      }
      return res.status(500).json("Internal server error!");
    }
  };

export function signValidator(req: Request, res: Response, next: NextFunction) {
  try {
    const msg = [];
    const { email, password } = req.body;
    if (!email) msg.push("Email is required!");
    if (!password) msg.push("Password is required!");

    if (msg.length > 0) return res.status(400).json(msg);

    if (!validateEmail(email)) msg.push("Provide a valid email!");

    if (typeof password !== "string") msg.push("Password must be a string!");
    else if (password.length < 6) msg.push("Password is too short!");

    if (msg.length > 0) return res.status(400).json(msg);

    return next();
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
    } else console.error(e);

    return res.status(500).json("Internal server error!");
  }
}

export async function validateEngToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { authorization } = req.headers;

    if (!authorization) return res.status(400).json("Without token!");

    const token = authorization.split("Bearer ").pop();

    if (!token) return res.status(400).json("No valid token!");

    try {
      const decoded = jwt.verify(token, dotEnv.SECRET_WORD) as JwtPayload;

      const user = await EngModel.findOne({ code: decoded.code });

      if (!user) return res.status(404).json("User not found!");

      req.user = user;

      return next();
    } catch (e) {
      return res.status(403).json("Not authorized!");
    }
  } catch (e) {
    if (e instanceof Error) logger.error(e.message);
    return res.status(500).json("Internal server error!");
  }
}
