// script.mjs
// This is the main JavaScript file for web application
// It handles DOM manipulation and integrates with your data module.

// Import the getUserIDs function from the data.mjs file.
import { getUserIDs } from "./data.mjs"; // Assuming data.mjs reflects your data.js structure

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
 * Populates the user selection dropdown with user IDs.
 * This function now uses the global referenced 'userSelect' element.
 * @param {string[]} userIDs   An array of user ID strings.
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
    console.error("handleUserSelection: UI elements not found for selection handling. ");
    return;
  }

  const selectedUserID = userSelect.value;

  if (selectedUserID) {
    console.log(`User selected: ${selectedUserID}`);
    userDataDisplay.innerHTML = `<p>Data for User ${selectedUserID} will be displayed here </p>`;
  } else {
    console.log("No user selected. ");
    
    userDataDisplay.innerHTML = `<p>Please select a user from the dropdown above to view their music listening data.</p>`;
  }
}


// Add an event listener that waits for the entire HTML document to be fully loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
  // First, create all UI elements.
  createUI();

  // Now UI is created and elements are accessible, populate the dropdown and attach the event lis.
  const userIDs = getUserIDs();
  populateUserDropdown(userIDs);

  // -- attach the event listener to the dynamically created select elements.
  // -- userSelect is already a global reference from createUI()
  userSelect.addEventListener('change', handleUserSelection);

  console.log("Application initialized successfully.");
});
