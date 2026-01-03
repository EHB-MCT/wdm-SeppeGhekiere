import { useEffect, useState } from "react";
import quizData1 from "../quizData.json";
import quizData2 from "../quizData2.json";
import quizData3 from "../quizData3.json";
import quizData4 from "../quizData4.json";

function AllQuizzes({ navigateTo }) {
	const [allQuizzes, setAllQuizzes] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState('all');

	useEffect(() => {
		const combinedQuizzes = [
			...quizData1.quizzes,
			...quizData2.quizzes,
			...quizData3.quizzes,
			...quizData4.quizzes
		];
		setAllQuizzes(combinedQuizzes);
	}, []);

	const categories = [
		{ id: 'all', name: 'All Quizzes', emoji: '📋' },
		{ id: 'personality', name: 'Personality Tests', emoji: '🧠' },
		{ id: 'learning', name: 'Learning & Work Style', emoji: '📚' },
		{ id: 'development', name: 'Personal Development', emoji: '🌱' },
		{ id: 'professional', name: 'Professional Skills', emoji: '💼' }
	];

	const getQuizCategory = (quizId) => {
		if (['personality-test', 'social-media-savvy', 'introvert-extrovert'].includes(quizId)) return 'personality';
		if (['learning-style', 'communication-style', 'work-style'].includes(quizId)) return 'learning';
		if (['stress-management', 'decision-making', 'creativity-style'].includes(quizId)) return 'development';
		if (['leadership-style', 'time-management', 'conflict-resolution'].includes(quizId)) return 'professional';
		return 'personality';
	};

	const filteredQuizzes = selectedCategory === 'all' 
		? allQuizzes 
		: allQuizzes.filter(quiz => getQuizCategory(quiz.id) === selectedCategory);

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

	return (
		<div className="page-container">
			<div style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
				<h1 style={{
					fontSize: '3rem',
					background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text',
					marginBottom: '1rem'
				}}>
					📋 All Personality Quizzes
				</h1>

				<p style={{
					fontSize: '1.25rem',
					color: 'var(--text-secondary)',
					marginBottom: '3rem',
					lineHeight: '1.6'
				}}>
					Explore our complete collection of personality assessments and discover different aspects of yourself
				</p>

				{/* Category Filter */}
				<div style={{
					display: 'flex',
					justifyContent: 'center',
					flexWrap: 'wrap',
					gap: '1rem',
					marginBottom: '3rem'
				}}>
					{categories.map((category) => (
						<button
							key={category.id}
							className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'}`}
							onClick={() => setSelectedCategory(category.id)}
							style={{
								fontSize: '0.875rem',
								padding: '0.5rem 1rem',
								minHeight: '40px'
							}}
						>
							{category.emoji} {category.name}
						</button>
					))}
				</div>

				{/* Quiz Grid */}
				<div className="quiz-grid">
					{filteredQuizzes.map((quiz) => (
						<div key={quiz.id} className="quiz-card" onClick={() => navigateTo(`quiz/${quiz.id}`)}>
							<span className="quiz-emoji">{getQuizEmoji(quiz.id)}</span>
							<h3 className="quiz-title">{quiz.title}</h3>
							<p className="quiz-meta">{quiz.questions.length} questions</p>
							<span className="quiz-start-btn">Start Quiz</span>
						</div>
					))}
				</div>

				{filteredQuizzes.length === 0 && (
					<div style={{
						textAlign: 'center',
						padding: '3rem',
						color: 'var(--text-secondary)'
					}}>
						<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
						<h3>No quizzes found in this category</h3>
						<p>Try selecting a different category</p>
					</div>
				)}

				{/* Stats */}
				<div style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
					gap: '2rem',
					marginTop: '4rem',
					padding: '2rem',
					background: 'var(--bg-glass)',
					borderRadius: 'var(--border-radius)',
					border: '1px solid var(--border-color)'
				}}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
						<h4 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>{allQuizzes.length}</h4>
						<p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Quizzes</p>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❓</div>
						<h4 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>
							{allQuizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)}
						</h4>
						<p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Questions</p>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</div>
						<h4 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>{categories.length - 1}</h4>
						<p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Categories</p>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
						<h4 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>Free</h4>
						<p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Always Free</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AllQuizzes;