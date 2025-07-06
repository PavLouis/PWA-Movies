// seed/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Movie = require('../models/Movie');
const ListMovie = require('../models/ListMovie');
const { connectDB, getBucket } = require('../config/db');
const RecMovieList = require('../models/RecMovieList');

// TMDB Configuration
const API_KEY = 'd9fc022845c710ff39499a8d72b9d7b1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

const getPopularMovies = async () => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US`
  );
  return response.json();
};

const downloadAndUploadImage = async (imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return new Promise((resolve, reject) => {
      const uploadStream = getBucket().openUploadStream(filename, {
        contentType: 'image/jpeg'
      });

      uploadStream.on('finish', (uploadResult) => {
        resolve(uploadResult);
      });

      uploadStream.on('error', reject);
      uploadStream.write(buffer);
      uploadStream.end();
    });
  } catch (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

const seedDatabase = async () => {
  try {
    // Wait for MongoDB to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await RecMovieList.deleteMany({})
    await ListMovie.deleteMany({})
    const bucket = getBucket();
    const files = await bucket.find({}).toArray();
    for (const file of files) {
      await bucket.delete(file._id);
    }
    
    console.log('Existing data cleared');

    // Create admin user
    const hashedPassword = await bcrypt.hash('Strongpassword1!', 10);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      isAdmin: true
    });

    const randomUser = await User.create({
        username: 'dede',
        email: 'dede@mail.com',
        password: hashedPassword,
        isAdmin: false
      });

    console.log('Admin user created');
    console.log('RandomUser user created');

    // Get popular movies from TMDB
    const { results: movies } = await getPopularMovies();
    const selectedMovies = movies.slice(0, 10);

    // Create movies with downloaded images
    for (const movieData of selectedMovies) {
      const filename = `${Date.now()}-${movieData.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      
      try {
        const imageUrl = `${IMAGE_BASE_URL}${movieData.poster_path}`;
        const uploadResult = await downloadAndUploadImage(imageUrl, filename);

        const movie = new Movie({
          title: movieData.title,
          releaseYear: new Date(movieData.release_date).getFullYear(),
          description: movieData.overview,
          genre: movieData.genre_ids[0].toString(), // You might want to map this to actual genre names
          voteAverage: movieData.vote_average,
          image: {
            fileId: uploadResult._id,
            filename: filename,
            contentType: 'image/jpeg'
          }
        });

        await movie.save();
        console.log(`Created movie: ${movie.title}`);
      } catch (error) {
        console.error(`Error creating movie ${movieData.title}:`, error);
      }
    }

    const recommendedLists = [
        {
          userId: randomUser._id,
          title: "Best Movies",
          description: "A collection of mind-bending films",
          isPublic: true
        },
        {
          userId: randomUser._id,
          title: "My Private Watchlist",
          description: "Movies I want to watch later",
          isPublic: false
        }
      ];

    const createdLists = await RecMovieList.insertMany(recommendedLists);

    console.log("Recommendations list were created !")

    const firstList = createdLists[0];

    const createdMovies = await Movie.find({});

    const listMovies = createdMovies.slice(0, 4).map(movie => ({
        recMovieListId: firstList._id,
        movieId: movie._id,
        addedAt: new Date()
    }));

    await ListMovie.insertMany(listMovies);
    
    console.log("Link to movies and recommenations list were created !")


    console.log('Database seeded successfully');
    process.exit(0);  // Exit successfully
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
const dbUri = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI 
  : process.env.MONGODB_URI;

connectDB(dbUri).then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});