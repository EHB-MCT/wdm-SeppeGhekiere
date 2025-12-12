import { useState, useEffect } from "react";

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		
		if (token && userData) {
			try {
				const parsedUser = JSON.parse(userData);
				const userWithToken = { ...parsedUser, token };
				setUser(userWithToken);
				setIsAuthenticated(true);
			} catch (error) {
				console.error('Error parsing user data:', error);
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
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

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Login failed');
		}

		const data = await response.json();
		
		const userWithToken = { ...data.user, token: data.token };
		setUser(userWithToken);
		setIsAuthenticated(true);
		localStorage.setItem('token', data.token);
		localStorage.setItem('user', JSON.stringify(userWithToken));
			
			return { success: true };
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

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Signup failed');
		}

		const data = await response.json();
		
		const userWithToken = { ...data.user, token: data.token };
		setUser(userWithToken);
		setIsAuthenticated(true);
		localStorage.setItem('token', data.token);
		localStorage.setItem('user', JSON.stringify(userWithToken));
			
			return { success: true };
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
