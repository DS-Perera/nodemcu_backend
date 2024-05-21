const express = require("express");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");
const moment = require("moment-timezone");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuU5qac9KqPpLt4_d6B5OEKPZWua5YqVk",
  authDomain: "atm--project.firebaseapp.com",
  databaseURL: "https://atm--project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "atm--project",
  storageBucket: "atm--project.appspot.com",
  messagingSenderId: "5612719051",
  appId: "1:5612719051:web:28b7904ad325f86b39c44e",
};
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

const app = express();

app.use(cors()); // Enable CORS

// MongoDB URI
// const uri = "mongodb+srv://dsperera1997:MzGSnANzhRMnK3n8@cluster0.t8zqcyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = "mongodb+srv://dsperera1997:MzGSnANzhRMnK3n8@cluster0.t8zqcyz.mongodb.net/?retryWrites=true&w=majority&ssl=true";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware to connect to MongoDB once and use the client in all routes
async function connectMongoDB(req, res, next) {
  try {
    // Check if client is connected
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Connected to MongoDB");
    }
    req.mongoClient = client;
    next();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

app.use(connectMongoDB);

// Route to fetch data from Firebase and store it in MongoDB
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

    // Specify the database and collection
    const mongoDatabase = req.mongoClient.db('newDB');
    const collection = mongoDatabase.collection('sampleCollection');

    // Construct the document to be inserted
    const document = {
      data,
      timestamp: currentDateTime
    };

    // Insert the document into the collection
    const result = await collection.insertOne(document);
    console.log(`Inserted document with _id: ${result.insertedId}`);

    // Send the response
    res.json(document);
    console.log(document);
  } catch (error) {
    console.error("Error fetching data or storing to MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to retrieve data from MongoDB
app.get("/fetch-data", async (req, res) => {
  try {
    // Specify the database and collection
    const mongoDatabase = req.mongoClient.db('newDB');
    const collection = mongoDatabase.collection('sampleCollection');

    // Retrieve all documents from the collection
    const documents = await collection.find({}).toArray();

    if (documents.length === 0) {
      res.status(404).json({ error: "No data found in the database" });
      return;
    }

    // Send the retrieved documents as the response
    res.json(documents);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
