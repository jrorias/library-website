import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_ID = 0; // ✅ Changed from '0' to 0

export default async function handler(req, res) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  // Validate environment variables
  if (!privateKey || !clientEmail || !SPREADSHEET_ID) {
    console.error('Missing environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error: Missing environment variables' 
    });
  }

  try {
    const jwt = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    let sheet = doc.sheetsById[SHEET_ID];

    // Create sheet if doesn't exist
    if (!sheet) {
      sheet = await doc.addSheet({ 
        sheetId: SHEET_ID, 
        title: 'GSAP Library' 
      });
      await sheet.setHeaderRow([
        'id', 'title', 'description', 'documentationUrl', 
        'codeSnippet', 'variables', 'dataAccessibilityText', 
        'embedVideo', 'color', 'likes', 'dateAdded', 'image'
      ]);
    }

    // GET - Fetch all rows
    if (req.method === 'GET') {
      const rows = await sheet.getRows();
      const data = rows.map((row) => ({
        id: row.get('id') || '',
        title: row.get('title') || '',
        description: row.get('description') || '',
        codeSnippet: row.get('codeSnippet') || '',
        variables: row.get('variables') || '',
        dataAccessibilityText: row.get('dataAccessibilityText') || '',
        documentationUrl: row.get('documentationUrl') || '', // ✅ Default to empty string
        embedVideo: row.get('embedVideo') || '',
        color: row.get('color') || '',
        likes: parseInt(row.get('likes') || '0', 10),
        dateAdded: row.get('dateAdded') || '',
        image: row.get('image') || ''
      }));
      
      return res.status(200).json(data);
    } 
    
    // POST - Add new row
    else if (req.method === 'POST') {
      // ✅ Validate required fields
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      const newRow = {
        id: Date.now().toString(),
        title: req.body.title || '',
        description: req.body.description || '',
        documentationUrl: req.body.documentationUrl || '', // ✅ Handle explicitly
        codeSnippet: req.body.codeSnippet || '',
        variables: req.body.variables || '',
        dataAccessibilityText: req.body.dataAccessibilityText || '',
        embedVideo: req.body.embedVideo || '',
        color: req.body.color || '',
        likes: req.body.likes || '0',
        dateAdded: req.body.dateAdded || new Date().toISOString(),
        image: req.body.image || ''
      };

      await sheet.addRow(newRow);
      const rows = await sheet.getRows();
      
      return res.status(200).json({ 
        message: 'Data added successfully', 
        rowNumber: rows.length,
        id: newRow.id 
      });
    } 
    
    // PUT - Update row
    else if (req.method === 'PUT') {
      if (req.body.action === 'reorder') {
        const { entries } = req.body;
        
        // ✅ Validate entries
        if (!Array.isArray(entries)) {
          return res.status(400).json({ error: 'Invalid entries array' });
        }

        const rows = await sheet.getRows();
        
        for (const entry of entries) {
          const row = rows.find(r => r.get('id') === entry.id);
          if (row) {
            // ✅ Only update allowed fields
            const allowedFields = [
              'title', 'description', 'documentationUrl', 'codeSnippet', 
              'variables', 'dataAccessibilityText', 'embedVideo', 
              'color', 'likes', 'dateAdded', 'image'
            ];
            
            for (const [key, value] of Object.entries(entry)) {
              if (allowedFields.includes(key)) {
                row.set(key, value !== undefined && value !== null ? value.toString() : '');
              }
            }
            await row.save();
          }
        }
        
        return res.status(200).json({ message: 'Entries reordered successfully' });
      } 
      else {
        // Update likes
        const { index, likes } = req.body;
        
        // ✅ Validate input
        if (typeof index !== 'number' || typeof likes !== 'number') {
          return res.status(400).json({ error: 'Invalid index or likes value' });
        }

        const rows = await sheet.getRows();
        
        if (index >= 0 && index < rows.length && rows[index]) {
          rows[index].set('likes', likes.toString());
          await rows[index].save();
          return res.status(200).json({ message: 'Likes updated successfully' });
        } else {
          return res.status(400).json({ error: 'Invalid row index' });
        }
      }
    } 
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Error in API route:', error);
    console.error('Stack trace:', error.stack); // ✅ Log stack trace
    return res.status(500).json({ 
      error: `Internal server error: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}