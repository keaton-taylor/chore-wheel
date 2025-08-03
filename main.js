// main.js — handles logic for the Chore Wheel Web App

const kids = ["Wyatt", "Emma", "Tuck", "Hattie"];

const fullChores = [
  "Pick up and vacuum/sweep living room",
  "Pick up and sweep/vacuum dining room",
  "Clean and wipe down counters and table",
  "Clean and vacuum entry way and hallway",
  "Put away items and vacuum stairs",
  "Clean and wipe down coffee station",
  "Clean bathroom",
  "Clean schoolroom table and put away items",
  "Pick up toy area",
  "Pick up family room",
  "* Placeholder chore 1",
  "* Placeholder chore 2",
  "* Placeholder chore 3",
  "* Placeholder chore 4"
];

const hattieChores = [
  "Glass clean the bottom 'puppy' part of window",
  "Wipe down front of fridge",
  "Wipe down white cabinets and drawers",
  "Vacuum rugs",
  "Dust baseboards with microfiber cloth",
  "Organize shoe bin",
  "Use handheld vacuum on couch cushions"
];

let lastAssignments = {};

function getAvailableChores(chores, lastAssignments) {
  return chores.filter(chore => !(chore in lastAssignments));
}

function getDateSeed() {
  const currentDate = getCurrentDateCST();
  // Create a simple hash from the date string
  let hash = 0;
  for (let i = 0; i < currentDate.length; i++) {
    const char = currentDate.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function assignChoresDeterministic() {
  const seed = getDateSeed();
  const assignments = {};
  
  // Use the seed to create a pseudo-random but deterministic sequence
  let availableChores = [...fullChores];
  const rotatingKids = kids.filter(k => k !== "Hattie");
  
  // Assign chores to rotating kids
  rotatingKids.forEach((kid, idx) => {
    const choreIndex = (seed + idx * 7) % availableChores.length;
    assignments[kid] = availableChores[choreIndex];
    availableChores.splice(choreIndex, 1);
  });
  
  // Assign Hattie's chore
  const hattieIndex = (seed + 100) % hattieChores.length;
  assignments["Hattie"] = hattieChores[hattieIndex];
  
  return assignments;
}

function assignChores() {
  let assignments = {};
  let availableChores = getAvailableChores(fullChores, lastAssignments);
  let rotatingKids = kids.filter(k => k !== "Hattie");
  let hattieChore = hattieChores[Math.floor(Math.random() * hattieChores.length)];

  rotatingKids.forEach((kid, idx) => {
    if (availableChores.length === 0) availableChores = [...fullChores];
    const choreIndex = (idx + Object.keys(lastAssignments).length) % availableChores.length;
    assignments[kid] = availableChores.splice(choreIndex, 1)[0];
  });

  assignments["Hattie"] = hattieChore;
  return assignments;
}

function getCurrentDateCST() {
  const now = new Date();
  const offset = 6 * 60; // CST offset in minutes
  const cstDate = new Date(now.getTime() - offset * 60000);
  return cstDate.toDateString();
}

function isLocked() {
  const lastRun = localStorage.getItem("lastChoreRun");
  if (!lastRun) return false;

  const lastDate = new Date(lastRun);
  const now = new Date();

  const offset = 6 * 60; // CST offset in minutes
  const lastCST = new Date(lastDate.getTime() - offset * 60000);
  const nowCST = new Date(now.getTime() - offset * 60000);

  const diff = nowCST - lastCST;
  return diff < 24 * 60 * 60 * 1000;
}

function displayAssignments(assignments) {
  const choreList = document.getElementById("choreList");
  choreList.innerHTML = "";

  if (!assignments || Object.keys(assignments).length === 0) {
    const li = document.createElement("li");
    li.textContent = "No chores assigned yet. Click 'Assign Chores' to get started!";
    li.className = "p-2 bg-gray-50 rounded shadow text-gray-600 text-center";
    choreList.appendChild(li);
    return;
  }

  Object.entries(assignments).forEach(([kid, chore]) => {
    const li = document.createElement("li");
    li.textContent = `${kid}: ${chore}`;
    li.className = "p-2 bg-gray-50 rounded shadow";
    choreList.appendChild(li);
  });
}

function isAssignedFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('assigned') === 'true';
}

function updateURLWithAssigned() {
  const newURL = `${window.location.origin}${window.location.pathname}?assigned=true`;
  window.history.replaceState({}, '', newURL);
}

function clearURLAssigned() {
  window.history.replaceState({}, '', window.location.pathname);
}

function rotateChores() {
  if (isLocked()) {
    document.getElementById("lockNotice").classList.remove("hidden");
    return;
  }

  const todayAssignments = assignChoresDeterministic();
  
  // Store that chores have been assigned for today
  localStorage.setItem("lastChoreRun", new Date().toISOString());
  
  // Update URL to indicate chores are assigned
  updateURLWithAssigned();
  
  // Display the assignments
  displayAssignments(todayAssignments);

  document.getElementById("lockNotice").classList.add("hidden");
}

function loadStoredAssignments() {
  // Check if URL indicates chores are assigned
  if (isAssignedFromURL()) {
    const todayAssignments = assignChoresDeterministic();
    displayAssignments(todayAssignments);
    return;
  }

  // Check if chores were assigned today (using lock mechanism)
  if (isLocked()) {
    const todayAssignments = assignChoresDeterministic();
    displayAssignments(todayAssignments);
    updateURLWithAssigned();
  } else {
    displayAssignments({});
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Load any existing assignments for today
  loadStoredAssignments();
  
  // Check lock status
  if (isLocked()) {
    document.getElementById("lockNotice").classList.remove("hidden");
  }
});