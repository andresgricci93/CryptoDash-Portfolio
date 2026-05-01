import { motion } from 'framer-motion';
import { Eye, Pencil, Unlink } from 'lucide-react';

const NoteCard = ({ 
  note, 
  onDelete, 
  onEdit, 
  onView,
  onUnlink,
  onDragStart,
  onDragEnd,
  draggable = true  
}) => {
  
  return (
    <motion.div
      key={note._id}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.7 }}
      className="bg-gray-700 p-7 mb-2 rounded relative"
      draggable={draggable}  
      onDragStart={draggable ? (e) => onDragStart(e, note) : undefined}  
      onDragEnd={draggable ? onDragEnd : undefined}  
    >
      {onDelete && (  
        <button
          onClick={() => onDelete(note._id)}
          className="absolute top-2 right-4 text-red-400 hover:text-red-300"
        >
          ×
        </button>
      )}

      {onView && (  
        <Eye 
          onClick={() => onView(note._id)}
          size={13}
          className='absolute bottom-4 right-14 cursor-pointer text-white hover:text-blue-300'
        />
      )}

      {onUnlink && (
        <Unlink
          onClick={() => onUnlink(note._id)}
          size={13}
          className='absolute bottom-4 right-9 cursor-pointer text-white hover:text-red-400'
        />
      )}

      {onEdit && (  
        <Pencil 
          onClick={() => onEdit(note)}
          size={13}
          className='absolute bottom-4 right-4 cursor-pointer text-white hover:text-gray-300'
        />
      )}

      <h4 className="text-white font-semibold">{note.title}</h4>
      <p className="text-gray-300 text-sm">
        {note.textContent.substring(0, 50)}...
      </p>
    </motion.div>
  );
};

export default NoteCard;
