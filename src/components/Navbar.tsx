import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Heart, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Consider the user authenticated if either the auth state is true or a token exists
  const auth = isAuthenticated || !!token;

  const handleLogout = () => {
    logout();
    // Refresh the page to clear any cached data
    window.location.reload();
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Responsive container: column on mobile, row on medium+ */}
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-4 md:py-0">
            {/* Brand Section */}
            <div 
              className="w-full md:w-auto cursor-pointer"
              onClick={() => navigate('/')}
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex flex-col md:flex-row items-center"
              >
                <Heart className="h-8 w-8 text-red-500" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Badlapur Insurance Company
                </span>
              </motion.div>
              <span className="block ml-10 text-xs text-gray-500 md:ml-2">
                Made by Sushil Surwade
              </span>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {auth ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/profile')}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Profile</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Register
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
      <div className="bg-red-500 overflow-hidden py-3">
        <motion.p 
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="text-red-50 text-xl font-bold whitespace-nowrap"
        >
          This Website is created by Sushil Surwade for Audit Purpose only
        </motion.p>
      </div>
    </>
  );
};
