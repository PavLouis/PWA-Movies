import React from 'react';
import { X, Home, Compass, Heart, Bell, User } from 'lucide-react';
import NotificationManager from './NotificationsManager';

const MobileNav = ({ isOpen, onClose }) => {
  return (
    <div 
      className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-4">
            <li>
              <a href="/" className="flex items-center space-x-4 text-white p-4 hover:bg-gray-800 rounded-lg">
                <Home className="w-6 h-6" />
                <span className="text-lg">Home</span>
              </a>
            </li>
            <li>
              <a href="/discover" className="flex items-center space-x-4 text-white p-4 hover:bg-gray-800 rounded-lg">
                <Compass className="w-6 h-6" />
                <span className="text-lg">Discover</span>
              </a>
            </li>
            <li>
              <a href="/favorites" className="flex items-center space-x-4 text-white p-4 hover:bg-gray-800 rounded-lg">
                <Heart className="w-6 h-6" />
                <span className="text-lg">Favorites</span>
              </a>
            </li>
            <li>
              <a href="/notifications" className="flex items-center space-x-4 text-white p-4 hover:bg-gray-800 rounded-lg">
                <NotificationManager className="w-6 h-6" />
                <span className="text-lg">Notifications</span>
              </a>
            </li>
            <li>
              <a href="/profile" className="flex items-center space-x-4 text-white p-4 hover:bg-gray-800 rounded-lg">
                <User className="w-6 h-6" />
                <span className="text-lg">Profile</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;