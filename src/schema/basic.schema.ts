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

export const EmailSchema = z.object({
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
    },
    {
      invalid_type_error: "Body must be an object!",
      required_error: "Body is required!",
    }
  ),
});

export const ResetPasswordSchema = z.object({
  body: z.object(
    {
      new_password: z
        .string({
          invalid_type_error: "New password must be a string!",
          required_error: "New password is required!",
        })
        .nonempty("New password is required!")
        .min(6, "New password is too short!"),
      confirm_password: z
        .string({
          invalid_type_error: "Confirm password must be a string!",
          required_error: "Confirm password is required!",
        })
        .nonempty("Confirm password is required!")
        .min(6, "Confirm password is too short!"),
    },
    {
      invalid_type_error: "Body must be an object!",
      required_error: "Body is required!",
    }
  ),
});

export type SignSchemaType = z.infer<typeof SignSchema>["body"];
