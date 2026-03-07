import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login, reset } from "../slices/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  console.log("Auth State:", { isLoading, isError, message });

  useEffect(() => {
    if (isError) {
      console.log("Login Error Message Detected:", message);
    }

    if (isSuccess || user) {
      navigate("/");
    }
  }, [user, isError, isSuccess, message, navigate]);

  // Reset auth state only on unmount
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const isNoUser =
    isError && message?.toLowerCase().includes("no user registered");
  const isWrongPass = isError && message?.toLowerCase().includes("password");

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-8 shadow-md rounded-sm">
        <h1 className="text-2xl font-bold text-center mb-6">
          Login to QuickCart
        </h1>

        {isError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4 text-sm"
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={onChange}
              className={`w-full px-4 py-2 border ${isNoUser ? "border-red-500" : "border-gray-300"} rounded-sm focus:outline-none focus:border-blue-500`}
              required
            />
            {isNoUser && (
              <p className="text-red-500 text-xs mt-1 lowercase font-medium">
                {message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={onChange}
                className={`w-full px-4 py-2 border ${isWrongPass ? "border-red-500" : "border-gray-300"} rounded-sm focus:outline-none focus:border-blue-500 pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isWrongPass && (
              <p className="text-red-500 text-xs mt-1 lowercase font-medium">
                {message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#fb641b] hover:bg-[#f35910] text-white font-bold py-2 px-4 rounded-sm transition uppercase tracking-wide disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            New to QuickCart?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
