const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  let currentDate = new Date();
  let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};

  const allowedIP = "90.240.45.255";
  let canEdit = false;

  function renderCalendar() {
    calendar.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${currentDate.toLocaleString("default", {
      month: "long",
    })} ${year}`;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.className = "day-name";
      dayEl.textContent = day;
      calendar.appendChild(dayEl);
    });

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement("div");
      blank.className = "day blank";
      calendar.appendChild(blank);
    }

    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split("T")[0];

      const dayBox = document.createElement("div");
      dayBox.className = "day";
      dayBox.innerHTML = `<strong>${d}</strong>`;

      if (events[dateStr]) {
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = events[dateStr];
        dayBox.appendChild(note);
      }

      dayBox.addEventListener("click", () => {
        if (!canEdit) {
          alert("Editing is disabled on this device.");
          return;
        }

        const input = prompt("Enter or edit note:", events[dateStr] || "");
        if (input !== null) {
          if (input.trim() === "") {
            delete events[dateStr];
          } else {
            events[dateStr] = input.trim();
          }
          localStorage.setItem("calendarEvents", JSON.stringify(events));
          renderCalendar();
        }
      });

      calendar.appendChild(dayBox);
    }
  }

  prevMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  };

  nextMonthBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  };

  // 🌐 Get user's public IP and check if editing is allowed
  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      if (data.ip === allowedIP) {
        canEdit = true;
      }
      renderCalendar();
    })
    .catch(err => {
      console.error("Failed to get IP address", err);
      renderCalendar();
    });