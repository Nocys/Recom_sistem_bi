const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');

const env = require('./config/env');
const { pool, testConnection } = require('./config/db');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const errorHandler = require('./middleware/errorHandler');
const { sendError, sendSuccess } = require('./utils/response');

const app = express();
const PgSession = connectPgSimple(session);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'sessions'
    }),
    name: 'interior.sid',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/health', async (req, res) => {
  try {
    const database = await testConnection();

    return sendSuccess(res, 'Backend server is running', {
      service: 'interior-recommendation-backend',
      database: 'connected',
      currentTime: database.current_time
    });
  } catch (err) {
    return sendError(res, 'Backend server is running, but database is disconnected.', 503, {
      service: 'interior-recommendation-backend',
      database: 'disconnected',
      reason: err.message
    });
  }
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/admin/products', adminProductRoutes);
app.use('/interactions', interactionRoutes);
app.use('/recommendations', recommendationRoutes);

app.use((req, res) => {
  return sendError(res, 'Route not found.', 404);
});

app.use(errorHandler);

const startServer = async () => {
  try {
    const database = await testConnection();
    console.log(`PostgreSQL connected at ${database.current_time}`);
  } catch (err) {
    console.error('PostgreSQL connection test failed:', err.message);
  }

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

startServer();

module.exports = app;
