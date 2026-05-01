import { useDraggable } from '@dnd-kit/react';
import { motion } from 'framer-motion';
import { Eye, Pencil } from 'lucide-react';

const DraggableNoteCard = ({ 
  note, 
  onDelete, 
  onEdit, 
  onView 
}) => {
  const { ref, isDragging } = useDraggable({
    id: note._id,
    data: { type: 'note', note }
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.7 }}
      className="bg-gray-700 p-7 mb-2 rounded relative"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note._id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-2 right-4 text-red-400 hover:text-red-300"
        >
          ×
        </button>
      )}

      {onView && (
        <Eye 
          onClick={(e) => {
            e.stopPropagation();
            onView(note._id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          size={13}
          className='absolute bottom-4 right-9 cursor-pointer text-white hover:text-blue-300'
        />
      )}

      {onEdit && (
        <Pencil 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(note);
          }}
          onPointerDown={(e) => e.stopPropagation()}
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

export default DraggableNoteCard;
