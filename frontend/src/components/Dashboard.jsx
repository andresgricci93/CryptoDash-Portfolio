import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import OverviewPage from '../pages/OverviewPage.jsx';
import CryptoDetailPage from '../pages/CryptoDetailPage.jsx';
import FavoriteCoins from '../pages/FavoriteCoins.jsx';
import NotesPage from '../pages/NotesPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';


function Dashboard() {
  return (
    <div className='flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden'>
     
      <div className='fixed inset-0 z-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 
        to-gray-900 opacity-80'/>
        <div className='absolute inset-0 backdrop-blur-sm'/>
      </div>
      
    
      <Sidebar />
     
      <div className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden h-screen">
        <Routes>
          <Route path="dashboard" element={<OverviewPage />} />
          <Route path="crypto/:id" element={<CryptoDetailPage />} />
          <Route path="favorites" element={<FavoriteCoins />} />     
          <Route path="notes" element={<NotesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;