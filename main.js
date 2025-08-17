import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

window.addEventListener("DOMContentLoaded", async () => {
  document.documentElement.scrollTo(0, document.documentElement.scrollHeight);

  let messages = [];
  let generator = null;
  
  // Initialize the AI model immediately
  const initializeAI = async () => {
    try {
      generator = await pipeline('text-generation', 'Xenova/distilgpt2');
      
      // Add Wizard's opening statement to conversation history
      const wizardOpening = "I am Oz, the Great and Terrible. Who are you, and why do you seek me?";
      messages.push({ role: "assistant", content: wizardOpening });
    } catch (error) {
      console.error('Failed to load AI model:', error);
    }
  };

  // Start loading AI model after wiz-head animation completes (5 seconds)
  setTimeout(() => {
    initializeAI();
  }, 5000);

  const fetchResponse = async () => {
    // Wait for generator to be ready if it's still loading
    while (!generator) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      // Build conversation context for the Wizard
      const conversationContext = messages.map(msg => 
        msg.role === 'user' ? `Visitor: ${msg.content}` : `Wizard: ${msg.content}`
      ).join('\n');
      
      const prompt = `You are the Great and Powerful Wizard of Oz. You must ONLY speak as the Wizard. Never speak for the visitor. Stay in character as the mysterious, wise Wizard from behind the curtain.

Previous conversation:
${conversationContext}

The Wizard responds:`;
      
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
      messageElement.classList.add("message", "message--received", "fade-in");
      messageElement.innerHTML = `<div class="message__text">${responseText}</div>`;
      chatLog.appendChild(messageElement);
      chatLog.scrollTop = chatLog.scrollHeight;
    } catch (error) {
      console.error('AI generation error:', error);
      const errorElement = document.createElement("div");
      errorElement.classList.add("message", "message--received", "fade-in");
      errorElement.innerHTML = `<div class="message__text">🧙‍♂️ The Wizard's crystal ball is cloudy. Please try again!</div>`;
      chatLog.appendChild(errorElement);
    }
  };

  const chatLog = document.getElementById("chat-log");
  const message = document.getElementById("message");
  const form = document.querySelector("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = message.value;
    const newMessage = { role: "user", content: `${messageText}` };
    messages.push(newMessage);
    
    // Immediately clear input and show user message
    message.value = "";
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "message--sent", "fade-in");
    messageElement.innerHTML = `
          <div class="message__text">${messageText}</div>
        `;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;

    // Process AI response separately (non-blocking)
    setTimeout(() => {
      fetchResponse();
    }, 0);
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
      // Step 1: Start h1 and profile container fade out simultaneously
      h1.classList.add("h1-fade-out");
      profileContainer.classList.add("fade-out");
      
      // Step 2: After fade outs complete (1s), show and fade in wiz-profile-container and form
      setTimeout(() => {
        // Hide profile container completely
        profileContainer.style.display = "none";
        
        // Prepare wizard profile elements
        header.appendChild(wizProfileContainer);
        wizProfileContainer.appendChild(wizProfileImg);
        wizProfileContainer.appendChild(wizProfileText);
        wizProfileContainer.classList.add("wiz-profile-fade-in");
        
        // Show form container and chat log with fade-in simultaneously
        formContainer.style.display = "block";
        formContainer.classList.add("wiz-profile-fade-in");
        
        // Show chat log container
        const chatLogContainer = document.getElementById("chat-log-container");
        chatLogContainer.style.display = "flex";
        
        // Step 3: After wiz-profile-container and form fade in completes (1s), show wizard message
        setTimeout(() => {
          // Show wizard's introduction message
          const wizardIntroElement = document.createElement("div");
          wizardIntroElement.classList.add("message", "message--received", "fade-in");
          wizardIntroElement.innerHTML = `<div class="message__text">I... AM... OZ... the Great and Terrible.<br>Why do you seek me?</div>`;
          chatLog.appendChild(wizardIntroElement);
          chatLog.scrollTop = chatLog.scrollHeight;
        }, 1000);
      }, 1000);
      
      const newMessage = { role: "user", content: `Hi, I'm ${obj.fullName}.` };
      messages.push(newMessage);
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
