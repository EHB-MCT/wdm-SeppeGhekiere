const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = express();
const port = 3000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/quizdb";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@user.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

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
			// Create default admin user after connection
			await createDefaultAdmin();
			return;
		} catch (err) {
			console.error(`Failed to connect to MongoDB (retries left: ${retries - 1}):`, err.message);
			retries--;
			if (retries === 0) {
				console.error("Max retries reached. Continuing without MongoDB...");
				return; // Continue without MongoDB instead of exiting
			}
			// Wait 5 seconds before retry
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
} catch {
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

// Admin middleware - check if user is admin
const isAdmin = (req, res, next) => {
	const email = req.user?.email;
	if (!email || email !== ADMIN_EMAIL) {
		return res.status(403).json({ error: "Admin access required" });
	}
	next();
};

// Create default admin user if not exists
const createDefaultAdmin = async () => {
	try {
		const existingAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL });
		if (!existingAdmin) {
			const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
			await usersCollection.insertOne({ 
				email: ADMIN_EMAIL, 
				password: hashedPassword 
			});
			console.log('Default admin user created:', ADMIN_EMAIL);
		}
	} catch (err) {
		console.error('Error creating default admin:', err);
	}
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

// Get detailed user profile with advanced analysis
app.get("/api/admin/profile/:email", authenticateToken, isAdmin, async (req, res) => {
	console.log("Profile endpoint called for:", req.params.email);
	try {
		const email = req.params.email;
		
		// Get user info and their quiz results
		const user = await usersCollection.findOne({ email }, { projection: { password: 0 } });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		
		const userResults = await resultsCollection.find({ email }).toArray();
		
		if (userResults.length === 0) {
			return res.status(404).json({ error: "No quiz results found for this user" });
		}
		
		// Calculate advanced personality profile
		const personalityProfile = calculateAdvancedProfile(userResults);
		
		// Get quiz history
		const quizHistory = userResults.map(result => ({
			quizType: result.quizId,
			personalityType: result.dominantTrait,
			timestamp: result.timestamp,
			score: result.score
		})).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
		
		// Generate behavioral predictions
		const predictions = generateBehavioralPredictions(personalityProfile);
		
		res.json({
			email: user.email,
			profile: personalityProfile,
			predictions: predictions,
			quizHistory: quizHistory,
			totalQuizzes: userResults.length
		});
		
	} catch (err) {
		console.error("Error generating profile:", err);
		res.status(500).json({ error: "Failed to generate profile" });
	}
});

// Helper function to calculate advanced personality profile
function calculateAdvancedProfile(results) {
	// Initialize trait scores
	const traitScores = {
		extroversion: 0,
		analytical: 0,
		creative: 0,
		conscientiousness: 0,
		dominance: 0,
		agreeableness: 0,
		openness: 0,
		neuroticism: 0
	};
	
	// Calculate scores based on quiz results and personality types
	results.forEach(result => {
		const personalityType = result.dominantTrait;
		const score = result.score || 85; // Default score if not provided
		
		// Map personality types to trait scores
		switch(personalityType) {
			case 'Analytical':
				traitScores.analytical += score;
				traitScores.conscientiousness += score * 0.7;
				traitScores.openness += score * 0.6;
				traitScores.extroversion -= score * 0.2;
				break;
			case 'Creative':
				traitScores.creative += score;
				traitScores.openness += score * 0.8;
				traitScores.extroversion += score * 0.3;
				traitScores.analytical -= score * 0.1;
				break;
			case 'Social':
				traitScores.extroversion += score;
				traitScores.agreeableness += score * 0.8;
				traitScores.dominance += score * 0.4;
				traitScores.neuroticism -= score * 0.2;
				break;
			case 'Practical':
				traitScores.conscientiousness += score;
				traitScores.analytical += score * 0.6;
				traitScores.openness -= score * 0.2;
				traitScores.creative -= score * 0.1;
				break;
			case 'Adventurous':
				traitScores.openness += score;
				traitScores.extroversion += score * 0.6;
				traitScores.dominance += score * 0.5;
				traitScores.neuroticism += score * 0.3;
				break;
			case 'Organized':
				traitScores.conscientiousness += score;
				traitScores.analytical += score * 0.5;
				traitScores.dominance += score * 0.3;
				traitScores.openness -= score * 0.3;
				break;
		}
	});
	
	// Normalize scores to 0-100 scale
	const numResults = results.length;
	Object.keys(traitScores).forEach(trait => {
		traitScores[trait] = Math.max(0, Math.min(100, 
			50 + (traitScores[trait] / (numResults * 100)) * 50
		));
	});
	
	// Determine dominant trait
	const dominantTrait = Object.entries(traitScores)
		.sort(([,a], [,b]) => b - a)[0][0];
	
	// Determine personality type based on dominant trait and scores
	const personalityType = getPersonalityType(traitScores, dominantTrait);
	
	return {
		traits: traitScores,
		dominantTrait: dominantTrait,
		personalityType: personalityType,
		confidence: Math.min(95, 60 + (numResults * 5)), // Confidence based on number of results
		lastUpdated: new Date().toISOString()
	};
}

// Helper function to determine personality type
function getPersonalityType(traitScores, dominantTrait) {
	const { extroversion, analytical, creative, conscientiousness, 
		dominance, agreeableness, openness, neuroticism } = traitScores;
	
	// Complex personality type mapping
	if (analytical > 70 && conscientiousness > 65) return "The Analyst";
	if (creative > 70 && openness > 70) return "The Innovator";
	if (extroversion > 70 && agreeableness > 65) return "The Connector";
	if (dominance > 70 && conscientiousness > 65) return "The Leader";
	if (openness > 70 && extroversion > 60) return "The Explorer";
	if (conscientiousness > 75) return "The Organizer";
	if (agreeableness > 75 && extroversion > 60) return "The Harmonizer";
	
	// Mixed types
	if (analytical > 60 && creative > 60) return "The Creative Thinker";
	if (extroversion > 60 && dominance > 60) return "The Social Leader";
	if (conscientiousness > 60 && agreeableness > 60) return "The Reliable Collaborator";
	
	// Default types based on dominant trait
	switch(dominantTrait) {
		case 'extroversion': return "The Social Butterfly";
		case 'analytical': return "The Thinker";
		case 'creative': return "The Artist";
		case 'conscientiousness': return "The Planner";
		case 'dominance': return "The Director";
		case 'agreeableness': return "The Supporter";
		case 'openness': return "The Adventurer";
		case 'neuroticism': return "The Sensitive Soul";
		default: return "The Balanced Individual";
	}
}

// Helper function to generate behavioral predictions
function generateBehavioralPredictions(profile) {
	const { traits } = profile;
	
	const decisionMaking = traits.analytical > 70 ? "Data-driven and logical" :
		traits.creative > 70 ? "Intuitive and innovative" :
		traits.extroversion > 70 ? "Collaborative and consultative" :
		"Balanced and adaptable";
	
	const learningStyle = traits.analytical > 65 ? "Structured and theoretical" :
		traits.creative > 65 ? "Visual and experiential" :
		traits.extroversion > 65 ? "Interactive and social" :
		"Independent and practical";
	
	const socialTendency = traits.extroversion > 70 ? "Highly social, energized by groups" :
		traits.extroversion < 40 ? "Reserved, prefers small groups" :
		"Moderately social, adaptable to situations";
	
	const workStyle = traits.conscientiousness > 70 ? "Methodical and detail-oriented" :
		traits.creative > 70 ? "Innovative and flexible" :
		traits.dominance > 70 ? "Leadership-driven and decisive" :
		"Collaborative and steady";
	
	return {
		decisionMaking,
		learningStyle,
		socialTendency,
		workStyle
	};
}

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

app.listen(port, () => {
	console.log(`Backend server listening at http://localhost:${port}`);
});
