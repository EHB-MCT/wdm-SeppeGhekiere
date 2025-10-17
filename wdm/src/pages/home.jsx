function Home({ navigateTo }) {
	return (
		<div>
			<h1>Welcome to the Random Knowledge Quiz</h1>
			<p>Test your knowledge with random questions!</p>
			<button onClick={() => navigateTo('quiz')}>Start Quiz</button>
		</div>
	);
}
export default Home;
