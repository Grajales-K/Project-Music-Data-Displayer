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

// --- NEW FUNCTION ADDED: calculateMostListenedArtistByCount ---
// This function determines which artist a user listened to the most times.
// It is similar to calculateMostListenedSongByCount but focuses on artists.
/**
 * Calculates the most frequently listened artist for a given set of listen events.
 * @param {Array<Object>} listenEvents - An array of listen event objects for a user.
 * @returns {string|null} The name of the most listened artist, or null if no listen events.
 */
function calculateMostListenedArtistByCount(listenEvents) {
  // Conceptual Understanding: If no events, no artist to find.
  if (!listenEvents || listenEvents.length === 0) {
    return null;
  }

  // Conceptual Understanding: A Map to count how many times each artist's song was played.
  const artistCounts = new Map();

  // Loop through each listening event to get the artist for each song.
  listenEvents.forEach((event) => {
    const song = getSong(event.song_id); // Get the full song details from data.mjs
    if (song && song.artist) {
      // Check if song and artist exist
      const artistName = song.artist; // Get the artist's name
      // Increment the count for this artist.
      artistCounts.set(artistName, (artistCounts.get(artistName) || 0) + 1);
    }
  });

  let mostListenedArtistName = null; // Variable for the most listened artist's name.
  let maxCount = 0; // Variable for the highest count of plays for an artist.

  // Find the artist with the highest count.
  for (const [artistName, count] of artistCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostListenedArtistName = artistName;
    }
  }
  return mostListenedArtistName; // Return the name of the most listened artist.
}
// --- END NEW FUNCTION ---

/**
 * Populates the user selection dropdown with user IDs.
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
 * This function now displays the most listened song AND artist within the table structure.
 */
function handleUserSelection() {
  if (!userSelect || !userDataDisplay) {
    console.error(
      "handleUserSelection: UI elements not found for selection handling. "
    );
    return;
  }

  const selectedUserID = userSelect.value;

  userDataDisplay.innerHTML = ""; // Clear previous content.

  if (selectedUserID) {
    console.log(`User selected: ${selectedUserID}`);

    const listenEvents = getListenEvents(selectedUserID);

    if (listenEvents.length === 0) {
      const noDataMessage = document.createElement("p");
      noDataMessage.textContent = `No music for this user`;
      userDataDisplay.appendChild(noDataMessage);
      return; // Exit if no data to display.
    }

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

    // Calculate the most listened song.
    const mostListenedSong = calculateMostListenedSongByCount(listenEvents);
    // --- NEW LOGIC: Calculate the most listened artist ---
    const mostListenedArtist = calculateMostListenedArtistByCount(listenEvents);

    // Add the most listened song row.
    appendQuestionAnswerRow(
      tableBody,
      "Most listened song (count)",
      mostListenedSong
    );

    // --- NEW LOGIC: Add the most listened artist row ---
    appendQuestionAnswerRow(
      tableBody,
      "Most listened artist (count)", // The question text for the table.
      mostListenedArtist // The calculated answer.
    );
    // --- END NEW LOGIC ---
  } else {
    console.log("No user selected. ");
    userDataDisplay.innerHTML = `<p>Please select a user from the dropdown above to view their music listening data.</p>`;
  }
}

// Add an event listener that waits for the entire HTML document to be fully loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {
  createUI();
  const userIDs = getUserIDs();
  populateUserDropdown(userIDs);
  userSelect.addEventListener("change", handleUserSelection);
  console.log("Application initialized successfully.");
});
