import { Router } from "express";
import {
  schemaValidation,
  signValidator,
  validateEngToken,
} from "../middlewares/validators.ts";
import { SignSchema } from "../schema/basic.schema.ts";
import { engSignIn } from "../controllers/eng.ctrl.ts";
import { getEngUser } from "../controllers/eng.ctrl.ts";
const router = Router();

router.post(
  "/sign-in",
  [schemaValidation(SignSchema), signValidator],
  engSignIn
);

router.get("/get-user", [validateEngToken], getEngUser);

export default router;
