import { motion } from "framer-motion";

const ModalWrapper = ({ 
  isOpen, 
  onClose, 
  children,
  maxWidth = "max-w-md",
  preventCloseOnBackdrop = false
}) => {

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
        onClick={preventCloseOnBackdrop ? undefined : onClose}
      />
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className={`bg-gray-800 rounded-lg p-6 ${maxWidth} w-full relative z-10`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default ModalWrapper;