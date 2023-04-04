import {
  getModelForClass,
  ModelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { Eng } from "./eng.model.ts";

@ModelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
  },
})
class ResetPassword {
  @prop({
    type: String,
    required: true,
  })
  email: string;

  @prop({
    type: String,
    required: true,
  })
  token: string;
}

const ResetPasswordModel = getModelForClass(ResetPassword, {
  options: {
    customName: "resetpassword",
  },
});

export default ResetPasswordModel;
