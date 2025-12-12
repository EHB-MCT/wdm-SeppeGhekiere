import { useState, useEffect } from 'react';

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
				setUser(parsedUser);
				setIsAuthenticated(true);
			} catch (error) {
				console.error('Error parsing user data:', error);
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
		}
		
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Login failed');
		}

			const data = await response.json();
			
			setUser(data.user);
			setIsAuthenticated(true);
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			
			return { success: true };
		} catch (error) {
			console.error('Login error:', error);
			return { success: false, error: error.message };
		}
	};

	const signup = async (email, password) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Signup failed');
		}

			const data = await response.json();
			
			setUser(data.user);
			setIsAuthenticated(true);
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			
			return { success: true };
		} catch (error) {
			console.error('Signup error:', error);
			return { success: false, error: error.message };
		}
	};

	const logout = () => {
		setUser(null);
		setIsAuthenticated(false);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	};

	return {
		isAuthenticated,
		user,
		loading,
		login,
		signup,
		logout
	};
};