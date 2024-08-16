const Joi = require("joi");

const userSchema = Joi.object({
  _id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Invalid ID format, must be a valid UUID",
    "any.required": "ID is a required field",
  }),
  username: Joi.string().min(5).max(15).required().messages({
    "string.base": "Username type should be text",
    "string.empty": "Username cannot be empty",
    "string.min": "Username should have a minimum length of 5",
    "string.max": "Username should have a maximum length of 15",
    "any.required": "Username is a required field",
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.empty": "email cannot be empty",
    "any.required": "email is a required field",
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*()_+\\-=[\\]{};:'\",.<>/?\\|~`]*$"))
    .required()
    .messages({
      "string.empty": "Password cannot be empty",
      "string.min": "Password should have a minimum length of 8",
      "string.pattern.base":
        "Password can only contain letters, digits, and special characters",
      "any.required": "Password is a required field",
    }),
});

const validateUser = (user) => {
  const { error, value } = userSchema.validate(user, { abortEarly: false });

  if (error) {
    return {
      valid: false,
      message: error.details.map((detail) => detail.message).join(", "),
    };
  } else {
    return { valid: true, user: value };
  }
};

module.exports = {
  validateUser,
};
