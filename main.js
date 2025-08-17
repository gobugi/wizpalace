import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

window.addEventListener("DOMContentLoaded", async () => {
  document.documentElement.scrollTo(0, document.documentElement.scrollHeight);

  let messages = [];
  let generator = null;
  
  // Initialize the AI model
  const initializeAI = async () => {
    try {
      const loadingElement = document.createElement("div");
      loadingElement.classList.add("message", "message--received");
      loadingElement.innerHTML = `<div class="message__text">🧙‍♂️ The Wizard is awakening... (Loading AI model, this may take a moment)</div>`;
      chatLog.appendChild(loadingElement);
      
      generator = await pipeline('text-generation', 'Xenova/distilgpt2');
      
      loadingElement.innerHTML = `<div class="message__text">🧙‍♂️ The Great and Powerful Wizard of Oz is ready to meet you!</div>`;
      chatLog.scrollTop = chatLog.scrollHeight;
    } catch (error) {
      console.error('Failed to load AI model:', error);
    }
  };

  const fetchResponse = async () => {
    if (!generator) {
      await initializeAI();
    }
    
    try {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      const prompt = `You are the wise and helpful Wizard of Oz. ${lastMessage.content}`;
      
      const result = await generator(prompt, {
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true,
      });
      
      let responseText = result[0].generated_text.replace(prompt, '').trim();
      
      // If response is empty or too short, provide a fallback
      if (!responseText || responseText.length < 10) {
        responseText = "The Great Wizard ponders your words and will provide wisdom in due time!";
      }
      
      let newAssistantMessage = {
        role: "assistant",
        content: responseText,
      };
      messages.push(newAssistantMessage);
      
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.classList.add("message--received");
      messageElement.innerHTML = `<div class="message__text">${responseText}</div>`;
      chatLog.appendChild(messageElement);
      chatLog.scrollTop = chatLog.scrollHeight;
    } catch (error) {
      console.error('AI generation error:', error);
      const errorElement = document.createElement("div");
      errorElement.classList.add("message", "message--received");
      errorElement.innerHTML = `<div class="message__text">🧙‍♂️ The Wizard's crystal ball is cloudy. Please try again!</div>`;
      chatLog.appendChild(errorElement);
    }
  };

  const chatLog = document.getElementById("chat-log");
  const message = document.getElementById("message");
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
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

    await fetchResponse();
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
    { id: "scarecrow", fullName: "Scarecrow" },
    { id: "tinman", fullName: "the Tin Man" },
    { id: "dorothy", fullName: "Dorothy Gale" },
    { id: "lion", fullName: "the Cowardly Lion" },
  ];

  profiles.map((obj) => {
    document.getElementById(obj.id).addEventListener("click", async () => {
      profileContainer.style.display = "none";
      formContainer.style.display = "block";
      h1.style.display = "none";
      header.appendChild(wizProfileContainer);
      wizProfileContainer.appendChild(wizProfileImg);
      wizProfileContainer.appendChild(wizProfileText);
      const newMessage = { role: "user", content: `Hi, I'm ${obj.fullName}.` };
      messages.push(newMessage);
      await fetchResponse();
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
