import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [resetStatus, setResetStatus] = useState(null);

  const handleResetPassword = () => {
    const auth = getAuth();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setResetStatus({
          success: true,
          message: 'Password reset email sent successfully. Check your email.',
        });
      })
      .catch((error) => {
        setResetStatus({
          success: false,
          message: `Error sending password reset email: ${error.message}`,
        });
      });
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleResetPassword}>
          Reset Password
        </button>
      </form>
      {resetStatus && (
        <div className={resetStatus.success ? 'success-message' : 'error-message'}>
          {resetStatus.message}
        </div>
      )}
    </div>
  );
}
