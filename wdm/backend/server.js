const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const quizData = require("./quizData.json");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// MongoDB setup
const uri = "mongodb://mongodb:27017"; // Local MongoDB URI
const client = new MongoClient(uri);
const db = client.db("quizdb"); // Database name
const resultsCollection = db.collection("results"); // Collection name

// Connect to MongoDB
async function connectDB() {
	try {
		await client.connect();
		console.log("Connected to MongoDB");
	} catch (err) {
		console.error("Failed to connect to MongoDB:", err);
		process.exit(1); // Exit if connection fails
	}
}
connectDB();

app.use(cors());
app.use(bodyParser.json());	

// Helper function to get all results from MongoDB
async function getAllResults() {
	return await resultsCollection.find({}).toArray();
}

// New GET endpoint to retrieve all results
app.get("/api/results", async (req, res) => {
	try {
		const allResults = await getAllResults();
		res.json(allResults);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch results" });
	}
});

app.post("/api/submit-result-with-email", async (req, res) => {
	const { answers, email } = req.body;
	console.log("Received answers:", answers, "for email:", email);

	const personality = {};

	answers.forEach((answer, index) => {
		const question = quizData[index];
		const choice = Object.keys(question.choices).find((key) => question.choices[key] === answer);
		if (choice && question.weights[choice]) {
			const weights = question.weights[choice];
			for (const trait in weights) {
				if (personality.hasOwnProperty(trait)) {
					personality[trait] += weights[trait];
				} else {
					personality[trait] = weights[trait];
				}
			}
		}
	});

	let dominantTrait = "";
	let maxScore = 0;
	for (const trait in personality) {
		if (personality[trait] > maxScore) {
			maxScore = personality[trait];
			dominantTrait = trait;
		}
	}

	// Store the result in MongoDB
	try {
		const result = { email, dominantTrait, personality, timestamp: new Date() };
		await resultsCollection.insertOne(result);
		res.json({ dominantTrait, personality });
	} catch (err) {
		res.status(500).json({ error: "Failed to save result" });
	}
});

// Existing endpoint (unchanged, as it doesn't store data)
app.post("/api/quiz-results", (req, res) => {
	const { answers } = req.body;
	console.log("Received answers:", answers);

	const personality = {};

	answers.forEach((answer, index) => {
		const question = quizData[index];
		const choice = Object.keys(question.choices).find((key) => question.choices[key] === answer);
		if (choice && question.weights[choice]) {
			const weights = question.weights[choice];
			for (const trait in weights) {
				if (personality.hasOwnProperty(trait)) {
					personality[trait] += weights[trait];
				} else {
					personality[trait] = weights[trait];
				}
			}
		}
	});

	let dominantTrait = "";
	let maxScore = 0;
	for (const trait in personality) {
		if (personality[trait] > maxScore) {
			maxScore = personality[trait];
			dominantTrait = trait;
		}
	}

	res.json({ dominantTrait });
});

app.listen(port, () => {
	console.log(`Backend server listening at http://localhost:${port}`);
});
