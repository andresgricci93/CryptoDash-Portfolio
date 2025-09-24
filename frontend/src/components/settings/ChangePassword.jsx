import { useState } from "react";
import { Key } from "lucide-react";
import {motion, AnimatePresence} from 'framer-motion';
import Setting from "./Setting.jsx";
import ToggleSwitch from "./ToggleSwitch.jsx";
import ChangePassModal from "../modals/ChangePassModal.jsx";
import Button from "../common/Button.jsx";

const ChangePassword = () => {
	// const [twoFactor, setTwoFactor] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = () => {
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
       setIsModalOpen(false)
	}

	  const handleConfirmChange = () => {
    console.log("Password changed!");

    setIsModalOpen(false);
  };
	return (
		<>
		<Setting icon={Key} title={"Security"}>
			{/* <ToggleSwitch
				label={"Two-Factor Authentication"}
				isOn={twoFactor}
				onToggle={() => setTwoFactor(!twoFactor)}
				/> */}
			<div className='mt-4'>
              <Button
			   variant="settingsCard"
			   onClick={handleOpenModal}
			  >
				Change Password
			  </Button>
			</div>
		</Setting>
		<AnimatePresence>

		{isModalOpen && (
			<ChangePassModal
			 isOpen={isModalOpen}
			 onClose={handleCloseModal}
			 onConfirm={handleConfirmChange}
			 title="Change your Password"
			 description=""
			 confirmPassChangeText="Change Password"
			 cancelText="Cancel"
			/>
		)}
		</AnimatePresence>
		</>
	);
};
export default ChangePassword;
