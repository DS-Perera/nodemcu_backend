const express = require("express");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");
const moment = require("moment-timezone");
const cors = require("cors"); // Import cors

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuU5qac9KqPpLt4_d6B5OEKPZWua5YqVk",
  authDomain: "atm--project.firebaseapp.com",
  databaseURL:
    "https://atm--project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "atm--project",
  storageBucket: "atm--project.appspot.com",
  messagingSenderId: "5612719051",
  appId: "1:5612719051:web:28b7904ad325f86b39c44e",
};
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

const app = express();

app.use(cors()); // Enable CORS

// Route to fetch data from Firebase
app.get("/data", async (req, res) => {
  try {
    // Reference to the root of the database
    const dbRef = ref(database);
    // Fetch the data once from the reference
    const snapshot = await get(dbRef);
    
    if (!snapshot.exists()) {
      res.status(404).json({ error: "No data available" });
      return;
    }

    // Get the value from the snapshot
    const data = snapshot.val();

    // Get current date and time in Colombo
    const currentDateTime = moment().tz("Asia/Colombo").format();

    // Construct the response object
    const responseData = {
      data,
      timestamp: currentDateTime,
    };

    // Send the response
    res.json(responseData);
    console.log(responseData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
