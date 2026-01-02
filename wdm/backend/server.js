const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
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

// Advanced psychological insights endpoint
app.get("/api/admin/psychology-insights", authenticateToken, isAdmin, async (req, res) => {
	try {
		// Get all user profiles with advanced data
		const profiles = await resultsCollection.find({
			profile: { $exists: true }
		}).toArray();

		if (profiles.length === 0) {
			return res.json({
				message: "No advanced profiles found. Users need to take updated quizzes.",
				insights: null
			});
		}

		// Calculate average traits across all users
		const avgTraits = {
			extroversion: 0,
			agreeableness: 0,
			conscientiousness: 0,
			neuroticism: 0,
			openness: 0,
			dominance: 0,
			analytical: 0,
			creative: 0
		};

		profiles.forEach(profile => {
			if (profile.profile && profile.profile.traits) {
				Object.entries(profile.profile.traits).forEach(([trait, value]) => {
					if (avgTraits.hasOwnProperty(trait)) {
						avgTraits[trait] += value;
					}
				});
			}
		});

		// Calculate averages
		Object.keys(avgTraits).forEach(trait => {
			avgTraits[trait] = Math.round(avgTraits[trait] / profiles.length);
		});

		// Find personality type distribution
		const personalityDistribution = {};
		profiles.forEach(profile => {
			const type = profile.profile?.personalityType || "Undetermined";
			personalityDistribution[type] = (personalityDistribution[type] || 0) + 1;
		});

		// Identify personality clusters
		const clusters = identifyPersonalityClusters(profiles);

		// Find trait correlations
		const correlations = calculateTraitCorrelations(profiles);

		// Generate insights
		const insights = generateInsights(avgTraits, personalityDistribution, clusters);

		res.json({
			avgTraits,
			personalityDistribution,
			clusters,
			correlations,
			insights,
			totalProfiles: profiles.length
		});
	} catch (err) {
		console.error("Failed to generate psychology insights:", err);
		res.status(500).json({ error: "Failed to generate insights" });
	}
});

// Identify personality clusters based on trait patterns
const identifyPersonalityClusters = (profiles) => {
	const clusters = [
		{
			name: "Analytical Thinkers",
			traits: ["analytical", "conscientiousness"],
			minScore: 60,
			users: []
		},
		{
			name: "Creative Visionaries", 
			traits: ["creative", "openness"],
			minScore: 60,
			users: []
		},
		{
			name: "Social Leaders",
			traits: ["extroversion", "dominance"],
			minScore: 60,
			users: []
		},
		{
			name: "Supportive Collaborators",
			traits: ["agreeableness", "conscientiousness"],
			minScore: 60,
			users: []
		}
	];

	profiles.forEach(profile => {
		const traits = profile.profile?.traits || {};
		const email = profile.email;

		clusters.forEach(cluster => {
			const meetsCriteria = cluster.traits.every(trait => 
				traits[trait] >= cluster.minScore
			);
			if (meetsCriteria) {
				cluster.users.push({
					email,
					traits: cluster.traits.map(t => ({ trait: t, score: traits[t] }))
				});
			}
		});
	});

	return clusters.map(cluster => ({
		...cluster,
		count: cluster.users.length,
		percentage: Math.round((cluster.users.length / profiles.length) * 100)
	}));
};

// Calculate trait correlations
const calculateTraitCorrelations = (profiles) => {
	const correlations = {};
	const traitPairs = [
		["extroversion", "agreeableness"],
		["analytical", "creative"],
		["conscientiousness", "neuroticism"],
		["openness", "creative"],
		["dominance", "extroversion"]
	];

	traitPairs.forEach(([trait1, trait2]) => {
		let correlation = 0;
		let validProfiles = 0;

		profiles.forEach(profile => {
			const traits = profile.profile?.traits || {};
			if (traits[trait1] !== undefined && traits[trait2] !== undefined) {
				correlation += (traits[trait1] * traits[trait2]) / 10000;
				validProfiles++;
			}
		});

		correlations[`${trait1}-${trait2}`] = {
			correlation: Math.round(correlation / validProfiles * 100) / 100,
			strength: Math.abs(correlation / validProfiles) > 0.5 ? "strong" : 
						Math.abs(correlation / validProfiles) > 0.3 ? "moderate" : "weak"
		};
	});

	return correlations;
};

// Generate insights based on data
const generateInsights = (avgTraits, personalityDistribution, clusters) => {
	const insights = [];

	// Analyze dominant traits
	const dominantTraits = Object.entries(avgTraits)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 3)
		.map(([trait, score]) => ({ trait, score }));

	insights.push({
		type: "dominant_traits",
		title: "Most Common Traits",
		description: `Your user base shows highest levels of ${dominantTraits.map(t => t.trait).join(", ")}`,
		data: dominantTraits
	});

	// Analyze personality diversity
	const diversityScore = Object.keys(personalityDistribution).length;
	insights.push({
		type: "diversity",
		title: "Personality Diversity",
		description: diversityScore > 4 ? "High diversity in personality types" : "Moderate personality diversity",
		data: { diversityScore, types: Object.keys(personalityDistribution).length }
	});

	// Analyze largest cluster
	const largestCluster = clusters.sort((a, b) => b.count - a.count)[0];
	if (largestCluster && largestCluster.count > 0) {
		insights.push({
			type: "cluster",
			title: "Largest Personality Cluster",
			description: `${largestCluster.name} represents ${largestCluster.percentage}% of users`,
			data: largestCluster
		});
	}

	// Analytical insight
	if (avgTraits.analytical > 60) {
		insights.push({
			type: "behavioral",
			title: "User Behavior Pattern",
			description: "Users tend to be analytical and data-driven in decision making"
		});
	} else if (avgTraits.creative > 60) {
		insights.push({
			type: "behavioral", 
			title: "User Behavior Pattern",
			description: "Users show creative and innovative tendencies"
		});
	}

	return insights;
};

// Get detailed user profile for admin
app.get("/api/admin/profile/:email", authenticateToken, isAdmin, async (req, res) => {
	try {
		const email = req.params.email;
		const userResults = await resultsCollection.find({ 
			email,
			profile: { $exists: true }
		}).sort({ timestamp: -1 }).toArray();

		if (userResults.length === 0) {
			return res.json({ 
				error: "No advanced profile found for this user" 
			});
		}

		// Get the most recent comprehensive profile
		const latestProfile = userResults[0];
		
		// Combine all quiz data for comprehensive view
		const allTraits = {
			extroversion: 0,
			agreeableness: 0,
			conscientiousness: 0,
			neuroticism: 0,
			openness: 0,
			dominance: 0,
			analytical: 0,
			creative: 0
		};

		userResults.forEach(result => {
			if (result.profile && result.profile.traits) {
				Object.entries(result.profile.traits).forEach(([trait, value]) => {
					allTraits[trait] += value;
				});
			}
		});

		// Average the traits
		Object.keys(allTraits).forEach(trait => {
			allTraits[trait] = Math.round(allTraits[trait] / userResults.length);
		});

		res.json({
			email,
			profile: latestProfile.profile,
			predictions: latestProfile.predictions,
			averagedTraits: allTraits,
			quizHistory: userResults.map(r => ({
				quizType: r.quizType,
				timestamp: r.timestamp,
				personalityType: r.profile?.personalityType
			}))
		});
	} catch (err) {
		console.error("Failed to fetch user profile:", err);
		res.status(500).json({ error: "Failed to fetch user profile" });
	}
});

app.listen(port, () => {
	console.log(`Backend server listening at http://localhost:${port}`);
});
=======
// Advanced personality calculation function
const calculatePersonalityProfile = (answers, quizData) => {
	// Initialize all 8 personality dimensions
	const traits = {
		extroversion: 0,
		agreeableness: 0,
		conscientiousness: 0,
		neuroticism: 0,
		openness: 0,
		dominance: 0,
		analytical: 0,
		creative: 0
	};

	// Find the quiz that contains the questions
	let quiz = null;
	for (const q of quizData.quizzes) {
		if (q.questions && q.questions.length > 0) {
			quiz = q;
			break;
		}
	}

	if (!quiz) {
		return {
			traits: Object.fromEntries(Object.entries(traits).map(([key, value]) => [key, 50])),
			dominantTrait: "unknown",
			personalityType: "Undetermined"
		};
	}

	// Calculate scores based on answers
	answers.forEach(answer => {
		const question = quiz.questions.find(q => q.question === answer.question);
		if (question && question.scores && question.scores[answer.selectedOption]) {
			const scores = question.scores[answer.selectedOption];
			Object.entries(scores).forEach(([trait, value]) => {
				if (traits.hasOwnProperty(trait)) {
					traits[trait] += value;
				}
			});
		}
	});

	// Normalize scores to 0-100 range
	const minScore = Math.min(...Object.values(traits));
	const maxScore = Math.max(...Object.values(traits));
	const range = maxScore - minScore || 1;

	const normalizedTraits = Object.fromEntries(
		Object.entries(traits).map(([trait, score]) => [
			trait,
			Math.round(((score - minScore) / range) * 100)
		])
	);

	// Determine dominant trait
	let dominantTrait = Object.entries(normalizedTraits)
		.sort(([,a], [,b]) => b - a)[0][0];

	// Determine personality type based on trait combinations
	const personalityType = determinePersonalityType(normalizedTraits);

	return {
		traits: normalizedTraits,
		dominantTrait,
		personalityType
	};
};

// Determine personality type based on trait combinations
const determinePersonalityType = (traits) => {
	const { extroversion, analytical, creative, conscientiousness, agreeableness } = traits;
	
	if (extroversion > 70 && analytical > 60) return "Strategic Leader";
	if (extroversion > 70 && creative > 60) return "Creative Visionary";
	if (analytical > 70 && conscientiousness > 60) return "Methodical Analyst";
	if (creative > 70 && agreeableness > 60) return "Empathetic Creator";
	if (extroversion > 70) return "Social Connector";
	if (analytical > 70) return "Logical Thinker";
	if (creative > 70) return "Innovative Artist";
	if (conscientiousness > 70) return "Organized Planner";
	if (agreeableness > 70) return "Supportive Collaborator";
	return "Balanced Individual";
};

// Get behavioral predictions based on personality profile
const getBehavioralPredictions = (traits) => {
	const predictions = {
		decisionMaking: "",
		learningStyle: "",
		socialTendency: "",
		workStyle: ""
	};

	if (traits.analytical > 60) {
		predictions.decisionMaking = "Data-driven and methodical";
		predictions.learningStyle = "Structured and analytical";
	} else if (traits.creative > 60) {
		predictions.decisionMaking = "Intuitive and innovative";
		predictions.learningStyle = "Experimental and visual";
	} else {
		predictions.decisionMaking = "Balanced approach";
		predictions.learningStyle = "Adaptable and versatile";
	}

	if (traits.extroversion > 60) {
		predictions.socialTendency = "Outgoing and collaborative";
		predictions.workStyle = "Team-oriented and communicative";
	} else {
		predictions.socialTendency = "Reflective and independent";
		predictions.workStyle = "Focused and autonomous";
	}

	return predictions;
};

// Submit quiz result for different quiz types
app.post("/api/submit-quiz-result", authenticateToken, async (req, res) => {
	try {
		const { answers, quizType } = req.body;
		const email = req.user.email;
		
		// Load the appropriate quiz data
		let quizDataPath;
		switch(quizType) {
			case "intelligence":
				quizDataPath = path.join(__dirname, "../src/quizData2.json");
				break;
			case "learning":
				quizDataPath = path.join(__dirname, "../src/quizData3.json");
				break;
			case "career":
				quizDataPath = path.join(__dirname, "../src/quizData4.json");
				break;
			default:
				quizDataPath = path.join(__dirname, "../src/quizData.json");
		}
		
		const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
		
		// Calculate advanced personality profile
		const profile = calculatePersonalityProfile(answers, quizData);
		const predictions = getBehavioralPredictions(profile.traits);
		
		// Save to database with enhanced data
		await resultsCollection.insertOne({
			email,
			quizType,
			answers,
			profile,
			predictions,
			timestamp: new Date()
		});
		
		res.json({ 
			profile,
			predictions,
			message: "Profile analyzed successfully"
		});
	} catch (error) {
		console.error("Error submitting quiz result:", error);
		res.status(500).json({ error: "Failed to submit quiz result" });
	}
});
>>>>>>> Stashed changes

app.listen(port, () => {
	console.log(`Backend server listening at http://localhost:${port}`);
});
