import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Upload, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import GenericInput from '../settings/GenericInput'
import Button from '../common/Button';
import AvatarUpload from '../settings/AvatarUpload';
import ModalWrapper from './ModalWrapper';



const EditProfileModal = ({ isOpen, onClose }) => {
    const authStore = useAuthStore();

  const { user, updateProfile, uploadAvatar } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {

    await updateProfile({
      name: formData.name,
      email: formData.email
    });
    
  
    if (selectedFile) {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      await uploadAvatar(formData); 
    }
    
    onClose();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};

  if (!isOpen) return null;

  return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-xl font-semibold">Edit Profile</h3>
          </div>
            <AvatarUpload 
                previewUrl={previewUrl}
                onFileSelect={handleFileSelect}
                size="w-24 h-24"
                buttonText="Click to change avatar"
            />
          <div className="space-y-4">          
              <div className="relative">
                <GenericInput 
                    label="Name"
                    icon={User}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    />
              </div>     
              <div className="relative">
                <GenericInput 
                    label="Email"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    />
              </div>      
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={onClose} variant="transparent" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </ModalWrapper>
  );
};

export default EditProfileModal;