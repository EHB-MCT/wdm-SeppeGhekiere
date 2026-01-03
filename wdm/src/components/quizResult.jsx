import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";

function QuizResult({ userAnswers, quiz }) {
	useAuth();
	const [dominantTrait, setDominantTrait] = useState(null);
	const [scores, setScores] = useState({});
	const [loading, setLoading] = useState(false);
	const [resultSubmitted, setResultSubmitted] = useState(false);
	const [error, setError] = useState(null);

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

	const submitResults = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submit-quiz-result`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({ 
					answers: userAnswers.map((answer, index) => ({
						question: quiz.questions[index]?.question,
						selectedOption: answer
					})),
					quizType: "personality"
				}),
			});

			if (response.status === 401) {
				setError("Your session has expired. Please log in again.");
				return;
			}

			const data = await response.json();
			setDominantTrait(data.profile?.dominantTrait || dominantTrait);
			setResultSubmitted(true);
		} catch (error) {
			console.error("Error submitting quiz results:", error);
			setError("Failed to get results. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [userAnswers, quiz, dominantTrait]);

	useEffect(() => {
		submitResults();
	}, [submitResults]);

 return (
		<div className="result-card">
			{loading ? (
				<>
					<h2>🎯 Quiz Complete!</h2>
					<p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
						Analyzing your answers...
					</p>
					<div className="loader"></div>
				</>
			) : error ? (
				<>
					<h2>❌ Error</h2>
					<p style={{ color: 'var(--error-color)', marginBottom: '2rem' }}>{error}</p>
					<div style={{ marginTop: '2rem' }}>
						<button
							className="btn btn-secondary"
							onClick={() => window.location.reload()}
						>
							🔄 Try Again
						</button>
					</div>
				</>
			) : (
				<>
					<h2>✨ Your Results</h2>
					<div className="dominant-trait">{dominantTrait}</div>
					<p className="trait-description">
						Based on your answers, this is your dominant trait.
						Each trait represents different ways of thinking and approaching life.
					</p>
					
					{resultSubmitted && (
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
					)}

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