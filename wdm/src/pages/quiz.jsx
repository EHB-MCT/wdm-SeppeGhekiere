import React, { useState, useEffect } from "react";
import quizData from "../quizData.json";
import QuizChoices from "../components/quizChoices";
import QuizResult from "../components/quizResult";

function Quiz({ page }) {
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [userAnswers, setUserAnswers] = useState([]);
	const [quizFinished, setQuizFinished] = useState(false);
	const [quiz, setQuiz] = useState(null);

	useEffect(() => {
		const quizId = page.split("/")[1];
		const selectedQuiz = quizData.quizzes.find((q) => q.id === quizId);
		setQuiz(selectedQuiz);
	}, [page]);

	const handleSelect = (choice) => {
		setUserAnswers([...userAnswers, choice]);
		const nextQuestion = currentQuestion + 1;
		if (nextQuestion < quiz.questions.length) {
			setCurrentQuestion(nextQuestion);
		} else {
			setQuizFinished(true);
		}
	};

	if (!quiz) {
		return <div>Loading quiz...</div>;
	}

	const progress = ((currentQuestion + (quizFinished ? 1 : 0)) / quiz.questions.length) * 100;

	return (
		<div className="quiz-container">
			{!quizFinished && (
				<div className="page-container">
					<div style={{ marginBottom: "2rem" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
							<h3>{quiz.title}</h3>
							<span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
								Question {currentQuestion + 1} of {quiz.questions.length}
							</span>
						</div>
						<div
							style={{
								width: "100%",
								height: "8px",
								background: "var(--bg-secondary)",
								borderRadius: "4px",
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: `${progress}%`,
									height: "100%",
									background: "linear-gradient(90deg, var(--primary-color), var(--accent-color))",
									borderRadius: "4px",
									transition: "width 0.3s ease",
								}}
							></div>
						</div>
					</div>
				</div>
			)}

			{quizFinished ? (
				<QuizResult userAnswers={userAnswers} quiz={quiz} />
			) : (
				<div className="question-card">
					<h2 className="question-text">{quiz.questions[currentQuestion].question}</h2>
					<QuizChoices choices={quiz.questions[currentQuestion].choices} onSelect={handleSelect} />
				</div>
			)}
		</div>
	);
}

export default Quiz;
