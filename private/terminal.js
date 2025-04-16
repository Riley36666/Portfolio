const terminal = document.getElementById("terminal");
const input = document.getElementById("command");
const promptText = document.getElementById("prompt").textContent;

function appendOutput(text) {
  terminal.innerHTML += text + "\n";
  terminal.scrollTop = terminal.scrollHeight;
}

input.addEventListener("keydown", async (e) => {
  const command = input.value.trim();

  // TAB key for autocomplete
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
    } catch (err) {
      appendOutput("Autocomplete failed");
    }

    return;
  }

  // ENTER key to run command
  if (e.key === "Enter") {
    appendOutput(promptText + " " + command);
    input.value = "";

    if (command) {
      try {
        const res = await fetch("/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command }),
        });

        const text = await res.text();
        appendOutput(text);
      } catch (err) {
        appendOutput("Error contacting server");
      }
    }

    return;
  }
});
