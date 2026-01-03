import { useState } from "react";
import "./App.css";
import Home from "./pages/home.jsx";
import Quiz from "./pages/quiz.jsx";
import AllQuizzes from "./pages/allQuizzes.jsx";
import LogIn from "./components/LogIn.jsx";
import SignUp from "./components/SignUp.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import { useAuth } from "./hooks/useAuth.js";

function App() {
	const [page, setPage] = useState("home");
	const { isAuthenticated, user, loading, signup, login, logout } = useAuth();

	const navigateTo = (page) => setPage(page);

	if (loading) {
		return (
			<div className="app">
				<div className="main-content">
					<div className="loader"></div>
				</div>
			</div>
		);
	}

	const renderPage = () => {
		if (page.startsWith("quiz/")) {
			return <Quiz page={page} isAuthenticated={isAuthenticated} navigateTo={navigateTo} />;
		}
		switch (page) {
			case "home":
				return <Home navigateTo={navigateTo} />;
			case "all-quizzes":
				return <AllQuizzes navigateTo={navigateTo} />;
			case "login":
				return (
					<div className="form-container">
						<div className="form-card">
							<LogIn onLogin={login} />
						</div>
					</div>
				);
			case "signup":
				return (
					<div className="form-container">
						<div className="form-card">
							<SignUp onSignup={signup} />
						</div>
					</div>
				);
			case "quiz":
				return isAuthenticated ? <Quiz /> : (
					<div className="page-container">
						<h2>Access Required</h2>
						<p>Please sign in to take personality quiz.</p>
						<button className="btn btn-primary" onClick={() => navigateTo("login")}>
							Sign In
						</button>
					</div>
				);
			case "admin":
				return (isAuthenticated && user?.email?.includes('admin')) ? (
					<AdminDashboard token={user.token} />
				) : (
					<div className="page-container">
						<h2>Admin Access Required</h2>
						<p>You need administrator privileges to access this page.</p>
					</div>
				);
			default:
				return <Home navigateTo={navigateTo} />;
		}
	};

	return (
		<div className="app">
			<nav className="navbar">
				<div className="navbar-container">
					<a href="#" className="navbar-brand" onClick={(e) => { e.preventDefault(); navigateTo("home"); }}>
						🧠 Personality Quiz
					</a>

					<div className="navbar-nav">
						<a
							href="#"
							className={`nav-link ${page === "home" ? "active" : ""}`}
							onClick={(e) => { e.preventDefault(); navigateTo("home"); }}
						>
							Home
						</a>
						<a
							href="#"
							className={`nav-link ${page === "all-quizzes" ? "active" : ""}`}
							onClick={(e) => { e.preventDefault(); navigateTo("all-quizzes"); }}
						>
							All Quizzes
						</a>

						{isAuthenticated ? (
							<>
								<a
									href="#"
									className={`nav-link ${page === "quiz" ? "active" : ""}`}
									onClick={(e) => { e.preventDefault(); navigateTo("quiz"); }}
								>
									Quiz
								</a>
								{user?.email?.includes('admin') && (
									<a
										href="#"
										className={`nav-link ${page === "admin" ? "active" : ""}`}
										onClick={(e) => { e.preventDefault(); navigateTo("admin"); }}
									>
										Admin
									</a>
								)}
								<div className="user-info">
									<span className="user-email">{user?.email}</span>
									<button className="btn-logout" onClick={logout}>
										Sign Out
									</button>
								</div>
							</>
						) : (
							<>
								<a
									href="#"
									className={`nav-link ${page === "login" ? "active" : ""}`}
									onClick={(e) => { e.preventDefault(); navigateTo("login"); }}
								>
									Login
								</a>
								<a
									href="#"
									className={`nav-link ${page === "signup" ? "active" : ""}`}
									onClick={(e) => { e.preventDefault(); navigateTo("signup"); }}
								>
									Sign Up
									</a>
							</>
						)}
					</div>
				</div>
			</nav>

			<main className="main-content">
				{renderPage()}
			</main>
		</div>
	);
}

export default App;
