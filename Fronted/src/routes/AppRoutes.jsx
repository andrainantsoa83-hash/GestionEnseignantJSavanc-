import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Cisco from '../pages/Cisco';
import CiscoDetail from '../pages/CiscoDetail';
import Commune from '../pages/Commune';
import CommuneDetail from '../pages/CommuneDetail';
import Zap from '../pages/Zap';
import ZapDetail from '../pages/ZapDetail';
import Etablissement from '../pages/Etablissement';
import Enseignant from '../pages/Enseignant';
import Utilisateur from '../pages/Utilisateur';
import Historique from '../pages/Historique';
import Profil from '../pages/Profil';
import Login from '../pages/Login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cisco" element={<Cisco />} />
        <Route path="cisco/:id" element={<CiscoDetail />} />
        <Route path="commune" element={<Commune />} />
        <Route path="commune/:id" element={<CommuneDetail />} />
        <Route path="zap" element={<Zap />} />
        <Route path="zap/:id" element={<ZapDetail />} />
        <Route path="etablissement" element={<Etablissement />} />
        <Route path="enseignant" element={<Enseignant />} />
        <Route path="utilisateur" element={<Utilisateur />} />
        <Route path="historique" element={<Historique />} />
        <Route path="profil" element={<Profil />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
