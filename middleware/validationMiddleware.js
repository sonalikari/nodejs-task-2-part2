const { validationResult, body } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');

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

exports.validateLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required').custom(async (password, { req }) => {
        const { username } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid username or password');
        }
    }),
];

exports.validateAddress=[
    body('address').notEmpty().isString(),
    body('city').notEmpty().isString(),
    body('state').notEmpty().isString(),
    body('pincode').notEmpty().isString().matches(/^\d{6}$/).withMessage('Invalid pincode format'),
    body('phone').notEmpty().isString().matches(/^\d{10}$/).withMessage('Invalid phone number format'),
];