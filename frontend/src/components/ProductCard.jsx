import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../slices/wishlistSlice";
import { updateCart } from "../slices/cartSlice";
import { Heart, ShoppingBag } from "lucide-react";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);

  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(
      updateCart({ productId: product._id, quantity: 1, action: "add" }),
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-100 group relative transform hover:-translate-y-1">
      {/* Product Image Wrapper */}
      <Link
        to={`/product/${product._id}`}
        className="block relative pt-[100%] overflow-hidden bg-gray-50/50 p-6 rounded-t-3xl"
      >
        <img
          src={
            product.images[0] ||
            "https://via.placeholder.com/400x400.png?text=Product"
          }
          alt={product.title}
          className="absolute top-0 left-0 w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Assured Badge Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest flex items-center">
            QC Assured{" "}
            <div className="ml-1 w-1 h-1 bg-blue-600 rounded-full"></div>
          </span>
        </div>

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-all duration-300 shadow-sm border z-10 hover:scale-110 active:scale-95 ${
            isWishlisted
              ? "bg-red-50 border-red-100 text-red-500"
              : "bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50"
          }`}
        >
          <Heart
            size={18}
            className={isWishlisted ? "fill-current" : ""}
            strokeWidth={2.5}
          />
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow bg-white relative z-10">
        <Link to={`/product/${product._id}`}>
          <h3
            className="text-[13px] font-bold text-gray-800 group-hover:text-blue-600 truncate mb-2 uppercase tracking-tight transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        {product.numReviews > 0 ? (
          <div className="flex items-center space-x-2 mb-3">
            <div className="bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center shadow-sm">
              {product.rating.toFixed(1)}{" "}
              <svg
                className="w-2.5 h-2.5 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
            <span className="text-[10px] font-bold text-gray-400">
              ({product.numReviews.toLocaleString()})
            </span>
          </div>
        ) : (
          <div className="h-6 mb-3 flex items-center">
            <span className="text-[10px] font-bold text-gray-300">
              New Arrival
            </span>
          </div>
        )}

        {/* Pricing */}
        {/* Pricing */}
        <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-4 gap-2 flex-wrap sm:flex-nowrap relative">
          <div className="flex flex-col flex-1 min-w-[60%] overflow-hidden">
            <div className="flex items-baseline space-x-2 mb-1 flex-wrap">
              <span className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap">
                ₹{product.price.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 line-through whitespace-nowrap">
                  ₹
                  {(
                    product.price /
                    (1 - product.discountPercentage / 100)
                  ).toFixed(2)}
                </span>
              )}
            </div>
            {product.discountPercentage > 0 && (
              <div className="mt-1">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                  {product.discountPercentage}% off
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-blue-100 flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 self-end z-20"
            title="Add to Cart"
          >
            <ShoppingBag
              size={20}
              className="w-4 h-4 sm:w-5 sm:h-5"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
