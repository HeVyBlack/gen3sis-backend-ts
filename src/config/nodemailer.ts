import { createTransport } from "nodemailer";
import { dotEnv } from "./initial.setup.ts";

const transporter = createTransport({
  host: dotEnv.MAIL_HOST,
  port: dotEnv.MAIL_PORT,
  secure: false,
  auth: {
    user: dotEnv.MAIL_USER,
    pass: dotEnv.MAIL_PASS,
  },
});

export default transporter;
