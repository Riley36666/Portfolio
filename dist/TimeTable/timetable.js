"use strict";
function updateCountdowns(exams) {
    const now = new Date();
    const container = document.getElementById("examCountdown");
    if (container)
        container.innerHTML = "";
    exams.forEach(exam => {
        const examDate = new Date(exam.date).getTime();
        const diff = examDate - now.getTime();
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const examElement = document.createElement("div");
            examElement.className = "exam";
            examElement.innerHTML = `
        <h3>${exam.name}</h3>
        <p>📅 ${new Date(exam.date).toDateString()} @ ${new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p>📍 ${exam.room} — Seat ${exam.seat}</p>
        <p>⏳ ${days}d ${hours}h ${minutes}m left</p>
      `;
            if (container)
                container.appendChild(examElement);
        }
    });
}
// fetches from file
fetch('TimeTable/exams.json')
    .then(response => response.json())
    .then(data => {
    updateCountdowns(data);
    setInterval(() => updateCountdowns(data), 10);
})
    .catch(error => {
    console.error('Error loading exams.json:', error);
});
