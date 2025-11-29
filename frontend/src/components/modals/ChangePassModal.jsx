import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Lock, Key, CheckCircle, X  } from "lucide-react";
import Button from "../common/Button";
import PasswordInput from "../settings/PasswordInput.jsx";
import { useAuthStore } from "../../store/authStore.js";
import PasswordStrengthMeter from "../PasswordStrengthMeter.jsx";
import PasswordCompromiseCheck from "@components/settings/PasswordCompromiseCheck.jsx";


const ChangePassModal = ({
  isOpen, 
  onClose, 
  onConfirm,
  title,
  description,
  cancelText,
  confirmPassChangeText,
  onKeyDown
}) => {

const [currentPassValue, setCurrentPassValue] = useState("");
const [newPassValue, setNewPassValue] = useState("");
const [confirmNewPassValue, setConfirmNewPassValue] = useState("");

const [isCurrentPassValid, setIsCurrentPassValid] = useState(null);
const [isNewPassValid, setIsNewPassValid] = useState(null);
const [passwordsMatch, setPasswordsMatch] = useState(null);

// - HaveIBeenPwned check API
const [shouldCheckCompromise, setShouldCheckCompromise] = useState(false);
const [isPasswordCompromised, setIsPasswordCompromised] = useState(false);

// Success - Error - Modals
const [isSuccess, setIsSuccess] = useState(false);
const [isError, setIsError] = useState(false);


const isFormValid = isCurrentPassValid && isNewPassValid && passwordsMatch && !isPasswordCompromised;


const { verifyCurrentPassword } = useAuthStore();
const { changePassword } = useAuthStore();

useEffect(() => {
  if (isOpen) {
    setIsSuccess(false);
    setIsError(false);
  }
}, [isOpen]);

const handleCurrentPasswordBlur = async (e) => {
    const password = e.target.value;
    console.log("Password on blur:", password, "Length:", password.length);
    if (password.trim()) {
     const isValid = await verifyCurrentPassword(password);
     setIsCurrentPassValid(isValid);
    }
}

const handleNewPasswordBlur = () => {
  setShouldCheckCompromise(true);
};

const evaluatePasswordStrength = (password) => {
  
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
  if (password.match(/\d/)) strength++;
  if (password.match(/[^a-zA-Z\d]/)) strength++;
  

  return strength >= 3;
};

    const handleNewPasswordChange = (e) => {
      const newPassword = e.target.value;
      setNewPassValue(newPassword);
      
      // Reset trigger when password changes
      setShouldCheckCompromise(false);
      
      const isStrong = evaluatePasswordStrength(newPassword);
      setIsNewPassValid(isStrong);
    };

    const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;    
    setConfirmNewPassValue(confirmPassword);
    
    if (confirmPassword.length === 0) {
        console.log("Setting to null");
        setPasswordsMatch(null); 
    } else {
        const doPasswordsMatch = confirmPassword === newPassValue;
        console.log("Do passwords match?", doPasswordsMatch);
        setPasswordsMatch(doPasswordsMatch); 
    }
    };

    const handleCompromiseStatusChange = (isBlocked, message) => {
      setIsPasswordCompromised(isBlocked);
    };

const handleConfirmChangePassword = async () => {
  try {
    await changePassword(newPassValue);
    setIsSuccess(true); 
    
    setTimeout(() => {
      onClose(); 
     
    }, 4000);
    
  } catch (error) {
    console.error("Error changing password:", error);
    setIsError(true);
    setTimeout(() => {
      setIsError(false); 
    }, 4000);
  }
};


// Prevent copy/paste
  const handleKeyDown = (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      e.preventDefault();
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
        onClick={!isSuccess && !isError ? onClose : undefined} 
      /> 
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full relative z-10">
            <h3 className="text-white text-lg font-semibold mb-4">
            {title}
            </h3>
       {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-semibold">Password Changed Successfully!</p>
            <p className="text-gray-300 text-sm mt-2">This modal will close automatically</p>
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-semibold">Password change failed</p>
            <p className="text-gray-300 text-sm mt-2">Something went wrong. Please try again</p>
          </div>
        ) : (
          <>    
            <p className="text-gray-300 mb-6">
            {description}
            </p>

            <PasswordInput 
            label="Current Password"
            icon={Lock}
            placeholder="Enter your current password"
            onKeyDown={handleKeyDown}
            value={currentPassValue}
            onChange={(e) => setCurrentPassValue(e.target.value)}
            onBlur={handleCurrentPasswordBlur}
            disabled={isCurrentPassValid === true}
            validationState={  isCurrentPassValid === true ? "valid" : 
                               isCurrentPassValid === false ? "error" : 
                                "default"}
            />
            <PasswordInput 
            label="New Password"
            icon={Key}
            onKeyDown={handleKeyDown}
            value={newPassValue}
            onChange={handleNewPasswordChange}
            onBlur={handleNewPasswordBlur}
            validationState={  isNewPassValid === true ? "valid" : 
                               isNewPassValid === false ? "error" : 
                                "default"}
            />
            <PasswordInput 
            label="Confirm New Password"
            icon={Key}
            placeholder=""
            onKeyDown={handleKeyDown}
            onChange={handleConfirmPasswordChange}
            validationState={
                passwordsMatch === true ? "valid" : 
                passwordsMatch === false && confirmNewPassValue.length > 0 ? "error" : 
                "default"
            }
            />
            <div className="mb-4">
             <PasswordStrengthMeter password={newPassValue} />
            </div>
            <PasswordCompromiseCheck 
               password={newPassValue}
               onStatusChange={handleCompromiseStatusChange}
               shouldCheck={shouldCheckCompromise}
               isPasswordStrong={isNewPassValid}
              />
           <div className="flex gap-3 justify-end">
            <Button
                onClick={onClose}
                variant="transparent"
            >
                {cancelText}
            </Button>
            <Button
             onClick={handleConfirmChangePassword}
             variant={isFormValid ? "success" : "secondary"}
             disabled={!isFormValid}
            >
                {confirmPassChangeText}
            </Button>
          </div>
          </>
         )} 
        </div>
      </div>
    </motion.div >
  )
}

export default ChangePassModal