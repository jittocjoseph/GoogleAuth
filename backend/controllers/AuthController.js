const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

// Helper function to send OTP email
const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD }
    });

    await transporter.sendMail({
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    });
};

// Signup function
const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
         console.log(hashedPassword)

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        const otpEntry = new Otp({ email, otp: otpCode, otpExpires });
        await otpEntry.save();

        await sendOtpEmail(email, otpCode);
        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Error signing up' });
    }
};

// Verify OTP function
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
        if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

        await User.updateOne({ email }, { isVerified: true });
        await Otp.deleteMany({ email });

        res.status(200).json({ message: 'Account verified successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error verifying OTP' });
    }
};

// Resend OTP function
const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, otpExpires },
            { upsert: true, new: true }
        );

        await sendOtpEmail(email, otpCode);
        res.status(200).json({ message: 'New OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Error resending OTP' });
    }
};

// Signin function
const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        if (!user.isVerified) return res.status(400).json({ error: 'Account not verified' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, password: '', isVerified: true });
            await user.save();
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Logged in successfully', token: jwtToken });
    } catch (error) {
        res.status(500).json({ error: 'Google login failed' });
    }
};

module.exports = { signup, verifyOtp, resendOtp, signin, googleLogin };