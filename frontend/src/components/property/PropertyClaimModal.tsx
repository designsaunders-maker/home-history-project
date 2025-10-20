// src/components/property/PropertyClaimModal.tsx
import React, { useState } from 'react';
import { Upload, UserCheck, X, Calendar, FileText, Home, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface PropertyClaimModalProps {
  address: string;
  location: { lat: number; lng: number };
  onClose: () => void;
  onSubmit: (claimType: 'basic' | 'enhanced', data: any) => Promise<void>;
  existingProperty?: any; // Optional existing property to add memory to
}

const PropertyClaimModal: React.FC<PropertyClaimModalProps> = ({
  address,
  location,
  onClose,
  onSubmit,
  existingProperty
}) => {
  const [step, setStep] = useState<'type' | 'memories'>('type');
  const [claimType, setClaimType] = useState<'basic' | 'enhanced'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [memoryData, setMemoryData] = useState({
    name: '',
    email: '',
    yearMovedIn: '',
    yearMovedOut: '',
    current: false,
    memory: '',
    photo: null as File | null
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleNext = () => {
    setStep('memories');
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setPhotoUrl(response.data.photoUrl);
        return response.data.photoUrl;
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      setError('Failed to upload photo: ' + (err.message || 'Unknown error'));
      throw err;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let photoUrlToSave = photoUrl;
      
      // Upload photo if one was selected but not yet uploaded
      if (memoryData.photo && !photoUrl) {
        photoUrlToSave = await handlePhotoUpload(memoryData.photo);
      }

      // Use the new memory endpoint that handles finding/creating properties
      await axios.post(`${process.env.REACT_APP_API_URL}/api/properties/memories`, {
        address,
        lat: location.lat,
        lng: location.lng,
        yearBuilt: new Date().getFullYear(), // Default value
        memory: memoryData.memory,
        submitterName: memoryData.name,
        contact: memoryData.email,
        photo: photoUrlToSave,
        residency: {
          yearMovedIn: memoryData.yearMovedIn ? parseInt(memoryData.yearMovedIn) : undefined,
          yearMovedOut: memoryData.yearMovedOut ? parseInt(memoryData.yearMovedOut) : undefined,
          current: memoryData.current
        }
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit memory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Share Your Memory
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {submitted && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">
            ✅ Thank you! Your memory has been shared.
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-start gap-2 text-gray-600 mb-4">
            <Home className="w-5 h-5 mt-1" />
            <div>
              <div className="font-medium">Location</div>
              <div>{address}</div>
            </div>
          </div>
        </div>

        {step === 'type' ? (
          <div className="space-y-4">
            <div 
              className={`bg-blue-50 border p-6 rounded-lg cursor-pointer transition-all ${
                claimType === 'basic' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setClaimType('basic')}
            >
              <h3 className="font-semibold mb-2 text-blue-900">Share a Memory</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your story about this place - no verification needed!
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Share your memories and experiences</li>
                <li>• Connect with others who have stories here</li>
                <li>• Preserve the history of this place</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleNext}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={memoryData.name}
                  onChange={(e) => setMemoryData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How should we credit you?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={memoryData.email}
                  onChange={(e) => setMemoryData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">When did you live here? (optional)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Year moved in</label>
                          <input
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={memoryData.yearMovedIn}
                            onChange={(e) => setMemoryData(prev => ({ ...prev, yearMovedIn: e.target.value }))}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 2010"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Year moved out</label>
                          <input
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={memoryData.yearMovedOut}
                            onChange={(e) => setMemoryData(prev => ({ ...prev, yearMovedOut: e.target.value }))}
                            disabled={memoryData.current}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 2015"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={memoryData.current}
                            onChange={(e) => setMemoryData(prev => ({
                              ...prev,
                              current: e.target.checked,
                              yearMovedOut: e.target.checked ? '' : prev.yearMovedOut
                            }))}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-600">I currently live here</span>
                        </label>
                      </div>
                    </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Your Memory <span className="text-gray-500">(required)</span>
              </label>
              <textarea
                value={memoryData.memory}
                onChange={(e) => setMemoryData(prev => ({ ...prev, memory: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Share your story about this place. What made it special? What memories do you have here?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMemoryData(prev => ({ ...prev, photo: e.target.files?.[0] || null }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploadingPhoto}
              />
              {photoUrl && (
                <div className="mt-2">
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <p className="text-xs text-green-600 mt-1">✓ Photo uploaded successfully</p>
                </div>
              )}
              {uploadingPhoto && (
                <p className="text-xs text-blue-600 mt-1">Uploading photo...</p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setStep('type')}
              >
                Back
              </button>
              <button 
                type="submit"
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Sharing...' : 'Share Memory'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PropertyClaimModal;