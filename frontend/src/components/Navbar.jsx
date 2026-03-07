import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  LogOut,
  ChevronDown,
  Package,
  ShieldCheck,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import { clearCart } from "../slices/cartSlice";
import { clearWishlist } from "../slices/wishlistSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearWishlist());
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const cartItemsCount =
    cart && cart.items
      ? cart.items.reduce((acc, item) => acc + item.quantity, 0)
      : 0;

  return (
    <header className="bg-blue-600 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between gap-4 md:gap-8 max-w-7xl">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black italic tracking-tighter flex items-center shrink-0"
        >
          Quick
          <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
            Cart
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 relative max-w-2xl group"
        >
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="w-full py-2.5 px-6 pr-12 rounded-lg text-gray-800 bg-white border-2 border-transparent focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 shadow-sm placeholder:text-gray-400 text-sm font-medium transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-5 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Search size={18} className="stroke-[3]" />
          </button>
        </form>

        {/* User Actions */}
        <div className="flex items-center space-x-4 md:space-x-8">
          {user ? (
            <div className="relative flex items-center h-full" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="cursor-pointer flex items-center hover:text-yellow-400 transition-colors font-bold py-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/50 border border-white/20 flex items-center justify-center mr-2 shadow-inner">
                  <User size={18} />
                </div>
                <span className="hidden lg:inline text-sm tracking-tight">
                  {user.name}
                </span>
                <ChevronDown
                  size={14}
                  className={`ml-1.5 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""} opacity-70`}
                />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full right-0 w-64 pt-3 ${showProfileMenu ? "block" : "hidden"} lg:group-hover:block z-[100] animate-in fade-in slide-in-from-top-2 duration-300`}
              >
                <div className="bg-white text-gray-800 shadow-2xl rounded-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5 relative z-20">
                  {/* Greeting Header */}
                  <div className="bg-gray-50/80 backdrop-blur-sm px-5 py-4 border-b border-gray-100">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                      Authenticated Account
                    </p>
                    <p className="text-sm font-black text-blue-600 truncate">
                      {user.name}
                    </p>
                  </div>

                  <nav className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center px-4 py-3 text-sm rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group/item"
                    >
                      <User
                        size={16}
                        className="mr-3 text-gray-400 group-hover/item:text-blue-500 transition-colors"
                      />
                      <span className="font-bold">My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center px-4 py-3 text-sm rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group/item"
                    >
                      <Package
                        size={16}
                        className="mr-3 text-gray-400 group-hover/item:text-blue-500 transition-colors"
                      />
                      <span className="font-bold">My Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center px-4 py-3 text-sm md:hidden rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group/item"
                    >
                      <Heart
                        size={16}
                        className="mr-3 text-gray-400 group-hover/item:text-blue-500 transition-colors"
                      />
                      <span className="font-bold">Wishlist</span>
                    </Link>

                    {(user.role === "admin" || user.role === "superadmin") && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="mt-1 flex items-center px-4 py-3 text-sm bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all"
                      >
                        <ShieldCheck size={16} className="mr-3" /> Admin
                        Dashboard
                      </Link>
                    )}
                  </nav>

                  <div className="p-2 border-t border-gray-50">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center font-black"
                    >
                      <LogOut size={16} className="mr-3" /> Logout Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="hover:text-yellow-400 transition-colors flex items-center font-bold text-sm uppercase tracking-wider"
            >
              <User size={18} className="mr-1.5" /> Login
            </Link>
          )}

          <Link
            to="/wishlist"
            className="hover:text-yellow-400 transition-colors flex items-center group"
          >
            <Heart
              size={20}
              className="mr-1.5 transition-transform group-hover:scale-110"
            />
            <span className="hidden sm:inline font-bold text-sm uppercase tracking-wider">
              Wishlist
            </span>
          </Link>

          <Link
            to="/cart"
            className="hover:text-yellow-400 transition-colors flex items-center relative group"
          >
            <div className="relative">
              <ShoppingCart
                size={22}
                className="mr-1.5 transition-transform group-hover:scale-110"
              />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2.5 -right-1 bg-yellow-400 text-blue-900 text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-blue-600 shadow-md transform group-hover:scale-110 transition-transform">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold text-sm uppercase tracking-wider ml-1">
              Cart
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
