require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const userRoutes = require('./routes/users');
const recMovieListRoutes = require('./routes/recMovieList')
const favouritesRoutes = require('./routes/favourites');
const likeRoutes = require('./routes/listLike');
const commentRoutes = require('./routes/listComment')
const pushSubRoutes = require('./routes/pushSub');
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDoc = YAML.load('./swagger.yaml')
const webpush = require('web-push')
const app = express();


webpush.setVapidDetails(
  'mailto:your@mail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

app.use(cors());
app.use(express.json());

// Database connection
const dbUri = process.env.NODE_ENV === 'test' ? global.__MONGO_URI__ : process.env.MONGODB_URI;
connectDB(dbUri);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/lists', recMovieListRoutes);
app.use('/api/like', likeRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api', pushSubRoutes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
