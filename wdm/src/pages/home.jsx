import { useEffect, useState } from "react";
import quizData1 from "../quizData.json";
import quizData2 from "../quizData2.json";
import quizData3 from "../quizData3.json";
import quizData4 from "../quizData4.json";

function Home({ navigateTo }) {
	const [allQuizzes, setAllQuizzes] = useState([]);
	const [featuredQuizzes, setFeaturedQuizzes] = useState([]);

	useEffect(() => {
		const combinedQuizzes = [
			...quizData1.quizzes,
			...quizData2.quizzes,
			...quizData3.quizzes,
			...quizData4.quizzes
		];
		setAllQuizzes(combinedQuizzes);
		
		// Get 4 random quizzes
		const shuffled = [...combinedQuizzes].sort(() => 0.5 - Math.random());
		setFeaturedQuizzes(shuffled.slice(0, 4));
	}, []);

	return (
		<div className="page-container">
			<div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
				<h1 style={{
					fontSize: '3.5rem',
					background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text',
					marginBottom: '1rem'
				}}>
					🧠 Discover Your Personality
				</h1>

				<p style={{
					fontSize: '1.25rem',
					color: 'var(--text-secondary)',
					marginBottom: '2rem',
					lineHeight: '1.6'
				}}>
					Embark on a journey of self-discovery with our scientifically-inspired personality quiz.
					Answer thought-provoking questions and uncover insights about your unique personality traits.
				</p>

				<div className="quiz-grid">
					{featuredQuizzes.map((quiz) => (
						<div key={quiz.id} className="quiz-card" onClick={() => navigateTo(`quiz/${quiz.id}`)}>
							<span className="quiz-emoji">{getQuizEmoji(quiz.id)}</span>
							<h3 className="quiz-title">{quiz.title}</h3>
							<p className="quiz-meta">{quiz.questions.length} questions</p>
							<span className="quiz-start-btn">Start Quiz</span>
						</div>
					))}
				</div>

				<div style={{ textAlign: 'center', marginTop: '2rem' }}>
					<button
						className="btn btn-secondary"
						onClick={() => navigateTo('all-quizzes')}
						style={{
							fontSize: '1rem',
							padding: '0.75rem 1.5rem',
							minHeight: '48px'
						}}
					>
						📋 View All {allQuizzes.length} Quizzes
					</button>
				</div>



				<p style={{
					color: 'var(--text-muted)',
					fontSize: '0.875rem'
				}}>
					Already have an account?
					<a
						href="#"
						onClick={(e) => { e.preventDefault(); navigateTo('login'); }}
						style={{
							color: 'var(--primary-color)',
							textDecoration: 'none',
							marginLeft: '0.5rem'
						}}
					>
						Sign in here
					</a>
				</p>
			</div>
		</div>
	);
}

// Helper function to get emoji for each quiz type
function getQuizEmoji(quizId) {
	const emojiMap = {
		'personality-test': '🧠',
		'social-media-savvy': '📱',
		'introvert-extrovert': '👥',
		'learning-style': '📚',
		'communication-style': '💬',
		'work-style': '💼',
		'stress-management': '🧘',
		'decision-making': '⚖️',
		'creativity-style': '🎨',
		'leadership-style': '👑',
		'time-management': '⏰',
		'conflict-resolution': '🤝'
	};
	return emojiMap[quizId] || '📋';
}

export default Home;
