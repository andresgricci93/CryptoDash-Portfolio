export const getNotesCountByCrypto = (notes) => {
  const counts = {};
  
  //prevents "Cannot read properties of undefined (reading 'forEach)" when notes is undefined at the beginning.
  if (!notes || !Array.isArray(notes)) {
     return counts;
  }

  notes.forEach(note => {
    if (note.cryptoId && Array.isArray(note.cryptoId)) {
      note.cryptoId.forEach(cryptoId => {
        counts[cryptoId] = (counts[cryptoId] || 0) + 1;
      });
    }
  });
  
  return counts;
};


export const formatNoteCount = (count) => {
  if (count === 0) return "";
  if (count === 1) return "1 note";
  return `${count} notes`;
};