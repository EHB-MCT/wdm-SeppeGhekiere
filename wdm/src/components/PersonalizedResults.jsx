import { useState, useEffect } from "react";

const PersonalizedResults = ({ user, profile }) => {
	const [recommendations, setRecommendations] = useState([]);

	useEffect(() => {
		if (profile && profile.profile) {
			const recs = generateRecommendations(profile);
			setRecommendations(recs);
		}
	}, [profile]);

	const generateRecommendations = (profile) => {
		const { traits, dominantTrait, personalityType } = profile.profile;
		const recs = [];

		// Generate career recommendations
		if (traits.analytical > 70) {
			recs.push({
				type: "career",
				title: "Data-Driven Careers",
				description: "Consider roles in data analysis, research, engineering, or financial planning",
				icon: "💼"
			});
		}

		if (traits.creative > 70) {
			recs.push({
				type: "career",
				title: "Creative Professions",
				description: "Explore opportunities in design, marketing, arts, or content creation",
				icon: "🎨"
			});
		}

		if (traits.extroversion > 70 && traits.dominance > 60) {
			recs.push({
				type: "career",
				title: "Leadership Roles",
				description: "Management, sales, public relations, or entrepreneurial ventures suit you",
				icon: "👔"
			});
		}

		// Generate learning recommendations
		if (traits.openness > 60) {
			recs.push({
				type: "learning",
				title: "Expand Your Horizons",
				description: "Try learning new languages, musical instruments, or travel to new cultures",
				icon: "🌍"
			});
		}

		if (traits.conscientiousness > 70) {
			recs.push({
				type: "learning",
				title: "Structured Learning",
				description: "Consider formal courses, certification programs, or methodical self-study approaches",
				icon: "📚"
			});
		}

		// Generate social recommendations
		if (traits.agreeableness > 70) {
			recs.push({
				type: "social",
				title: "Collaborative Activities",
				description: "Join community service groups, team sports, or collaborative projects",
				icon: "🤝"
			});
		}

		if (traits.extroversion < 30) {
			recs.push({
				type: "social",
				title: "Meaningful Connections",
				description: "Focus on deep one-on-one relationships rather than large social gatherings",
				icon: "👥"
			});
		}

		// Generate development recommendations
		if (traits.neuroticism > 60) {
			recs.push({
				type: "development",
				title: "Stress Management",
				description: "Practice mindfulness, meditation, or regular exercise to build emotional resilience",
				icon: "🧘"
			});
		}

		if (traits.analytical < 40) {
			recs.push({
				type: "development",
				title: "Analytical Thinking",
				description: "Try logic puzzles, strategic games, or analytical reading to strengthen reasoning skills",
				icon: "🧩"
			});
		}

		// Generate quiz recommendations
		const nextQuizzes = getNextQuizRecommendations(traits, personalityType);
		recs.push(...nextQuizzes);

		return recs;
	};

	const getNextQuizRecommendations = (traits, personalityType) => {
		const quizRecs = [];

		// Recommend specific quizzes based on traits
		if (traits.analytical < 50) {
			quizRecs.push({
				type: "quiz",
				title: "Intelligence Assessment",
				description: "Discover your analytical and logical thinking capabilities",
				icon: "🧠",
				action: "intelligence"
			});
		}

		if (traits.creative < 50) {
			quizRecs.push({
				type: "quiz",
				title: "Learning Style Quiz",
				description: "Understand how you best absorb and process information",
				icon: "📖",
				action: "learning"
			});
		}

		if (traits.dominance < 50 && traits.extroversion < 50) {
			quizRecs.push({
				type: "quiz",
				title: "Career Aptitude Test",
				description: "Find career paths that match your personality and skills",
				icon: "💼",
				action: "career"
			});
		}

		return quizRecs;
	};

	const getPersonalizedMessage = () => {
		if (!profile || !profile.profile) return "";

		const { traits, personalityType } = profile.profile;
		const dominant = Object.entries(traits).sort(([,a], [,b]) => b - a)[0];
		const trait = dominant[0];
		const score = dominant[1];

		const messages = {
			extroversion: `With your high extroversion (${score}%), you're naturally outgoing and energized by social interactions. You thrive in collaborative environments and could excel in leadership roles that require strong communication skills.`,
			analytical: `Your analytical thinking (${score}%) sets you apart with strong logical reasoning and data-driven decision making. You excel at breaking down complex problems and finding systematic solutions.`,
			creative: `Your creativity (${score}%) gives you a unique perspective and innovative approach to challenges. You see possibilities others miss and can generate original ideas effortlessly.`,
			conscientiousness: `With high conscientiousness (${score}%), you're organized, detail-oriented, and highly reliable. Your systematic approach ensures quality and consistency in everything you do.`,
			dominance: `Your dominance trait (${score}%) indicates natural leadership potential. You're confident in decision-making and comfortable taking charge in challenging situations.`,
			agreeableness: `Your high agreeableness (${score}%) makes you empathetic and cooperative. You build strong relationships and excel in team environments where harmony matters.`,
			openness: `With openness at ${score}%, you're curious and imaginative. You embrace new experiences and adapt well to change, making you highly versatile.`,
			neuroticism: `Your emotional sensitivity (${score}%) gives you deep emotional awareness. While you may feel stress more intensely, you're also attuned to emotional nuances others miss.`
		};

		return messages[trait] || `As a ${personalityType}, you bring a unique combination of strengths to any situation. Your balanced personality allows you to adapt and thrive in various environments.`;
	};

	const handleQuizRecommendation = (quizType) => {
		// This would typically navigate to the specific quiz
		console.log(`Navigate to ${quizType} quiz`);
		// Implementation depends on your routing system
	};

	return (
		<div className="personalized-results" style={{ 
			background: "var(--bg-glass)", 
			borderRadius: "var(--border-radius)", 
			border: "1px solid var(--border-color)",
			padding: "2rem",
			marginBottom: "2rem"
		}}>
			{/* Personalized Message */}
			<div style={{ marginBottom: "2rem" }}>
				<h2 style={{ 
					color: "var(--text-primary)", 
					marginBottom: "1rem",
					background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					backgroundClip: "text"
				}}>
					🎯 Your Personalized Insights
				</h2>
				<div style={{
					background: "var(--bg-secondary)",
					padding: "1.5rem",
					borderRadius: "var(--border-radius)",
					borderLeft: "4px solid var(--primary-color)"
				}}>
					<p style={{ 
						color: "var(--text-secondary)", 
						lineHeight: "1.6",
						margin: 0
					}}>
						{getPersonalizedMessage()}
					</p>
				</div>
			</div>

			{/* Recommendations */}
			{recommendations.length > 0 && (
				<div>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1.5rem" }}>
						🚀 Personalized Recommendations
					</h3>
					<div style={{ 
						display: "grid", 
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
						gap: "1.5rem" 
					}}>
						{recommendations.map((rec, index) => (
							<div key={index} style={{
								background: "var(--bg-secondary)",
								padding: "1.5rem",
								borderRadius: "var(--border-radius)",
								borderTop: `3px solid ${
									rec.type === 'career' ? 'var(--primary-color)' :
									rec.type === 'learning' ? 'var(--accent-color)' :
									rec.type === 'social' ? 'var(--success-color)' :
									rec.type === 'development' ? 'var(--warning-color)' :
									'var(--info-color)'
								}`,
								transition: "transform 0.2s ease",
								cursor: rec.type === 'quiz' ? "pointer" : "default"
							}}
							onClick={() => rec.type === 'quiz' && handleQuizRecommendation(rec.action)}
							onMouseEnter={rec.type === 'quiz' ? (e) => e.currentTarget.style.transform = 'translateY(-2px)' : undefined}
							onMouseLeave={rec.type === 'quiz' ? (e) => e.currentTarget.style.transform = 'translateY(0)' : undefined}
							>
								<div style={{ display: "flex", alignItems: "flex-start", marginBottom: "1rem" }}>
									<span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>
										{rec.icon}
									</span>
									<div style={{ flex: 1 }}>
										<h4 style={{ 
											color: "var(--text-primary)", 
											margin: "0 0 0.5rem 0",
											fontSize: "1.1rem"
										 }}>
											{rec.title}
										</h4>
										<span style={{
											background: "var(--bg-glass)",
											color: "var(--text-secondary)",
											padding: "0.25rem 0.75rem",
											borderRadius: "12px",
											fontSize: "0.75rem",
											textTransform: "uppercase",
											fontWeight: "600"
										}}>
											{rec.type}
										</span>
									</div>
								</div>
								<p style={{ 
									color: "var(--text-secondary)", 
									fontSize: "0.9rem", 
									lineHeight: "1.5",
									margin: 0
								}}>
									{rec.description}
								</p>
								{rec.type === 'quiz' && (
									<button 
										style={{
											background: "var(--primary-color)",
											color: "white",
											border: "none",
											padding: "0.5rem 1rem",
											borderRadius: "8px",
											marginTop: "1rem",
											cursor: "pointer",
											fontSize: "0.9rem",
											fontWeight: "600"
										}}
										onClick={(e) => {
											e.stopPropagation();
											handleQuizRecommendation(rec.action);
										}}
									>
										Take Quiz →
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{recommendations.length === 0 && (
				<div style={{ textAlign: "center", padding: "2rem" }}>
					<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
						Well-Balanced Personality
					</h3>
					<p style={{ color: "var(--text-secondary)" }}>
						You show a balanced personality profile across all traits. Continue exploring different areas to discover your unique strengths!
					</p>
				</div>
			)}

			{/* Development Path */}
			{profile && profile.profile && (
				<div style={{ marginTop: "2rem" }}>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
						📈 Your Development Path
					</h3>
					<div style={{
						background: "var(--bg-secondary)",
						padding: "1.5rem",
						borderRadius: "var(--border-radius)"
					}}>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
							<div style={{ textAlign: "center" }}>
								<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎯</div>
								<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Current Focus</h4>
								<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
									Leverage your {profile.profile.dominantTrait} strengths
								</p>
							</div>
							<div style={{ textAlign: "center" }}>
								<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌱</div>
								<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Growth Area</h4>
								<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
									{Object.entries(profile.profile.traits)
										.sort(([,a], [,b]) => a - b)[0][0]}
								</p>
							</div>
							<div style={{ textAlign: "center" }}>
								<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
								<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Personality Type</h4>
								<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
									{profile.profile.personalityType}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PersonalizedResults;