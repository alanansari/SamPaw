const express = require('express');
const rateLimit  = require('express-rate-limit');
const {errorMiddleware} = require('./middleware/errors');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
require('dotenv').config();
const mongoose = require('mongoose');
const cors=require('cors');
const cookieparser = require('cookie-parser');
const cluster = require('cluster');
const os = require('os');
const status = require('express-status-monitor');
const fileUpload = require('express-fileupload')

const totalCPUs = os.cpus().length;


if (cluster.isPrimary) {
	console.log(`Primary ${process.pid} is running`);
  
	// Fork workers.
	for (let i = 0; i < totalCPUs; i++) {
	  cluster.fork();
	}
  
	cluster.on('exit', (worker, code, signal) => {
	  console.log(`worker ${worker.process.pid} died`);
	});
} else {
	const app = express();
	app.use(fileUpload({
		useTempFiles:true,
		limits:{fileSize: 5*1024*1024}
	  }));
	
	app.use(express.json());
	app.use(cors({origin:true}));
	app.use(express.urlencoded({ extended: false }));
	app.use(cookieparser());

	// Connection to DataBase
	mongoose.connect(process.env.DB_URI)
	.then(()=>{
		app.listen(process.env.PORT);
		console.log(`Connected to PORT: ${process.env.PORT}`);
	})
	.catch((err)=>{
		console.log(err);
	});

	// status monitor
	app.use(status());

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
	app.use('/api/',authRoutes,errorMiddleware);
	app.use('/api/home',homeRoutes,errorMiddleware);
}

