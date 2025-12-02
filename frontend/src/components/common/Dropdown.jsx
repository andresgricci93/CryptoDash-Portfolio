import {useState, useRef, useEffect} from "react";

const Dropdown = ({value, onChange, options, placeholder="Select..."}) => {

   const [isOpen, setIsOpen] = useState(false)
   const dropdownRef = useRef(null);

   useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   },[])


   const selectedOption = options.find(opt => opt.value === value);

   return (
     <div ref={dropdownRef} className="relative w-fit overf">
 
       <button
         type="button"
         onClick={() => setIsOpen(!isOpen)}
         className="w-32 p-2 bg-gray-700 text-white text-sm rounded border border-gray-600 flex justify-between items-center"
       >
         <span>{selectedOption ? selectedOption.label : placeholder}</span>
         <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
         >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
       </button>
 
     
       {isOpen && (
         <ul className="absolute top-full left-0 w-full mt-1 bg-gray-700 border border-gray-600 rounded max-h-60 overflow-y-auto overflow-x-hidden z-50">
           {options.map((option) => (
             <li
               key={option.value}
               onClick={() => {
                 onChange(option.value);
                 setIsOpen(false);
               }}
               className="p-2 w-32 text-white text-sm hover:bg-gray-600 cursor-pointer"
             >
               {option.label}
             </li>
           ))}
         </ul>
       )}
     </div>
   )

}


export default Dropdown;