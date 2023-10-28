const express = require('express');
const rateLimit  = require('express-rate-limit');
const {errorMiddleware} = require('./middleware/errors');
const authRoutes = require('./routes/authRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const homeRoutes = require('./routes/homeRoutes');
require('dotenv').config();
const cors=require('cors');
const cluster = require('cluster');
const os = require('os');
const helmet = require('helmet');
const status = require('express-status-monitor');
const fileUpload = require('express-fileupload');
const connectDB = require('./connectDB');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')


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
		useTempFiles:false,
		limits:{fileSize: 5*1024*1024}
	  }));
	
	app.use(express.json());
	app.use(cors({origin:true}));
	app.use(express.urlencoded({ extended: false }));

	// Connection to DataBase
	connectDB();

	app.listen(process.env.PORT);
    console.log(`Connected to port ${process.env.PORT}`);

	// status monitor
	app.use(status());

	// express app security
	app.use(helmet());

	// Applying Global Rate Limiter
	const limiter = rateLimit({
		windowMs: 1 * 60 * 1000, // 1 minutes
		max: 30,				// max 30 requests
		standardHeaders: true,
		legacyHeaders: false
	});
	app.use(limiter);

	// Global Error Handling
	app.use(errorMiddleware);

	// Routes
	app.use('/api/home',homeRoutes,errorMiddleware);
	app.use('/api/admin',adminRoutes,errorMiddleware);
	app.use('/api/col',collectorRoutes,errorMiddleware);
	app.use('/api',authRoutes,errorMiddleware);
	app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
}

