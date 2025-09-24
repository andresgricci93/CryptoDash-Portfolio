
const Setting = ({ icon: Icon, title, children }) => {
	return (
		<div
			className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
		>
			<div className='flex items-center mb-4'>
				<Icon className='text-white mr-4' size='24' />
				<h2 className='text-xl font-semibold text-gray-100'>{title}</h2>
			</div>
			{children}
		</div>
	);
};
export default Setting;