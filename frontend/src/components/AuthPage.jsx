import React from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await axios.post('http://localhost:5001/api/Auth/google-login', {
                token: credentialResponse.credential,
            });
            console.log(response.data);  // Log successful response
        } catch (error) {
            // Log error response more explicitly
            if (error.response) {
                // If the error has a response object, log its status and data
                console.error('Error response:', error.response.status);
                console.error('Error data:', error.response.data);
            } else if (error.request) {
                // If the request was made but no response received
                console.error('Error request:', error.request);
            } else {
                // If something else caused the error
                console.error('Error message:', error.message);
            }
        }
    };
    

    return (
        <div>
            <h2>Login with Google</h2>
            <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log('Login Failed')}
            />
        </div>
    );
};

export default AuthPage;
