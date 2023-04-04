import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
} from "@typegoose/typegoose";
import random from "random";
import { v4 } from "uuid";
import { Role } from "./role.model.ts";
import { CError, countries } from "../utils/variables.ts";
import argon2 from "argon2";
import mongoose from "mongoose";

class Info {
  @prop({ type: String, trim: true })
  name: string;

  @prop({ type: String, trim: true })
  last_name: string;

  @prop({ type: String, trim: true, enum: countries })
  country: typeof countries;

  @prop({ type: String, trim: true })
  city: string;

  @prop({ type: String, trim: true })
  level: string;

  @prop({ type: mongoose.Schema.Types.Mixed })
  exp_plat: [string] | boolean;

  @prop({ type: Number })
  time_in_imp: number;

  @prop({ type: String, trim: true })
  certs: [{ cert: string }];

  @prop({ type: String, trim: true })
  exp: string;

  @prop({ type: String, trim: true })
  exp_in_pro_dir: string;

  @prop({ type: String, trim: true })
  exp_in_exec: string;

  @prop({ type: Number })
  tel: number;

  @prop({ type: String, trim: true })
  email: string;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Eng {
  @prop({
    type: Number,
    required: true,
    default: random.int(1000000000, 1999999999),
  })
  id_code: number;

  @prop({
    type: String,
    required: true,
    default: v4(),
  })
  code: string;

  @prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
  })
  email: string;

  @prop({
    type: String,
    required: true,
    minlength: 6,
  })
  password: string;

  @prop({
    type: Boolean,
    required: true,
    default: false,
  })
  verified_email: boolean;

  @prop({
    type: Boolean,
    required: true,
    default: false,
  })
  verified_info: boolean;

  @prop({
    type: Boolean,
    required: true,
    default: false,
  })
  user_checked: boolean;

  @prop({
    ref: () => Role,
  })
  roles: Ref<Role>[];

  info?: Info;

  public async encryptPassword(pasword: string) {
    const hash = await argon2.hash(pasword);
    return hash;
  }

  public async comparePassword(password: string) {
    try {
      return await argon2.verify(this.password, password);
    } catch (e) {
      throw new CError("Error while verifying password!");
    }
  }
}

const EngModel = getModelForClass(Eng, {
  options: {
    customName: "Engs",
  },
});

export default EngModel;
