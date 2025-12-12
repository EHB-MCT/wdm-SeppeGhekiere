import React, { useState, useEffect } from "react";
import quizData1 from "../quizData.json";
import quizData2 from "../quizData2.json";
import quizData3 from "../quizData3.json";
import quizData4 from "../quizData4.json";
import QuizChoices from "../components/quizChoices";
import QuizResult from "../components/quizResult";

function Quiz({ page, isAuthenticated, navigateTo }) {
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [userAnswers, setUserAnswers] = useState([]);
	const [quizFinished, setQuizFinished] = useState(false);
	const [quiz, setQuiz] = useState(null);

	useEffect(() => {
		const quizId = page.split("/")[1];
		const allQuizzes = [
			...quizData1.quizzes,
			...quizData2.quizzes,
			...quizData3.quizzes,
			...quizData4.quizzes
		];
		const selectedQuiz = allQuizzes.find((q) => q.id === quizId);
		setQuiz(selectedQuiz);
	}, [page]);

	const progress = quiz ? ((currentQuestion + (quizFinished ? 1 : 0)) / quiz.questions.length) * 100 : 0;

	const handleSelect = (choice) => {
		const newAnswers = [...userAnswers, choice];
		setUserAnswers(newAnswers);

		if (currentQuestion < quiz.questions.length - 1) {
			setCurrentQuestion(currentQuestion + 1);
		} else {
			setQuizFinished(true);
		}
	};

	if (!quiz) {
		return (
			<div className="quiz-container">
				<div className="page-container">
					<div style={{ textAlign: 'center' }}>
						<div className="loader"></div>
						<p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
							Loading quiz...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="quiz-container">
			{!quizFinished && (
				<div className="page-container">
					<div style={{ marginBottom: '2rem' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
							<h3>{quiz.title}</h3>
							<span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
								Question {currentQuestion + 1} of {quiz.questions.length}
							</span>
						</div>
						<div style={{
							width: '100%',
							height: '8px',
							background: 'var(--bg-secondary)',
							borderRadius: '4px',
							overflow: 'hidden'
						}}>
							<div style={{
								width: `${progress}%`,
								height: '100%',
								background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
								borderRadius: '4px',
								transition: 'width 0.3s ease'
							}}></div>
						</div>
					</div>
				</div>
			)}

			{quizFinished ? (
				isAuthenticated ? (
					<QuizResult userAnswers={userAnswers} quiz={quiz} />
				) : (
					<div className="result-card">
						<h2>🎉 Quiz Completed!</h2>
						<p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
							Great job! You've completed the quiz. Sign in to see your personalized results and discover insights about your personality.
						</p>
						
						<div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
							<button
								className="btn btn-primary"
								onClick={() => navigateTo('login')}
								style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
							>
								🔐 Sign In to See Results
							</button>
							<button
								className="btn btn-secondary"
								onClick={() => {
									setQuizFinished(false);
									setCurrentQuestion(0);
									setUserAnswers([]);
								}}
								style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
							>
								🔄 Retake Quiz
							</button>
						</div>
						
						<div style={{
							marginTop: '2rem',
							padding: '1.5rem',
							background: 'var(--bg-glass)',
							borderRadius: 'var(--border-radius)',
							border: '1px solid var(--border-color)'
						}}>
							<h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📊 Your Quiz Summary</h3>
							<p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
								<strong>Quiz:</strong> {quiz?.title}
							</p>
							<p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
								<strong>Questions Answered:</strong> {userAnswers.length}
							</p>
							<p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
								<strong>Completion Time:</strong> {new Date().toLocaleTimeString()}
							</p>
							<p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
								Create a free account to save your results, track your personality journey, and compare with friends!
							</p>
						</div>
					</div>
				)
			) : (
				<div className="question-card">
					<h2 className="question-text">{quiz.questions[currentQuestion].question}</h2>
					<QuizChoices
						choices={quiz.questions[currentQuestion].choices}
						onSelect={handleSelect}
					/>
				</div>
			)}
		</div>
	);
}

export default Quiz;
