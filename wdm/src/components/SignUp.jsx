import { useState } from "react";

const SignUp = ({ onSignup }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long");
			setLoading(false);
			return;
		}

		const result = await onSignup(email, password);
		if (!result.success) {
			setError(result.error);
		} else {
			setError("");
			// Clear form on success
			setEmail("");
			setPassword("");
			setConfirmPassword("");
		}
		setLoading(false);
	};

	return (
		<>
			<h2 className="form-title">Create Your Account</h2>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label className="form-label" htmlFor="signup-email">Email Address</label>
					<input
						id="signup-email"
						type="email"
						className="form-input"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="signup-password">Password</label>
					<input
						id="signup-password"
						type="password"
						className="form-input"
						placeholder="Create a password (min. 6 characters)"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
						minLength="6"
					/>
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="confirm-password">Confirm Password</label>
					<input
						id="confirm-password"
						type="password"
						className="form-input"
						placeholder="Confirm your password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						disabled={loading}
						minLength="6"
					/>
				</div>
				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? "Creating Account..." : "Create Account"}
				</button>
				{error && <div className="form-error">{error}</div>}
			</form>
		</>
	);
};

export default SignUp;
