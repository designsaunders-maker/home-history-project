import React, { useState, useEffect } from 'react';
import api from '../api/client';

interface PropertyData {
  _id: string;
  address: string;
  yearBuilt: number;
  currentOwner: string;
}

interface EditPropertyProps {
  property: PropertyData;
  onClose: () => void;
  onUpdate: (updatedProperty: PropertyData) => void;
}

const EditProperty: React.FC<EditPropertyProps> = ({ property, onClose, onUpdate }) => {
  const [editedProperty, setEditedProperty] = useState(property);

  useEffect(() => {
    setEditedProperty(property);
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProperty(prevState => ({
      ...prevState,
      [name]: name === 'yearBuilt' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/properties/${property._id}`, editedProperty);
      onClose();
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h2 className="text-lg font-bold mb-4">Edit Property</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="address"
            value={editedProperty.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="number"
            name="yearBuilt"
            value={editedProperty.yearBuilt}
            onChange={handleChange}
            placeholder="Year Built"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            name="currentOwner"
            value={editedProperty.currentOwner}
            onChange={handleChange}
            placeholder="Current Owner"
            className="w-full p-2 mb-4 border rounded"
          />
          <div className="flex justify-between">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Property</button>
            <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;