const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validationMiddleware = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Routes
router.post('/register', validationMiddleware.validateRegistration, userController.registerUser);
router.post('/login', validationMiddleware.validateLogin, userController.loginUser);

router.get('/get', authMiddleware.validateAccessToken, userController.getUserData);
router.delete('/delete', authMiddleware.validateAccessToken, userController.deleteUserData);

router.get('/list/:page', userController.getUserList);

router.post('/address', validationMiddleware.validateAddress, authMiddleware.validateAccessToken, userController.addUserAddress);
router.get('/get/:id', authMiddleware.validateAccessToken, userController.getUserById);

module.exports = router;