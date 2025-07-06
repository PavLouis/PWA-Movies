import React, { useEffect, useState } from 'react'
import { API_URL } from '../services/api';
import { Loader, X } from 'lucide-react';
import { reclistService } from '../services/reclist';
import { toastNotif } from '../utils/toastNotifications';

export default function ModalRecListAddMovie({ isOpen, onClose, recListId, moviesRecList, updateFilm }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movieId, setMovieId] = useState('');
  const token = localStorage.getItem('token')

  const loadMoviesNotInRecList = async () => {
    try {
      setLoading(true);

      // Fetch movies data
      const response = await fetch(`${API_URL}/api/movies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Priority': 'high'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();

      const filteredMovies = []
      for (const movie of data.movies) {
        const toRemove = moviesRecList.findIndex(recMovie => recMovie._id === movie._id)
        if (toRemove === -1) {
          filteredMovies.push(movie)
        }
      }
      setMovies(filteredMovies);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadMoviesNotInRecList();

  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = {movieId: movieId}
    setLoading(true)
    const res = await reclistService.addMovieRecList(recListId, form)
    if (res.state === 'good') {
      toastNotif.success('Movie added to recommendation list !')
      updateFilm();
    } else if (res.state === 'offline') {
      toastNotif.info('You are currently offline. Your movie will be added to your reclist when your back online.')
    } else {
      console.error('An error occured when we added a movie to your recommendation list : ', res.error)
      toastNotif.error('An error occured when we added a movie to your recommendation list!')
    }
    setLoading(false);
    onClose();
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">Select a Movie</h2>

            <select
              className="w-full bg-gray-700 text-white rounded-lg p-2"
              onChange={(e) => setMovieId(e.target.value)}
              required
            >
              <option value="">Select a movie...</option>
              {movies.map(movie => (
                <option key={movie._id} value={movie._id}>
                  {movie.title} ({movie.releaseYear})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : (
              'Add Movie !'
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
