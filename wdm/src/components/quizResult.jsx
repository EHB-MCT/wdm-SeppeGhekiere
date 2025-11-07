import { useEffect, useState } from "react";

function QuizResult({ userAnswers }) {
	const [dominantTrait, setDominantTrait] = useState(null);
	const [email, setEmail] = useState("");
	const [emailSubmitted, setEmailSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmitEmail = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/submit-result-with-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ answers: userAnswers, email }),
			});
			const data = await response.json();
			setDominantTrait(data.dominantTrait);
			setEmailSubmitted(true);
		} catch (error) {
			console.error("Error submitting email and results:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2>Quiz Result</h2>
			{!emailSubmitted ? (
				<div>
					<h3>Enter your email to see your personality trait:</h3>
					<input type="email" placeholder="Your email" value={email} suggestion="email" onChange={(e) => setEmail(e.target.value)} style={{ padding: "0.5rem", margin: "1rem 0", width: "80%", maxWidth: "300px" }} />
					<button className="btn" onClick={handleSubmitEmail} disabled={loading || !email}>
						{loading ? "Submitting..." : "Show My Result"}
					</button>
				</div>
			) : dominantTrait ? (
				<div>
					<h3>Your dominant personality trait is:</h3>
					<h2 className="dominant-trait">{dominantTrait}</h2>
				</div>
			) : (
				<div className="loader"></div>
			)}
		</div>
	);
}

export default QuizResult;
