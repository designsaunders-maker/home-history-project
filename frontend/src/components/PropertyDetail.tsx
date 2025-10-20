import React from 'react';
import { X, Calendar, User, MessageCircle, Camera, MapPin } from 'lucide-react';
import { useEnrichedAddress } from '../hooks/useEnrichedAddress';

interface Memory {
  _id?: string;
  photo?: string;
  memory: string;
  submitterName: string;
  contact?: string;
  residency?: {
    yearMovedIn?: number;
    yearMovedOut?: number;
    current: boolean;
  };
  submittedAt: string;
}

interface Property {
  _id: string;
  address: string;
  yearBuilt?: number;
  lat: number;
  lng: number;
  memories: Memory[];
  createdAt: string;
  updatedAt: string;
}

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
  onAddMemory?: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ 
  property, 
  onClose, 
  onAddMemory 
}) => {
  // Debug logging
  console.debug("[PropertyDetail] mounted with address:", property?.address);
  
  // Guard against empty address
  const addr = property?.address?.trim();
  const { data, loading, error } = useEnrichedAddress(addr || undefined);
  const ac = data?.census?.result?.addressMatches?.[0]?.addressComponents;
  const stdLine = ac ? `${ac.city || ""}${ac.city ? ", " : ""}${ac.state || ""} ${ac.zip || ""}`.trim() : "";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatResidencyPeriod = (residency?: Memory['residency']) => {
    if (!residency) return 'Residency not specified';
    
    if (residency.current) {
      return `${residency.yearMovedIn || 'Unknown'} - Present`;
    } else if (residency.yearMovedOut) {
      return `${residency.yearMovedIn || 'Unknown'} - ${residency.yearMovedOut}`;
    } else if (residency.yearMovedIn) {
      return `${residency.yearMovedIn} - Unknown`;
    }
    
    return 'Residency not specified';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Backdrop clicked - closing modal');
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{property.address}</h2>
              {property.yearBuilt && (
                <p className="text-sm text-gray-600">Built: {property.yearBuilt}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onAddMemory && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Share Memory button clicked');
                  onAddMemory();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 relative z-[10001] pointer-events-auto"
                style={{ zIndex: 10001 }}
              >
                <MessageCircle className="w-4 h-4" />
                Share Memory
              </button>
            )}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                onClose();
              }}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors relative z-[10001] pointer-events-auto"
              style={{ zIndex: 10001 }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {property.memories.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memories yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share a memory about this place!</p>
              {onAddMemory && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Share Your Memory button clicked');
                    onAddMemory();
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative z-[10001] pointer-events-auto"
                  style={{ zIndex: 10001 }}
                >
                  Share Your Memory
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Property Basics Section */}
              <section aria-label="Property basics" style={{marginBottom: 16}}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Basics</h3>
                {loading && <p className="text-gray-600">Loading property details…</p>}
                {error && <p style={{color: "crimson"}}>Couldn't load details.</p>}
                {data && (
                  <ul className="space-y-2 text-sm">
                    <li><strong>Address:</strong> {data.address}</li>
                    <li><strong>Lat/Lng:</strong> {data.geocode?.[0]?.lat}, {data.geocode?.[0]?.lon}</li>
                    <li><strong>Matched Address (Census):</strong> {data.census?.result?.addressMatches?.[0]?.matchedAddress}</li>
                    {stdLine && <li><strong>Standardized Address:</strong> {stdLine}</li>}
                  </ul>
                )}
              </section>

              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {property.memories.length} {property.memories.length !== 1 ? 'Memories' : 'Memory'}
                </h3>
              </div>
              
              {property.memories
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((memory, index) => (
                <div key={memory._id || index} className="bg-gray-50 rounded-lg p-6 border">
                  {/* Memory Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{memory.submitterName}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatResidencyPeriod(memory.residency)}</span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(memory.submittedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo */}
                  {memory.photo && (
                    <div className="mb-4">
                      <img 
                        src={memory.photo} 
                        alt="Memory photo" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('Image failed to load:', memory.photo);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Memory Text */}
                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-gray-800 leading-relaxed">{memory.memory}</p>
                  </div>

                  {/* Contact Info */}
                  {memory.contact && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Contact:</span> {memory.contact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
