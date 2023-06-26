// Get the loading image HTML element
const loading = document.querySelector(".loading");

// Get the modal HTML element, and its content & close button elements
const modal = document.querySelector(".modal");
const modalContent = modal.querySelector(".modal-content");
const modalClose = modal.querySelector(".modal-close");

// Add an event listener to the close button so when its clicked, the modal disappears
modalClose.addEventListener("click", function () {
  // Add the hidden css class when clicked
  modal.classList.add("hidden");
});

// Create a function that generates an AI prompt
function getRandomAction() {
  // Define a list of AI actions that we want the character to perform
  const actions = [
    "say hello in your most iconic way",
    "give fashion advice based on your tastes",
    "share a summary of your last epic adventure",
    "reveal your hopes and dreams to me",
    "tell me who is your best friend",
    "write your linkedin bio",
  ];

  // Generate a random number between 0 and the length of the actions list so we can choose one at random
  const randIdx = Math.floor(Math.random() * actions.length);
  return actions[randIdx];
}

// Create a function that will run when we click on a character
async function playCharacter(character) {
  // Remove the hidden class from the loading image so it shows on screen
  loading.classList.remove("hidden");

  // Get a random action by running the function we created
  const action = getRandomAction();

  // Send a prompt to ChatGPT
  try {
    const response = await fetch(_CONFIG_.API_BASE_URL + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_CONFIG_.API_KEY}`,
      },

      body: JSON.stringify({
        model: _CONFIG_.GPT_MODEL,
        messages: [
          {
            role: "user",
            content: `You are ${character} and should ${action} in a maximum of 100 characters without breaking character`,
          },
        ],
      }),
    });
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const retryAfterSeconds = parseInt(retryAfter, 10);
      if (!isNaN(retryAfterSeconds)) {
        console.log(
          `Rate limit exceeded. Retry after ${retryAfterSeconds} seconds.`
        );
        // Implement retry logic or wait for the recommended duration before retrying
      } else {
        console.log(
          `Invalid Retry-After header value. Unable to determine the recommended wait
          time.`
        );
      }

      // Implement retry logic or wait for the recommended duration before retrying
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const jsonData = await response.json();
    console.log(jsonData);
    const content = jsonData.choices[0].message.content;

    // Add the response that ChatGPT gave us to the modal HTML
    modalContent.innerHTML = `
        <h2>${character}</h2>
        <p>${content}</p>
        <code>Character: ${character}, Action: ${action}</code>
    `;

    modal.classList.remove("hidden");
    loading.classList.add("hidden");
  } catch (error) {
    console.error("Error:", error);
  }
}
// Create a function to run when the page loads
function init() {
  // Get all of the character HTML elements
  const characters = document.querySelectorAll(".character");

  // Add a click event to every character
  characters.forEach((el) => {
    el.addEventListener("click", function () {
      const character = el.dataset.character;
      // When the character is clicked, run the playCharacter function using the clicked character
      playCharacter(character);
    });
  });
}

init();
