function updateCountdowns(exams) {
  const now = new Date();
  const container = document.getElementById("examCountdown");
  container.innerHTML = "";

  exams.forEach(exam => {
    const examDate = new Date(exam.date);
    const diff = examDate - now;

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      const examElement = document.createElement("div");
      examElement.className = "exam";

      examElement.innerHTML = `
        <h3>${exam.subject}</h3>
        <p>📅 ${examDate.toDateString()} @ ${examDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
        <p>📍 ${exam.room} — Seat ${exam.seat}</p>
        <p>⏳ ${days}d ${hours}h ${minutes}m left</p>
      `;

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
