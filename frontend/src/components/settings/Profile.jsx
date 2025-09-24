import { useState } from "react";
import { User } from "lucide-react";
import Setting from "./Setting.jsx";
import Button from "../common/Button.jsx";
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileModal from "../modals/EditProfileModal.jsx";

const Profile = () => {
	const { user } = useAuthStore();
	const [isModalOpen, setIsModalOpen] = useState(false);
	
	const handleOpenModal = () => {
	  setIsModalOpen(true);
	};
	
	const handleCloseModal = () => {
	  setIsModalOpen(false);
	};


	
	return (
	<>	
		<Setting icon={User} title={"Profile"}>
			<div className='flex flex-col sm:flex-row items-center mb-6'>
				<img
					src={user?.avatar || 'https://randomuser.me/api/portraits/men/3.jpg'}
					alt='Profile'
					className='rounded-full w-20 h-20 object-cover mr-4'
				/>
				<div>
					<h3 className='text-lg font-semibold text-gray-100'>{user?.name || 'Loading...'}</h3>
					<p className='text-gray-400'>{user?.email || 'Loading...'}</p>
				</div>
			</div>

            <Button
			   variant="settingsCard"
			   onClick={handleOpenModal}
			>
				Edit Profile
			</Button>
		</Setting>
			<AnimatePresence>

		{isModalOpen && (
			<EditProfileModal
			 isOpen={isModalOpen}
			 onClose={handleCloseModal}

			/>
		)}
		</AnimatePresence>
	  </>
	);
};
export default Profile;
