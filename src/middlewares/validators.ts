import { validate as validateEmail } from "email-validator";
import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import logger from "../utils/logger.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { dotEnv } from "../config/initial.setup.ts";
import EngModel from "../models/eng.model.ts";
import { httpErrorHandler } from "../utils/error.handler.ts";
import { isArray, isObject, objectKeys } from "../utils/functions.ts";

export const schemaValidation =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req = schema.parse({
        body: req.body,
        params: req.params,
        query: req.params,
      }) as Request;

      return next();
    } catch (e) {
      if (e instanceof ZodError) {
        console.log(e.issues.map((i) => i.path));
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
    return httpErrorHandler(res, e);
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

export const customSchemaValidator =
  <T>(cSchema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const eterateSchema = <TT>(schema: T, e_body: TT, a_body: {}) => {
        let e_msg: string[] = [];
        objectKeys(schema as object).forEach((val) => {
          if (isObject(schema[val])) {
            if (!isObject(e_body[val])) e_msg.push(`${val} must be an object!`);
            else {
              const r = eterateSchema(schema[val], e_body[val], a_body[val]);
              r.e_msg.forEach((i: string) => e_msg.push(i));
              Object.assign(a_body, r.a_body);
            }
          } else {
            const r = (cSchema[val] as Function)(e_body[val]);
            if (isObject(r)) {
              if ("value" in r) (e_body[val] as TT) = r.value;
              a_body[val] = e_body[val];
            } else if (typeof r === "string") e_msg.push(r);
            else if (isArray(r)) r.forEach((i: string) => e_msg.push(i));
          }
        });
        return { e_msg, a_body };
      };

      const r = eterateSchema(cSchema, req.body, {});

      if (r.e_msg.length > 0) return res.status(400).json(r.e_msg);

      req.body = r.a_body;

      return next();
    } catch (e) {
      return httpErrorHandler(res, e);
    }
  };
