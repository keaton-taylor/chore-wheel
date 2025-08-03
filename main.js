<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chore Wheel</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full bg-white shadow-lg rounded-xl p-6">
    <h1 class="text-2xl font-bold mb-4 text-center">Chore Wheel</h1>
    <ul id="choreList" class="space-y-2"></ul>
    <div class="text-center mt-6">
      <button id="rotateButton" onclick="rotateChores()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Assign Chores</button>
      <p id="lockNotice" class="text-sm text-red-600 mt-2 hidden">Chores can only be reassigned once every 24 hours.</p>
    </div>
  </div>

  <script>
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

      // Adjust both dates to Central Standard Time (CST = UTC-6)
      const offset = 6 * 60; // minutes
      const lastCST = new Date(lastDate.getTime() - offset * 60000);
      const nowCST = new Date(now.getTime() - offset * 60000);

      const diff = nowCST - lastCST;
      return diff < 24 * 60 * 60 * 1000; // 24 hours
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
  </script>
</body>
</html>
