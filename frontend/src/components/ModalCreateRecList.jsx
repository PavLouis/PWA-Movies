import { LetterText, Loader, Lock, Mail, Text, TextIcon, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { reclistService } from '../services/reclist';
import { toastNotif } from '../utils/toastNotifications';

export default function ModalCreateRecList({isOpen, onClose, updateRecList, addNewRecListOffline}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true
  });

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const res = await reclistService.createRecList(formData)
    console.log(res)
    if (res.state === 'good') {
        toastNotif.success('Recommendation list created !')
        updateRecList();
    } else if (res.state === 'offline') {
        toastNotif.info('You are currently offline. Your recommendation list will be created when your back online.')
        const tmpCard = {
            _id: formData.title,
            userId: {
                _id: "tmp + 1",
                username: "You"
            },
            title: formData.title,
            description: formData.description,
            isPublic: true,
            createdAt: "2025-02-15T08:37:44.673Z",
            updatedAt: "Not created yet",
        }
        addNewRecListOffline(tmpCard)
    } else {
        console.error('An error occured when we created your recommendation list : ', res.error)
        toastNotif.error('An error occured when we created your recommendation list!')
    }
    setLoading(false);
    onClose();
    setFormData({title: '', description: '', isPublic: true})
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

          <div>
            <label className="block text-gray-300 mb-2">Title</label>
            <div className="relative">
              <input
                type="title"
                className="w-full bg-gray-700 text-white rounded-lg py-2 pl-2 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <div className="relative">
              <textarea
                type="text"
                className="w-full bg-gray-700 text-white rounded-lg py-2 pl-2 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : (
              'Create !'
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
