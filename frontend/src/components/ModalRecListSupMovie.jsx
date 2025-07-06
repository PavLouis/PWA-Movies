import { LetterText, Loader, Lock, Mail, Text, TextIcon, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { reclistService } from '../services/reclist';
import { toastNotif } from '../utils/toastNotifications';

export default function ModalRecListSupMovie({ isOpen, onClose, updateRecList, recListId, movieId }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    if (!recListId) return;

    const res = await reclistService.deleteMovieRecList(recListId, movieId)
    if (res.state === 'good') {
      toastNotif.delete('Movie deleted from recommendation list !')
      updateRecList();
    } else if (res.state === 'offline') {
      toastNotif.info('You are currently offline. Delete request are not supported yet.')
    } else {
      console.error('An error occured when tried to delete a movie from your recommendation list : ', res.error)
      toastNotif.error('An error occured when tried to delete a movie from your recommendation list!')
    }
    setLoading(false);
    onClose();
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md relative">
        <h2 className='font-bold text-md'>Are you sure you want to delete this movies from your recommendation list ?</h2>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className='flex gap-4 pt-4'>
          <button
            onClick={onClose}
            className="w-full bg-stone-400 text-white py-2 rounded-lg hover:bg-stone-600 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            No
          </button>

          <button
            onClick={handleSubmit}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : (
              'Yes'
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
