import {useState} from 'react'
import { BarChart2,  
  Menu, 
  Settings, 
  BarChart3, 
  NotebookPen,
  HandCoins,
  LogOut,
 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { useAuthStore } from "../store/authStore";



const SIDEBAR_ITEMS = [

	{ name: "Dashboard", icon: BarChart3, color: "#FFFFFF", href: "/dashboard" },
	{ name: "Favorites Coins", icon:  HandCoins , color: "#FFFFFF", href: "/favorites" },
	{ name: "Notes", icon: NotebookPen, color: "#FFFFFF", href: "/notes" },
	{ name: "Settings", icon: Settings, color: "#FFFFFF", href: "/settings" },
  
];

export const Sidebar = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { user, logout } = useAuthStore();
  
    const handleLogout = () => {
      logout();
    }


  return (
    <motion.div
     className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        `} 
        animate={{width: isSidebarOpen ? 256 : 80}}      
    >
       <div className='h-screen bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
          <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
          >
          <Menu size={24}/>
          </motion.button>
          <nav className='mt-8 flex-grow'>
            {SIDEBAR_ITEMS.map((item) => (
              <Link key={item.href} to={item.href}>
                <motion.div
                className='flex items-center p-4 hover:-ml-[4px] -ml-[4px] text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors
                mb-2'
                >
                  <item.icon size={20} style={{color: item.color, minWidth: "20px"}} />
                  <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className='ml-4 whitespace-nowrap'
                      initial={{opacity: 0, width: 0}}
                      animate={{opacity: 1, width: "auto"}}
                      exit={{opacity:0, width: 0}}
                      transition={{duration: 0.2, delay: 0.3}}
                    >
                      {item.name}
                    </motion.span>
                  )}   
                  </AnimatePresence>
                </motion.div>
              </Link>

            ))}
          </nav>
          <Link>
            <motion.div
             
              whileTap={{ scale: 0.98 }}
              className='flex items-center p-4 hover:-ml-[4px] -ml-[4px] text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors
                  mb-2 '
              onClick={handleLogout}  
                  >
              <LogOut size={20} style={{ color: "#FFFFFF", minWidth: "20px" }} />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.button
                  className='ml-4 whitespace-nowrap'
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  >
                    Logout
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
       </div> 

    </motion.div>
  )
}
