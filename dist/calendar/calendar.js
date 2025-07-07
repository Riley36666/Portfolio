"use strict";
let currentDate = new Date();
const calendar = document.getElementById("calendar");
if (calendar) {
    calendar.innerHTML = "";
}
const monthYear = document.getElementById("monthYear");
if (monthYear)
    monthYear.textContent = `${currentDate.toLocaleString("default", {
        month: "long"
    })} ${currentDate.getFullYear()}`;
const prevMonthBtn = document.getElementById("prevMonth");
if (prevMonthBtn)
    prevMonthBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };
const nextMonthBtn = document.getElementById("nextMonth");
if (nextMonthBtn)
    nextMonthBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };
let events = JSON.parse(localStorage.getItem("calendarEvents") || '{}');
const allowedIP = "90.240.45.255";
let canEdit = false;
function renderCalendar() {
    calendar.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach((day) => {
        const dayEl = document.createElement("div");
        dayEl.className = "day-name";
        dayEl.textContent = day;
        if (calendar)
            calendar.appendChild(dayEl);
    });
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        blank.className = "day blank";
        if (calendar)
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
                }
                else {
                    events[dateStr] = input.trim();
                }
                localStorage.setItem("calendarEvents", JSON.stringify(events));
                renderCalendar();
            }
        });
        if (calendar)
            calendar.appendChild(dayBox);
    }
}
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
