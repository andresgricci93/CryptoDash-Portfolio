import { useState } from "react";
import { User } from "lucide-react";
import Setting from "./Setting.jsx";
import Button from "../common/Button.jsx";


const Profile = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	
	const handleOpenModal = () => {
	  setIsModalOpen(true);
	};
	
	const handleCloseModal = () => {
	  setIsModalOpen(false);
	};


	
	return (
		<Setting icon={User} title={"Profile"}>
			<div className='flex flex-col sm:flex-row items-center mb-6'>
				<img
					src='https://randomuser.me/api/portraits/men/3.jpg'
					alt='Profile'
					className='rounded-full w-20 h-20 object-cover mr-4'
				/>
				<div>
					<h3 className='text-lg font-semibold text-gray-100'>John Doe</h3>
					<p className='text-gray-400'>john.doe@example.com</p>
				</div>
			</div>

            <Button
			   variant="settingsCard"
			   onClick={handleOpenModal}
			>
				Edit Profile
			</Button>
		</Setting>
	);
};
export default Profile;
