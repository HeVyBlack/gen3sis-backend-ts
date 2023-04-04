import { Request, Response } from "express";
import EngModel, { Eng } from "../models/eng.model.ts";
import logger from "../utils/logger.ts";
import { CError, banEmailList } from "../utils/variables.ts";
import { SignSchemaType } from "../schema/basic.schema.ts";
import RoleModel from "../models/role.model.ts";
import transporter from "../config/nodemailer.ts";
import jwt from "jsonwebtoken";
import { dotEnv } from "../config/initial.setup.ts";

export async function engSignIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await EngModel.findOne({ email });

    if (!user) return await createEng(req, res);

    if (!user.verified_email)
      return res.status(400).json("Please, confirm your email!");

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return res.status(400).json("Invalid password!");

    const token = jwt.sign({ code: user.code }, dotEnv.SECRET_WORD, {
      expiresIn: "12h",
    });

    return res.status(200).json(token);
  } catch (e) {
    if (e instanceof CError) return res.status(500).json(e.msg);
    if (e instanceof Error) {
      logger.error(e.message);
    }
    return res.status(500).json("Internal server error!");
  }
}

async function createEng(
  req: Request<unknown, unknown, SignSchemaType>,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (banEmailList.includes(email.split("@").pop() as string))
      return res.status(400).json("Email domain is not valid!");

    const user = new EngModel({ email });

    user.password = await user.encryptPassword(String(password));

    const role = await RoleModel.findOne({ name: "user" });

    if (role) user.roles = [role.id];
    else {
      logger.error("Role user doesn't exists!");
      return res.status(500).json("Internal server error!");
    }

    Promise.all([utils.sendSignUpEmail(user), user.save()]);

    return res
      .status(200)
      .json("User is now register! Please, confirm your email!");
  } catch (e) {
    if (e instanceof CError) return res.status(500).json(e.msg);
    if (e instanceof Error) logger.error(e.message);
    return res.status(500).json("Internal server error!");
  }
}

export function getEngUser(req: Request, res: Response) {
  try {
    const { email, verified_email, verified_info, user_checked } = req.user;
    return res.status(200).json({
      email,
      verified_email,
      verified_info,
      user_checked,
    });
  } catch (e) {
    if (e instanceof Error) logger.error(e.message);
    return res.status(500).json("Internal server error!");
  }
}

const utils = {
  async sendSignUpEmail(user: Eng) {
    const { email, code } = user;

    const confirmToken = jwt.sign(
      {
        code,
      },
      String(process.env.SECRET_WORD)
    );

    const confirmLink = `${process.env.FRONTEND_HOST}/eng/confirm-email?token=${confirmToken}`;

    await transporter.sendMail({
      from: `'Soporte Gen3sis' <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Confirma tu correo",
      html: `<h1>!Bienvenido a Gen3sis!</h1>
        <h2>Por favor, confirma tu correo:</h2>
        <a href="${confirmLink}" target="_blank">!Click aquí!</a>
        <p>Este mensaje de correo electrónico y sus adjuntos puede contener información confidencial, privilegiada o legalmente protegida y esta destinado únicamente para el uso del destinatario(s) previsto(s). Cualquier divulgación, difusión, distribución, copia o la toma de cualquier acción basada en la información aquí contenida esta prohibido. Los correos electrónicos no son seguros y no se pueden garantizar que estén libre de errores, ya que pueden ser interceptados, modificados, o contener virus. Cualquier persona que se comunica con esta organización por e-mail se considera que ha aceptado estos riesgos. La organización no se hace responsable de los errores u omisiones de este mensaje y no sera responsable por danos derivados de la utilización del correo electrónico situación que conoce y acepta el destinatario. Cualquier opinión y otra declaración contenida en este mensaje y cualquier archivo adjunto son de exclusiva responsabilidad del autor y no representan necesariamente la posición de la empresa. Si recibe este mensaje por error, por favor notificarlo al remitente de inmediato y desecharlo de su sistema. El destinatario autoriza a la empresa remitente el tratamiento y protección de los datos de contacto (direcciones de correo físico, electrónico, redes sociales y teléfono).</p>`,
    });
  },
};
