import React, { useState , useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const RoommateProfile = ({ onProfileCreated }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stayingInPG, setStayingInPG] = useState(false);
const [pgSearch, setPgSearch] = useState('');
const [pgOptions, setPgOptions] = useState([]);
const [selectedPG, setSelectedPG] = useState(null);
const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    budget: '',
    durationOfStay: '',
    bio: '',
    images: [],
    habits: {
      smoking: false,
      drinking: false,
      pets: false,
      parties: false,
      guests: false,
      cleanliness: 3,
      sleepSchedule: 'flexible',
    },
    vibeScore: 5,
  });

  useEffect(() => {
    if (!stayingInPG || !pgSearch.trim()) {
      setPgOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/roommate/pg-list?search=${encodeURIComponent(pgSearch)}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPgOptions(data);
      } catch (err) {
        console.error('Failed to search PGs:', err);
        setPgOptions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pgSearch, stayingInPG, user]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (name in formData.habits) {
      setFormData(prev => ({ ...prev, habits: { ...prev.habits, [name]: type === 'checkbox' ? checked : value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setFormData(prev => ({ ...prev, images: files }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user) return toast.error('Login required');
  setLoading(true);

  try {
    const payload = new FormData();

    // Existing fields
    payload.append('age', formData.age);
    payload.append('gender', formData.gender);
    payload.append('budget', formData.budget);
    payload.append('durationOfStay', formData.durationOfStay);
    payload.append('bio', formData.bio);
    payload.append('vibeScore', formData.vibeScore);
    payload.append('habits', JSON.stringify(formData.habits));

    // ADD THESE TWO LINES (THIS IS THE FIX)
    payload.append('stayingInPG', stayingInPG);                    // ← was missing
    if (stayingInPG && selectedPG) {
      payload.append('currentPGId', selectedPG._id);               // ← was missing
    }

    // Images
    formData.images.forEach((file) => payload.append('images', file));

    const res = await axios.post('/api/roommate/profile', payload, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success('Profile created successfully!');
    onProfileCreated && onProfileCreated(res.data);
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || 'Failed to save profile');
  } finally {
    setLoading(false);
  }
};

  // Step 1: Personal Information
const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Tell us about yourself</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">How old are you?</label>
        <input name="age" type="number" placeholder="Enter your age" value={formData.age} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">What is your gender?</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">What's your monthly budget?</label>
        <input name="budget" type="number" placeholder="Enter monthly budget" value={formData.budget} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">How long do you plan to stay? (months)</label>
        <input name="durationOfStay" type="number" placeholder="Enter duration in months" value={formData.durationOfStay} onChange={handleChange} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* NEW: PG Question - in your exact style */}
      <div className="mt-6 p-5 bg-indigo-50 border border-indigo-200 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={stayingInPG}
            onChange={(e) => {
              setStayingInPG(e.target.checked);
              if (!e.target.checked) {
                setSelectedPG(null);
                setPgSearch('');
                setPgOptions([]);
              }
            }}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="font-semibold text-indigo-900">I'm currently staying in a PG/Hostel</span>
        </label>

        {stayingInPG && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Search for your PG</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Sunshine PG, Koramangala"
                value={pgSearch}
                onChange={(e) => setPgSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {showDropdown && pgOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {pgOptions.map(pg => (
                    <div
                      key={pg._id}
                      onClick={() => {
                        setSelectedPG(pg);
                        setPgSearch(`${pg.title}, ${pg.location.city}`);
                        setShowDropdown(false);
                      }}
                      className="p-3 hover:bg-indigo-50 cursor-pointer border-b flex items-center gap-3"
                    >
                      {pg.imageUrl ? (
  <img src={pg.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
) : (
  <div className="w-10 h-10 bg-gray-200 border-2 border-dashed rounded" />
)}
                      <div>
                        <div className="font-medium">{pg.title}</div>
                        <div className="text-xs text-gray-600">
  {pg.location?.city || 'Unknown City'} • ₹{pg.rent || 'N/A'}/bed
</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && pgOptions.length === 0 && pgSearch && (
                <div className="absolute z-10 w-full mt-1 p-3 bg-white border rounded-lg text-center text-gray-500">
                  No PGs found
                </div>
              )}
            </div>

            {selectedPG && (
              <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded">
                <p className="text-green-800 text-sm font-medium">
                  Selected: <strong>{selectedPG.title}</strong> ({selectedPG.location.city})
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Step 2: Bio & Images
  const renderBioAndImages = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Describe yourself & share photos</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Tell us about yourself</label>
        <textarea 
          name="bio" 
          placeholder="Share a brief introduction about yourself, your interests, and what you're looking for in a roommate..."
          value={formData.bio}
          onChange={handleChange} 
          maxLength={200} 
          rows={4}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Add a photo</label>
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleImageChange}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2 mt-3">
          {formData.images.map((f, idx) => (
            <img key={idx} src={URL.createObjectURL(f)} alt="preview" className="w-20 h-20 object-cover rounded border" />
          ))}
        </div>
      </div>
    </div>
  );

  // Step 3: Habits & Preferences
  const renderHabits = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Your living habits & preferences</h3>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium">Which of these apply to you?</label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'smoking', label: 'I smoke' },
            { key: 'drinking', label: 'I drink alcohol' },
            { key: 'pets', label: 'I have pets' },
            { key: 'parties', label: 'I like to host parties' },
            { key: 'guests', label: 'I frequently have guests over' }
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
              <input 
                name={item.key} 
                type="checkbox" 
                checked={formData.habits[item.key]} 
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            How clean do you keep your space?
            <span className="ml-2 text-gray-500">(1 = messy, 5 = very clean)</span>
          </label>
          <input 
            name="cleanliness" 
            type="range" 
            min="1" 
            max="5" 
            value={formData.habits.cleanliness} 
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Messy</span>
            <span>Very Clean</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">What's your typical sleep schedule?</label>
          <select 
            name="sleepSchedule" 
            value={formData.habits.sleepSchedule} 
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="early bird">Early bird (bed by 10 PM)</option>
            <option value="night owl">Night owl (up past midnight)</option>
            <option value="flexible">Flexible / It varies</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 4: Vibe & Review 
  const renderVibeAndReview = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Almost done!</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          How would you rate your overall vibe?
          <span className="ml-2 text-gray-500">(1 = very chill, 10 = very energetic)</span>
        </label>
        <input 
          name="vibeScore" 
          type="range" 
          min="1" 
          max="10" 
          value={formData.vibeScore} 
          onChange={handleChange}
          className="w-full mb-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Very Chill</span>
          <span className="font-medium">Current: {formData.vibeScore}</span>
          <span>Very Energetic</span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded mt-6">
        <h4 className="font-medium mb-2">Review your information:</h4>
        <div className="text-sm space-y-1">
          <p><strong>Age:</strong> {formData.age}</p>
          <p><strong>Gender:</strong> {formData.gender}</p>
          <p><strong>Budget:</strong> ${formData.budget}/month</p>
          <p><strong>Stay Duration:</strong> {formData.durationOfStay} months</p>
          <p><strong>Photos:</strong> {formData.images.length} uploaded</p>
          {stayingInPG && selectedPG && (
      <p className="text-green-700 font-medium">
        Current PG: {selectedPG.title}, {selectedPG.location?.city}
      </p>
    )}
        </div>
      </div>
    </div>
  );

  const steps = [
    { title: "Personal Info", component: renderPersonalInfo },
    { title: "Bio & Photos", component: renderBioAndImages },
    { title: "Habits", component: renderHabits },
    { title: "Review", component: renderVibeAndReview }
  ];

 return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md pt-24">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Your Roommate Profile</h2>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={index} className="text-center flex-1">
              <div className={`h-2 mx-2 rounded-full ${
                index + 1 < currentStep ? 'bg-indigo-600' : 
                index + 1 === currentStep ? 'bg-indigo-400' : 'bg-gray-200'
              }`}></div>
              <span className={`text-xs mt-1 ${index + 1 <= currentStep ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {steps[currentStep - 1].component()}

        <div className="flex justify-between mt-8 pt-4 border-t">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Back
            </button>
          )}
          
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={stayingInPG && currentStep === 1 && !selectedPG}
              className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || (stayingInPG && !selectedPG)}
              className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RoommateProfile;