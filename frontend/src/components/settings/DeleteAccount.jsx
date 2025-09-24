import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteModal from "@components/modals/DeleteModal";
import Button from "../common/Button";
const DeleteAccount = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className='bg-red-900 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-red-700 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className='flex items-center mb-4'>
          <Trash2 className='text-red-400 mr-3' size={24} />
          <h2 className='text-xl font-semibold text-gray-100'>Danger Zone</h2>
        </div>
        <p className='text-gray-300 mb-4'>Permanently delete your account and all of your content.</p>
        <Button
          onClick={handleOpenModal}
          variant="dangerGhost"
        >
        Delete Account
        </Button>
      </div>
     <AnimatePresence>
      {isModalOpen && (
        <DeleteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        description="This action cannot be undone. This will permanently delete your account and all your data."
        confirmText="Delete Account"
        cancelText="Cancel"
        requireTextConfirmation={true}
        confirmationText="delete my account"
        />
      )}
      </AnimatePresence> 
    </>
  );
};

export default DeleteAccount;