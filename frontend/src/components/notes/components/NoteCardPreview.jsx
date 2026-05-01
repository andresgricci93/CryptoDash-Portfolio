const NoteCardPreview = ({ note }) => (
  <div className="bg-gray-600 p-3 rounded-md shadow-lg opacity-90 w-64 rotate-2 pointer-events-none">
    <h4 className="text-white font-semibold text-sm">{note.title}</h4>
    <p className="text-gray-300 text-xs mt-1">
      {note.textContent.substring(0, 40)}...
    </p>
  </div>
);

export default NoteCardPreview;
