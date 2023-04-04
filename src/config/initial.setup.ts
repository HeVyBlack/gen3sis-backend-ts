import { objectKeys } from "../utils/functions.ts";
import { CError } from "../utils/variables.ts";
import Roles from "../models/role.model.ts";
import logger from "../utils/logger.ts";

export const dotEnv = {
  SECRET_WORD: String(process.env.SECRET_WORD),
  PORT: Number(process.env.PORT),
  MONGO_URI: String(process.env.MONGO_URI),
  FRONTEND_HOST: String(process.env.FRONTEND_HOST),
  MAIL_HOST: String(process.env.MAIL_HOST),
  MAIL_PORT: Number(process.env.MAIL_PORT),
  MAIL_USER: String(process.env.MAIL_USER),
  MAIL_PASS: String(process.env.MAIL_PASS),
  SOPORT_G3: String(process.env.SOPORT_G3),
  SECRET_STAFF_WORD: String(process.env.SECRET_STAFF_WORD),
  SECRET_RESET_WORD: String(process.env.SECRET_RESET_WORD),
  MAIL_FOR_ING: String(process.env.MAIL_FOR_ING),
  MAIL_FOR_PART: String(process.env.MAIL_FOR_PART),
};

const dictionary = {
  SECRET_WORD: "palabra secreta",
  PORT: "puerto",
  MONGO_URI: "uri de mongo",
  FRONTEND_HOST: "link del frontend",
  MAIL_HOST: "host para email",
  MAIL_PORT: "puerto para email",
  MAIL_USER: "usuario para email",
  MAIL_PASS: "contraseña para email",
  SOPORT_G3: "email de soporte g3",
  SECRET_STAFF_WORD: "palabra secreta para staff",
  MAIL_FOR_ING: "email de ingenieria",
  MAIL_FOR_PART: "email de partner",
  SECRET_RESET_WORD: "secret word for resets",
};

export function valiateConfig() {
  let msg = "";
  objectKeys(dotEnv).forEach((i) => {
    if (!dotEnv[i] || dotEnv[i] === "undefined") {
      msg += `${String(dictionary[i]).toLocaleUpperCase()} no esta definido\n`;
    }
  });
  if (msg.length > 0) throw new CError(msg);
}

export async function createRoles() {
  try {
    const count = await Roles.estimatedDocumentCount();

    if (count > 0) return;

    const values = await Promise.all([
      new Roles({ name: "user" }).save(),
      new Roles({ name: "admin" }).save(),
      new Roles({ name: "super_user" }).save(),
    ]);

    let msg = "";

    values.forEach((i) => {
      msg += `${i.name} has been created!\n`;
    });

    logger.info(msg);
  } catch (e) {
    if (e instanceof Error) logger.error(e.message);
    else console.error(e);
  }
}
