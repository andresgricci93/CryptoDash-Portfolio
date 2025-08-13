import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import OverviewPage from '../pages/OverviewPage.jsx';


function Dashboard() {
  return (
    <div className='flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden'>
     
      <div className='fixed inset-0 z-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 
        to-gray-900 opacity-80'/>
        <div className='absolute inset-0 backdrop-blur-sm'/>
      </div>
      
    
      <Sidebar />
     
      <div className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<OverviewPage />} />


        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;