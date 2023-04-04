const express = require('express');
const rateLimit  = require('express-rate-limit');
const {errorMiddleware} = require('./middleware/errors');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
const mongoose = require('mongoose');
const cors=require('cors');

const app = express();
app.use(express.json());
app.use(cors({origin:true}));

// Connection to DataBase
mongoose.connect(process.env.DB_URI)
.then(()=>{
    app.listen(process.env.PORT);
    console.log(`Connected to PORT: ${process.env.PORT}`);
})
.catch((err)=>{
    console.log(err);
});

// Applying Global Rate Limiter
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 100,
	standardHeaders: true,
	legacyHeaders: false
});
app.use(limiter);

// Global Error Handling
app.use(errorMiddleware);

// Routes
app.use('/api/',authRoutes);