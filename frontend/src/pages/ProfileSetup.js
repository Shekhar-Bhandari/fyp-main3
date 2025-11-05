import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, Plus, UserCircle, Heart, Code, Github, Linkedin } from 'lucide-react';
import UserServices from '../Services/UserServices';
import './ProfileSetup.css'; 

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    university: '',
    major: '',
    year: '',
    interests: [],
    skills: [],
    github: '',
    linkedin: '',
  });
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // 🔥 CHECK IF PROFILE SETUP IS ALREADY COMPLETE
  useEffect(() => {
    const existingUser = JSON.parse(localStorage.getItem('todoapp') || '{}');
    
    // If user has already completed profile setup, redirect to home
    if (existingUser.profileSetupComplete === true) {
      console.log('✅ Profile already completed, redirecting to home...');
      navigate('/home', { replace: true });
      return;
    }

    // Pre-fill form with existing user data if available
    if (existingUser.name) {
      setProfileData(prev => ({
        ...prev,
        name: existingUser.name || '',
        bio: existingUser.bio || '',
        university: existingUser.university || '',
        major: existingUser.major || '',
        year: existingUser.year || '',
        interests: existingUser.interests || [],
        skills: existingUser.skills || [],
        github: existingUser.github || '',
        linkedin: existingUser.linkedin || '',
      }));
    }
  }, [navigate]);

  const suggestedInterests = [
    'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science',
    'Game Development', 'Blockchain', 'IoT', 'Cybersecurity',
    'Cloud Computing', 'UI/UX Design',
  ];

  const suggestedSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++',
    'Flutter', 'Firebase', 'MongoDB', 'SQL',
  ];

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAddInterest = (interest) => {
    if (interest && !profileData.interests.includes(interest)) {
      setProfileData({ ...profileData, interests: [...profileData.interests, interest] });
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter((i) => i !== interestToRemove),
    });
  };

  const handleAddSkill = (skill) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData({ ...profileData, skills: [...profileData.skills, skill] });
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleNext = () => {
    if (step === 1 && !profileData.name.trim()) {
      toast.error('Please enter your full name to continue.');
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  /**
   * 🚀 Saves the completed profile data to the backend database.
   */
  const handleComplete = async () => {
    const existingUser = JSON.parse(localStorage.getItem('todoapp') || '{}');
    const token = existingUser.token;

    if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/auth');
        return;
    }

    // Validate required name field
    if (!profileData.name.trim()) {
        toast.error('Name is required to complete profile setup.');
        setStep(1); // Go back to step 1
        return;
    }

    setLoading(true);
    try {
        // Prepare clean payload
        const cleanedData = {
            name: profileData.name.trim(),
            bio: profileData.bio?.trim() || '',
            university: profileData.university?.trim() || '',
            major: profileData.major?.trim() || '',
            year: profileData.year?.trim() || '',
            interests: profileData.interests || [],
            skills: profileData.skills || [],
            github: profileData.github?.trim() || '',
            linkedin: profileData.linkedin?.trim() || '',
        };

        console.log('📤 Saving profile setup:', cleanedData);

        // 1. CALL THE API TO PERSIST DATA TO THE DATABASE
        const response = await UserServices.updateProfile(cleanedData);
        
        console.log('✅ Profile saved successfully:', response.data);

        // 2. UPDATE LOCAL STORAGE WITH DATA RETURNED FROM SERVER
        const updatedUser = { 
            ...existingUser,
            ...(response.data.user || response.data),
            token: existingUser.token, // Preserve token
            profileSetupComplete: true // 🔥 Mark as complete
        };
        
        localStorage.setItem('todoapp', JSON.stringify(updatedUser));
        
        toast.success('Profile setup complete! Welcome aboard! 🎉');
        navigate('/home', { replace: true });

    } catch (error) {
        console.error("❌ Failed to save profile:", error);
        
        // Handle specific errors
        if (error.response?.status === 401) {
            toast.error('Session expired. Please log in again.');
            localStorage.removeItem('todoapp');
            navigate('/auth');
        } else if (error.response?.status === 400) {
            toast.error(error.response?.data?.message || 'Invalid profile data. Please check your inputs.');
        } else {
            toast.error(`Failed to save profile: ${error.response?.data?.message || 'Please check your connection.'}`);
        }
    } finally {
        setLoading(false);
    }
  };

  /**
   * 🔥 SKIP PROFILE SETUP - Mark as complete and navigate to home
   */
  const handleSkip = async () => {
    const existingUser = JSON.parse(localStorage.getItem('todoapp') || '{}');
    
    // Mark profile setup as complete even if skipped
    const updatedUser = {
        ...existingUser,
        profileSetupComplete: true
    };
    
    localStorage.setItem('todoapp', JSON.stringify(updatedUser));
    toast.info('Profile setup skipped. You can complete it later from your profile page.');
    navigate('/home', { replace: true });
  };

  return (
    <div className="profile-setup-wrapper">
      <div className="profile-setup-card">
        <div className="profile-setup-header">
          <h1>Welcome to Connectiva! 🎓</h1>
          <p>Let's set up your profile to showcase your projects</p>
        </div>

        <div className="progress-bar-container">
          <div className="progress-labels">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-header">
              <UserCircle size={28} />
              <h2>Basic Information</h2>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="name" 
                value={profileData.name} 
                onChange={handleInputChange} 
                placeholder="Enter your full name"
                style={{
                  borderColor: profileData.name?.trim() ? 'inherit' : '#ef4444'
                }}
              />
              {!profileData.name?.trim() && (
                <small style={{ color: '#ef4444', fontSize: '12px' }}>
                  Name is required
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={profileData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." rows="3" />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>University/College</label>
                <input type="text" name="university" value={profileData.university} onChange={handleInputChange} placeholder="Your institution" />
              </div>
              <div className="form-group">
                <label>Major/Field of Study</label>
                <input type="text" name="major" value={profileData.major} onChange={handleInputChange} placeholder="e.g., Computer Science" />
              </div>
            </div>

            <div className="form-group">
              <label>Year of Study</label>
              <input type="text" name="year" value={profileData.year} onChange={handleInputChange} placeholder="e.g., 2nd Year" />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-header">
              <Heart size={28} />
              <h2>Your Interests</h2>
            </div>
            <p>Select or add your areas of interest</p>

            <div className="input-add-container">
              <input
                type="text"
                placeholder="Type an interest and press Enter"
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                onKeyPress={(e) => { if(e.key==='Enter') handleAddInterest(currentInterest); }}
              />
              <button onClick={() => handleAddInterest(currentInterest)}><Plus size={20} /></button>
            </div>

            <div className="suggested-container">
              <p>Suggested:</p>
              <div className="tags-container">
                {suggestedInterests.map((interest) => (
                  <button key={interest} onClick={() => handleAddInterest(interest)} className={profileData.interests.includes(interest) ? 'selected-tag' : 'tag'}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {profileData.interests.length > 0 && (
              <div className="selected-tags-container">
                <p>Your Interests ({profileData.interests.length}):</p>
                <div className="tags-container">
                  {profileData.interests.map((interest) => (
                    <div key={interest} className="selected-tag-wrapper">
                      <span>{interest}</span>
                      <button onClick={() => handleRemoveInterest(interest)}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-header">
              <Code size={28} />
              <h2>Skills & Links</h2>
            </div>

            <div className="input-add-container">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => { if(e.key==='Enter') handleAddSkill(currentSkill); }}
              />
              <button onClick={() => handleAddSkill(currentSkill)}><Plus size={20} /></button>
            </div>

            <div className="suggested-container">
              <p>Suggested Skills:</p>
              <div className="tags-container">
                {suggestedSkills.map((skill) => (
                  <button key={skill} onClick={() => handleAddSkill(skill)} className={profileData.skills.includes(skill) ? 'selected-tag' : 'tag'}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {profileData.skills.length > 0 && (
              <div className="selected-tags-container">
                <p>Your Skills ({profileData.skills.length}):</p>
                <div className="tags-container">
                  {profileData.skills.map((skill) => (
                    <div key={skill} className="selected-tag-wrapper">
                      <span>{skill}</span>
                      <button onClick={() => handleRemoveSkill(skill)}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="social-links">
              <p>Social Links (Optional):</p>
              <div className="social-input">
                <Github size={20} />
                <input type="text" name="github" value={profileData.github} onChange={handleInputChange} placeholder="GitHub username" />
              </div>
              <div className="social-input">
                <Linkedin size={20} />
                <input type="text" name="linkedin" value={profileData.linkedin} onChange={handleInputChange} placeholder="LinkedIn username" />
              </div>
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          <button onClick={handleBack} disabled={step===1 || loading}>
            Back
          </button>
          
          <button 
            onClick={handleSkip} 
            disabled={loading}
            style={{ opacity: 0.7 }}
          >
            Skip
          </button>
          
          {step < totalSteps ? (
            <button 
              onClick={handleNext} 
              disabled={loading || (step === 1 && !profileData.name.trim())}
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleComplete} 
              disabled={loading || !profileData.name.trim()}
            >
              {loading ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;