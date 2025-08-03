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

function rotateChores() {
  if (isLocked()) {
    document.getElementById("lockNotice").classList.remove("hidden");
    return;
  }

  const todayAssignments = assignChores();
  const choreList = document.getElementById("choreList");
  choreList.innerHTML = "";

  Object.entries(todayAssignments).forEach(([kid, chore]) => {
    const li = document.createElement("li");
    li.textContent = `${kid}: ${chore}`;
    li.className = "p-2 bg-gray-50 rounded shadow";
    choreList.appendChild(li);
  });

  lastAssignments = {};
  Object.entries(todayAssignments).forEach(([kid, chore]) => {
    if (kid !== "Hattie") lastAssignments[chore] = kid;
  });

  localStorage.setItem("lastChoreRun", new Date().toISOString());
  document.getElementById("lockNotice").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  if (isLocked()) {
    document.getElementById("lockNotice").classList.remove("hidden");
  }
});