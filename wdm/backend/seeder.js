const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/quizdb";
const client = new MongoClient(MONGO_URI);

// Sample data
const sampleUsers = [
	{ email: "john.doe@example.com", password: "password123" },
	{ email: "jane.smith@example.com", password: "password123" },
	{ email: "mike.wilson@example.com", password: "password123" },
	{ email: "sarah.jones@example.com", password: "password123" },
	{ email: "alex.brown@example.com", password: "password123" },
	{ email: "emily.davis@example.com", password: "password123" },
	{ email: "chris.miller@example.com", password: "password123" },
	{ email: "lisa.garcia@example.com", password: "password123" }
];

const personalityTypes = ["Analytical", "Creative", "Social", "Practical", "Adventurous", "Organized"];

// Available quiz IDs from the quiz data files
const availableQuizIds = [
	"personality-test",
	"social-media-savvy", 
	"introvert-extrovert",
	"learning-style",
	"communication-style",
	"work-style",
	"stress-management",
	"decision-making",
	"creativity-style",
	"leadership-style",
	"time-management",
	"conflict-resolution"
];

// Helper function to generate random answers
function generateAnswers(length) {
	return Array.from({ length }, () => Math.floor(Math.random() * 3) + 1);
}

// Helper function to get random quiz ID
function getRandomQuizId() {
	return availableQuizIds[Math.floor(Math.random() * availableQuizIds.length)];
}

// Helper function to generate random timestamp within days
function getRandomTimestamp(daysAgo) {
	const now = Date.now();
	const daysMs = daysAgo * 24 * 60 * 60 * 1000;
	const randomMs = Math.floor(Math.random() * daysMs);
	return new Date(now - randomMs);
}

// Generate comprehensive quiz results for advanced profiling
const sampleQuizResults = [];

// Generate 2-4 quiz results per user
sampleUsers.forEach((user, userIndex) => {
	const userDominantTrait = personalityTypes[userIndex % personalityTypes.length];
	const numberOfQuizzes = Math.floor(Math.random() * 3) + 2; // 2-4 quizzes per user
	
	// Generate unique quiz results for this user
	const usedQuizIds = new Set();
	
	for (let i = 0; i < numberOfQuizzes; i++) {
		let quizId = getRandomQuizId();
		// Ensure unique quiz IDs for this user
		while (usedQuizIds.has(quizId)) {
			quizId = getRandomQuizId();
		}
		usedQuizIds.add(quizId);
		
		// Generate answer length based on quiz type (varies between 8-12 questions)
		const answerLength = Math.floor(Math.random() * 5) + 8;
		
		// Add some variety - 70% chance to match dominant trait, 30% chance for variety
		const dominantTrait = Math.random() < 0.7 ? userDominantTrait : 
			personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
		
		sampleQuizResults.push({
			email: user.email,
			quizId: quizId,
			dominantTrait: dominantTrait,
			answers: generateAnswers(answerLength),
			timestamp: getRandomTimestamp(30), // Within last 30 days
			score: Math.floor(Math.random() * 25) + 75 // Scores between 75-100
		});
	}
});

// Add some specific patterns for better testing
// User with consistent Analytical results across multiple quizzes
const analyticalUser = sampleUsers[0].email;
["personality-test", "learning-style", "decision-making", "time-management"].forEach((quizId, index) => {
	sampleQuizResults.push({
		email: analyticalUser,
		quizId: quizId,
		dominantTrait: "Analytical",
		answers: generateAnswers(10),
		timestamp: getRandomTimestamp(20 - index * 5),
		score: Math.floor(Math.random() * 10) + 85
	});
});

// User with Creative results
const creativeUser = sampleUsers[1].email;
["social-media-savvy", "creativity-style", "communication-style", "leadership-style"].forEach((quizId, index) => {
	sampleQuizResults.push({
		email: creativeUser,
		quizId: quizId,
		dominantTrait: "Creative",
		answers: generateAnswers(9),
		timestamp: getRandomTimestamp(18 - index * 4),
		score: Math.floor(Math.random() * 15) + 80
	});
});

// User with Social/Leadership mix
const socialUser = sampleUsers[2].email;
["introvert-extrovert", "work-style", "stress-management", "conflict-resolution"].forEach((quizId, index) => {
	sampleQuizResults.push({
		email: socialUser,
		quizId: quizId,
		dominantTrait: index < 2 ? "Social" : "Creative",
		answers: generateAnswers(11),
		timestamp: getRandomTimestamp(25 - index * 6),
		score: Math.floor(Math.random() * 20) + 75
	});
});

// Add some recent activity for better testing
[
	{ email: sampleUsers[3].email, quizId: "leadership-style", trait: "Practical", hoursAgo: 2 },
	{ email: sampleUsers[4].email, quizId: "time-management", trait: "Organized", hoursAgo: 5 },
	{ email: sampleUsers[5].email, quizId: "stress-management", trait: "Creative", hoursAgo: 8 },
	{ email: sampleUsers[6].email, quizId: "decision-making", trait: "Analytical", hoursAgo: 12 },
	{ email: sampleUsers[7].email, quizId: "communication-style", trait: "Social", hoursAgo: 24 }
].forEach(result => {
	sampleQuizResults.push({
		email: result.email,
		quizId: result.quizId,
		dominantTrait: result.trait,
		answers: generateAnswers(8),
		timestamp: new Date(Date.now() - result.hoursAgo * 60 * 60 * 1000),
		score: Math.floor(Math.random() * 15) + 82
	});
});

async function seedDatabase() {
	try {
		await client.connect();
		console.log("Connected to MongoDB for seeding");

		const db = client.db("quizdb");
		const usersCollection = db.collection("users");
		const resultsCollection = db.collection("results");

		// Clear existing data but preserve admin user
		console.log("Clearing existing data (preserving admin user)...");
		const adminEmail = process.env.ADMIN_EMAIL || "admin@user.com";
		await usersCollection.deleteMany({ email: { $ne: adminEmail } });
		await resultsCollection.deleteMany({});

		// Hash passwords and insert users
		console.log("Creating sample users...");
		const hashedUsers = [];
		for (const user of sampleUsers) {
			const hashedPassword = await bcrypt.hash(user.password, 10);
			hashedUsers.push({
				email: user.email,
				password: hashedPassword,
				createdAt: new Date()
			});
		}
		await usersCollection.insertMany(hashedUsers);
		console.log(`Created ${hashedUsers.length} sample users`);

		// Insert quiz results
		console.log("Creating sample quiz results...");
		await resultsCollection.insertMany(sampleQuizResults);
		console.log(`Created ${sampleQuizResults.length} sample quiz results`);

		// Display statistics
		const userCount = await usersCollection.countDocuments();
		const resultCount = await resultsCollection.countDocuments();
		const personalityStats = await resultsCollection.aggregate([
			{ $group: { _id: "$dominantTrait", count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		]).toArray();

		console.log("\n=== Database Seeding Complete ===");
		console.log(`Total Users: ${userCount}`);
		console.log(`Total Quiz Results: ${resultCount}`);
		console.log("\nPersonality Distribution:");
		personalityStats.forEach(stat => {
			console.log(`  ${stat._id}: ${stat.count} results`);
		});

	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		await client.close();
		console.log("\nDatabase connection closed");
	}
}

// Run the seeder
if (require.main === module) {
	seedDatabase()
		.then(() => {
			console.log("Seeding completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Seeding failed:", error);
			process.exit(1);
		});
}

module.exports = { seedDatabase };