import { useState } from "react";

const LogIn = ({ onLogin }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const result = await onLogin(email, password);
		if (!result.success) {
			setError(result.error);
		} else {
			setError("");
		}
		setLoading(false);
	};

	return (
		<>
			<h2 className="form-title">Welcome Back</h2>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label className="form-label" htmlFor="email">
						Email Address
					</label>
					<input id="email" type="email" className="form-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="password">
						Password
					</label>
					<input id="password" type="password" className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
				</div>
				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? "Logging In..." : "Log In"}
				</button>
				{error && <div className="form-error">{error}</div>}
			</form>
		</>
	);
};

export default LogIn;
