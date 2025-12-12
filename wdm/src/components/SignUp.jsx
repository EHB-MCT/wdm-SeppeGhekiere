import { useState } from "react";

function SignUp({ onSignup }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		try {
			await onSignup(email, password);
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>Join Us!</h2>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<div className="form-group">
				<label className="form-label" htmlFor="email">
					Email Address
				</label>
				<input
					id="email"
					type="email"
					className="form-input"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
			</div>
			<div className="form-group">
				<label className="form-label" htmlFor="password">
					Password
				</label>
				<input
					id="password"
					type="password"
					className="form-input"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
			</div>
			<button type="submit" className="btn btn-primary">
				Sign Up
			</button>
		</form>
	);
}

export default SignUp;