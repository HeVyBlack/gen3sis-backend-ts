import { z } from "zod";

export const SignSchema = z.object({
  body: z.object(
    {
      email: z
        .string({
          invalid_type_error: "Email must be a string!",
          required_error: "Email is required!",
        })
        .nonempty("Email is required!")
        .email({
          message: "Provide a valid email!",
        }),
      password: z
        .string({
          invalid_type_error: "Password must be a string!",
          required_error: "Password is required!",
        })
        .nonempty("Password is required!")
        .min(6, "Password is too short!"),
    },
    {
      invalid_type_error: "Body must be an object!",
      required_error: "Body is required!",
    }
  ),
});

export type SignSchemaType = z.infer<typeof SignSchema>["body"];
