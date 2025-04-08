import { questions } from "./questions.js"; // Make sure path is correct
const questions = {
  ...mathsQuestions,
  ...englishQuestions,
  ...scienceQuestions,
  ...historyQuestions,
  ...geographyQuestions
};
const subjects = {
  Maths: ["Algebra", "Geometry", "Trigonometry", "Probability"],
  English: ["Poetry", "Prose", "Drama", "Language Techniques"],
  Science: ["Biology", "Chemistry", "Physics"],
  History: ["WWI", "WWII", "Cold War", "Industrial Revolution"],
  Geography: ["Rivers", "Coasts", "Urban Issues", "Climate Change"]
};



let activeSubject = "Maths";

const tabsContainer = document.getElementById("subjectTabs");
const topicsContainer = document.getElementById("topicsContainer");
const searchInput = document.getElementById("searchInput");

// Modal setup
const modal = document.createElement("div");
modal.id = "questionModal";
modal.innerHTML = `<div class="modal-content" id="modalContent"></div>`;
modal.style.display = "none";
document.body.appendChild(modal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

function createTabs() {
  Object.keys(subjects).forEach((subject) => {
    const btn = document.createElement("button");
    btn.textContent = subject;
    btn.classList.toggle("active", subject === activeSubject);
    btn.addEventListener("click", () => {
      activeSubject = subject;
      updateTabs();
      renderTopics();
    });
    tabsContainer.appendChild(btn);
  });
}

function updateTabs() {
  [...tabsContainer.children].forEach((btn) => {
    btn.classList.toggle("active", btn.textContent === activeSubject);
  });
}

function renderTopics() {
  const query = searchInput.value.toLowerCase();
  const filtered = subjects[activeSubject].filter((topic) =>
    topic.toLowerCase().includes(query)
  );

  topicsContainer.innerHTML = "";

  filtered.forEach((topic) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${topic}</h2>
      <p>Quick notes and explanations for ${topic}.</p>
      <button data-topic="${topic}">Start Revising</button>
    `;
    const btn = card.querySelector("button");
    btn.addEventListener("click", () => showQuestion(topic));
    topicsContainer.appendChild(card);
  });
}

function showQuestion(topic) {
  const data = questions[topic];
  if (!data) {
    modal.querySelector("#modalContent").innerHTML = `<div class="modal-box">
      <h2>${topic}</h2>
      <p>No questions available yet for this topic.</p>
      <button onclick="document.getElementById('questionModal').style.display='none'">Close</button>
    </div>`;
    modal.style.display = "flex";
    return;
  }

  const optionsHTML = data.options
    .map(
      (opt) => `<button class="option">${opt}</button>`
    )
    .join("");

  modal.querySelector("#modalContent").innerHTML = `<div class="modal-box">
    <h2>${topic}</h2>
    <p>${data.question}</p>
    <div class="options">${optionsHTML}</div>
    <p id="feedback" style="margin-top: 1rem;"></p>
    <button onclick="document.getElementById('questionModal').style.display='none'">Close</button>
  </div>`;

  modal.style.display = "flex";

  document.querySelectorAll(".option").forEach((btn) =>
    btn.addEventListener("click", () => {
      const feedback = document.getElementById("feedback");
      if (btn.textContent === data.answer) {
        feedback.textContent = "✅ Correct!";
        feedback.style.color = "green";
      } else {
        feedback.textContent = `❌ Incorrect. Correct answer: ${data.answer}`;
        feedback.style.color = "red";
      }
    })
  );
}

searchInput.addEventListener("input", renderTopics);
createTabs();
renderTopics();
