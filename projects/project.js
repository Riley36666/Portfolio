document.addEventListener("DOMContentLoaded", () => {
  fetch('/api/website')
    .then(res => res.json())
    .then(data => {
      const website = data.website;

      const projects = [
        {
          title: "AI Chatbot",
          description: "A smart chatbot built using OpenAI's GPT API.",
          live: `https://${website}/ai`, // added "//" here
        },
        {
          title: "Notes app",
          description: "Simple notes app I created using json as a storage",
          live: `https://${website}/notes`
        },
        {
          title: "Calandar app",
          description: "My calandar!",
          github: `https://${website}/calendar`
        },
        {
          title: "Ai naughts and crosses game",
          description: "Ai game that has a gui.",
          github: "https://github.com/Riley36666/Ai-noughts-and-crosses"
        },
      ];

      const projectList = document.getElementById("project-list");

      projects.forEach(project => {
        const card = document.createElement("div");
        card.className = "project-card";

        card.innerHTML = `
          <div class="project-title">${project.title}</div>
          <div class="project-description">${project.description}</div>
          <div class="project-buttons">
            ${project.github ? `<a href="${project.github}" target="_blank">GitHub</a>` : ""}
            ${project.live ? `<a href="${project.live}" target="_blank">Live Site</a>` : ""}
          </div>
        `;

        projectList.appendChild(card);
      });
    })
    .catch(err => console.error("Failed to load website URL:", err));
});
