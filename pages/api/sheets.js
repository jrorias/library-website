import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_ID = '0';

export default async function handler(req, res) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail || !SPREADSHEET_ID) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error: Missing environment variables' });
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

    if (!sheet) {
      sheet = await doc.addSheet({ sheetId: SHEET_ID, title: 'GSAP Library' });
      await sheet.setHeaderRow(['id', 'title', 'description','documentationUrl', 'codeSnippet', 'variables', 'dataAccessibilityText', 'embedVideo', 'color', 'likes', 'dateAdded', 'image']);
    }

    if (req.method === 'GET') {
      const rows = await sheet.getRows();
      const data = rows.map((row) => {
        return {
          id: row.get('id'),
          title: row.get('title'),
          description: row.get('description'),
          codeSnippet: row.get('codeSnippet'),
          variables: row.get('variables'),
          dataAccessibilityText: row.get('dataAccessibilityText'),
           documentationUrl: row.get('documentationUrl'),  // <-- ADD THIS
          embedVideo: row.get('embedVideo'),
          color: row.get('color'),
          likes: parseInt(row.get('likes') || '0'),
          dateAdded: row.get('dateAdded'),
          image: row.get('image')
        };
      });
      res.status(200).json(data);
    } else if (req.method === 'POST') {
      // Store the row but don't use it directly to avoid the unused variable warning
      await sheet.addRow({
        id: Date.now().toString(),
        ...req.body
      });
      const rows = await sheet.getRows();
      const newRowNumber = rows.length;
      res.status(200).json({ message: 'Data added successfully', rowNumber: newRowNumber });
    } else if (req.method === 'PUT') {
      if (req.body.action === 'reorder') {
        const { entries } = req.body;
        const rows = await sheet.getRows();
        
        for (let i = 0; i < entries.length; i++) {
          const row = rows.find(r => r.get('id') === entries[i].id);
          if (row) {
            for (const [key, value] of Object.entries(entries[i])) {
              row.set(key, value);
            }
            await row.save();
          }
        }
        
        res.status(200).json({ message: 'Entries reordered successfully' });
      } else {
        const { index, likes } = req.body;
        const rows = await sheet.getRows();
        if (index >= 0 && index < rows.length) {
          rows[index].set('likes', likes.toString());
          await rows[index].save();
          res.status(200).json({ message: 'Likes updated successfully' });
        } else {
          res.status(400).json({ error: 'Invalid row index' });
        }
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}