window.addEventListener("DOMContentLoaded", async () => {
  let messages = [];

  const chatLog = document.getElementById("chat-log");
  const message = document.getElementById("message");
  const form = document.querySelector("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = message.value;
    const newMessage = { role: "user", content: `${messageText}` };
    messages.push(newMessage);
    message.value = "";
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.classList.add("message--sent");
    messageElement.innerHTML = `
          <div class="message__text">${messageText}</div>
        `;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
    fetch("https://wizpalace.azurewebsites.net/api/gptfunction?", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      let newAssistantMessage = {
        role: "assistant",
        content: `${data.completion.content}`,
      };
      messages.push(newAssistantMessage);
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.classList.add("message--received");
      messageElement.innerHTML = `
          <div class="message__text">${data.completion.content}</div>
        `;
      chatLog.appendChild(messageElement);
      chatLog.scrollTop = chatLog.scrollHeight;
    });
  });

  // clicking profile
  const profileContainer = document.getElementById("select-profile-container");
  
  const scarecrow = document.getElementById("scarecrow");
  const tinman = document.getElementById("tinman");
  const dorothy = document.getElementById("dorothy");
  const lion = document.getElementById("lion");
  const header = document.querySelector("header");
  const h1 = document.querySelector("h1");

  const wizProfileContainer = document.createElement("div");
  wizProfileContainer.classList.add("wiz-profile-container");

  const wizProfileImg = document.createElement("img");
  wizProfileImg.classList.add("wiz-profile-img");
  wizProfileImg.src = "images/wiz-profile.png";

  const wizProfileText = document.createElement("div");
  wizProfileText.classList.add("wiz-profile-text");
  wizProfileText.innerHTML = 'Wizard of Oz';

  scarecrow.addEventListener("click", (e) => {
    const initialMessage = { role: "user", content: "Hi, I'm Scarecrow." };
    messages.push(initialMessage);
    profileContainer.style.display = "none";
    form.style.display = "block";
    h1.style.display = "none";
    header.appendChild(wizProfileContainer);
    wizProfileContainer.appendChild(wizProfileImg);
    wizProfileContainer.appendChild(wizProfileText);
  });

  tinman.addEventListener("click", (e) => {
    const initialMessage = { role: "user", content: "Hi, I'm the Tin Man." };
    messages.push(initialMessage);
    profileContainer.style.display = "none";
    form.style.display = "block";
    h1.style.display = "none";
    header.appendChild(wizProfileContainer);
    wizProfileContainer.appendChild(wizProfileImg);
    wizProfileContainer.appendChild(wizProfileText);
  });

  dorothy.addEventListener("click", (e) => {
    const initialMessage = { role: "user", content: "Hi, I'm Dorothy Gale." };
    messages.push(initialMessage);
    profileContainer.style.display = "none";
    form.style.display = "block";
    h1.style.display = "none";
    header.appendChild(wizProfileContainer);
    wizProfileContainer.appendChild(wizProfileImg);
    wizProfileContainer.appendChild(wizProfileText);
  });

  lion.addEventListener("click", (e) => {
    const initialMessage = { role: "user", content: "Hi, I'm the Cowardly Lion." };
    messages.push(initialMessage);
    profileContainer.style.display = "none";
    form.style.display = "block";
    h1.style.display = "none";
    header.appendChild(wizProfileContainer);
    wizProfileContainer.appendChild(wizProfileImg);
    wizProfileContainer.appendChild(wizProfileText);
  });
});
