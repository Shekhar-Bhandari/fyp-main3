import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Mail,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ThumbsUp,
  MessageCircle,
  Eye,
  Users,
  BookOpen,
  Edit
} from "lucide-react";
import toast from "react-hot-toast";
import "../styles/navbar.css";
import "../styles/home.css";

// ✅ REAL SERVICE IMPORTS (Assuming these files are correctly linked to your backend API)
import UserService from "../Services/UserServices";
// import PostServices from "../Services/PostServices"; // Keeping this commented as it's not used here

// ❌ REMOVED: All Mock UserService definitions and mock data structures.

const SPECIALIZATIONS = {
  'all': { label: 'All Projects', icon: '🌟' },
  'web-dev': { label: 'Web Dev', icon: '🌐' },
  'mobile-dev': { label: 'Mobile Dev', icon: '📱' },
  'ai-ml': { label: 'AI/ML', icon: '🤖' },
  'data-science': { label: 'Data Science', icon: '📊' },
  'cloud-computing': { label: 'Cloud', icon: '☁️' },
  'devops': { label: 'DevOps', icon: '⚙️' },
  'cybersecurity': { label: 'Security', icon: '🔒' },
  'blockchain': { label: 'Blockchain', icon: '⛓️' },
  'game-dev': { label: 'Game Dev', icon: '🎮' },
  'iot': { label: 'IoT', icon: '🔌' },
  'ui-ux': { label: 'UI/UX', icon: '🎨' },
  'other': { label: 'Other', icon: '💡' }
};

const getSpecLabel = (specValue) => {
  const spec = SPECIALIZATIONS[specValue];
  return spec ? `${spec.icon} ${spec.label}` : specValue;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;

  if (seconds < MINUTE) return `${seconds}s ago`;
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)}d ago`;
  if (seconds < MONTH) return `${Math.floor(seconds / WEEK)}w ago`;
  
  const formatter = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });

  return formatter.format(date);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    year: 'numeric'
  }).format(date);
};

const ProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // ✅ Using the actual UserService now!
      const [profileRes, postsRes, statsRes] = await Promise.all([
        UserService.getUserProfile(userId),
        UserService.getUserPosts(userId),
        UserService.getUserStats(userId)
      ]);
      
      // Assumes your API response is structured as { data: ... }
      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setStats(statsRes.data);

    } catch (error) {
      console.error("Error fetching profile:", error);
      // Handle 404/not found error
      if (error.response?.status === 404) {
         setProfile(null); // Explicitly set to null to show "User not found"
      } else {
         toast.error("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post) => {
    navigate('/', { state: { openPost: post._id } });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary, #f8fafc)'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--bg-primary, #f8fafc)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          User not found 😔
        </h2>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary, #f8fafc)'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--card-bg, white)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--card-bg, white)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-secondary, #64748b)'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {profile.name}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {posts.length} posts
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => navigate('/profile')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Profile Header Card */}
        <div style={{
          backgroundColor: 'var(--card-bg, white)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Cover with gradient */}
          <div style={{
            height: '200px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              left: '32px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '4px solid var(--card-bg, white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          <div style={{ padding: '64px 32px 32px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {profile.name}
                </h2>
                {profile.specialization && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#10b98120',
                    color: '#10b981',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    <span>{getSpecLabel(profile.specialization)}</span>
                  </div>
                )}
              </div>
              {!isOwnProfile && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{
                    padding: '10px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    <Users size={16} />
                    Follow
                  </button>
                  <button style={{
                    padding: '10px 24px',
                    backgroundColor: 'var(--card-bg, white)',
                    color: '#10b981',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#10b981';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--card-bg, white)';
                    e.target.style.color = '#10b981';
                  }}
                  >
                    <Mail size={16} />
                    Message
                  </button>
                </div>
              )}
            </div>

            {profile.bio && (
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '16px', 
                lineHeight: '1.6', 
                marginBottom: '24px', 
                maxWidth: '800px' 
              }}>
                {profile.bio}
              </p>
            )}

            {/* Profile Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {profile.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <MapPin size={18} color="#10b981" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.createdAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Calendar size={18} color="#10b981" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              )}
              {profile.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Mail size={18} color="#10b981" />
                  <span>{profile.email}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(profile.website || profile.github || profile.linkedin || profile.twitter) && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#10b98110',
                      color: '#10b981',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Globe size={16} />
                    Website
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#10b98110',
                      color: '#10b981',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#10b98110',
                      color: '#10b981',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#10b98110',
                      color: '#10b981',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <Twitter size={16} />
                    Twitter
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: 'var(--card-bg, white)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <BookOpen size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {stats.totalPosts}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Posts</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-bg, white)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <ThumbsUp size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {stats.totalLikes}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Likes</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-bg, white)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <MessageCircle size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {stats.totalComments}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Comments</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-bg, white)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <Eye size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {stats.totalViews}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Views</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-bg, white)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <Users size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {stats.followers}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Followers</div>
            </div>
            <div style={{
              backgroundColor: 'var(--card-bg, white)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <Users size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {stats.following}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Following</div>
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div style={{
          backgroundColor: 'var(--card-bg, white)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BookOpen size={20} color="#10b981" />
            Posts ({posts.length})
          </h3>

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                No posts yet
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                {isOwnProfile ? "Start sharing your projects!" : "This user hasn't posted anything yet."}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {posts.map((post) => {
                const mediaUrl = post.media?.url || post.image || '';
                const relativeTime = formatRelativeTime(post.createdAt);
                
                return (
                  <div
                    key={post._id}
                    onClick={() => handlePostClick(post)}
                    style={{
                      padding: '20px',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: 'var(--card-bg, white)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {mediaUrl && (
                        <div style={{
                          width: '120px',
                          height: '120px',
                          flexShrink: 0,
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={mediaUrl}
                            alt={post.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <h4 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {post.title}
                          </h4>
                          {post.specialization && (
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: '#10b98110',
                              color: '#10b981',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              flexShrink: 0
                            }}>
                              {SPECIALIZATIONS[post.specialization]?.icon} {SPECIALIZATIONS[post.specialization]?.label}
                            </span>
                          )}
                        </div>
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          marginBottom: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {post.description}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '14px',
                          color: 'var(--text-secondary)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ThumbsUp size={16} color="#10b981" />
                            <span>{post.likes?.length || 0}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageCircle size={16} color="#10b981" />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={16} color="#10b981" />
                            <span>{post.views?.length || 0}</span>
                          </div>
                          <span style={{ marginLeft: 'auto' }}>{relativeTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;