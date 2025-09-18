import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "@store/authStore";

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText, 
  cancelText,
  requireTextConfirmation = false,
  confirmationText = ""
}) => {
  
  const [inputValue, setInputValue] = useState("");
  
  const isConfirmDisabled = requireTextConfirmation ? inputValue !== confirmationText : false;
  const { deleteAccount } = useAuthStore(); 
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Prevent copy/paste
  const handleKeyDown = (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      e.preventDefault();
    }
  };
  
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handleConfirmDelete = async () => {
  try {
    await deleteAccount();
    console.log("Account deleted successfully!");
    setIsModalOpen(false);

  } catch (error) {
    console.error("Error deleting account:", error);

  }
};
  if (!isOpen) return null;
  
  return (
    <motion.div 
        className="fixed inset-0 z-[9999]"
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.3 }}
    > 
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full relative z-10">
          <h3 className="text-white text-lg font-semibold mb-4">
            {title}
          </h3>
          
          <p className="text-gray-300 mb-6">
            {description}
          </p>

          {requireTextConfirmation && (
            <>
              <p className="text-gray-300 mb-2">
                Please type <span className="text-red-400 font-mono">{confirmationText}</span> to confirm:
              </p>
              
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onContextMenu={handleContextMenu}
                className="w-full p-3 bg-gray-700 text-white rounded mb-6 font-mono
                         focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={confirmationText}
              />
            </>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isConfirmDisabled}
              className={`px-4 py-2 rounded transition-colors ${
                isConfirmDisabled 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DeleteModal;