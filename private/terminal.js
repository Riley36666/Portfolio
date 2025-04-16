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
  
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        appendOutput(data.suggestions.join("    "));
      } else {
        const suggestion = await res.text();
        if (suggestion && suggestion !== command) {
          input.value = suggestion;
        }
      }
      
    } catch (err) {
      appendOutput("Autocomplete failed");
    }
  }
  

  // ENTER to execute command
  if (e.key === "Enter") {
    appendOutput(promptText + " " + command);
    input.value = "";

    if (command === "clear") {
      clearTerminal();
      return;
    }
    if (command === "git") {
      gitpull = "git pull"
      try {
        const res = await fetch("/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gitpull }),
      });
      } catch {
        appendOutput("Error contacting server");
      }
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
