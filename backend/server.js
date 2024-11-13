const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const AppError = require('./utils/appError'); // Make sure you have this file
const authRoutes = require('./routes/authRoutes');

// Initialize express and configuration
dotenv.config();
require('./models/dbConnect');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); // Include to handle JSON payloads in requests

// Routes
app.use('/auth/', authRoutes);

// Handle unmatched routes with custom AppError
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler (if you have one)
app.use((err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err); // Log the error details for debugging
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
