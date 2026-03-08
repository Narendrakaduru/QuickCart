import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { register, reset } from "../slices/authSlice";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isError) {
      console.error(message);
    }

    if (user) {
      navigate("/");
    }
  }, [user, isError, navigate, message]);

  // Handle successful registration message
  useEffect(() => {
    if (isSuccess) {
      // We stay on the page to show the success message
    }
  }, [isSuccess]);

  // Reset auth state only on unmount
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const isNoUser = isError && message?.toLowerCase().includes("already exists");

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
    } else {
      const userData = {
        name,
        email,
        password,
      };

      dispatch(register(userData));
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-8 md:p-10 shadow-2xl shadow-gray-200 rounded-[2.5rem] border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">
          Create Account
        </h1>
        <p className="text-gray-500 text-center mb-10 text-sm font-medium">
          Join QuickCart for a premium shopping experience
        </p>

        {isError && !isNoUser && (
          <div
            className="bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl relative mb-8 text-xs font-semibold flex items-center shadow-sm"
            role="alert"
          >
            <span className="block">{message}</span>
          </div>
        )}

        {isSuccess && (
          <div
            className="bg-green-50 border border-green-100 text-green-600 px-5 py-3 rounded-2xl relative mb-8 text-xs font-semibold flex items-center shadow-sm"
            role="alert"
          >
            <span className="block">
              Registration successful!{" "}
              <strong>
                Please check your Email for the verification link.
              </strong>
            </span>
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                placeholder="John Doe"
                onChange={onChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                placeholder="name@example.com"
                onChange={onChange}
                className={`w-full px-5 py-3 bg-gray-50 border ${isNoUser ? "border-red-500" : "border-gray-100"} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium`}
                required
              />
              {isNoUser && (
                <p className="text-red-500 text-[10px] mt-1 uppercase font-bold tracking-tight pl-1">
                  {message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1"
                htmlFor="password"
              >
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={onChange}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium pr-14"
                  required
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
              <label
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="••••••••"
                  onChange={onChange}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all text-sm font-medium pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] mt-6"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
