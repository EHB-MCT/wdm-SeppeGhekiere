import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import DetailedUserProfile from "./DetailedUserProfile";
import UserComparison from "./UserComparison";

const AdminDashboard = ({ token }) => {
	const [analytics, setAnalytics] = useState(null);
	const [users, setUsers] = useState([]);
	const [filteredResults, setFilteredResults] = useState([]);
	const [databaseData, setDatabaseData] = useState(null);
	const [selectedUser, setSelectedUser] = useState(null);
	const [activeView, setActiveView] = useState("overview");
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		email: "",
		startDate: "",
		endDate: "",
		personalityType: "",
	});

	const COLORS = ["#6366f1", "#06b6d4", "#ec4899", "#10b981", "#f59e0b"];

	useEffect(() => {
		fetchAnalytics();
		fetchUsers();
		fetchDatabaseData();
	}, []);

	const fetchAnalytics = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const data = await response.json();
				setAnalytics(data);
			} else if (response.status === 401) {
				alert("Admin access required or session expired");
			}
		} catch (error) {
			console.error("Failed to fetch analytics:", error);
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const data = await response.json();
				setUsers(data);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	const fetchDatabaseData = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/database`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const data = await response.json();
				console.log('Database Data:', data);
				setDatabaseData(data);
				return data;
			}
		} catch (error) {
			console.error("Error fetching database data:", error);
		}
	};

	const applyFilters = async () => {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value) params.append(key, value);
		});

		try {
			const response = await fetch(`/api/admin/results/filter?${params}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				const data = await response.json();
				setFilteredResults(data);
			} else if (response.status === 401) {
				alert("Admin access required or session expired");
			}
		} catch (error) {
			console.error("Failed to filter results:", error);
		}
	};

	const deleteUser = async (email) => {
		if (!confirm(`Are you sure you want to delete user ${email}?`)) return;

		try {
			const response = await fetch(`/api/admin/users/${email}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.ok) {
				fetchUsers();
				fetchAnalytics();
			} else if (response.status === 401) {
				alert("Admin access required or session expired");
			}
		} catch (error) {
			console.error("Failed to delete user:", error);
		}
	};

	if (loading) {
		return (
			<div className="page-container">
				<div style={{ textAlign: "center", padding: "3rem" }}>
					<div className="loader"></div>
					<p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading admin dashboard...</p>
				</div>
			</div>
		);
}

				{activeView === "overview" && (
					<>
				{/* Overview Cards */}
				<div
					style={{
									background: activeView === view ? "var(--primary-color)" : "transparent",
									color: activeView === view ? "white" : "var(--text-primary)",
									border: "none",
									padding: "0.75rem 1.5rem",
									borderRadius: "8px",
									cursor: "pointer",
									fontWeight: "600",
									transition: "all 0.2s ease"
								}}
                                                        >
                                                                {view === "overview" ? "📊 Overview" :
                                                                 view === "profiles" ? "👥 Profiles" :
                                                                 "🔍 Comparison"}
                                                        </button>
						))}
					</div>
				</div>

				{activeView === "overview" && (
				<div style={{ marginBottom: "2rem" }}>
					<h1
						style={{
							background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							marginBottom: "0.5rem",
						}}
					>
						📊 Admin Dashboard
					</h1>
					<p style={{ color: "var(--text-secondary)" }}>Monitor user activity, analyze trends, and manage your personality quiz platform</p>
				</div>

				{/* Overview Cards */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
						gap: "1.5rem",
						marginBottom: "3rem",
					}}
				>
					<div
						style={{
							background: "var(--bg-glass)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							textAlign: "center",
						}}
					>
						<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
						<h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>Total Users</h3>
						<p
							style={{
								fontSize: "2rem",
								fontWeight: "bold",
								color: "var(--primary-color)",
								margin: 0,
							}}
						>
							{analytics?.totalUsers || 0}
						</p>
					</div>
					<div
						style={{
							background: "var(--bg-glass)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							textAlign: "center",
						}}
					>
						<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div>
						<h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>Total Quiz Results</h3>
						<p
							style={{
								fontSize: "2rem",
								fontWeight: "bold",
								color: "var(--success-color)",
								margin: 0,
							}}
						>
							{analytics?.totalResults || 0}
						</p>
					</div>
					<div
						style={{
							background: "var(--bg-glass)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							textAlign: "center",
						}}
					>
						<div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
						<h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>Avg Quizzes/User</h3>
						<p
							style={{
								fontSize: "2rem",
								fontWeight: "bold",
								color: "var(--accent-color)",
								margin: 0,
							}}
						>
							{analytics?.totalUsers ? (analytics.totalResults / analytics.totalUsers).toFixed(1) : 0}
						</p>
					</div>
				</div>

				{/* Charts */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
						gap: "2rem",
						marginBottom: "3rem",
					}}
				>
					<div
						style={{
							background: "var(--bg-glass)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
						}}
					>
						<h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>🧠 Personality Distribution</h3>
						<PieChart width={400} height={300}>
							<Pie data={analytics?.personalityStats || []} cx={200} cy={150} labelLine={false} label={({ _id, count }) => `${_id}: ${count}`} outerRadius={80} fill="#8884d8" dataKey="count">
								{(analytics?.personalityStats || []).map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</div>

					<div
						style={{
							background: "var(--bg-glass)",
							padding: "1.5rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
						}}
					>
						<h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>📈 Daily Activity (30 Days)</h3>
						<LineChart width={400} height={300} data={analytics?.dailyResults || []}>
							<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
							<XAxis dataKey="_id" stroke="var(--text-secondary)" />
							<YAxis stroke="var(--text-secondary)" />
							<Tooltip
								contentStyle={{
									background: "var(--bg-secondary)",
									border: "1px solid var(--border-color)",
									borderRadius: "8px",
								}}
							/>
							<Legend />
							<Line type="monotone" dataKey="count" stroke="var(--primary-color)" strokeWidth={3} name="Quizzes Taken" dot={{ fill: "var(--primary-color)", strokeWidth: 2, r: 4 }} />
						</LineChart>
					</div>
</div>
					</>
				)}

				{activeView === "overview" && (
					<>
				{/* Filters */}
				<div
					style={{
						background: "var(--bg-glass)",
						padding: "2rem",
						borderRadius: "var(--border-radius)",
						border: "1px solid var(--border-color)",
						marginBottom: "2rem",
					}}
				>
					<h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>🔍 Filter Results</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
							gap: "1rem",
							alignItems: "end",
						}}
					>
						<div className="form-group">
							<label className="form-label">User Email</label>
							<input type="text" className="form-input" placeholder="Search by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
						</div>
						<div className="form-group">
							<label className="form-label">Start Date</label>
							<input type="date" className="form-input" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
						</div>
						<div className="form-group">
							<label className="form-label">End Date</label>
							<input type="date" className="form-input" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
						</div>
						<div className="form-group">
							<label className="form-label">Personality Type</label>
							<select className="form-input" value={filters.personalityType} onChange={(e) => setFilters({ ...filters, personalityType: e.target.value })}>
								<option value="">All Types</option>
								{analytics?.personalityStats?.map((stat) => (
									<option key={stat._id} value={stat._id}>
										{stat._id}
									</option>
								))}
							</select>
						</div>
						<button className="btn btn-primary" onClick={applyFilters}>
							🔍 Apply Filters
						</button>
					</div>
				</div>
			</div>

			{/* Filtered Results */}
			{filteredResults.length > 0 && (
				<div className="page-container" style={{ marginTop: "2rem" }}>
					<h3 style={{ color: "var(--text-primary)" }}>📋 Filtered Results ({filteredResults.length})</h3>
					<div
						style={{
							background: "var(--bg-glass)",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							overflow: "hidden",
						}}
					>
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								color: "var(--text-primary)",
							}}
						>
							<thead>
								<tr style={{ background: "var(--bg-secondary)" }}>
									<th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Email</th>
									<th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Personality Type</th>
									<th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Date</th>
								</tr>
							</thead>
							<tbody>
								{filteredResults.map((result, index) => (
									<tr
										key={index}
										style={{
											borderBottom: "1px solid var(--border-color)",
											transition: "var(--transition)",
										}}
									>
										<td style={{ padding: "1rem" }}>{result.email}</td>
										<td style={{ padding: "1rem" }}>
											<span
												style={{
													background: "var(--primary-color)",
													color: "white",
													padding: "0.25rem 0.5rem",
													borderRadius: "4px",
													fontSize: "0.875rem",
												}}
											>
												{result.dominantTrait}
											</span>
										</td>
										<td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{new Date(result.timestamp).toLocaleDateString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
</div>
					</>
				)}

 {activeView === "comparison" && (
					<UserComparison token={token} />
				)}
			</div>
		</div>
	);
};

export default AdminDashboard;
				<div
					style={{
						background: "var(--bg-glass)",
						borderRadius: "var(--border-radius)",
						border: "1px solid var(--border-color)",
						overflow: "hidden",
					}}
				>
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							color: "var(--text-primary)",
						}}
					>
						<thead>
							<tr style={{ background: "var(--bg-secondary)" }}>
								<th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Email</th>
								<th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Total Quizzes</th>
								<th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Last Activity</th>
								<th style={{ padding: "1rem", textAlign: "left", fontWeight: "600" }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user, index) => (
								<tr
									key={index}
									style={{
										borderBottom: "1px solid var(--border-color)",
										transition: "var(--transition)",
									}}
								>
									<td style={{ padding: "1rem" }}>{user.email}</td>
									<td style={{ padding: "1rem" }}>
										<span
											style={{
												background: "var(--success-color)",
												color: "white",
												padding: "0.25rem 0.5rem",
												borderRadius: "4px",
												fontSize: "0.875rem",
											}}
										>
											{user.totalQuizzes}
										</span>
									</td>
									<td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{user.results.length > 0 ? new Date(Math.max(...user.results.map((r) => new Date(r.timestamp)))).toLocaleDateString() : "Never"}</td>
									<td style={{ padding: "1rem" }}>
										<button className="btn btn-danger" onClick={() => deleteUser(user.email)} style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
											🗑️ Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Database Data Section */}
			{databaseData && (
				<div className="page-container" style={{ marginTop: "2rem" }}>
					<h3 style={{ color: "var(--text-primary)", marginBottom: "1.5rem" }}>🗄️ Database Overview</h3>
					
					<div style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
						gap: "1rem",
						marginBottom: "2rem"
					}}>
						<div style={{
							background: "var(--bg-glass)",
							padding: "1rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							textAlign: "center"
						}}>
							<div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>
								{databaseData.statistics.totalUsers}
							</div>
							<div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
								Total Users
							</div>
						</div>
						<div style={{
							background: "var(--bg-glass)",
							padding: "1rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							textAlign: "center"
						}}>
							<div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>
								{databaseData.statistics.totalResults}
							</div>
							<div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
								Total Results
							</div>
						</div>
						<div style={{
							background: "var(--bg-glass)",
							padding: "1rem",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							textAlign: "center"
						}}>
							<div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>
								{databaseData.statistics.averageResultsPerUser}
							</div>
							<div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
								Avg Results/User
							</div>
						</div>
					</div>

					<div style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "2rem"
					}}>
						{/* Users List */}
						<div style={{
							background: "var(--bg-glass)",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							overflow: "hidden"
						}}>
							<div style={{
								background: "var(--bg-secondary)",
								padding: "1rem",
								borderBottom: "1px solid var(--border-color)"
							}}>
								<h4 style={{ margin: 0, color: "var(--text-primary)" }}>
									👥 Users ({databaseData.users.total})
								</h4>
							</div>
							<div style={{ maxHeight: "300px", overflow: "auto" }}>
								{databaseData.users.data.map((user, index) => (
									<div key={index} style={{
										padding: "0.75rem 1rem",
										borderBottom: "1px solid var(--border-color)",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									}}>
										<span style={{ color: "var(--text-primary)" }}>{user.email}</span>
										<span style={{ 
											background: "var(--accent-color)", 
											color: "white", 
											padding: "0.25rem 0.5rem", 
											borderRadius: "4px", 
											fontSize: "0.75rem" 
										}}>
											User
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Recent Results */}
						<div style={{
							background: "var(--bg-glass)",
							borderRadius: "var(--border-radius)",
							border: "1px solid var(--border-color)",
							overflow: "hidden"
						}}>
							<div style={{
								background: "var(--bg-secondary)",
								padding: "1rem",
								borderBottom: "1px solid var(--border-color)"
							}}>
								<h4 style={{ margin: 0, color: "var(--text-primary)" }}>
									📊 Recent Results ({databaseData.results.total})
								</h4>
							</div>
							<div style={{ maxHeight: "300px", overflow: "auto" }}>
								{databaseData.results.data.slice(0, 10).map((result, index) => (
									<div key={index} style={{
										padding: "0.75rem 1rem",
										borderBottom: "1px solid var(--border-color)"
									}}>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
											<span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
												{result.email}
											</span>
											<span style={{ 
												background: "var(--success-color)", 
												color: "white", 
												padding: "0.25rem 0.5rem", 
												borderRadius: "4px", 
												fontSize: "0.75rem" 
											}}>
												{result.quizId}
											</span>
										</div>
										<div style={{ 
											fontSize: "0.875rem", 
											color: "var(--text-secondary)",
											marginTop: "0.25rem" 
										}}>
											{result.dominantTrait} • {new Date(result.timestamp).toLocaleDateString()}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
