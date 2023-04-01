window.addEventListener("DOMContentLoaded", async () => {
  document.documentElement.scrollTo(0, document.documentElement.scrollHeight);

  let messages = [];

  const fetchResponse = () => {
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
  };

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

    fetchResponse();
  });

  // clicking profile
  const profileContainer = document.getElementById("select-profile-container");
  const formContainer = document.getElementById("form-container");
  const header = document.querySelector("header");
  const h1 = document.querySelector("h1");

  const wizProfileContainer = document.createElement("div");
  wizProfileContainer.classList.add("wiz-profile-container");

  const wizProfileImg = document.createElement("img");
  wizProfileImg.classList.add("wiz-profile-img");
  wizProfileImg.src = "images/wiz-profile.png";

  const wizProfileText = document.createElement("div");
  wizProfileText.classList.add("wiz-profile-text");
  wizProfileText.innerHTML = "Wizard of Oz";

  const profiles = [
    { name: "scarecrow", content: "Hi, I'm Scarecrow." },
    { name: "tinman", content: "Hi, I'm the Tin Man." },
    { name: "dorothy", content: "Hi, I'm Dorothy Gale." },
    { name: "lion", content: "Hi, I'm the Cowardly Lion." },
  ];

  profiles.map((obj) => {
    document.getElementById(obj.name).addEventListener("click", (e) => {
      profileContainer.style.display = "none";
      formContainer.style.display = "block";
      h1.style.display = "none";
      header.appendChild(wizProfileContainer);
      wizProfileContainer.appendChild(wizProfileImg);
      wizProfileContainer.appendChild(wizProfileText);
      const newMessage = { role: "user", content: obj.content };
      messages.push(newMessage);
      fetchResponse();
    });
  });

  // autoscroll upon new addition to chat-log

  const chatLogContainer = document.getElementById("chat-log-container");

  const mutationObserver = new MutationObserver((entries) => {
    if (entries) {
      chatLogContainer.scrollTo(0, chatLogContainer.scrollHeight);
    }
  });

  mutationObserver.observe(chatLog, { childList: true });
});
