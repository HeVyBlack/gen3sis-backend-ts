import { prop, getModelForClass } from "@typegoose/typegoose";

export class Role {
  @prop({
    type: String,
    required: true,
  })
  name: string;
}

const RoleModel = getModelForClass(Role, {
  options: {
    customName: "Roles",
  },
});

export default RoleModel;
