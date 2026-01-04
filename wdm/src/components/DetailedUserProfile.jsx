import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const DetailedUserProfile = ({ user, token }) => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile/${user.email}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data = await response.json();
					setProfile(data);
				} else {
					console.error('Failed to fetch profile');
				}
			} catch (error) {
				console.error("Error fetching profile:", error);
			} finally {
				setLoading(false);
			}
		};

		if (user && user.email) {
			fetchProfile();
		}
	}, [user, token]);

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "2rem" }}>
				<div className="loader"></div>
				<p>Loading profile...</p>
			</div>
		);
	}

	if (!profile || !profile.profile) {
		return (
			<div style={{ textAlign: "center", padding: "2rem" }}>
				<h3>No Advanced Profile Available</h3>
				<p>User needs to complete an updated quiz to generate detailed personality profile.</p>
			</div>
		);
	}

	// Prepare data for radar chart
	const radarData = Object.entries(profile.profile.traits).map(([trait, score]) => ({
		trait: trait.charAt(0).toUpperCase() + trait.slice(1),
		score: score,
		fullMark: 100
	}));

	// Prepare data for trait comparison
	const traitData = Object.entries(profile.profile.traits).map(([trait, score]) => ({
		trait: trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1'),
		score: score
	}));

	// Get personalized message based on dominant traits
	const getPersonalizedMessage = () => {
		const { traits } = profile.profile;
		const dominant = Object.entries(traits).sort(([,a], [,b]) => b - a)[0];
		const trait = dominant[0];
		const score = dominant[1];

		const messages = {
			extroversion: score > 70 ? "Highly outgoing and socially confident individual who thrives in group settings" : "Moderately social, comfortable in both group and independent environments",
			analytical: score > 70 ? "Strong logical thinking and data-driven decision making abilities" : "Balanced approach between analytical and intuitive thinking",
			creative: score > 70 ? "Innovative and imaginative thinker with strong artistic tendencies" : "Shows creativity when needed while maintaining practical focus",
			conscientiousness: score > 70 ? "Highly organized and detail-oriented with strong self-discipline" : "Maintains good balance between planning and flexibility",
			dominance: score > 70 ? "Natural leadership qualities with strong decision-making confidence" : "Collaborative approach with selective leadership when needed",
			agreeableness: score > 70 ? "Empathetic and cooperative team player who values harmony" : "Balanced between cooperation and healthy disagreement",
			openness: score > 70 ? "Curious and open-minded with love for new experiences" : "Selective openness while maintaining practical boundaries",
			neuroticism: score > 70 ? "Emotionally sensitive with heightened awareness of environment" : "Emotionally stable with good stress management"
		};

		return messages[trait] || "Well-balanced personality with diverse strengths";
	};

	return (
		<div className="detailed-profile" style={{ 
			background: "var(--bg-glass)", 
			borderRadius: "var(--border-radius)", 
			border: "1px solid var(--border-color)",
			padding: "2rem",
			marginBottom: "2rem"
		}}>
			{/* Profile Header */}
			<div style={{ marginBottom: "2rem" }}>
				<h2 style={{ 
					color: "var(--text-primary)", 
					marginBottom: "0.5rem",
					background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					backgroundClip: "text"
				}}>
					🧠 Advanced Personality Profile: {profile.email}
				</h2>
				<div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem" }}>
					<span style={{
						background: "var(--primary-color)",
						color: "white",
						padding: "0.5rem 1rem",
						borderRadius: "20px",
						fontSize: "0.9rem",
						fontWeight: "600"
					}}>
						{profile.profile.personalityType}
					</span>
					<span style={{
						background: "var(--accent-color)",
						color: "white",
						padding: "0.5rem 1rem",
						borderRadius: "20px",
						fontSize: "0.9rem"
					}}>
						Dominant: {profile.profile.dominantTrait.charAt(0).toUpperCase() + profile.profile.dominantTrait.slice(1)}
					</span>
				</div>
			</div>

			{/* Personalized Insights */}
			<div style={{ 
				background: "var(--bg-secondary)", 
				padding: "1.5rem", 
				borderRadius: "var(--border-radius)",
				marginBottom: "2rem"
			}}>
				<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>🎯 Personality Insights</h3>
				<p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
					{getPersonalizedMessage()}
				</p>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
				{/* Radar Chart */}
				<div style={{ 
					background: "var(--bg-secondary)", 
					padding: "1.5rem", 
					borderRadius: "var(--border-radius)" 
				}}>
					<h3 style={{ color: "var(--text-primary)", marginTop: 0, marginBottom: "1rem" }}>
						📊 Personality Radar
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<RadarChart data={radarData}>
							<PolarGrid stroke="var(--border-color)" />
							<PolarAngleAxis 
								dataKey="trait" 
								tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
							/>
							<PolarRadiusAxis 
								angle={90} 
								domain={[0, 100]} 
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
							/>
							<Radar 
								name="Personality" 
								dataKey="score" 
								stroke="var(--primary-color)" 
								fill="var(--primary-color)" 
								fillOpacity={0.6}
								strokeWidth={2}
							/>
							<Tooltip 
								contentStyle={{
									background: "var(--bg-glass)",
									border: "1px solid var(--border-color)",
									borderRadius: "8px"
								}}
							/>
						</RadarChart>
					</ResponsiveContainer>
				</div>

				{/* Trait Breakdown */}
				<div style={{ 
					background: "var(--bg-secondary)", 
					padding: "1.5rem", 
					borderRadius: "var(--border-radius)" 
				}}>
					<h3 style={{ color: "var(--text-primary)", marginTop: 0, marginBottom: "1rem" }}>
						📈 Trait Breakdown
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={traitData} layout="horizontal">
							<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
							<XAxis 
								type="number" 
								domain={[0, 100]} 
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
							/>
							<YAxis 
								type="category" 
								dataKey="trait" 
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
								width={80}
							/>
							<Tooltip 
								contentStyle={{
									background: "var(--bg-glass)",
									border: "1px solid var(--border-color)",
									borderRadius: "8px"
								}}
							/>
							<Bar 
								dataKey="score" 
								fill="var(--accent-color)"
								radius={[0, 4, 4, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Behavioral Predictions */}
			{profile.predictions && (
				<div style={{ marginTop: "2rem" }}>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
						🔮 Behavioral Predictions
					</h3>
					<div style={{ 
						display: "grid", 
						gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
						gap: "1rem" 
					}}>
						<div style={{
							background: "var(--bg-secondary)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							textAlign: "center"
						}}>
							<div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🧠</div>
							<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Decision Making</h4>
							<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
								{profile.predictions.decisionMaking}
							</p>
						</div>
						<div style={{
							background: "var(--bg-secondary)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							textAlign: "center"
						}}>
							<div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📚</div>
							<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Learning Style</h4>
							<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
								{profile.predictions.learningStyle}
							</p>
						</div>
						<div style={{
							background: "var(--bg-secondary)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							textAlign: "center"
						}}>
							<div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>👥</div>
							<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Social Tendency</h4>
							<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
								{profile.predictions.socialTendency}
							</p>
						</div>
						<div style={{
							background: "var(--bg-secondary)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							textAlign: "center"
						}}>
							<div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>💼</div>
							<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Work Style</h4>
							<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
								{profile.predictions.workStyle}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Quiz History */}
			{profile.quizHistory && profile.quizHistory.length > 0 && (
				<div style={{ marginTop: "2rem" }}>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
						📝 Quiz History
					</h3>
					<div style={{
						background: "var(--bg-secondary)",
						borderRadius: "var(--border-radius)",
						overflow: "hidden"
					}}>
						<table style={{ width: "100%", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ background: "var(--bg-glass)" }}>
									<th style={{ padding: "1rem", textAlign: "left", color: "var(--text-primary)" }}>Quiz Type</th>
									<th style={{ padding: "1rem", textAlign: "left", color: "var(--text-primary)" }}>Personality Type</th>
									<th style={{ padding: "1rem", textAlign: "left", color: "var(--text-primary)" }}>Date</th>
								</tr>
							</thead>
							<tbody>
								{profile.quizHistory.map((quiz, index) => (
									<tr key={index} style={{ borderBottom: "1px solid var(--border-color)" }}>
										<td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
											{quiz.quizType || "General"}
										</td>
										<td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
											{quiz.personalityType}
										</td>
										<td style={{ padding: "1rem", color: "var(--text-secondary)" }}>
											{new Date(quiz.timestamp).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};

export default DetailedUserProfile;