import { AnimatePresence, motion as Motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const SidebarNavItem = ({ item, isSidebarOpen }) => {
  const Icon = item.icon;

  return (
    <NavLink
      aria-label={item.name}
      className={({ isActive }) => (
        `mb-2 flex -ml-1 items-center rounded-lg p-4 text-sm font-medium transition-colors hover:bg-gray-700 ${
          isActive ? 'bg-gray-700 text-white' : 'text-gray-100'
        }`
      )}
      to={item.href}
    >
      <Icon aria-hidden="true" className="min-w-5 text-white" size={20} />
      <AnimatePresence initial={false}>
        {isSidebarOpen ? (
          <Motion.span
            animate={{ opacity: 1, width: 'auto' }}
            className="ml-4 whitespace-nowrap"
            exit={{ opacity: 0, width: 0 }}
            initial={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.name}
          </Motion.span>
        ) : null}
      </AnimatePresence>
    </NavLink>
  );
};

export default SidebarNavItem;
