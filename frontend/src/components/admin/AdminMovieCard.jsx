import React, { useState, useEffect } from 'react';
import { Heart, Share2, Star, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toastNotif } from '../../utils/toastNotifications';
import ModalDeleteMovie from './ModalDeleteMovie';

const AdminMovieCard = ({
  id,
  title = "Movie Title",
  rating = 4.5,
  posterUrl = "/api/placeholder/300/450",
  poster_path,
  vote_average,
  updateMovieList
}) => {
  const [isModalDeleteModalOpen, setIsModalDeleteModalOpen] = useState(false)

  return (
    <div className="relative group">

      <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
        <img
          src={posterUrl}
          alt={title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />

        {/* Effet vignette amélioré */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70" />

        <div onClick={() => setIsModalDeleteModalOpen(true)} className='absolute top-0 right-0 p-4 transition-transform duration-300 group-hover:scale-150'>
          <X className='rounded-xl bg-red-500 cursor-pointer' />
        </div>

        {/* Nouveau style pour le contenu */}
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        </div>
      </div>
      {isModalDeleteModalOpen && <ModalDeleteMovie isOpen={isModalDeleteModalOpen} onClose={() => {setIsModalDeleteModalOpen(false)}} updateMovie={() => updateMovieList()} movieId={id}/>}
    </div>
  );
};

export default AdminMovieCard;