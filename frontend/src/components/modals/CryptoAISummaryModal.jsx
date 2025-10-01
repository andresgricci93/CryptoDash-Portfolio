import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check, X, Loader } from "lucide-react";
import Button from "../common/Button";

const CryptoAISummaryModal = ({ 
  isOpen, 
  onClose, 
  summary, 
  originalTitle,
  onExportPDF,
  onExportWord
}) => {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    await onExportPDF(summary);
    setPdfLoading(false);
  };

  const handleExportWord = async () => {
    setWordLoading(true);
    await onExportWord(summary);
    setWordLoading(false);
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

      
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-white text-xl font-semibold">
              AI Summary: {originalTitle}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-gray-700 rounded p-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
            <pre className="text-gray-200 whitespace-pre-wrap font-sans">
              {summary}
            </pre>
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={handleCopy}
              variant="secondary"
            >
              {copied ? (
                <>

                  Copied!
                </>
              ) : (
                <>

                  Copy Text
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                onClick={handleExportPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "PDF"
                )}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleExportWord}
                disabled={wordLoading}
              >
                {wordLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Word"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CryptoAISummaryModal;