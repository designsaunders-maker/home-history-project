import React, { useState, useEffect } from 'react';
import api from '../api/client';
import EditProperty from './EditProperty';
import PropertyMap from './PropertyMap';
import AddProperty from './AddProperty';

interface PropertyData {
  _id: string;
  address: string;
  yearBuilt: number;
  currentOwner: string;
  lat?: number;
  lng?: number;
}

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [editingProperty, setEditingProperty] = useState<PropertyData | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get<PropertyData[]>('/api/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleUpdate = (updatedProperty: PropertyData) => {
    setProperties(properties.map(p => p._id === updatedProperty._id ? updatedProperty : p));
    setEditingProperty(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Property List</h2>
      <button 
        onClick={() => setIsAddingProperty(true)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Add Property
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property List Column */}
        <div className="space-y-4">
          {properties.map(property => (
            <div 
              key={property._id} 
              className={`mb-4 p-4 border rounded cursor-pointer ${
                selectedProperty?._id === property._id ? 'border-blue-500' : ''
              }`}
              onClick={() => setSelectedProperty(property)}
            >
              <p>Address: {property.address}</p>
              <p>Year Built: {property.yearBuilt}</p>
              <p>Current Owner: {property.currentOwner}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingProperty(property);
                }}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {/* Map Column */}
        <div className="h-[600px] border rounded">
          <PropertyMap 
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={setSelectedProperty}
          />
        </div>
      </div>

      {editingProperty && (
        <EditProperty
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onUpdate={handleUpdate}
        />
      )}

      {isAddingProperty && (
        <AddProperty
          onPropertyAdded={fetchProperties}
          onClose={() => setIsAddingProperty(false)}
        />
      )}
    </div>
  );
};

export default PropertyList;