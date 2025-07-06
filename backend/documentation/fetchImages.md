## Fetch images and movies and use it for the front

#### Exemple of component

Just a basic implementation to check how its done

```jsx
import React, { useState, useEffect } from 'react';

const MovieGallery = () => {
  const [movies, setMovies] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const token = 'EMPTY';

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/movies', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data.movies);

        data.movies.forEach(movie => {
          fetchMovieImage(movie._id);
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchMovieImage = async (movieId) => {
      try {
        const response = await fetch(`http://localhost:5001/api/movies/${movieId}/image`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrls(prev => ({ ...prev, [movieId]: url }));
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };
    fetchMovies();

    return () => {
        // Cleanup blob URLs
        Object.values(imageUrls).forEach(URL.revokeObjectURL);
      };
    
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {movies.map(movie => (
        <div key={movie._id} className="p-4 border rounded">
          {imageUrls[movie._id] && (
            <img
              src={imageUrls[movie._id]}
              alt={movie.title}
              className="w-full h-64 object-cover"
            />
          )}
          <h2 className="mt-2 text-lg font-bold">{movie.title}</h2>
        </div>
      ))}
    </div>
  );
};

export default MovieGallery;
```