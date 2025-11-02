import { useState } from 'react';
import { Home, Trophy, User } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  const navigation = [
    { name: 'Home', id: 'home', icon: Home },
    { name: 'Leaderboard', id: 'leaderboard', icon: Trophy },
    { name: 'Profile', id: 'profile', icon: User },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome Home</h1>
            <p className="text-gray-600">This is the home page content.</p>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Leaderboard</h1>
            <p className="text-gray-600">View the top performers here.</p>
          </div>
        );
      case 'profile':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Profile</h1>
            <p className="text-gray-600">Manage your account settings.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">MyApp</span>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activePage === item.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {renderPage()}
      </main>
    </div>
  );
}