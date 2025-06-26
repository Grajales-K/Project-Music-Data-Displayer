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

// --- NEW FUNCTION ADDED: appendQuestionAnswerRow ---
// This helper function simplifies adding rows to our table later.
// It will only add a row if there's an actual answer.
/**
 * Helper function to append a question-answer row to the data table.
 * If the answer is null or undefined or an empty string, the row will not be appended.
 * @param {HTMLElement} tableBody - The <tbody> element to append the row to.
 * @param {string} questionText - The text for the question cell.
 * @param {string|null} answerText - The text for the answer cell, or null/undefined/empty string if no answer.
 */
function appendQuestionAnswerRow(tableBody, questionText, answerText) {
  // Conceptual Understanding: Only create and add the row if we have a valid answer.
  if (answerText !== null && answerText !== undefined && answerText !== "") {
    const row = document.createElement("tr"); // Create a table row (like <tr>)

    const questionCell = document.createElement("td"); // Create first table data cell (like <td>)
    questionCell.textContent = questionText;
    row.appendChild(questionCell);
    const answerCell = document.createElement("td");
    answerCell.textContent = answerText;
    row.appendChild(answerCell);

    tableBody.appendChild(row);
  }
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
  // If no most listened song was found (e.g., no valid songs in data).
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
      return; // Exit if no data to display.
    }

    // --- NEW LOGIC: Create the table structure and headers ---
    const dataTable = document.createElement("table");

    const tableHead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const questionHeader = document.createElement("th");
    questionHeader.textContent = "Question";
    headerRow.appendChild(questionHeader);

    const answerHeader = document.createElement("th");
    answerHeader.textContent = "Answer";
    headerRow.appendChild(answerHeader);

    tableHead.appendChild(headerRow);
    dataTable.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    dataTable.appendChild(tableBody);
    userDataDisplay.appendChild(dataTable);

    // It takes the 'listenEvents' (the raw data) and gives us back the answer string.
    const mostListenedSong = calculateMostListenedSongByCount(listenEvents);

    //reusable 'appendQuestionAnswerRow' function, it also hides the row if the answer is null/empty.
    appendQuestionAnswerRow(
      tableBody,
      "Most listened song (count)",
      mostListenedSong
    );
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
