import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import RecListPage from './pages/RecListPage';
import RecListSinglePage from './pages/RecListSinglePage';
import DashboardAdmin from './pages/DashboardAdmin';
import MovieDetails from './pages/MovieDetails'
import ProfilePage from './pages/ProfilePage';

function App() {

  return (
    <>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/information-film/:id" element={<MovieDetails />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="reclist" element={<RecListPage />} />
            <Route path="reclist/:recListId" element={<RecListSinglePage />} />
            <Route path="admin" element={<DashboardAdmin />} />
            <Route path='profile' element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
      </AuthProvider>
    </>
  );
}

export default App;