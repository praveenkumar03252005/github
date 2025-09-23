import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function DriverRatingInterface() {
  const [driverName, setDriverName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Sample existing drivers database
  const existingDrivers = [
    { 
      id: 1, 
      name: 'John Smith', 
      phone: '+1234567890', 
      vehicle: 'Toyota Camry', 
      plateNumber: 'ABC-123',
      totalRides: 245,
      avgRating: 4.8,
      lastRide: '2025-08-20'
    },
    { 
      id: 2, 
      name: 'Mike Johnson', 
      phone: '+1234567891', 
      vehicle: 'Honda Civic', 
      plateNumber: 'XYZ-456',
      totalRides: 189,
      avgRating: 4.5,
      lastRide: '2025-08-19'
    },
    { 
      id: 3, 
      name: 'Sarah Wilson', 
      phone: '+1234567892', 
      vehicle: 'Hyundai Elantra', 
      plateNumber: 'DEF-789',
      totalRides: 312,
      avgRating: 4.9,
      lastRide: '2025-08-21'
    },
    { 
      id: 4, 
      name: 'David Brown', 
      phone: '+1234567893', 
      vehicle: 'Ford Focus', 
      plateNumber: 'GHI-012',
      totalRides: 98,
      avgRating: 4.2,
      lastRide: '2025-08-18'
    },
    { 
      id: 5, 
      name: 'Lisa Davis', 
      phone: '+1234567894', 
      vehicle: 'Nissan Altima', 
      plateNumber: 'JKL-345',
      totalRides: 156,
      avgRating: 4.7,
      lastRide: '2025-08-22'
    }
  ];

  // Filter drivers based on input
  const filteredDrivers = existingDrivers.filter(driver =>
    driver.name.toLowerCase().includes(driverName.toLowerCase()) && driverName.length > 0
  );

  const handleDriverNameChange = (value) => {
    setDriverName(value);
    setSelectedDriver(null);
    setShowSuggestions(value.length > 0);
  };

  const handleDriverSelect = (driver) => {
    setDriverName(driver.name);
    setSelectedDriver(driver);
    setShowSuggestions(false);
  };

  const handleStarClick = (starIndex) => {
    setRating(starIndex);
  };

  const handleStarHover = (starIndex) => {
    setHoveredRating(starIndex);
  };

  const handleSubmit = () => {
    if (driverName.trim() && rating > 0) {
      setIsSubmitted(true);
      // Here you would typically send the data to your backend
      console.log({
        driverName: driverName.trim(),
        rating,
        feedback: feedback.trim(),
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setDriverName('');
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
    setSelectedDriver(null);
    setShowSuggestions(false);
  };

  const getRatingText = (stars) => {
    switch(stars) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Driver Rating & Feedback</h1>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-green-600 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h2>
              <p className="text-gray-600 mb-6">Your rating and feedback have been submitted successfully.</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Review Summary:</h3>
                <div className="text-left space-y-2">
                  <p><span className="font-medium">Driver:</span> {driverName}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({getRatingText(rating)})</span>
                  </div>
                  {feedback && (
                    <p><span className="font-medium">Feedback:</span> {feedback}</p>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleReset}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
              >
                Rate Another Driver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Driver Rating & Feedback</h1>
          </div>

          <div className="space-y-6">
            {/* Driver Name Input with Autocomplete */}
            <div className="relative">
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-2">
                Driver Name
              </label>
              <input
                id="driverName"
                type="text"
                placeholder="Enter driver name..."
                value={driverName}
                onChange={(e) => handleDriverNameChange(e.target.value)}
                onFocus={() => setShowSuggestions(driverName.length > 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredDrivers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      onClick={() => handleDriverSelect(driver)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-600">{driver.vehicle} • {driver.plateNumber}</p>
                          <p className="text-xs text-gray-500">{driver.phone}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{driver.avgRating}</span>
                          </div>
                          <p className="text-xs text-gray-500">{driver.totalRides} rides</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Driver Details */}
            {selectedDriver && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Driver Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{selectedDriver.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-medium">{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vehicle:</p>
                    <p className="font-medium">{selectedDriver.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Plate Number:</p>
                    <p className="font-medium">{selectedDriver.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Rides:</p>
                    <p className="font-medium">{selectedDriver.totalRides}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Average Rating:</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{selectedDriver.avgRating}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Last Ride:</p>
                    <p className="font-medium">{selectedDriver.lastRide}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-600 mb-4">{getRatingText(hoveredRating || rating)}</p>
                
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all duration-150 hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Textarea */}
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with this driver..."
                className="w-full p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                rows="4"
                maxLength="500"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {feedback.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={!driverName.trim() || rating === 0}
                className={`w-full py-3 px-6 rounded-md font-medium transition-all ${
                  driverName.trim() && rating > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {driverName.trim() && rating > 0 ? 'Submit Rating & Feedback' : 'Please enter driver name and select rating'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}