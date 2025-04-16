const terminal = document.getElementById("terminal");
const input = document.getElementById("command");
const promptText = document.getElementById("prompt").textContent;

let history = [];
let historyIndex = -1;

function appendOutput(text) {
  terminal.innerHTML += text + "\n";
  terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
  terminal.innerHTML = "";
}

input.addEventListener("keydown", async (e) => {
  const command = input.value.trim();

  // Handle command history navigation
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (history.length > 0 && historyIndex > 0) {
      historyIndex--;
      input.value = history[historyIndex];
    } else if (history.length > 0 && historyIndex === -1) {
      historyIndex = history.length - 1;
      input.value = history[historyIndex];
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex >= 0 && historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    } else {
      historyIndex = -1;
      input.value = "";
    }
    return;
  }

  // TAB for autocomplete
  if (e.key === "Tab") {
    e.preventDefault();
    try {
      const res = await fetch("/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const suggestion = await res.text();
      if (suggestion && suggestion !== command) {
        input.value = suggestion;
      }
    } catch {
      appendOutput("Autocomplete failed");
    }
    return;
  }

  // ENTER to execute command
  if (e.key === "Enter") {
    appendOutput(promptText + " " + command);
    input.value = "";

    if (command === "clear") {
      clearTerminal();
      return;
    }

    // Save to history
    if (command) {
      history.push(command);
      historyIndex = -1;
    }

    try {
      const res = await fetch("/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const text = await res.text();
      appendOutput(text);
    } catch {
      appendOutput("Error contacting server");
    }

    return;
  }
});
