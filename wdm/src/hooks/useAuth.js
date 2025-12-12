import { useState, useEffect } from "react";

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

		useEffect(() => {
		const token = localStorage.getItem("authToken");
		if (token) {
			// Optionally verify token with backend
			setIsAuthenticated(true);
			setUser({ 
				email: localStorage.getItem("userEmail"),
				token: token
			});
		}
		setLoading(false);
	}, []);

	const signup = async (email, password) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json();
			if (response.ok) {
				return { success: true };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: "Network error" };
		}
	};

	const login = async (email, password) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json();
			if (response.ok) {
				localStorage.setItem("authToken", data.token);
				localStorage.setItem("userEmail", email);
				setIsAuthenticated(true);
				setUser({ 
					email,
					token: data.token
				});
				return { success: true };
			} else {
				return { success: false, error: data.error };
			}
		} catch (error) {
			return { success: false, error: "Network error" };
		}
	};

	const logout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("userEmail");
		setIsAuthenticated(false);
		setUser(null);
	};

	return { isAuthenticated, user, loading, signup, login, logout };
};
