import { useState } from "react";
import "./quiz.css";

const Quizzes = ({ navigateTo }) => {
	const quizzes = [
		{
			id: "personality",
			title: "Personality Quiz",
			description: "Discover your unique personality traits and behavioral patterns",
			icon: "🧠",
			color: "#6366f1",
			page: "quiz"
		},
		{
			id: "intelligence",
			title: "Intelligence Types",
			description: "Explore your different types of intelligence and cognitive strengths",
			icon: "🎯",
			color: "#ec4899",
			page: "quiz2"
		},
		{
			id: "learning",
			title: "Learning Style",
			description: "Find out how you learn best and optimize your study methods",
			icon: "📚",
			color: "#06b6d4",
			page: "quiz3"
		},
		{
			id: "career",
			title: "Career Aptitude",
			description: "Discover which career paths align with your skills and interests",
			icon: "💼",
			color: "#10b981",
			page: "quiz4"
		}
	];

	return (
		<div className="quizzes-container">
			<div className="quizzes-header">
				<h1>Choose Your Quiz</h1>
				<p>Select a quiz to explore different aspects of yourself</p>
			</div>

			<div className="quizzes-grid">
				{quizzes.map((quiz) => (
					<div
						key={quiz.id}
						className="quiz-card"
						onClick={() => navigateTo(quiz.page)}
						style={{ borderColor: quiz.color + "40" }}
					>
						<div className="quiz-icon" style={{ color: quiz.color }}>
							{quiz.icon}
						</div>
						<h3 style={{ color: quiz.color }}>{quiz.title}</h3>
						<p>{quiz.description}</p>
						<button className="quiz-start-btn" style={{ background: quiz.color }}>
							Start Quiz →
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default Quizzes;