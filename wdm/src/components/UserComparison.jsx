import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const UserComparison = ({ token }) => {
	const [insights, setInsights] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedComparison, setSelectedComparison] = useState("extroversion-conscientiousness");

	useEffect(() => {
		const fetchInsights = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/psychology-insights`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data = await response.json();
					setInsights(data);
				} else {
					console.error('Failed to fetch insights');
				}
			} catch (error) {
				console.error("Error fetching insights:", error);
			} finally {
				setLoading(false);
			}
		};

		if (token) {
			fetchInsights();
		}
	}, [token]);

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "2rem" }}>
				<div className="loader"></div>
				<p>Loading psychological insights...</p>
			</div>
		);
	}

	if (!insights || !insights.totalProfiles || insights.totalProfiles === 0) {
		return (
			<div style={{ textAlign: "center", padding: "2rem" }}>
				<h3>No Advanced Profiles Available</h3>
				<p>Users need to complete updated quizzes to generate comparison data.</p>
			</div>
		);
	}

	// Prepare scatter plot data for trait comparisons
	const getScatterData = (comparison) => {
		const [trait1, trait2] = comparison.split('-');
		if (!insights.avgTraits) return [];
		
		return [{
			[trait1]: insights.avgTraits[trait1] || 0,
			[trait2]: insights.avgTraits[trait2] || 0,
			z: 100 // Size of the bubble
		}];
	};

	// Prepare trait distribution data
	const traitDistributionData = Object.entries(insights.avgTraits || {}).map(([trait, value]) => ({
		trait: trait.charAt(0).toUpperCase() + trait.slice(1).replace(/([A-Z])/g, ' $1'),
		value: value
	}));

	// Prepare personality type distribution
	const personalityTypeData = Object.entries(insights.personalityDistribution || {}).map(([type, count]) => ({
		type: type.length > 15 ? type.substring(0, 15) + "..." : type,
		count: count,
		fullType: type
	}));

	// Get correlation strength color
	const getCorrelationColor = (strength) => {
		switch (strength) {
			case "strong": return "var(--primary-color)";
			case "moderate": return "var(--accent-color)";
			default: return "var(--success-color)";
		}
	};

	const scatterData = getScatterData(selectedComparison);
	const [trait1, trait2] = selectedComparison.split('-');

	return (
		<div className="user-comparison" style={{ 
			background: "var(--bg-glass)", 
			borderRadius: "var(--border-radius)", 
			border: "1px solid var(--border-color)",
			padding: "2rem",
			marginBottom: "2rem"
		}}>
			<h2 style={{ 
				color: "var(--text-primary)", 
				marginBottom: "2rem",
				background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
				WebkitBackgroundClip: "text",
				WebkitTextFillColor: "transparent",
				backgroundClip: "text"
			}}>
				📊 User Personality Comparison & Analysis
			</h2>

			{/* Key Insights */}
			{insights.insights && insights.insights.length > 0 && (
				<div style={{ marginBottom: "2rem" }}>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
						🔍 Key Psychological Insights
					</h3>
					<div style={{ 
						display: "grid", 
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
						gap: "1rem" 
					}}>
						{insights.insights.map((insight, index) => (
							<div key={index} style={{
								background: "var(--bg-secondary)",
								padding: "1.5rem",
								borderRadius: "var(--border-radius)",
								borderLeft: `4px solid var(--primary-color)`
							}}>
								<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>
									{insight.title}
								</h4>
								<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
									{insight.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
				{/* Trait Correlation Scatter Plot */}
				<div style={{ 
					background: "var(--bg-secondary)", 
					padding: "1.5rem", 
					borderRadius: "var(--border-radius)" 
				}}>
					<h3 style={{ color: "var(--text-primary)", marginTop: 0, marginBottom: "1rem" }}>
						📈 Trait Correlation Analysis
					</h3>
					
					{/* Comparison Selector */}
					<div style={{ marginBottom: "1rem" }}>
						<select 
							value={selectedComparison}
							onChange={(e) => setSelectedComparison(e.target.value)}
							style={{
								background: "var(--bg-glass)",
								border: "1px solid var(--border-color)",
								borderRadius: "8px",
								padding: "0.5rem",
								color: "var(--text-primary)",
								width: "100%"
							}}
						>
							<option value="extroversion-agreeableness">Extroversion vs Agreeableness</option>
							<option value="analytical-creative">Analytical vs Creative</option>
							<option value="conscientiousness-neuroticism">Conscientiousness vs Neuroticism</option>
							<option value="openness-creative">Openness vs Creative</option>
							<option value="dominance-extroversion">Dominance vs Extroversion</option>
						</select>
					</div>

					<ResponsiveContainer width="100%" height={300}>
						<ScatterChart>
							<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
							<XAxis 
								type="number" 
								dataKey={trait1} 
								name={trait1.charAt(0).toUpperCase() + trait1.slice(1)}
								domain={[0, 100]}
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
							/>
							<YAxis 
								type="number" 
								dataKey={trait2} 
								name={trait2.charAt(0).toUpperCase() + trait2.slice(1)}
								domain={[0, 100]}
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
							/>
							<Tooltip 
								cursor={{ strokeDasharray: '3 3' }}
								contentStyle={{
									background: "var(--bg-glass)",
									border: "1px solid var(--border-color)",
									borderRadius: "8px"
								}}
							/>
							<Scatter 
								name="Average User" 
								data={scatterData} 
								fill="var(--primary-color)"
							/>
						</ScatterChart>
					</ResponsiveContainer>

					{/* Correlation Info */}
					{insights.correlations && insights.correlations[selectedComparison] && (
						<div style={{ marginTop: "1rem", textAlign: "center" }}>
							<span style={{
								background: getCorrelationColor(insights.correlations[selectedComparison].strength),
								color: "white",
								padding: "0.5rem 1rem",
								borderRadius: "20px",
								fontSize: "0.8rem"
							}}>
								Correlation: {insights.correlations[selectedComparison].correlation} 
								({insights.correlations[selectedComparison].strength})
							</span>
						</div>
					)}
				</div>

				{/* Trait Distribution */}
				<div style={{ 
					background: "var(--bg-secondary)", 
					padding: "1.5rem", 
					borderRadius: "var(--border-radius)" 
				}}>
					<h3 style={{ color: "var(--text-primary)", marginTop: 0, marginBottom: "1rem" }}>
						📊 Average Trait Distribution
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={traitDistributionData}>
							<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
							<XAxis 
								dataKey="trait" 
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
								angle={-45}
								textAnchor="end"
								height={80}
							/>
							<YAxis 
								domain={[0, 100]}
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
							/>
							<Tooltip 
								contentStyle={{
									background: "var(--bg-glass)",
									border: "1px solid var(--border-color)",
									borderRadius: "8px"
								}}
							/>
							<Bar 
								dataKey="value" 
								fill="var(--accent-color)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Personality Type Distribution */}
			<div style={{ marginTop: "2rem" }}>
				<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
					🎭 Personality Type Distribution
				</h3>
				<div style={{
					background: "var(--bg-secondary)",
					padding: "1.5rem",
					borderRadius: "var(--border-radius)"
				}}>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={personalityTypeData} layout="horizontal">
							<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
							<XAxis 
								type="number"
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
							/>
							<YAxis 
								type="category" 
								dataKey="type" 
								tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
								width={150}
							/>
							<Tooltip 
								contentStyle={{
									background: "var(--bg-glass)",
									border: "1px solid var(--border-color)",
									borderRadius: "8px"
								}}
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										const data = payload[0].payload;
										return (
											<div style={{
												background: "var(--bg-glass)",
												border: "1px solid var(--border-color)",
												borderRadius: "8px",
												padding: "0.5rem"
											}}>
												<p style={{ margin: 0, color: "var(--text-primary)" }}>
													{data.fullType}
												</p>
												<p style={{ margin: 0, color: "var(--text-secondary)" }}>
													Count: {data.count}
												</p>
											</div>
										);
									}
									return null;
								}}
							/>
							<Bar 
								dataKey="count" 
								fill="var(--success-color)"
								radius={[0, 4, 4, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Personality Clusters */}
			{insights.clusters && insights.clusters.length > 0 && (
				<div style={{ marginTop: "2rem" }}>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
						👥 Personality Clusters
					</h3>
					<div style={{ 
						display: "grid", 
						gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
						gap: "1rem" 
					}}>
						{insights.clusters.map((cluster, index) => (
							<div key={index} style={{
								background: "var(--bg-secondary)",
								padding: "1.5rem",
								borderRadius: "var(--border-radius)",
								textAlign: "center",
								border: cluster.count > 0 ? "2px solid var(--primary-color)" : "1px solid var(--border-color)"
							}}>
								<h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>
									{cluster.name}
								</h4>
								<div style={{
									fontSize: "2rem",
									fontWeight: "bold",
									color: cluster.count > 0 ? "var(--primary-color)" : "var(--text-secondary)",
									margin: "1rem 0"
								}}>
									{cluster.count}
								</div>
								<p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
									{cluster.percentage}% of users
								</p>
								{cluster.count > 0 && (
									<div style={{ marginTop: "1rem" }}>
										<p style={{ 
											color: "var(--text-secondary)", 
											fontSize: "0.8rem", 
											margin: "0 0 0.5rem 0" 
										}}>
											Key Traits:
										</p>
										{cluster.traits.map((trait, i) => (
											<span key={i} style={{
												background: "var(--accent-color)",
												color: "white",
												padding: "0.25rem 0.5rem",
												borderRadius: "12px",
												fontSize: "0.7rem",
												margin: "0.25rem",
												display: "inline-block"
											}}>
												{trait.trait}: {trait.score}
											</span>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default UserComparison;