import { Loader, X } from 'lucide-react'
import React, { useState } from 'react'
import { toastNotif } from '../../utils/toastNotifications'
import { API_URL } from '../../services/api'

export default function ModalCreateMovie({ isOpen, onClose, updateMovies }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    releaseYear: '',
    description: '',
    genre: '',
    voteAverage: 0,
    image: null,
    isPublic: true
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    const movieFormData = new FormData()
    Object.keys(formData).forEach(key => {
      movieFormData.append(key, formData[key])
    })

    try {
      const response = await fetch(`${API_URL}/api/movies`, {
        method: 'POST',
        body: movieFormData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        toastNotif.success('Movie created successfully!')
        updateMovies();
      } else {
        console.error('Error creating movie:', result)
        toastNotif.error('An error occurred while creating the movie!')
      }
    } catch (error) {
      const isOffline = !navigator.onLine;
      if (isOffline) {
        toastNotif.info('You are currently offline. Please be back online to create the movie!.')
      } else {
        console.error('Error:', error)
        toastNotif.error('Network error occurred!')
      }
    }

    setLoading(false)
    onClose()
    setFormData({
      title: '',
      releaseYear: '',
      description: '',
      genre: '',
      voteAverage: 0,
      image: null,
      isPublic: true
    })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] })
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

        <h2 className="text-xl text-white mb-6">Create New Movie</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Title</label>
            <input
              type="text"
              className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter movie title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Release Year</label>
            <input
              type="number"
              className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter release year"
              value={formData.releaseYear}
              onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter movie description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Genre</label>
            <input
              type="text"
              className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter movie genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Vote Average</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter vote average"
              value={formData.voteAverage}
              onChange={(e) => setFormData({ ...formData, voteAverage: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Movie Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-600 file:text-white hover:file:bg-gray-500"
              onChange={handleFileChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mt-6"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : (
              'Create Movie'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}