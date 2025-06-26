// script.mjs
// This is the main JavaScript file for web application
// It handles DOM manipulation and integrates with your data module.

// Import the getUserIDs function from the data.mjs file.
import { getUserIDs, getListenEvents, getSong } from "./data.mjs"; // Assuming data.mjs reflects your data.js structure

// --- Global DOM Element References (will be assigned after creation) ---
let userSelect; // Reference to the <select> element
let userDataDisplay; // Reference to the <section> where user data is shown

/**
 * Creates the entire application UI dynamically using DOM manipulation.
 */
function createUI() {
  const main = document.createElement("main");

  const h1 = document.createElement("h1");
  h1.textContent = "Music Listening Track";
  main.appendChild(h1);

  // ------------------- dropdown ---------------------------
  const dropdownSection = document.createElement("section");
  const label = document.createElement("label");
  label.setAttribute("for", "user-select");
  label.textContent = "Select User : 👉 ";
  dropdownSection.appendChild(label);

  // ------------------ User Selectors -----------------------
  // Assign to global variable userSelect directly after creation
  userSelect = document.createElement("select");
  userSelect.id = "user-select"; // Set ID for reference and label linking

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "  -- Please Choose A User 🎧 -- ";
  userSelect.appendChild(defaultOption);

  // ----------- Append Select to its Section  ----------------
  dropdownSection.appendChild(userSelect);
  main.appendChild(dropdownSection);

  // --------- Create Section to display userData --------------
  // Assign to global variable userDataDisplay directly after creation
  userDataDisplay = document.createElement("section");
  // FIX: Corrected typo from "user-date-display" to "user-data-display"
  userDataDisplay.id = "user-data-display";

  const initialMessage = document.createElement("p");
  initialMessage.textContent =
    "Please select a user from the dropdown above to view their music listening data.";
  userDataDisplay.appendChild(initialMessage);

  // ---------------  append data to section main  ----------------
  main.appendChild(userDataDisplay);

  // ---------------  append entire main to body   ----------------
  document.body.appendChild(main);
}

/**
 * Calculate Most Listen song function
 * this will determines which song a user listened the most of time
 * it is dependent of the UI and only focuses on the data calculation
 *
 * @param {Array<Object>} listenEvents - An array of listen event objects for a user.
 * @returns {string|null} The title and artist of the most listened song, or null if no listen events.
 */
function calculateMostListenedSongByCount(listenEvents) {
  if (!listenEvents || listenEvents.length === 0) {
    return null;
  }

  // ---------------  temporal count song  keys IDs ----------------
  const songCounts = new Map();

  //-----loop through each listening events one by one ----
  listenEvents.forEach((event) => {
    const songId = event.song_id;
    // Get the current count for this songId (if it exists, otherwise start at 0).
    // Then, add 1 to it and store it back in the map.
    songCounts.set(songId, (songCounts.get(songId) || 0) + 1);
  });

  let mostListenedSongId = null;
  let maxCount = 0;

  for (const [songId, count] of songCounts.entries()) {
    if (count > maxCount) {
      maxCount = count; //update the count
      mostListenedSongId = songId; //update the most listened song ID
    }
  }

  //If we found the most listed song ID use getSong to get details, artist and title
  if (mostListenedSongId) {
    const song = getSong(mostListenedSongId);
    if (song) {
      //if successfully return as string details
      return `${song.artist} - ${song.title}`;
    }
  }
  // Conceptual Understanding: If no most listened song was found (e.g., no valid songs in data).
  return null;
}

/**
 * Populates the user selection dropdown with user IDs.
 * This function now uses the global referenced 'userSelect' element.
 * @param {string|null} userIDs   An array of user ID strings.
 */
function populateUserDropdown(userIDs) {
  if (!userSelect) {
    console.error(
      "populateUserDropdown: UserSelect element not Found. UI Might not be created yet."
    );
    return;
  }

  userIDs.forEach((userID) => {
    const option = document.createElement("option");
    option.value = userID;
    option.textContent = ` User ${userID} 🎧`;
    userSelect.appendChild(option);
  });
}

/**
 * Handles the change event on the user dropdown.
 * This function now uses the globally referenced 'userSelect' and  'userDataDisplay' elements.
 */
function handleUserSelection() {
  //ensure the elements are available
  if (!userSelect || !userDataDisplay) {
    console.error(
      "handleUserSelection: UI elements not found for selection handling. "
    );
    return;
  }

  const selectedUserID = userSelect.value;

  // Clear previous content in the display area, Every time a new user is selected, we clear the old data.
  userDataDisplay.innerHTML = "";

  if (selectedUserID) {
    console.log(`User selected: ${selectedUserID}`);

    // Conceptual Understanding: Fetch the raw listening events for the selected user.
    // This is where we get the data from 'data.mjs'.
    const listenEvents = getListenEvents(selectedUserID);

    if (listenEvents.length === 0) {
      // Conceptual Understanding: If the user has no music data, display a specific message.
      const noDataMessage = document.createElement("p");
      noDataMessage.textContent = `No music for this user`; // Matching your screenshot message.
      userDataDisplay.appendChild(noDataMessage);
      return; // Stop here, no more calculations or display for this user.
    }

    // --- NEW LOGIC: Calculate and display only the most listened song by count ---
    // Conceptual Understanding:
    // STEP 1: We call our specialized function to calculate the most listened song.
    // It takes the 'listenEvents' (the raw data) and gives us back the answer string.
    const mostListenedSong = calculateMostListenedSongByCount(listenEvents);

    // Conceptual Understanding:
    // STEP 2: We create a new HTML paragraph (<p>) element to hold our answer.
    const resultParagraph = document.createElement("p");

    // Conceptual Understanding:
    // STEP 3: We set the text inside this new paragraph element.
    // We combine the question text with the calculated answer.
    resultParagraph.textContent = `Most listened song (count): ${mostListenedSong}`;

    // Conceptual Understanding:
    // STEP 4: We add this newly created paragraph to our 'userDataDisplay' section.
    // This makes the answer visible on the web page.
    userDataDisplay.appendChild(resultParagraph);
    // --- END NEW LOGIC ---
  } else {
    console.log("No user selected. ");
    // Conceptual Understanding: If no user is selected, display the initial prompt message.
    userDataDisplay.innerHTML = `<p>Please select a user from the dropdown above to view their music listening data.</p>`;
  }
}

// Add an event listener that waits for the entire HTML document to be fully loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {
  // First, create all UI elements.
  createUI();

  // Now UI is created and elements are accessible, populate the dropdown and attach the event lis.
  const userIDs = getUserIDs();
  populateUserDropdown(userIDs);

  // -- attach the event listener to the dynamically created select elements.
  // -- userSelect is already a global reference from createUI()
  userSelect.addEventListener("change", handleUserSelection);

  console.log("Application initialized successfully.");
});
