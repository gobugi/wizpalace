import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

window.addEventListener("DOMContentLoaded", async () => {
  document.documentElement.scrollTo(0, document.documentElement.scrollHeight);

  let messages = [];
  let generator = null;
  
  // Initialize the AI model immediately
  const initializeAI = async () => {
    try {
      generator = await pipeline('text-generation', 'Xenova/gpt2');
      
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

  // Get DOM elements
  const chatLog = document.getElementById("chat-log");
  const message = document.getElementById("message");
  const form = document.querySelector("form");
  const submitButton = document.querySelector("button");

  // Function to update button state based on input content
  const updateButtonState = () => {
    const hasContent = message.value.trim().length > 0;
    if (hasContent) {
      submitButton.className = "button-active";
    } else {
      submitButton.className = "button-inactive";
    }
  };

  // Initialize button state
  updateButtonState();

  // Listen for input changes
  message.addEventListener("input", updateButtonState);

  // Thinking animation functions
  let thinkingElement = null;
  let aiProcessingComplete = false;
  
  const showThinkingIndicator = () => {
    console.log("=== showThinkingIndicator function START ===");
    console.log("chatLog element:", chatLog);
    console.log("Current thinkingElement:", thinkingElement);
    
    thinkingElement = document.createElement("div");
    thinkingElement.classList.add("thinking-indicator", "fade-in");
    thinkingElement.innerHTML = `
      <div class="message__text">
        <div class="thinking-dots">
          <div class="thinking-dot"></div>
          <div class="thinking-dot"></div>
          <div class="thinking-dot"></div>
        </div>
      </div>
    `;
    console.log("Created thinking element:", thinkingElement);
    chatLog.appendChild(thinkingElement);
    console.log("Appended thinking element to chatLog");
    chatLog.scrollTop = chatLog.scrollHeight;
    console.log("=== showThinkingIndicator function END ===");
  };
  
  const hideThinkingIndicator = () => {
    console.log("hideThinkingIndicator called, thinkingElement:", thinkingElement);
    if (thinkingElement && thinkingElement.parentNode) {
      console.log("Removing thinking element");
      thinkingElement.remove();
      thinkingElement = null;
    } else if (thinkingElement) {
      console.log("Thinking element exists but has no parent - setting to null");
      thinkingElement = null;
    }
  };

  const fetchResponse = async () => {
    console.log("fetchResponse started");
    // Wait for generator to be ready if it's still loading
    while (!generator) {
      console.log("Waiting for generator...");
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log("Generator is ready, starting AI generation");
    try {
      // Build conversation context for the Wizard (without role labels)
      const conversationContext = messages.map(msg => msg.content).join('\n\n');
      
      const prompt = `You are the Great and Powerful Wizard of Oz. You are wise, mysterious, and dramatic. Give thoughtful advice and answer questions with authority. Never break character.

${conversationContext}

Wizard:`;
      
      // Yield to event loop before starting AI generation to allow timers to fire
      await new Promise(resolve => setTimeout(resolve, 0));
      console.log("About to call generator - event loop yielded");
      
      const result = await generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9,
      });
      
      let responseText = result[0].generated_text.replace(prompt, '').trim();
      
      // Clean up any unwanted prefixes
      responseText = responseText.replace(/^(Wizard of Oz:|Wizard:|Visitor:|Response:)/i, '').trim();
      responseText = responseText.replace(/\n(Wizard of Oz:|Wizard:|Visitor:).*$/gi, '').trim();
      
      // Stop at natural conversation breaks
      responseText = responseText.split('\n')[0].trim();
      
      // If response is empty or too short, provide a fallback
      if (!responseText || responseText.length < 10) {
        responseText = "The Great Wizard ponders your words and will provide wisdom in due time!";
      }
      
      let newAssistantMessage = {
        role: "assistant",
        content: responseText,
      };
      messages.push(newAssistantMessage);
      
      console.log("AI response generated at:", Date.now(), "- marking AI as complete");
      // Mark AI processing as complete
      aiProcessingComplete = true;
      // Hide thinking indicator before showing response
      hideThinkingIndicator();
      
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "message--received", "fade-in");
      messageElement.innerHTML = `<div class="message__text">${responseText}</div>`;
      chatLog.appendChild(messageElement);
      chatLog.scrollTop = chatLog.scrollHeight;
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Mark AI processing as complete
      aiProcessingComplete = true;
      // Hide thinking indicator before showing error
      hideThinkingIndicator();
      
      const errorElement = document.createElement("div");
      errorElement.classList.add("message", "message--received", "fade-in");
      errorElement.innerHTML = `<div class="message__text">🧙‍♂️ The Wizard's crystal ball is cloudy. Please try again!</div>`;
      chatLog.appendChild(errorElement);
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = message.value.trim();
    
    // Prevent submission if message is empty
    if (!messageText) {
      return;
    }
    
    const newMessage = { role: "user", content: `${messageText}` };
    messages.push(newMessage);
    
    console.log("Form submitted");

    // Trigger button animation
    if (submitButton.className === "button-active") {
      submitButton.style.transform = "scale(0.95)";
      setTimeout(() => {
        submitButton.style.removeProperty("transform");
      }, 150);
    }

    // TRIGGER 1 PART 1: Immediately clear input and show user message
    message.value = "";
    updateButtonState();
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "message--sent", "fade-in");
    messageElement.innerHTML = `
          <div class="message__text">${messageText}</div>
        `;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
    console.log("User message displayed immediately");

    // TRIGGER 1 PART 2: Show thinking bubble exactly 1 second after form submission
    // Reset AI completion flag for this new request
    aiProcessingComplete = false;
    
    console.log("Setting thinking bubble timer for 1 second from now at:", Date.now());
    const thinkingTimer = setTimeout(() => {
      console.log("THINKING BUBBLE TIMER FIRED at:", Date.now(), "- checking if AI still processing");
      console.log("aiProcessingComplete flag:", aiProcessingComplete);
      if (!aiProcessingComplete) {
        console.log("AI still processing - showing thinking bubble");
        showThinkingIndicator();
      } else {
        console.log("AI already finished - not showing thinking bubble");
      }
    }, 2000);
    console.log("Thinking bubble timer ID:", thinkingTimer);

    // TRIGGER 2: Start AI processing in background (delayed to allow timer to fire)
    setTimeout(() => {
      console.log("Starting AI processing in background");
      fetchResponse().catch(error => {
        console.error('Async fetchResponse error:', error);
      });
    }, 2100); // Delay AI processing until after thinking bubble should appear
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
    { id: "tinman", fullName: "Tin Man" },
    { id: "dorothy", fullName: "Dorothy Gale" },
    { id: "lion", fullName: "Cowardly Lion" },
  ];

  profiles.map((obj) => {
    document.getElementById(obj.id).addEventListener("click", async () => {
      // Store the fullName for use in nested callbacks
      const selectedCharacterName = obj.fullName;
      
      // Trigger background transition
      document.body.classList.add("character-selected");
      
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
          wizardIntroElement.innerHTML = `<div class="message__text">I am Oz, the Great and Terrible.<br>Why do you seek me, ${selectedCharacterName}?</div>`;
          chatLog.appendChild(wizardIntroElement);
          chatLog.scrollTop = chatLog.scrollHeight;
        }, 1000);
      }, 1000);
      
      const newMessage = { role: "user", content: `Hi, I'm ${selectedCharacterName}.` };
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
