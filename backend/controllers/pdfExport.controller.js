import puppeteer from 'puppeteer';
import { Note } from '../models/note.model.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { GoogleGenerativeAI } from "@google/generative-ai";
import htmlPdf from 'html-pdf-node';



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

    const options = { format: 'A4' };
    const file = { content: htmlTemplate };
    
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

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

export const exportToWord = async (req, res) => {
  const { noteId } = req.params;
  console.log("Word export per noteId:", noteId);

  try {
    const note = await Note.findOne({ _id: noteId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }


    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: note.title,
            heading: HeadingLevel.HEADING_1,
          }),
          ...(note.tags?.length ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tags: ${note.tags.join(', ')}`,
                  italics: true,
                  color: "666666",
                }),
              ],
            }),
            new Paragraph({ text: "" }), 
          ] : []),
          
          new Paragraph({
            text: note.textContent,
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title}.docx"`);
    res.send(buffer);

  } catch (error) {
    console.error('Word generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const generateAISummary = async (req, res) => {
  const { noteId } = req.params;
  console.log("AI Summary per noteId:", noteId);

  try {
    const note = await Note.findOne({ _id: noteId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    const prompt = `Please create a concise summary of this note. Focus on the key points and main ideas:

Title: ${note.title}
Content: ${note.textContent}

  Provide a clear, structured summary in plain text format.
  Instructions:
  - Write in plain text only
  - No asterisks, no bold formatting, no special characters
  - Use normal sentences and paragraphs
  - Focus on the main points and key information
  - Keep it concise but informative
`;

    const googleai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const gemini = googleai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const result = await gemini.generateContent(prompt);
    const summary = result.response.text();

    res.status(200).json({
      success: true,
      summary: summary,
      originalTitle: note.title
    });

  } catch (error) {
    console.error('AI Summary generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const exportSummaryToPDF = async (req, res) => {
  const { title, content } = req.body;

  try {
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
          h1 { color: #333; margin-bottom: 20px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">${content}</div>
      </body>
      </html>
    `;

    const options = { format: 'A4' };
    const file = { content: htmlTemplate };
    
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const exportSummaryToWord = async (req, res) => {
  const { title, content } = req.body;

  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }), // Spazio
          new Paragraph({
            text: content,
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`);
    res.send(buffer);

  } catch (error) {
    console.error('Word generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};