const { body, param, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  return next();
};

const strongPassword = body('password')
  .notEmpty().withMessage('Password is required')
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  .withMessage('Password must include uppercase, lowercase, number, and symbol');

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer((value) => {
      const normalized = String(value).replace(/[^\d+]/g, '');
      return normalized.startsWith('+') ? normalized : `+${normalized}`;
    })
    .isMobilePhone('any', { strictMode: true })
    .withMessage('Enter a valid mobile number with country code'),
  strongPassword,
];

const loginRules = [
  body('identifier')
    .optional()
    .trim()
    .notEmpty().withMessage('Email or mobile number is required'),
  body('email')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .trim(),
  body().custom((value) => {
    const identifier = value.identifier || value.email || value.phone;
    if (!identifier) throw new Error('Email or mobile number is required');
    return true;
  }),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
];

const resetPasswordRules = [
  param('token').trim().notEmpty().withMessage('Reset token is required'),
  strongPassword,
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
};
