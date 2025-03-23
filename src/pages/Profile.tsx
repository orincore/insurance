import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Shield, Upload, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface DocumentData {
  id: string;
  name: string;
  size: string;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'paused' | 'completed' | 'failed';
  controller: AbortController;
}

export const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser); // assuming a setter exists in your store
  const token = localStorage.getItem('token');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  // Flag to ensure we only refresh the page once after uploads complete
  const [refreshTriggered, setRefreshTriggered] = useState(false);
  // State to hold the id of the file that is pending deletion confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const mockInsuranceData = {
    policyNumber: "BIC-2024-1234",
    coverage: "₹5,00,000",
    validUntil: "March 2025",
    planType: "Gold Family Health Plan"
  };

  // Fetch user profile from the backend and update authStore
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('https://api.orincore.com/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token, setUser]);

  // Fetch uploaded files from the backend on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('https://api.orincore.com/api/files', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const files = await response.json();
          const mappedFiles = files.map((file: any) => ({
            id: file.id || file._id,
            name: file.originalname,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          }));
          setDocuments(mappedFiles);
        } else {
          console.error('Failed to fetch files');
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    if (token) {
      fetchFiles();
    }
  }, [token]);

  // Function to upload a single file using axios
  const uploadFile = async (file: File, uploadId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const controller = new AbortController();
    
    // Update the corresponding upload item with new controller, reset progress and set status to uploading
    setUploads(prev =>
      prev.map(item =>
        item.id === uploadId ? { ...item, controller, status: 'uploading', progress: 0 } : item
      )
    );

    try {
      const response = await axios.post('https://api.orincore.com/api/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploads(prev =>
            prev.map(item =>
              item.id === uploadId ? { ...item, progress: percentCompleted } : item
            )
          );
        }
      });
      if (response.status === 200 || response.status === 201) {
        const fileData = response.data.file;
        const uploadedFile: DocumentData = {
          id: fileData.id || fileData._id,
          name: fileData.originalname,
          size: `${(fileData.size / (1024 * 1024)).toFixed(2)} MB`
        };
        setDocuments(prev => [...prev, uploadedFile]);
        setUploads(prev =>
          prev.map(item =>
            item.id === uploadId ? { ...item, status: 'completed', progress: 100 } : item
          )
        );
        // Refresh the page once after a file is successfully uploaded
        if (!refreshTriggered) {
          setRefreshTriggered(true);
          window.location.reload();
        }
      } else {
        setUploads(prev =>
          prev.map(item =>
            item.id === uploadId ? { ...item, status: 'failed' } : item
          )
        );
        console.error('Failed to upload file');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        // If canceled, mark as paused
        setUploads(prev =>
          prev.map(item =>
            item.id === uploadId ? { ...item, status: 'paused' } : item
          )
        );
      } else {
        setUploads(prev =>
          prev.map(item =>
            item.id === uploadId ? { ...item, status: 'failed' } : item
          )
        );
        console.error('Error uploading file:', error);
      }
    }
  };

  // Handle file upload from input selection
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && token) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadId = `${Date.now()}-${i}`;
        setUploads(prev => [
          ...prev,
          { id: uploadId, file, progress: 0, status: 'uploading', controller: new AbortController() }
        ]);
        uploadFile(file, uploadId);
      }
    }
  };

  // Pause an ongoing upload
  const handlePause = (uploadId: string) => {
    const uploadItem = uploads.find(item => item.id === uploadId);
    if (uploadItem && uploadItem.status === 'uploading') {
      uploadItem.controller.abort();
      setUploads(prev =>
        prev.map(item =>
          item.id === uploadId ? { ...item, status: 'paused' } : item
        )
      );
    }
  };

  // Resume a paused upload (restarts the upload)
  const handleResume = (uploadId: string) => {
    const uploadItem = uploads.find(item => item.id === uploadId);
    if (uploadItem && uploadItem.status === 'paused') {
      uploadFile(uploadItem.file, uploadId);
    }
  };

  // Stop an upload and remove it from the list
  const handleStop = (uploadId: string) => {
    const uploadItem = uploads.find(item => item.id === uploadId);
    if (uploadItem && uploadItem.status === 'uploading') {
      uploadItem.controller.abort();
    }
    setUploads(prev => prev.filter(item => item.id !== uploadId));
  };

  // Delete an uploaded file from the backend (confirmation handled by custom modal)
  const handleDelete = async (id: string) => {
    if (token) {
      try {
        const response = await fetch(`https://api.orincore.com/api/files/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setDocuments(prev => prev.filter(doc => doc.id !== id));
        } else {
          console.error('Failed to delete file');
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-red-500 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white">Profile Information</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center"
              >
                <User className="h-6 w-6 text-gray-400" />
                <span className="ml-3 text-gray-900">{user?.username}</span>
              </motion.div>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center"
              >
                <Mail className="h-6 w-6 text-gray-400" />
                <span className="ml-3 text-gray-900">{user?.email}</span>
              </motion.div>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Insurance Details</h4>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                >
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-red-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Policy Number</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{mockInsuranceData.policyNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-red-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Coverage Amount</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{mockInsuranceData.coverage}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-red-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Valid Until</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{mockInsuranceData.validUntil}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-red-500" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Plan Type</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{mockInsuranceData.planType}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white shadow rounded-lg overflow-hidden"
        >
          <div className="bg-red-500 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-white">Upload Medical Documents</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-red-500 border-dashed cursor-pointer hover:bg-red-50 transition-colors">
                  <Upload className="w-8 h-8 text-red-500" />
                  <span className="mt-2 text-base leading-normal text-red-500">Select files to upload</span>
                  <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                </label>
              </div>

              {/* Upload Progress Section */}
              {uploads.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Uploading Files</h4>
                  <div className="space-y-3">
                    {uploads.map((upload) => (
                      <motion.div
                        key={upload.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-900">{upload.file.name}</p>
                          <p className="text-sm text-gray-500">{upload.progress}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${upload.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          {upload.status === 'uploading' && (
                            <>
                              <button
                                onClick={() => handlePause(upload.id)}
                                className="px-3 py-1 text-xs bg-yellow-500 text-white rounded"
                              >
                                Pause
                              </button>
                              <button
                                onClick={() => handleStop(upload.id)}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded"
                              >
                                Stop
                              </button>
                            </>
                          )}
                          {upload.status === 'paused' && (
                            <>
                              <button
                                onClick={() => handleResume(upload.id)}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded"
                              >
                                Resume
                              </button>
                              <button
                                onClick={() => handleStop(upload.id)}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded"
                              >
                                Stop
                              </button>
                            </>
                          )}
                          {upload.status === 'completed' && (
                            <span className="text-green-600 text-xs">Completed</span>
                          )}
                          {upload.status === 'failed' && (
                            <span className="text-red-600 text-xs">Failed</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Documents Section (Download option removed) */}
              {documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h4>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.size}</p>
                        </div>
                        <div>
                          <button
                            onClick={() => setConfirmDeleteId(doc.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg p-6 w-80 text-center"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this file?</p>
              <div className="flex justify-around">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
