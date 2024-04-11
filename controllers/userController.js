const bcrypt = require('bcrypt');
const User = require('../models/user');
const md5 = require('md5');
const AccessToken = require('../models/access_token');
const Address = require('../models/Address');

exports.registerUser = async (req, res) => {
    try {
        const { username, password, confirmPassword, email, firstname, lastname } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        const hashedPassword = await bcrypt.hash(password, 8);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            firstname,
            lastname
        });
        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: "Error occurred! Try Again" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const accessToken = md5(Math.random().toString());
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);

        await AccessToken.create({
            user_id: user._id,
            access_token: accessToken,
            expiry: expiry
        });
        res.status(200).json({ access_token: accessToken });
    } catch (error) {
        res.status(500).json({ error: 'Error while logging in the user' });
    }
};

exports.getUserData = async (req, res) => {
    try {
        const accessToken = req.headers['access_token'];
        const token = await AccessToken.findOne({ access_token: accessToken });

        if (!token || token.expiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid access token or token expired' });
        }
        const user = await User.findById(token.user_id);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error while fetching user data' });
    }
};

exports.deleteUserData = async (req, res) => {
    try {
        const accessToken = req.headers['access_token'];
        const token = await AccessToken.findOne({ access_token: accessToken });

        if (!token || token.expiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid access token or token expired' });
        }
        const user = await User.findById(token.user_id);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        await User.findByIdAndDelete(token.user_id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting user data' });
    }
};

exports.getUserList = async (req, res) => {
    try {
        const page = parseInt(req.params.page);
        if (isNaN(page) || page <= 0) {
            return res.status(400).json({ error: 'Invalid page number' });
        }
        const limit = 10;
        const skip = (page - 1) * limit;
        const userList = await User.find().skip(skip).limit(limit);

        res.json(userList);
    } catch (error) {
        res.status(500).json({ error: 'Error while fetching user list' });
    }
};

exports.addUserAddress = async (req, res) => {
    try {
        const { address, city, state, pincode, phone } = req.body;
        const userId = req.user._id; 

        const newAddress = new Address({
            userId: userId,
            address,
            city,
            state,
            pincode,
            phone
        });

        await newAddress.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        user.addresses.push(newAddress._id);
        await user.save();

        res.status(200).json({ message: 'Address added successfully' });
    } catch (error) {
        console.error('Error adding user address:', error);
        res.status(500).json({ error: 'Error while adding user address' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).populate('addresses');

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Error while fetching user data' });
    }
};

