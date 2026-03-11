import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'No verification token found.');

  useEffect(() => {
    if (!token) return;


    axios
      .get(`/api/v1/auth/verifyemail/${token}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified. You can now log in.');
        } else {
          setStatus('error');
          setMessage(res.data?.error || 'Verification failed.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.error ||
            'The verification link is invalid or has expired.'
        );
      });
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-8 md:p-10 shadow-2xl shadow-gray-200 rounded-[2.5rem] border border-gray-100 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Verifying your email...
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Please wait while we confirm your email address.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Email Verified!
            </h1>
            <p className="text-gray-500 text-sm font-medium">{message}</p>
            <Link
              to="/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs mt-4"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="w-16 h-16 text-red-500" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Verification Failed
            </h1>
            <p className="text-gray-500 text-sm font-medium">{message}</p>
            <Link
              to="/register"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 px-6 rounded-xl transition-all uppercase tracking-widest text-xs mt-4"
            >
              Back to Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
