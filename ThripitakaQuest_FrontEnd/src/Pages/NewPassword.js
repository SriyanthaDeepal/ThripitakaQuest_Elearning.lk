import React, { useState, useEffect } from 'react';
import { getAuth, confirmPasswordReset, isSignInWithEmailLink } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom'; // Change useHistory to useNavigate
import { Link } from 'react-router-dom'; // Add this import

export default function PasswordReset() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState(null);

  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const oobCode = searchParams.get('oobCode'); // oobCode is the token in the reset link

  useEffect(() => {
    // Check if the oobCode is valid and if the password reset is already completed
    if (!oobCode || !isSignInWithEmailLink(auth, window.location.href)) {
      // Redirect to an error page or handle accordingly
      navigate('/error'); // Use navigate instead of history.push
    }
  }, [auth, oobCode, navigate]);

  const handlePasswordReset = () => {
    confirmPasswordReset(auth, oobCode, newPassword)
      .then(() => {
        setResetStatus({
            success: true,
            message: (
              <>
                Password reset successful. You can now{' '}
                <Link to={`/NewPassword/${oobCode}`}>click here</Link> to set your new password.
              </>
            ),
          });
      })
      .catch((error) => {
        setResetStatus({
          success: false,
          message: `Error resetting password: ${error.message}`,
        });
      });
  };

  return (
    <div>
      <h2>Password Reset</h2>
      <form>
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
