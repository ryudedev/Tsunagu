'use client';
import { signInWithRedirect } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthComponent() {
  const {user, isLoading, signOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome!</h2>
          <p>User ID: {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <h2>Please sign in</h2>
          <button onClick={handleSignIn}>Sign In with Google</button>
        </div>
      )}
    </div>
  );
}