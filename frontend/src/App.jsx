import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Timeline from './pages/Timeline';
import NewAlbum from './pages/NewAlbum';
import AlbumDetail from './pages/AlbumDetail';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Timeline />} />
          <Route path="/new" element={<NewAlbum />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
