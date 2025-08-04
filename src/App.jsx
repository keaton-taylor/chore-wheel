import React, { useState, useEffect } from 'react'

const kids = ["Wyatt", "Emma", "Tuck", "Hattie"]

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
]

const hattieChores = [
  "Glass clean the bottom 'puppy' part of window",
  "Wipe down front of fridge",
  "Wipe down white cabinets and drawers",
  "Vacuum rugs",
  "Dust baseboards with microfiber cloth",
  "Organize shoe bin",
  "Use handheld vacuum on couch cushions"
]

// Update Banner Component
const UpdateBanner = ({ onReload }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 shadow-lg">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">A new version is available!</span>
        </div>
        <button
          onClick={onReload}
          className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  )
}

function App() {
  const [assignments, setAssignments] = useState({})
  const [isLocked, setIsLocked] = useState(false)
  const [lastAssignments, setLastAssignments] = useState({})
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)

  // Get current date in CST
  const getCurrentDateCST = () => {
    const now = new Date()
    const offset = 6 * 60 // CST offset in minutes
    const cstDate = new Date(now.getTime() - offset * 60000)
    return cstDate.toDateString()
  }

  // Get storage key for today
  const getStorageKey = () => {
    return `choreAssignments_${getCurrentDateCST()}`
  }

  // Check if chores are locked (reset at midnight CST)
  const checkLockStatus = () => {
    const lastRun = localStorage.getItem("lastChoreRun")
    if (!lastRun) return false

    const lastDate = new Date(lastRun)
    const now = new Date()
    const offset = 6 * 60 // CST offset in minutes
    const lastCST = new Date(lastDate.getTime() - offset * 60000)
    const nowCST = new Date(now.getTime() - offset * 60000)
    
    // Check if it's the same day in CST
    const lastDateStr = lastCST.toDateString()
    const nowDateStr = nowCST.toDateString()
    
    return lastDateStr === nowDateStr
  }

  // Load assignments from localStorage
  const loadAssignments = () => {
    const stored = localStorage.getItem(getStorageKey())
    if (stored) {
      setAssignments(JSON.parse(stored))
    }
  }

  // Generate deterministic assignments based on date
  const generateAssignments = () => {
    const today = getCurrentDateCST()
    const seed = today.split(' ').join('') // Use date as seed
    
    // Simple deterministic random function
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    const assignments = {}
    const availableChores = [...fullChores]
    const rotatingKids = kids.filter(k => k !== "Hattie")
    
    // Assign chores to rotating kids
    rotatingKids.forEach((kid, idx) => {
      if (availableChores.length === 0) {
        availableChores.push(...fullChores)
      }
      const choreIndex = Math.abs(hash + idx) % availableChores.length
      assignments[kid] = availableChores.splice(choreIndex, 1)[0]
    })
    
    // Assign Hattie's chore
    const hattieIndex = Math.abs(hash) % hattieChores.length
    assignments["Hattie"] = hattieChores[hattieIndex]
    
    return assignments
  }

  // Assign chores
  const assignChores = () => {
    if (isLocked) return

    const newAssignments = generateAssignments()
    
    // Store in localStorage
    localStorage.setItem(getStorageKey(), JSON.stringify(newAssignments))
    localStorage.setItem("lastChoreRun", new Date().toISOString())
    
    setAssignments(newAssignments)
    setLastAssignments(newAssignments)
    setIsLocked(true)
    
    // Update URL
    window.history.replaceState({}, '', `${window.location.pathname}?assigned=true`)
  }

  // Handle app reload
  const handleReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active.postMessage({ type: 'SKIP_WAITING' })
      })
    }
    window.location.reload()
  }

  // Clean up old assignments
  const cleanupOldAssignments = () => {
    const keys = Object.keys(localStorage)
    const choreKeys = keys.filter(key => key.startsWith('choreAssignments_'))
    
    choreKeys.forEach(key => {
      const dateStr = key.replace('choreAssignments_', '')
      const storedDate = new Date(dateStr)
      const currentDate = new Date()
      const diffDays = (currentDate - storedDate) / (1000 * 60 * 60 * 24)
      
      if (diffDays > 7) {
        localStorage.removeItem(key)
      }
    })
  }

  // Initialize app
  useEffect(() => {
    cleanupOldAssignments()
    loadAssignments()
    setIsLocked(checkLockStatus())
    
    // Check if URL indicates chores are assigned
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('assigned') === 'true') {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        setAssignments(JSON.parse(stored))
      } else {
        // Generate assignments if they don't exist but URL says they should
        const newAssignments = generateAssignments()
        localStorage.setItem(getStorageKey(), JSON.stringify(newAssignments))
        setAssignments(newAssignments)
      }
    }

    // Listen for service worker updates
    const handleUpdateAvailable = () => {
      setShowUpdateBanner(true)
    }

    window.addEventListener('sw-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable)
    }
  }, [])

  // Determine button text based on current state
  const getButtonText = () => {
    if (Object.keys(assignments).length > 0) {
      return "View Chores"
    }
    return "Assign Chores"
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      {showUpdateBanner && <UpdateBanner onReload={handleReload} />}
      
      <div className={`max-w-xl w-full bg-white shadow-lg rounded-xl p-6 ${showUpdateBanner ? 'mt-16' : ''}`}>
        <h1 className="text-2xl font-bold mb-4 text-center">Chore Wheel</h1>
        
        <div className="space-y-2 mb-6">
          {Object.keys(assignments).length === 0 ? (
            <div className="p-2 bg-gray-50 rounded shadow text-gray-600 text-center">
              No chores assigned yet. Click 'Assign Chores' to get started!
            </div>
          ) : (
            Object.entries(assignments).map(([kid, chore]) => (
              <div key={kid} className="p-2 bg-gray-50 rounded shadow">
                <strong>{kid}:</strong> {chore}
              </div>
            ))
          )}
        </div>
        
        <div className="text-center">
          <button 
            onClick={assignChores}
            disabled={isLocked}
            className={`px-4 py-2 rounded text-white ${
              isLocked 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {getButtonText()}
          </button>
          
          {isLocked && (
            <p className="text-sm text-red-600 mt-2">
              Chores can only be reassigned once every 24 hours.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App 