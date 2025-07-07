function createBubble(content: string, type: string) {
  const bubble = document.createElement('div');
  bubble.className = `message ${type}`;
  bubble.innerHTML = content;
  const chat = document.getElementById('chat');
  if (chat) chat.appendChild(bubble);
}

function sendMessage() {
  const input = document.getElementById('userInput') as HTMLInputElement | null;
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;
  createBubble(message, 'user');
  input.value = '';
  input.focus();
  const chat = document.getElementById('chat');
  if (chat) {
    const placeholder = document.createElement('div');
    placeholder.className = 'message assistant';
    placeholder.innerHTML = '<em>Thinking...</em>';
    chat.appendChild(placeholder);
  }
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => {
      if (chat) chat.removeChild(chat.lastChild!);
      createBubble(data.reply, 'assistant');
      saveChatHistory();
    });
  saveChatHistory();
}

function saveChatHistory() {
  const chat = document.getElementById('chat');
  if (!chat) return;
  const history: { type: string; content: string }[] = [];
  chat.querySelectorAll('.message').forEach(msg => {
    history.push({
      type: msg.classList.contains('user') ? 'user' : 'assistant',
      content: msg.innerHTML
    });
  });
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

function loadChatHistory() {
  const chat = document.getElementById('chat');
  if (!chat) return;
  chat.innerHTML = '';
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]') as { type: string; content: string }[];
  history.forEach((msg) => {
    createBubble(msg.content, msg.type);
  });
}

document.getElementById('userInput')?.addEventListener('keydown', function (e: KeyboardEvent) {
  if (e.key === 'Enter') sendMessage();
});
document.getElementById('resetBtn')?.addEventListener('click', resetChat);

function resetChat() {
  localStorage.removeItem('chatHistory');
  const chat = document.getElementById('chat');
  if (chat) chat.innerHTML = '';
}

window.onload = loadChatHistory;

function renderMarkdown(text: string) {
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code)}</code></pre>`;
  });
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  return text;
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
