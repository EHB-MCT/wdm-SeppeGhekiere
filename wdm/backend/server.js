const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = express();
const port = 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quizdb";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// MongoDB setup
const client = new MongoClient(MONGO_URI);
const db = client.db("quizdb");
const resultsCollection = db.collection("results");
const usersCollection = db.collection("users");

// Connect to MongoDB with retry logic
async function connectDB() {
	let retries = 5;
	while (retries > 0) {
		try {
			await client.connect();
			console.log("Connected to MongoDB");
			return;
		} catch (err) {
			console.error(`Failed to connect to MongoDB (retries left: ${retries - 1}):`, err.message);
			retries--;
			if (retries === 0) {
				console.error("Max retries reached. Continuing without MongoDB...");
				return; // Continue without MongoDB instead of exiting
			}
			// Wait 5 seconds before retrying
			await new Promise(resolve => setTimeout(resolve, 5000));
		}
	}
}
connectDB();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
	const token = req.headers["authorization"]?.split(" ")[1]; // Expect "Bearer <token>"
	if (!token) return res.status(401).json({ error: "Access denied" });

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ error: "Invalid token" });
		req.user = user; // Attach user info to request
		next();
	});
};

app.use(cors());
app.use(bodyParser.json());

app.post("/api/auth/register", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ error: "Email and password required" });

	try {
		// Check if MongoDB is connected
		if (!client.topology || !client.topology.isConnected()) {
			return res.status(500).json({ error: "Database connection unavailable. Please try again later." });
		}

		const existingUser = await usersCollection.findOne({ email });
		if (existingUser) return res.status(400).json({ error: "User already exists" });

		const hashedPassword = await bcrypt.hash(password, 10);
		await usersCollection.insertOne({ email, password: hashedPassword });

		// Auto-login after successful registration
		const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
		res.status(201).json({ token, user: { email } });
	} catch (err) {
		console.error("Signup error:", err);
		res.status(500).json({ error: "Server error" });
	}
});

app.post("/api/auth/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ error: "Email and password required" });

	try {
		const user = await usersCollection.findOne({ email });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });
		res.json({ token, user: { email: user.email } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

// Helper function to get all results from MongoDB
async function getAllResults() {
	return await resultsCollection.find({}).toArray();
}

// GET results (public for now; add auth if needed)
app.get("/api/results", async (req, res) => {
	try {
		// Check if MongoDB is connected
		if (!client.topology || !client.topology.isConnected()) {
			return res.json([]); // Return empty array if MongoDB not connected
		}
		const allResults = await getAllResults();
		res.json(allResults);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch results" });
	}
});

// Submit result with email (now protected)
app.post("/api/submit-result-with-email", authenticateToken, async (req, res) => {
	const { answers } = req.body;
	const email = req.user.email; // From JWT
	console.log("Received answers for:", email);

	// For now, just save the answers without personality calculation
	// TODO: Add quiz data and personality calculation logic
	try {
		const result = { 
			email, 
			quizId: "default-quiz", 
			answers, 
			timestamp: new Date() 
		};
		await resultsCollection.insertOne(result);
		res.json({ message: "Results saved successfully", answers });
	} catch (err) {
		console.error("Failed to save result:", err);
		res.status(500).json({ error: "Failed to save result" });
	}
});

// Admin middleware - check if user is admin (for demo, using email check)
const isAdmin = (req, res, next) => {
	const email = req.user?.email;
	if (!email || !email.includes('admin')) {
		return res.status(403).json({ error: "Admin access required" });
	}
	next();
};

// Admin analytics endpoints
app.get("/api/admin/analytics", authenticateToken, isAdmin, async (req, res) => {
	try {
		const totalUsers = await usersCollection.countDocuments();
		const totalResults = await resultsCollection.countDocuments();
		
		// Get personality distribution
		const personalityStats = await resultsCollection.aggregate([
			{ $group: { _id: "$dominantTrait", count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		]).toArray();
		
		// Get daily results for last 30 days
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		const dailyResults = await resultsCollection.aggregate([
			{ $match: { timestamp: { $gte: thirtyDaysAgo } } },
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } }
		]).toArray();
		
		res.json({
			totalUsers,
			totalResults,
			personalityStats,
			dailyResults
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch analytics" });
	}
});

// Get all users with their results
app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
	try {
		const users = await usersCollection.find({}).project({ password: 0 }).toArray();
		const results = await resultsCollection.find({}).toArray();
		
		// Combine user data with their results
		const usersWithResults = users.map(user => ({
			...user,
			results: results.filter(result => result.email === user.email),
			totalQuizzes: results.filter(result => result.email === user.email).length
		}));
		
		res.json(usersWithResults);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch users" });
	}
});

// Filter results by user, date range, or personality type
app.get("/api/admin/results/filter", authenticateToken, isAdmin, async (req, res) => {
	try {
		const { email, startDate, endDate, personalityType } = req.query;
		const filter = {};
		
		if (email) filter.email = email;
		if (personalityType) filter.dominantTrait = personalityType;
		if (startDate || endDate) {
			filter.timestamp = {};
			if (startDate) filter.timestamp.$gte = new Date(startDate);
			if (endDate) filter.timestamp.$lte = new Date(endDate);
		}
		
		const results = await resultsCollection.find(filter).toArray();
		res.json(results);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to filter results" });
	}
});

// Delete user and their results
app.delete("/api/admin/users/:email", authenticateToken, isAdmin, async (req, res) => {
	try {
		const email = req.params.email;
		await usersCollection.deleteOne({ email });
		await resultsCollection.deleteMany({ email });
		res.json({ message: "User and their results deleted successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to delete user" });
	}
});

<<<<<<< Updated upstream
// Get all database data (for debugging/admin purposes)
app.get("/api/admin/database", authenticateToken, isAdmin, async (req, res) => {
	try {
		const users = await usersCollection.find({}).project({ password: 0 }).toArray();
		const results = await resultsCollection.find({}).toArray();
		
		res.json({
			users: {
				total: users.length,
				data: users
			},
			results: {
				total: results.length,
				data: results
			},
			statistics: {
				totalUsers: users.length,
				totalResults: results.length,
				quizzesTaken: results.length,
				averageResultsPerUser: users.length > 0 ? (results.length / users.length).toFixed(2) : 0
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch database data" });
	}
});

// Get database statistics (simplified version)
app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
	try {
		const totalUsers = await usersCollection.countDocuments();
		const totalResults = await resultsCollection.countDocuments();
		
		// Get quiz distribution
		const quizDistribution = await resultsCollection.aggregate([
			{ $group: { _id: "$quizId", count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		]).toArray();
		
		// Get recent activity
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		
		const recentResults = await resultsCollection.countDocuments({
			timestamp: { $gte: sevenDaysAgo }
		});
		
		res.json({
			totalUsers,
			totalResults,
			quizDistribution,
			recentActivity: {
				last7Days: recentResults,
				averagePerDay: (recentResults / 7).toFixed(1)
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch statistics" });
	}
});

app.listen(port, () => {
	console.log(`Backend server listening at http://localhost:${port}`);
});
=======
// Submit quiz result for different quiz types
app.post("/api/submit-quiz-result", authenticateToken, async (req, res) => {
	try {
		const { answers, quizType } = req.body;
		const email = req.user.email;
		
		// Load the appropriate quiz data
		let quizDataPath;
		switch(quizType) {
			case "intelligence":
				quizDataPath = path.join(__dirname, "quizData2.json");
				break;
			case "learning":
				quizDataPath = path.join(__dirname, "quizData3.json");
				break;
			case "career":
				quizDataPath = path.join(__dirname, "quizData4.json");
				break;
			default:
				quizDataPath = path.join(__dirname, "quizData.json");
		}
		
		const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
		
		// Calculate dominant trait
		const traitCounts = {};
		answers.forEach(answer => {
			const trait = answer.trait;
			if (trait) {
				traitCounts[trait] = (traitCounts[trait] || 0) + 1;
			}
		});
		
		let dominantTrait = "";
		let maxCount = 0;
		for (const trait in traitCounts) {
			if (traitCounts[trait] > maxCount) {
				maxCount = traitCounts[trait];
				dominantTrait = trait;
			}
		}
		
		// Save to database
		await resultsCollection.insertOne({
			email,
			quizType,
			answers,
			dominantTrait,
			timestamp: new Date()
		});
		
		res.json({ dominantTrait });
	} catch (error) {
		console.error("Error submitting quiz result:", error);
		res.status(500).json({ error: "Failed to submit quiz result" });
	}
});
>>>>>>> Stashed changes

app.listen(port, () => {
	console.log(`Backend server listening at http://localhost:${port}`);
});
