import { useState,useEffect } from 'react';
import { motion } from "framer-motion";
import Input from '../components/Input.jsx';
import { Link } from 'react-router-dom';
import { Mail,Lock,Loader } from "lucide-react";
import { useAuthStore } from '../store/authStore.js';
import { useSearchParams } from 'react-router-dom';


const LoginPage = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {login, isLoading, error} = useAuthStore();
  const [searchParams] = useSearchParams();

  
  useEffect(() => {
    const company = searchParams.get('company');
    if (company) {
      localStorage.setItem('invitedCompany', company)
    }
  },[searchParams])

  const invitedCompany = searchParams.get('company') || localStorage.getItem('invitedCompany');

  const handleLogin = async (e) => {
    e.preventDefault();
   await login(email, password);
  } 


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'   
    >
    <div className="p-8">
      <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r text-white text-transparent bg-clip-text'>
       {invitedCompany ? `Welcome, ${invitedCompany}`: 'Welcome back'}
      </h2>
      <form onSubmit={handleLogin}
      >
      <Input 
        icon={Mail}
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}     
      />
      <Input 
        icon={Lock}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}     
      />
      <div className='flex items-center mb-6'>
        <Link to='/forgot-password' className='text-sm text-white hover:underline'>
         Forgot Password?
        </Link>
      </div>
      {error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
      <motion.button
         whileHover={{scale: 1.02}}
         whileTap={{scale: 0.98}}
         className='w-full py-3 px-4 bg-gradient-to-r font-medium text-black bg-white rounded-lg focus:ring-offset-2 focus:ring-offset-gray-900
         transition-all duration-1000 ease-out'
         type="submit"
         disabled={isLoading}
      >
       {isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' />: "Login"}
      </motion.button>
      </form>
    </div>
     <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
       <p className='text-sm text-gray-400'>
         Don't have an account? {" "}
         <Link to='/signup' className='text-white hover:underline'>
          Sign Up
         </Link>
       </p>
     </div>
    </motion.div>
  )

}

export default LoginPage;