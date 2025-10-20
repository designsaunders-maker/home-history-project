import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Map } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import SearchFirstInterface from './SearchFirstInterface';
import PropertyClaimModal from './property/PropertyClaimModal';
import PropertyList from './PropertyList';

interface PropertyData {
  _id: string;
  address: string;
  yearBuilt: number;
  currentOwner: string;
  lat?: number;
  lng?: number;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'properties'>('search');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimData, setClaimData] = useState<{
    address: string;
    location: { lat: number; lng: number };
  } | null>(null);

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleClaimLocation = (address: string, location: { lat: number; lng: number }) => {
    setClaimData({ address, location });
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (claimType: 'basic' | 'enhanced', data: any) => {
    try {
      console.log('Submitting claim:', { claimType, data, location: claimData });
      setShowClaimModal(false);
      // You can add logic here to sync with the properties list
    } catch (error) {
      console.error('Failed to submit claim:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Map className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Home History</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 flex items-center">
                <User className="w-4 h-4 mr-1" />
                {user?.email || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Explore Locations
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Properties
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <div className="h-[calc(100vh-140px)]">
            <SearchFirstInterface 
              onClaimLocation={handleClaimLocation}
              showClaimButton={true}
            />
          </div>
        )}
        
        {activeTab === 'properties' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PropertyList />
          </div>
        )}
      </main>

      {/* Claim Modal */}
      {showClaimModal && claimData && (
        <PropertyClaimModal
          address={claimData.address}
          location={claimData.location}
          onClose={() => setShowClaimModal(false)}
          onSubmit={handleClaimSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;
