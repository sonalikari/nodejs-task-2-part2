const { validationResult, body } = require('express-validator');

exports.validateRegistration = [
    body('username').notEmpty().isString(),
    body('password').notEmpty().isString(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('email').notEmpty().isEmail(),
    body('firstname').notEmpty().isString(),
    body('lastname').notEmpty().isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateLogin=[
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];