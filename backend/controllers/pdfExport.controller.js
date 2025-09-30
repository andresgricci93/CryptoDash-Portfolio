import puppeteer from 'puppeteer';
import { Note } from '../models/note.model.js';

export const exportToPDF = async (req, res) => {
  const { noteId } = req.params;
  console.log("PDF export per noteId:", noteId);

  try {
    const note = await Note.findOne({ _id: noteId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          h2 { color: #555; }
          .tags { margin: 10px 0; }
          .tag { 
            background: #e3f2fd; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px;
            margin-right: 5px;
          }
          strong { font-weight: bold; }
          em { font-style: italic; }
        </style>
      </head>
      <body>
        <h1>${note.title}</h1>
        <div class="tags">
          ${note.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
        </div>
        <div class="content">
          ${note.htmlContent}
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate);
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};