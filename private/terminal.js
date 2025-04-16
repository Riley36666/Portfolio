const terminal = document.getElementById("terminal");
    const input = document.getElementById("command");
    const promptText = document.getElementById("prompt").textContent;

    function appendOutput(text) {
      terminal.innerHTML += text + "\n";
      terminal.scrollTop = terminal.scrollHeight;
    }

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const command = input.value.trim();
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
      }
    });
    input.addEventListener("keydown", async (e) => {
  if (e.key === "Tab") {
    e.preventDefault();

    const command = input.value;

    try {
      const res = await fetch("/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const suggestion = await res.text();

      // If we got a suggestion, add it to the input
      if (suggestion && suggestion !== command) {
        input.value = suggestion;
      }
    } catch (err) {
      appendOutput("Autocomplete failed");
    }

    return;
  }

  // ENTER to execute command
  if (e.key === "Enter") {
    const command = input.value.trim();
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
  }
});