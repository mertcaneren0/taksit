import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { trTR } from '@mui/material/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { tr } from 'date-fns/locale';

// Sayfalar
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import TaksitliHastalarPage from './pages/TaksitliHastalarPage';
import BorcluHastalarPage from './pages/BorcluHastalarPage';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';

// Context
import { useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
}, trTR);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  // eeyonetim.com için basename ayarı
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<HomePage />} />
            <Route path="taksitli-hastalar" element={<TaksitliHastalarPage />} />
            <Route path="borclu-hastalar" element={<BorcluHastalarPage />} />
            <Route path="depo-siparis" element={<InventoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
