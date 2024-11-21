import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './App.css';

const App = () => {
  const API_URL = 'https://movie-catalogue-backend.vercel.app/api/movies';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentMovieId, setCurrentMovieId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateInputs = () => {
    if (!title || !description || !image || !genre || !rating || !releaseDate) {
      alert("All fields are required!");
      return false;
    }
    return true;
  };

  const createMovie = async () => {
    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('genre', genre);
    formData.append('rating', rating);
    formData.append('releaseDate', releaseDate);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMovies([...movies, response.data]);
      console.log(response.data);
      clearForm();
    } catch (error) {
      console.error('Error creating movie:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get(API_URL);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSort = (type) => {
    setSortBy(type);
  };

  const handleEdit = (movie) => {
    setTitle(movie.title);
    setDescription(movie.description);
    setImage(movie.imageUrl);
    setGenre(movie.genre);
    setRating(movie.rating);
    setReleaseDate(movie.releaseDate);
    setCurrentMovieId(movie._id);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('genre', genre);
    formData.append('rating', rating);
    formData.append('releaseDate', releaseDate);

    try {
      const response = await axios.put(`${API_URL}/${currentMovieId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMovies(movies.map((movie) => (movie._id === currentMovieId ? response.data : movie)));
      clearForm();
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  const handleCancel = () => {
    clearForm();
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setImage(null);
    setGenre('');
    setRating('');
    setReleaseDate('');
    setCurrentMovieId(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase()) ||
    movie.genre.toLowerCase().includes(search.toLowerCase())
  );

  const sortedMovies = filteredMovies.sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'genre') return a.genre.localeCompare(b.genre);
    if (sortBy === 'rating') return a.rating - b.rating;
    return 0;
  });

  return (
    <div className="app-container">
      <h1 className="text-center text-3xl font-bold mb-5">Movie Catalog</h1>

      {/* Search & Sort */}
      <div className="search-sort mb-5 flex justify-between">
        <input
          type="text"
          placeholder="Search by title or genre"
          value={search}
          onChange={handleSearch}
          className="input input-bordered input-primary w-2/5"
        />
        <div className="sort">
          <button className="btn btn-primary dropdown-toggle" onClick={() => handleSort('title')}>
            Sort by Title
          </button>
          <button className="btn btn-primary dropdown-toggle" onClick={() => handleSort('genre')}>
            Sort by Genre
          </button>
          <button className="btn btn-primary dropdown-toggle" onClick={() => handleSort('rating')}>
            Sort by Rating
          </button>
        </div>
      </div>

      {/* Movie Form */}
      <div className="form card bg-base-100 shadow-lg p-5 mb-5">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full mb-2"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full mb-2"
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <input
          type="number"
          placeholder="Rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <input
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className="input input-bordered w-full mb-2"
        />

        {isEditing ? (
          <div className="edit-buttons mt-4">
            <button className="btn btn-success mr-2" onClick={handleSave}>Save</button>
            <button className="btn btn-error" onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={createMovie}>Add Movie</button>
        )}
      </div>

      {/* Movie List */}
      <div className="movies-list grid grid-cols-3 gap-5">
        {sortedMovies.length > 0 ? (
          sortedMovies.map((movie) => (
            <div key={movie._id} className="movie-card card bg-base-100 shadow-lg p-5">
              <img src={movie.imageUrl} alt={movie.title} className=" w-40 h-40 object-cover mb-2" />
              <h2 className="text-xl font-bold">{movie.title}</h2>
              <p>{movie.description}</p>
              <p>Genre: {movie.genre}</p>
              <p>Rating: {movie.rating}</p>
              <p>Release Date: {new Date(movie.releaseDate).toLocaleDateString()}</p>
              <div className="movie-actions flex gap-3 mt-4">
                <button className="btn btn-warning" onClick={() => handleEdit(movie)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(movie._id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No movies match your search.</p>
        )}
      </div>
    </div>
  );
};

export default App;