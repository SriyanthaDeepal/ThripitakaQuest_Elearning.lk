import React, { useState } from 'react';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';

export default function NewPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState(null);

  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handlePasswordReset = () => {
    if (newPassword !== confirmPassword) {
      setResetStatus({
        success: false,
        message: 'Passwords do not match.',
      });
      return;
    }

    // Extract oobCode from the URL parameters
    const searchParams = new URLSearchParams(location.search);
    const oobCode = searchParams.get('oobCode');

    if (!oobCode) {
      setResetStatus({
        success: false,
        message: 'Invalid reset link. Please request a new one.',
      });
      return;
    }

    // Use oobCode and newPassword to reset the password
    confirmPasswordReset(auth, oobCode, newPassword)
      .then(() => {
        setResetStatus({
          success: true,
          message: 'Password reset successful. You can now log in with your new password.',
        });
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-action-code') {
          setResetStatus({
            success: false,
            message: 'Link to reset your password has expired or has already been used.',
          });
        } else {
          setResetStatus({
            success: false,
            message: `Error resetting password: ${error.message}`,
          });
        }
      });
  };

  return (
    <div>
      <h2>New Password</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button type="button" onClick={handlePasswordReset}>
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
