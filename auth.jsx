import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // Flag to prevent multiple refresh requests

  useEffect(() => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }, [accessToken, refreshToken]);

  // Axios interceptor for handling 403 errors and refreshing tokens
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Pass through successful responses
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403 && !originalRequest._retry && !isRefreshing) {
          originalRequest._retry = true; // Prevent infinite retry loops
          setIsRefreshing(true);
          try {
            const refreshResponse = await axios.post('http://localhost:3000/token', { refreshToken });
            setAccessToken(refreshResponse.data.accessToken);
            setRefreshToken(refreshResponse.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            return axios(originalRequest); // Retry the original request
          } catch (refreshErr) {
            setError('Refresh failed. Please login again');
            setAccessToken(null);
            setRefreshToken(null);
          } finally {
            setIsRefreshing(false);
          }
        }
        return Promise.reject(error); // Reject other errors
      }
    );

    return () => axios.interceptors.response.eject(interceptor); // Remove interceptor on unmount
  }, [refreshToken, isRefreshing]);

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      setAccessToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setError(null);
    } catch (err) {
      setError('Login failed');
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/protected', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      // Errors will be handled by the interceptor
      setError('Fetch data failed');
    }
  };

  return (
    <div>
      {accessToken ? (
        <>
          <button onClick={fetchData}>Fetch Data</button>
          {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      ) : (
        <>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;