const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const netlifySiteName = process.env.NETLIFY_SITE_NAME || 'communityresourceboard';
const legacyNetlifySiteName = 'community-resource-board';

const isAllowedNetlifyOrigin = (origin) => {
  if (!origin) return false;

  try {
    const { hostname } = new URL(origin);
    const siteNames = [netlifySiteName, legacyNetlifySiteName];

    return siteNames.some((name) => {
      const primaryHost = `${name}.netlify.app`;
      const previewSuffix = `--${name}.netlify.app`;
      return hostname === primaryHost || hostname.endsWith(previewSuffix);
    });
  } catch {
    return false;
  }
};

const parseAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
  const configured = configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const productionFallback = [
    process.env.FRONTEND_URL,
    `https://${netlifySiteName}.netlify.app`,
    `https://${legacyNetlifySiteName}.netlify.app`,
  ].filter(Boolean);

  if (configured.length > 0) {
    return [...new Set([...configured, ...productionFallback])];
  }

  if (isProduction) {
    return productionFallback;
  }

  return [
    ...productionFallback,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
  ];
};

const allowedOrigins = new Set(parseAllowedOrigins());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || (isProduction && isAllowedNetlifyOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  optionsSuccessStatus: 204,
};

app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors(corsOptions));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 30 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.json({
    message: 'Community Resource Board API',
    version: '1.0.0',
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin is not allowed' });
  }

  console.error('Server error:', err.message);

  return res.status(status).json({
    message: status === 500 && isProduction ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = Number(process.env.PORT) || 5000;
let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Set a different PORT and retry.`);
      } else {
        console.error('Server listener error:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Startup error:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Shutdown error:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
