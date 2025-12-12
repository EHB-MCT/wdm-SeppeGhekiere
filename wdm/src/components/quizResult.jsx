import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";

function QuizResult({ userAnswers, quiz }) {
	const { user } = useAuth();
	const [dominantTrait, setDominantTrait] = useState(null);
	const [scores, setScores] = useState({});
	const [loading, setLoading] = useState(false);
	const [resultSubmitted, setResultSubmitted] = useState(false);

	// Calculate personality scores from user answers
	useEffect(() => {
		if (!quiz || !userAnswers.length) return;

		const traitScores = {};
		
		userAnswers.forEach((answer, questionIndex) => {
			if (quiz.questions[questionIndex] && quiz.questions[questionIndex].weights) {
				const weights = quiz.questions[questionIndex].weights[answer];
				if (weights) {
					Object.entries(weights).forEach(([trait, score]) => {
						traitScores[trait] = (traitScores[trait] || 0) + score;
					});
				}
			}
		});

		setScores(traitScores);
		
		// Find dominant trait
		const dominant = Object.entries(traitScores).reduce((a, b) => 
			traitScores[a[0]] > traitScores[b[0]] ? a : b
		)[0];
		setDominantTrait(dominant);
	}, [quiz, userAnswers]);

	const submitResults = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submit-result-with-email`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					quizId: quiz.id,
					dominantTrait: dominantTrait,
					personality: scores,
				}),
			});

			if (response.ok) {
				setResultSubmitted(true);
			} else {
				throw new Error("Failed to submit results");
			}
		} catch (error) {
			console.error("Error submitting results:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="result-card">
			{!dominantTrait ? (
				<div className="loader"></div>
			) : !resultSubmitted ? (
				<>
					<h2>🎯 Quiz Complete!</h2>
					<p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
						You've answered all questions. Save your results to discover your personality type!
					</p>
					
					<div style={{
						background: 'var(--bg-glass)',
						borderRadius: 'var(--border-radius)',
						padding: '1.5rem',
						marginBottom: '2rem',
						border: '1px solid var(--border-color)'
					}}>
						<h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📊 Your Results</h3>
						<div style={{ marginBottom: '1rem' }}>
							<div className="dominant-trait" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
								{dominantTrait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
							</div>
							<p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
								Dominant Personality Trait
							</p>
						</div>
						
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
							{Object.entries(scores).map(([trait, score]) => (
								<div key={trait} style={{
									background: 'var(--bg-secondary)',
									padding: '0.5rem',
									borderRadius: '8px',
									textAlign: 'center'
								}}>
									<div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
										{trait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
									</div>
									<div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
										{score}
									</div>
								</div>
							))}
						</div>
					</div>

					<button
						className="btn btn-primary"
						onClick={submitResults}
						disabled={loading}
						style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
					>
						{loading ? "💾 Saving..." : "💾 Save Results to Profile"}
					</button>
				</>
			) : (
				<>
					<h2>✨ Your Personality Type</h2>
					<div className="dominant-trait">
						{dominantTrait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
					</div>
					<p className="trait-description">
						Based on your answers, this is your dominant personality trait.
						Each trait represents different ways of thinking and approaching life.
					</p>
					
					<div style={{
						background: 'var(--bg-glass)',
						borderRadius: 'var(--border-radius)',
						padding: '1.5rem',
						margin: '2rem 0',
						border: '1px solid var(--border-color)'
					}}>
						<h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📊 Detailed Breakdown</h3>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
							{Object.entries(scores).map(([trait, score]) => (
								<div key={trait} style={{
									background: 'var(--bg-secondary)',
									padding: '0.5rem',
									borderRadius: '8px',
									textAlign: 'center'
								}}>
									<div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
										{trait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
									</div>
									<div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
										{score}
									</div>
								</div>
							))}
						</div>
					</div>

					<div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
						<button
							className="btn btn-secondary"
							onClick={() => window.location.href = '/all-quizzes'}
							style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
						>
							📋 Try More Quizzes
						</button>
						<button
							className="btn btn-secondary"
							onClick={() => window.location.reload()}
							style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
						>
							🔄 Retake Quiz
						</button>
					</div>
				</>
			)}
		</div>
	);
}

export default QuizResult;
