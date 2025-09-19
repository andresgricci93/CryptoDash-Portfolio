import { Upload } from 'lucide-react';

const AvatarUpload = ({ 
  previewUrl, 
  onFileSelect, 
  size = "w-24 h-24",
  buttonText = "Click to change avatar"
}) => {

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="mb-6 text-center">
      <div className="relative inline-block">
        <img
          src={previewUrl || 'https://randomuser.me/api/portraits/men/3.jpg'}
          alt="Profile"
          className={`${size} rounded-full object-cover`}
        />
        <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
          <Upload size={16} className="text-white" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-gray-400 text-sm mt-2">{buttonText}</p>
    </div>
  );
};

export default AvatarUpload;