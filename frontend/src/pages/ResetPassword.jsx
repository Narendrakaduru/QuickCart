import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { resetPassword, reset as resetAuth } from '../slices/authSlice';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const showModal = isSuccess && submitted;

  useEffect(() => {
    return () => {
      dispatch(resetAuth());
    };
  }, [dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setSubmitted(true);
    dispatch(resetPassword({ token, password }));
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center">
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full mx-4 text-center relative animate-scaleIn">
            <div className="flex justify-center mb-5">
              <div className="bg-green-50 p-5 rounded-full">
                <ShieldCheck className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Password Changed!</h2>
            <p className="text-gray-500 text-sm font-medium mb-8">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-md p-8 md:p-10 shadow-2xl shadow-gray-200 rounded-[2.5rem] border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">
          Reset Password
        </h1>
        <p className="text-gray-500 text-center mb-10 text-sm font-medium">
          Enter your new password below.
        </p>

        {isError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl relative mb-8 text-xs font-semibold flex items-center shadow-sm">
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium pr-14"
                required
                disabled={isLoading || (isSuccess && submitted)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium"
              required
              disabled={isLoading || (isSuccess && submitted)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (isSuccess && submitted)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link
            to="/login"
            className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
