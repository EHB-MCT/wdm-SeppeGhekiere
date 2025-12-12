import { useEffect, useState } from "react";
import quizData from "../quizData.json";
function Home({ navigateTo }) {
	const [quizzes, setQuizzes] = useState([]);

	useEffect(() => {
		setQuizzes(quizData.quizzes);
	}, []);

	return (
		<div className="page-container">
			<div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
				<h1
					style={{
						fontSize: "3.5rem",
						background: "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
						marginBottom: "1rem",
					}}
				>
					🧠 Discover Yourself
				</h1>

				<p
					style={{
						fontSize: "1.25rem",
						color: "var(--text-secondary)",
						marginBottom: "2rem",
						lineHeight: "1.6",
					}}
				>
					Embark on a journey of self-discovery with our scientifically-inspired personality quizzes. Answer thought-provoking questions and uncover insights about your unique personality traits.
				</p>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
						gap: "2rem",
						marginBottom: "3rem",
					}}
				>
					{quizzes.map((quiz) => (
						<div
							key={quiz.id}
							style={{
								padding: "1.5rem",
								background: "var(--bg-glass)",
								borderRadius: "var(--border-radius)",
								border: "1px solid var(--border-color)",
								textAlign: "center",
								cursor: "pointer",
								transition: "transform 0.2s",
							}}
							onClick={() => navigateTo(`quiz/${quiz.id}`)}
							onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
							onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
						>
							<h3 style={{ marginBottom: "0.5rem" }}>{quiz.title}</h3>
						</div>
					))}
				</div>

				<p
					style={{
						color: "var(--text-muted)",
						fontSize: "0.875rem",
					}}
				>
					Already have an account?
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							navigateTo("login");
						}}
						style={{
							color: "var(--primary-color)",
							textDecoration: "none",
							marginLeft: "0.5rem",
						}}
					>
						Sign in here
					</a>
				</p>
			</div>
		</div>
	);
}
export default Home;
