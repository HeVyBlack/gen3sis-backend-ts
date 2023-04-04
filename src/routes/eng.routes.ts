import { Router } from "express";
import {
  schemaValidation,
  signValidator,
  validateEngToken,
} from "../middlewares/validators.ts";
import {
  EmailSchema,
  ResetPasswordSchema,
  SignSchema,
} from "../schema/basic.schema.ts";
import {
  engConfirmEmail,
  engForgotPassword,
  engResetPassword,
  engSignIn,
} from "../controllers/eng.ctrl.ts";
import { getEngUser } from "../controllers/eng.ctrl.ts";
const router = Router();

router.post(
  "/sign-in",
  [schemaValidation(SignSchema), signValidator],
  engSignIn
);

router.get("/get-user", [validateEngToken], getEngUser);

router.patch("/confirm-email", engConfirmEmail);

router.post(
  "/forgot-password",
  [schemaValidation(EmailSchema)],
  engForgotPassword
);

router.patch(
  "/reset-password",
  [schemaValidation(ResetPasswordSchema)],
  engResetPassword
);

export default router;
