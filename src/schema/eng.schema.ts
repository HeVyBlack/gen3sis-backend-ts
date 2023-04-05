import { z } from "zod";
import { countries } from "../utils/variables.ts";
import { validate as validateEmail } from "email-validator";
import { isArray } from "../utils/functions.ts";

const certsSchema = z.object({
  cert: z
    .string({
      invalid_type_error: "Cert must be a string!",
      required_error: "Cert is required!",
    })
    .max(15, "Cert can't contain more than 15 letters")
    .min(2, "Cert must contain at least 2 letters!"),
});

export const EngformSchema = z.object({
  body: z.object(
    {
      name: z
        .string({
          invalid_type_error: "Name must be a string!",
          required_error: "Name is required!",
          description: "Engineer's name",
        })
        .nonempty("Name can't be empty!")
        .min(3, "Name must contain at least 3 letters!")
        .max(80, "Name can't contain more than 80 letters!"),

      last_name: z
        .string({
          invalid_type_error: "Last name must be a string!",
          required_error: "Last name is required!",
          description: "Engineer's last name",
        })
        .nonempty("Last name can't be empty!")
        .min(3, "Last name must contain at least 3 letters!")
        .max(80, "Last name can't contain more than 80 letters!"),
      country: z.enum(countries as [string], {
        invalid_type_error: "Invalid type for Country",
        required_error: "Country is required!",
        description: "Enginner's country!",
      }),
      city: z
        .string({
          invalid_type_error: "City must be a string!",
          required_error: "City is required!",
          description: "Enginner's city!",
        })
        .nonempty("City con't be empty!")
        .min(3, "City must contain at least 3 letters!")
        .max(80, "City can't contain more than 80 letters!"),
      level: z.enum(["profesional", "technical", "technologist"], {
        invalid_type_error: "Level must be a valid string!",
        required_error: "Level is required!",
        description: "Enginner's level!",
      }),
      exp_plat: z
        .union(
          [
            z
              .array(
                z.string({
                  invalid_type_error: "Platform expirience must be a string!",
                  required_error: "Platform expirience is required!",
                })
              )
              .nonempty("Platform expirience cant't be empty")
              .max(6, "Platform expirience can't contain more than 6 items!"),
            z.literal(false, {
              invalid_type_error: "Platform expirience must be a false!",
              required_error: "Platform expirience is required!",
            }),
          ],
          {
            invalid_type_error: "Platform expirience must be a array or false!",
            required_error: "Platform expirience is required!",
          }
        )
        .optional()
        .default(false),
      time_in_imp: z
        .number({
          invalid_type_error: "Expirience time must be a number!",
          required_error: "Expirience time is required!",
        })
        .min(0, "Expirience time can't be minor than 0")
        .max(80, "Expirience time can't be more than 80"),
      certs: z.array(certsSchema).optional().default([]),
      exp: z
        .string({
          invalid_type_error: "Expirience must be a string!",
          required_error: "Expirience is required!",
        })
        .min(3, "Expirience must contain at least 3 letters!")
        .max(3000, "Expirience can't contain more than 3000 letters!"),
      exp_in_pro_dir: z.boolean({
        invalid_type_error:
          "Expirience in proyect direction must be a boolean!",
        required_error: "Expirience in proyect is required!",
      }),
      exp_in_exec: z.boolean({
        invalid_type_error: "Expirience in execution must be a boolean!",
        required_error: "Expirience in execution is required!",
      }),
      tel: z.union(
        [
          z
            .string({
              invalid_type_error: "Tel must be a string!",
              required_error: "Tel is required!",
            })
            .min(10, "Tel must contain at least 10 letters!")
            .max(12, "Tel can't contain more than 12 letters!"),
          z
            .number({
              invalid_type_error: "Tel must be a number!",
              required_error: "Tel is required!",
            })
            .transform((arg, ctx) => {
              const parsed = String(arg);
              if (!parsed) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Tel is invalid!",
                });
                return z.NEVER;
              }
              if (parsed.length < 10) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Tel must contain at least 10 numbers!",
                });
                return z.NEVER;
              }
              if (parsed.length > 12) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Tel con't contain more than 10 numbers!",
                });
                return z.NEVER;
              }
              return parsed;
            }),
        ],
        {
          invalid_type_error: "Tel must be a string or number",
          required_error: "Tel is required!",
        }
      ),
      email: z
        .string({
          invalid_type_error: "Email must be a string!",
          required_error: "Email is required!",
        })
        .nonempty("Email can't be empty!")
        .email("Email must be a valid email!"),
    },
    {
      invalid_type_error: "Body must be an object!",
      required_error: "Body is required!",
    }
  ),
});

export const CustomEngFormSchema = {
  name(i: unknown) {
    if (!i) return "Nombre es requerido";
    if (typeof i !== "string") return "Nombre debe ser string";
    if (i.length < 3) return "Nombre no puede contener menos de 3 letras";
    if (i.length > 80) return "Nombre no puede contener mas de 80 letras";
    return { status: true };
  },
  last_name(i: unknown) {
    if (!i) return "Nombre es requerido";
    if (typeof i !== "string") return "Nombre debe ser string";
    if (i.length < 3) return "Nombre no puede contener menos de 3 letras";
    if (i.length > 80) return "Nombre no puede contener mas de 80 letras";
    return { status: true };
  },
  country(i: unknown) {
    if (!i) return "Pais es requerido";
    if (typeof i !== "string") return "Pais debe ser un string";
    if (!countries.includes(i)) return "Pais no es valido";
    return { status: true };
  },
  city(i: unknown) {
    if (!i) return "Ciudad es requerida";
    if (typeof i !== "string") return "Ciudad debe ser un string";
    if (i.length < 3) return "Ciudad no puede contener menos de 3 letras";
    if (i.length > 80) return "Ciudad no puede contener mas de 80 letras";
    return { status: true };
  },
  level(i: unknown) {
    if (!i) return "Nivel es requerido";
    if (typeof i !== "string") return "Nivel de ser un string";
    if (!["profesional", "technical", "technologist"].includes(i))
      return "Nivel es invalido";
    return { status: true };
  },
  exp_plat(i: unknown) {
    if (typeof i === "boolean") {
      if (i) return "Experiencia en Plataformas no puede ser true";
      return { status: true };
    } else {
      const base = [
        "implementation",
        "cyber_security",
        "cloud_services",
        "infrastructure",
        "structured_cabling",
      ];
      const msg: string[] = [];
      if (!i) return "Experiencia en Plataformas es requerido";
      if (!isArray(i)) return "Experiencia en Plataformas debe ser un array";
      const aux = [...(i as string[])];
      aux.forEach((e, index) => {
        if (typeof e !== "string") {
          msg.push(`Experiencia #${index + 1} debe ser un string`);
        } else if (!base.includes(e)) {
          const min = 3;
          const max = 80;
          if ((e as string).length < min)
            msg.push(
              `Experiencia #${
                index + 1
              } no puede contener menos de ${min} letras`
            );
          else if ((e as string).length > max)
            msg.push(
              `Experiencia #${index + 1} no puede contener mas de ${max} letras`
            );
        }
      });
      if (msg.length > 0) return msg;
      return { status: true };
    }
  },
  time_in_imp(i: unknown) {
    const min = 0;
    const max = 80;
    if (typeof i !== "number")
      return "Tiempo de experiencia en implementacion debe ser un numero";
    if (i < min)
      return `Tiempo de experiencia en implementacion no puede ser menor a ${min}`;
    if (i > max)
      return `Tiempo de experiencia en implementacion no puede ser mayor a ${max}`;
    return { status: true };
  },
  certs(i: unknown) {
    const msg: string[] = [];
    if (!i) return "Certificados es necesario";
    if (!isArray(i)) return "Certificados debe ser un array";
    const aux = [...(i as [{ cert: string }])];
    if (aux.length === 0) return { status: true };
    i = aux.map((cert, index) => {
      const max = 15;
      const min = 2;
      if (!cert.cert)
        msg.push(`El valor cert del certificado #${index} es necesario`);
      else {
        if (typeof cert.cert !== "string")
          msg.push(
            `El valor cert del certificado #${index} debe ser un string`
          );
        else if (cert.cert.length < min)
          msg.push(
            `El valor cert del certificado #${index} no puede contener menos de ${min} letras`
          );
        else if (cert.cert.length > max)
          msg.push(
            `El valor cert del certificado #${index} no puede contener mas de ${max} letras`
          );
        else return { cert: cert.cert };
      }
    });
    if (msg.length > 0) return msg;
    return { status: true, value: i };
  },
  exp(i: unknown) {
    if (typeof i !== "string") return "Experiencia debe ser un string";
    if (i.length < 3) return "Experiencia no puede contener menos de 3 letras";
    if (i.length > 3000)
      return "Experiencia no puede contener menos de 3000 letras";
    return { status: true };
  },
  exp_in_pro_dir(i: unknown) {
    if (typeof i !== "boolean")
      return "Experiencia en direccion de proyectos debe ser booleano";
    return { status: true };
  },
  exp_in_exec(i: unknown) {
    if (typeof i !== "boolean")
      return "Experiencia en ejecucion de proyectos debe ser booleano";
    return { status: true };
  },
  tel(i: unknown) {
    if (typeof i !== "number") return "El telefono debe ser un numero";
    if (String(i).length < 10)
      return "El telefono no puede contener menos de 10 numeros";
    if (String(i).length > 12)
      return "El telefono no puede contener mas de 12 numeros";

    return { status: true };
  },
  email(i: unknown) {
    if (!i) return "El correo es requerido";
    if (typeof i !== "string") return "El correo debe ser un string";
    if (!validateEmail(i)) return "El correo debe ser valido";
    return { status: true };
  },
};

export type EngformSchemaType = z.infer<typeof EngformSchema>["body"];
