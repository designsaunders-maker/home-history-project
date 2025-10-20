import React, { useState } from 'react';
import api from '../api/client';

interface AddPropertyProps {
  onPropertyAdded: () => void;
  onClose: () => void;
}

const AddProperty: React.FC<AddPropertyProps> = ({ onPropertyAdded, onClose }) => {
  const [formData, setFormData] = useState({
    address: '',
    yearBuilt: '',
    currentOwner: '',
    lat: 40.7128,
    lng: -74.0060
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/properties', {
        ...formData,
        yearBuilt: parseInt(formData.yearBuilt)
      });
      onPropertyAdded();
      onClose();
    } catch (error) {
      console.error('Error adding property:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Add New Property</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Year Built
            </label>
            <input
              type="number"
              name="yearBuilt"
              value={formData.yearBuilt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Current Owner
            </label>
            <input
              type="text"
              name="currentOwner"
              value={formData.currentOwner}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;