import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const NOTES_FILE = path.join(__dirname, '..', 'notes.json');
router.get('/', (req, res) => {
    const data = fs.readFileSync(NOTES_FILE, 'utf8');
    res.json(JSON.parse(data));
});
router.post('/', (req, res) => {
    const notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
    const newNote = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content,
        created: new Date().toISOString()
    };
    notes.push(newNote);
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    res.json(newNote);
});
router.delete('/:id', (req, res) => {
    let notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
    notes = notes.filter((note) => note.id != req.params.id);
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    res.sendStatus(200);
});
export default router;
