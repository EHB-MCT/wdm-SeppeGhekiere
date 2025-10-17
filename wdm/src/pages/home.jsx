function Home({ navigateTo }) {
	return (
		<div>
			<h1>Welcome to the Personality Quiz</h1>
			<p>Find your personality with random questions!</p>
			<button className="btn" onClick={() => navigateTo('quiz')}>Start Quiz</button>
		</div>
	);
}
export default Home;
