import { motion } from 'framer-motion';
import { Shield, Heart, Clock, Users } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-28">
              <motion.div 
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                className="sm:text-center lg:text-left"
              >
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Protect your future with</span>
                  <span className="block text-red-500">Badlpur Insurance Company</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Comprehensive health coverage tailored to your needs. Get peace of mind knowing you're protected by India's most trusted insurance provider.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <a href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 md:py-4 md:text-lg md:px-10">
                      Get Started
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Medical professionals"
          />
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-500 font-semibold tracking-wide uppercase">Benefits</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Badlpur Insurance?
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <Shield className="h-12 w-12 text-red-500" />
                <h3 className="mt-6 text-xl font-medium text-gray-900">Complete Protection</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Comprehensive coverage for you and your family
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <Heart className="h-12 w-12 text-red-500" />
                <h3 className="mt-6 text-xl font-medium text-gray-900">Quality Healthcare</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Access to the best healthcare facilities
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <Clock className="h-12 w-12 text-red-500" />
                <h3 className="mt-6 text-xl font-medium text-gray-900">Quick Claims</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Fast and hassle-free claim settlement
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <Users className="h-12 w-12 text-red-500" />
                <h3 className="mt-6 text-xl font-medium text-gray-900">Family Coverage</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Protect your entire family under one plan
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};