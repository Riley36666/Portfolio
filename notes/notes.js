document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('note-form');
  const titleInput = document.getElementById('note-title');
  const contentInput = document.getElementById('note-content');
  const notesList = document.getElementById('notes-list');

  async function loadNotes() {
    const res = await fetch('/api/notes');
    const notes = await res.json();
    notesList.innerHTML = '';
    notes.reverse().forEach(note => {
      const noteEl = document.createElement('div');
      noteEl.className = 'note';
      noteEl.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <small>Created: ${new Date(note.created).toLocaleString()}</small>
        <button onclick="deleteNote(${note.id})">Delete</button>
      `;
      notesList.appendChild(noteEl);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newNote = {
      title: titleInput.value.trim(),
      content: contentInput.value.trim()
    };
    if (!newNote.title || !newNote.content) return;

    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    });

    titleInput.value = '';
    contentInput.value = '';
    loadNotes();
  });

  window.deleteNote = async (id) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    loadNotes();
  };

  loadNotes();
});
