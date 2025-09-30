import jsPDF from 'jspdf';

const generatePdfProsAndCons = (favorites, aiResponse) => {
  const doc = new jsPDF();
  
  const today = new Date();
  const dateString = today.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  }).replace(/\//g, '-'); 
  
  doc.setFontSize(18);
  doc.text('Crypto Analysis - Pros & Cons', 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${dateString}`, 20, 30);
  
  doc.setFontSize(12);
  const cryptoNames = favorites.map(f => f.name).join(', ');
  doc.text(`Analysis for: ${cryptoNames}`, 20, 45);
  
  doc.setFontSize(10);
  const splitText = doc.splitTextToSize(aiResponse, 170);
  doc.text(splitText, 20, 60);

  doc.save(`crypto-pros-cons-analysis-${dateString}.pdf`);
};

export default generatePdfProsAndCons;