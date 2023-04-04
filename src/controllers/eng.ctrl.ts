import { Request, Response } from "express";
import EngModel, { Eng } from "../models/eng.model.ts";
import logger from "../utils/logger.ts";
import { CError, banEmailList } from "../utils/variables.ts";
import { SignSchemaType } from "../schema/basic.schema.ts";
import RoleModel from "../models/role.model.ts";
import transporter from "../config/nodemailer.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { dotEnv } from "../config/initial.setup.ts";
import { validate as validateEmail } from "email-validator";
import ResetPasswordModel from "../models/reset.pasword.model.ts";
import cron from "cron";

const CronJob = cron.CronJob;

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

export async function engConfirmEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json("The token is required!");

    try {
      const decoded = jwt.verify(
        String(token),
        dotEnv.SECRET_WORD
      ) as JwtPayload;
      const user = await EngModel.findOne({ code: decoded.code });

      if (!user) return res.status(404).json("User not found!");

      if (user.verified_email)
        return res.status(400).json("User already verify its email!");

      user.verified_email = true;

      await user.save();
    } catch (e) {
      return res.status(403).json("Invalid token!");
    }

    return res.status(200).json("Email verified!");
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
    }
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

export async function engForgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json("Email is required!");
    if (!validateEmail(email))
      return res.status(400).json("Email must be valid!");

    const user = await EngModel.findOne({ email });

    if (user) {
      const aux = await ResetPasswordModel.findOne({ email });

      if (aux) {
        try {
          jwt.verify(aux.token, dotEnv.SECRET_RESET_WORD);
          return res
            .status(400)
            .json("User already have a reset password petition!");
        } catch (e) {
          await ResetPasswordModel.findOneAndDelete({ email });
        }
      }

      const token = await utils.sendForgotPasswordEmail(user);

      await ResetPasswordModel.create({ token, email: user.email });

      const job = new CronJob(
        "* 10 * * * *",
        async function () {
          await ResetPasswordModel.deleteOne({ email });
          job.stop();
        },
        null,
        true
      );

      job.start();
    }
  } catch (e) {
    if (e instanceof Error) logger.error(e.message);
    return res.status(500).json("Internal server error!");
  }

  return res.status(200).json("If email is found, an email will be send!");
}

export async function engResetPassword(req: Request, res: Response) {
  try {
    const { new_password, confirm_password } = req.body;
    if (!new_password) return res.status(400).json("New password is required!");
    if (!confirm_password)
      return res.status(400).json("Confirm password is required!");

    if (typeof new_password !== "string")
      return res.status(400).json("New password must be a string!");

    if (typeof confirm_password !== "string")
      return res.status(400).json("Confirm password must be a string!");

    if (new_password !== confirm_password)
      return res.status(400).json("Passwords aren't equal!");

    const { token } = req.query;
    if (!token) return res.status(400).json("Token is required!");

    const reset = await ResetPasswordModel.findOne({ token: token });

    if (!reset)
      return res.status(404).json("User hasn't a reset password petition");

    const decoded = jwt.verify(
      String(reset.token),
      dotEnv.SECRET_RESET_WORD
    ) as JwtPayload;

    const user = await EngModel.findOne({ code: decoded.code });

    if (!user) return res.status(404).json("User not found!");

    if (await user.comparePassword(new_password))
      return res
        .status(400)
        .json("The new password is the same as the actual password!");

    if (user.email !== reset.email)
      return res.status(400).json("Email don't match");

    user.password = await user.encryptPassword(new_password);

    Promise.all([
      user.save(),
      ResetPasswordModel.findOneAndDelete({ email: user.email }),
      utils.sendSuccessResetPasswordEmail(user),
    ]);

    return res.status(200).json("Password reset successfully!");
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
  async sendForgotPasswordEmail(user: Eng) {
    const { email } = user;
    const code = user.code;

    const token = jwt.sign({ code }, dotEnv.SECRET_RESET_WORD, {
      expiresIn: "10min",
    });

    Promise.all([
      transporter.sendMail({
        from: `'Soporte Gen3sis' <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Cambia tu contraseña`,
        html: `<h1>Para restaurar la contraseña, da click al siguiente link:</h1>
                <a href="${process.env.FRONTEND_HOST}/eng/new-password?token=${token}" target="_blank"><h2><strong>click</strong></h2></a>`,
      }),
    ]);

    return token;
  },
  async sendSuccessResetPasswordEmail(user: Eng) {
    const { email } = user;

    Promise.all([
      transporter.sendMail({
        from: `'Soporte Gen3sis' <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Contraseña cambiada satisfactoriamente!`,
        html: `<h1>Acabas de cambiar tu contraseña</h1>
               <h2>Si no fuiste tú, cambiala! <a href="${process.env.FRONTEND_HOST}/eng/restore-password" target="_blank"><h2><strong>aquí</strong></h2></a><h2>`,
      }),
    ]);
  },
};
