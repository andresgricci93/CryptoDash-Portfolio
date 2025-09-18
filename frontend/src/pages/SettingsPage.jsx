import Header from "../components/common/Header";
import DeleteAccount from "../components/settings/DeleteAccount";
import Profile from "../components/settings/Profile";
import ChangePassword from "../components/settings/ChangePassword";

const SettingsPage = () => {


	
	return (
		<div className='flex-1 h-screen overflow-auto relative z-10 bg-gray-900'>
			<Header title='Settings' />
			<main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
			 <Profile />
			 <ChangePassword />
			 <DeleteAccount />
			</main>
		</div>
	);
};
export default SettingsPage;
