import React, { useEffect, useState } from "react";

function AdminDashboard({ token }) {
	const [analytics, setAnalytics] = useState(null);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = async (url, setter) => {
		try {
			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setter(data);
		} catch (err) {
			setError(err.message);
		}
	};

	useEffect(() => {
		setLoading(true);
		Promise.all([
			fetchData("/api/admin/analytics", setAnalytics),
			fetchData("/api/admin/users", setUsers),
		]).finally(() => setLoading(false));
	}, [token]);

	if (loading) return <div className="loader"></div>;
	if (error) return <div className="error-message">Error: {error}</div>;

	return (
		<div className="admin-dashboard">
			<h1>Admin Dashboard</h1>

			<section className="dashboard-section">
				<h2>Analytics Overview</h2>
				{analytics && (
					<div className="analytics-grid">
						<div className="analytics-card">
							<h3>Total Users</h3>
							<p>{analytics.totalUsers}</p>
						</div>
						<div className="analytics-card">
							<h3>Total Quizzes Taken</h3>
							<p>{analytics.totalResults}</p>
						</div>
						<div className="analytics-card">
							<h3>Dominant Trait</h3>
							<p>{analytics.personalityStats[0]?._id || "N/A"}</p>
						</div>
					</div>
				)}
			</section>

			<section className="dashboard-section">
				<h2>User Management</h2>
				<table className="users-table">
					<thead>
						<tr>
							<th>Email</th>
							<th>Total Quizzes</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user._id}>
								<td>{user.email}</td>
								<td>{user.totalQuizzes}</td>
								<td>
									<button className="btn btn-danger btn-sm">Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</div>
	);
}

export default AdminDashboard;