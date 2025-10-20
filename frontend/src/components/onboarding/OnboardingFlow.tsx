import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import SearchFirstInterface from '../SearchFirstInterface';
import PropertyClaimModal from '../property/PropertyClaimModal';

const OnboardingFlow = () => {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimData, setClaimData] = useState<{
    address: string;
    location: { lat: number; lng: number };
  } | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClaimSubmit = async (claimType: 'basic' | 'enhanced', data: any) => {
    try {
      // Implementation for submitting property claims
      console.log('Submitting claim:', { claimType, data, location: claimData });
      
      // For now, just close the modal and navigate to dashboard
      setShowClaimModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit claim:', error);
      throw error;
    }
  };

  const handleClaimLocation = (address: string, location: { lat: number; lng: number }) => {
    setClaimData({ address, location });
    setShowClaimModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Discover Your Home History
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Explore memories and connect with others who've lived in your neighborhood
          </p>
        </div>
      </div>

      {/* Main Search-First Interface */}
      <div className="flex-1">
        <SearchFirstInterface 
          onClaimLocation={handleClaimLocation}
          showClaimButton={true}
        />
      </div>

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

export default OnboardingFlow;