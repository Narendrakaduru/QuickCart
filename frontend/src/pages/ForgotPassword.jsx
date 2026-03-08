import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MailCheck, X } from 'lucide-react';
import { forgotPassword, reset as resetAuth } from '../slices/authSlice';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    dispatch(forgotPassword(email));
  };

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center">
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full mx-4 text-center relative animate-scaleIn">
            <button
              onClick={() => setSubmitted(false)}
              className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex justify-center mb-5">
              <div className="bg-blue-50 p-5 rounded-full">
                <MailCheck className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Check Your Email</h2>
            <p className="text-gray-500 text-sm font-medium mb-8">
              A password reset link has been sent to{' '}
              <span className="font-bold text-slate-700">{email}</span>.
              Please check your inbox (and spam folder).
            </p>
            <Link
              to="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-md p-8 md:p-10 shadow-2xl shadow-gray-200 rounded-[2.5rem] border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-center mb-10 text-sm font-medium">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {isError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl relative mb-8 text-xs font-semibold flex items-center shadow-sm">
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
