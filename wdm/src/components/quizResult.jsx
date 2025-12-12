import { useEffect, useState } from "react";

function QuizResult({ userAnswers }) {
	const [dominantTrait, setDominantTrait] = useState(null);
	const [email, setEmail] = useState("");
	const [emailSubmitted, setEmailSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmitEmail = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			if (!token) {
				alert("Please log in to submit your quiz results");
				return;
			}

			const response = await fetch("/api/submit-result-with-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({ answers: userAnswers, email }),
			});

			if (response.status === 401) {
				alert("Your session has expired. Please log in again.");
				return;
			}

			const data = await response.json();
			setDominantTrait(data.dominantTrait);
			setEmailSubmitted(true);
		} catch (error) {
			console.error("Error submitting email and results:", error);
			alert("Failed to submit results. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="result-card">
			{!emailSubmitted ? (
				<>
					<h2>🎯 Quiz Complete!</h2>
					<p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
						You've answered all questions. Enter your email to discover your personality type!
					</p>
					<div style={{ maxWidth: '400px', margin: '0 auto' }}>
						<div className="form-group">
							<label className="form-label" htmlFor="result-email">Email Address</label>
							<input
								id="result-email"
								type="email"
								className="form-input"
								placeholder="Enter your email to see results"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
							/>
						</div>
						<button
							className="btn btn-primary"
							onClick={handleSubmitEmail}
							disabled={loading || !email}
							style={{ width: '100%' }}
						>
							{loading ? "🔄 Analyzing..." : "🎭 Reveal My Personality"}
						</button>
					</div>
				</>
			) : dominantTrait ? (
				<>
					<h2>✨ Your Personality Type</h2>
					<div className="dominant-trait">{dominantTrait}</div>
					<p className="trait-description">
						Based on your answers, this is your dominant personality trait.
						Each trait represents different ways of thinking and approaching life.
					</p>
					<div style={{ marginTop: '2rem' }}>
						<button
							className="btn btn-secondary"
							onClick={() => window.location.reload()}
						>
							🔄 Take Quiz Again
						</button>
					</div>
				</>
			) : (
				<div className="loader"></div>
			)}
		</div>
	);
}

export default QuizResult;
