import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- import useNavigate
import { X, Plus, UserCircle, Heart, Code, Github, Linkedin } from 'lucide-react';
import './ProfileSetup.css'; // import the CSS file

const ProfileSetup = () => {
  const navigate = useNavigate(); // <-- initialize navigate
  const [step, setStep] = useState(1);
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
      alert('Please enter your name');
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    const existingUser = JSON.parse(localStorage.getItem('todoapp') || '{}');
    const updatedUser = { ...existingUser, ...profileData, profileSetupComplete: true };
    localStorage.setItem('todoapp', JSON.stringify(updatedUser));
    alert('Profile setup complete! Welcome to Connectiva 🎉');

    // Navigate to /home after completion
    navigate('/home');
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
              <input type="text" name="name" value={profileData.name} onChange={handleInputChange} placeholder="Enter your full name" />
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
          <button onClick={handleBack} disabled={step===1}>Back</button>
          <button onClick={() => { if(step<totalSteps) setStep(step+1); else handleComplete(); }}>Skip</button>
          {step<totalSteps ? <button onClick={handleNext}>Next</button> : <button onClick={handleComplete}>Complete</button>}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
