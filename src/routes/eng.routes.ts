import { Router } from "express";
import {
  customSchemaValidator,
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
  engPostInfoForm,
  engResetPassword,
  engSignIn,
} from "../controllers/eng.ctrl.ts";
import { getEngUser } from "../controllers/eng.ctrl.ts";
import { CustomEngFormSchema, EngformSchema } from "../schema/eng.schema.ts";
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
  [validateEngToken, schemaValidation(ResetPasswordSchema)],
  engResetPassword
);

router.post(
  "/post-infoform",
  [
    validateEngToken,
    schemaValidation(EngformSchema),
    customSchemaValidator(CustomEngFormSchema),
  ],
  engPostInfoForm
);

export default router;
