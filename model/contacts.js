const Joi = require("joi");

const contactSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.guid": "Invalid Id format, must be a valid UUID",
    "any.required": "Id is a required field",
  }),
  name: Joi.string().min(5).max(15).required().messages({
    "string.base": "Contact name type should be text",
    "string.empty": "Contact name cannot be empty",
    "string.min": "Contact name should have a minimum length of 5",
    "string.max": "Contact name should have a maximum length of 15",
    "any.required": "Contact name is a required field",
  }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9]{11}$/)
    .required()
    .messages({
      "string.base": "Phone number should be a string",
      "string.empty": "Phone number cannot be empty",
      "string.pattern.base":
        "Phone number must be a valid format with 11 digits",
      "any.required": "Phone number is a required field",
    }),

  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be a valid email format",
    "any.required": "Email is a required field",
  }),

  photo: Joi.string().optional().messages({
    "string.base": "Photo should be a valid file path or URL",
  }),
});

const validateContact = (contact) => {
  const { error, value } = contactSchema.validate(contact, {
    abortEarly: false,
  });

  if (error) {
    return {
      valid: false,
      message: error.details.map((detail) => detail.message).join(", "),
    };
  } else {
    return { valid: true, contact: value };
  }
};

module.exports = {
  validateContact,
};
