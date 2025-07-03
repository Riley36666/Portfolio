function createBubble(content, type) {
  const bubble = document.createElement('div');
  bubble.className = `message ${type}`;
  bubble.innerHTML = content;
  document.getElementById('chat').appendChild(bubble);
  bubble.scrollIntoView({ behavior: 'smooth' });
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const chat = document.getElementById('chat');
  const message = input.value.trim();
  if (!message) return;

  createBubble(message, 'user');
  input.value = '';
  input.focus();

  const placeholder = document.createElement('div');
  placeholder.className = 'message ai';
  placeholder.textContent = 'Typing...';
  chat.appendChild(placeholder);
  placeholder.scrollIntoView({ behavior: 'smooth' });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    placeholder.textContent = '';
    placeholder.innerHTML = renderMarkdown(data.reply || 'No response received.');
  } catch (err) {
    console.error(err);
    placeholder.textContent = '⚠️ Error connecting to AI.';
  }
}

async function loadChatHistory() {
  const res = await fetch('/api/chat/history');
  const history = await res.json();
  history.forEach(msg => {
    const type = msg.role === 'user' ? 'user' : 'ai';
    createBubble(renderMarkdown(msg.content), type);
  });
}

async function resetChat() {
  await fetch('/api/chat/reset', { method: 'POST' });
  document.getElementById('chat').innerHTML = '';
}

// Press Enter to send
document.getElementById('userInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') sendMessage();
});

document.getElementById('resetBtn').addEventListener('click', resetChat);

// Load history on page load
window.onload = loadChatHistory;

function renderMarkdown(text) {
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code)}</code></pre>`;
  });
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>')
             .replace(/^## (.*$)/gim, '<h2>$1</h2>')
             .replace(/^# (.*$)/gim, '<h1>$1</h1>')
             .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
             .replace(/\*(.*?)\*/gim, '<em>$1</em>')
             .replace(/\n/g, '<br>');
  return text;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
