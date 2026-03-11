import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  createProductReview,
  reset,
} from "../slices/productSlice";
import { updateCart } from "../slices/cartSlice";
import { addRecentlyViewedLocal, syncRecentlyViewed } from "../slices/userSlice";
import {
  Share2,
  ShoppingCart,
  Zap,
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    productDetails: product,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [reviewPosted, setReviewPosted] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(id)).then((res) => {
      // Trigger recently viewed logic upon successful fetch
      if (res.meta.requestStatus === "fulfilled" && res.payload) {
        dispatch(addRecentlyViewedLocal(res.payload));
        if (user) {
          dispatch(syncRecentlyViewed(res.payload._id));
        }
      }
    });
  }, [dispatch, id, user]);

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(
      updateCart({ productId: product._id, quantity: 1, action: "add" }),
    );
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await dispatch(
        updateCart({ productId: product._id, quantity: 1, action: "add" }),
      ).unwrap();
      navigate("/checkout");
    } catch (err) {
      console.error(err);
      navigate("/cart");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    const result = await dispatch(
      createProductReview({ id, reviewData: { rating, comment } }),
    );
    if (result.meta?.requestStatus === "fulfilled") {
      setReviewPosted(true);
      setRating(0);
      setComment("");
      dispatch(fetchProductDetails(id)); // Refetch to get new average
      setTimeout(() => {
        setReviewPosted(false);
        dispatch(reset());
      }, 3000);
    }
  };

  const activeImage =
    selectedImage || (product?.images?.length > 0 ? product.images[0] : "");

  if (isLoading && !product) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center h-[60vh] items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (isError && !product) {
    return (
      <div className="text-center text-red-500 mt-10 p-8 bg-white shadow-sm max-w-2xl mx-auto rounded">
        <AlertCircle className="mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
        <p>{message}</p>
        <button
          onClick={() => dispatch(fetchProductDetails(id))}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-sm font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-6 md:p-10 border border-gray-100 flex flex-col md:flex-row gap-12">
        {/* Left Side: Images */}
        <div className="w-full md:w-2/5 flex flex-col-reverse md:flex-row gap-4 sticky top-20 self-start">
          {/* Thumbnail Strip */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
            {product.images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.title} ${idx}`}
                className={`w-16 h-16 object-contain border p-1 cursor-pointer transition ${activeImage === img ? "border-blue-600 shadow-sm" : "border-gray-200 hover:border-gray-400"}`}
                onMouseEnter={() => setSelectedImage(img)}
              />
            ))}
          </div>

          {/* Main Image View */}
          <div className="flex-1 relative border border-gray-100 p-4 aspect-square flex items-center justify-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow border z-10">
              <Share2 size={18} />
            </button>
            <img
              src={activeImage || "https://via.placeholder.com/600x600.png"}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-3/5 space-y-4">
          <nav className="text-xs text-gray-500 flex items-center space-x-1 mb-2">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link 
              to={`/products?category=${encodeURIComponent(product.category)}`} 
              className="hover:text-blue-600"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-400 truncate">{product.title}</span>
          </nav>

          <div>
            <h1 className="text-xl md:text-2xl text-gray-900 font-medium leading-snug">
              {product.title}
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              {product.numReviews > 0 ? (
                <>
                  <div className="bg-green-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded flex items-center">
                    {product.rating.toFixed(1)}{" "}
                    <Star className="w-3 h-3 ml-1 fill-current" />
                  </div>
                  <span className="text-gray-500 text-sm font-medium">
                    {product.numReviews.toLocaleString()} Ratings &{" "}
                    {product.reviews?.length || 0} Reviews
                  </span>
                </>
              ) : (
                <span className="text-blue-600 text-sm font-medium">
                  Be the first to review this product
                </span>
              )}
            </div>
          </div>

          <div className="flex items-end space-x-3">
            <span className="text-3xl font-semibold text-gray-900">
              ₹{product.price.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span className="text-lg text-gray-500 line-through mb-1">
                  ₹
                  {(
                    product.price *
                    (1 + product.discountPercentage / 100)
                  ).toFixed(2)}
                </span>
                <span className="text-sm font-bold text-green-600 mb-1">
                  {product.discountPercentage}% off
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-100 flex items-center justify-center transition-all hover:scale-[1.03] active:scale-[0.97] uppercase tracking-wider text-xs"
            >
              <ShoppingCart size={18} strokeWidth={2.5} className="mr-2" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-orange-200 flex items-center justify-center transition-all hover:scale-[1.03] active:scale-[0.97] uppercase tracking-widest text-xs"
            >
              <Zap size={18} strokeWidth={2.5} className="mr-2 fill-current" /> Buy Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 bg-gray-50/50 rounded p-4 border border-gray-100 mt-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <CheckCircle2 size={20} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">100% Original</p>
                <p className="text-gray-500">Genuine items only</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <Zap size={20} />
              </div>
              <div className="text-xs">
                <p className="font-bold text-gray-800">Fast Delivery</p>
                <p className="text-gray-500">2-4 business days</p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="pt-6 border-t border-gray-100 mt-6">
            <div className="text-base font-medium mb-3 text-gray-900">
              Product Description
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications Section */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="pt-6 border-t border-gray-100 mt-6">
              <div className="text-base font-medium mb-4 text-gray-900">
                Key Specifications
              </div>
              <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-1">
                {product.specifications.map((spec, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center p-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors rounded-lg"
                  >
                    <span className="sm:w-1/3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 sm:mb-0">
                      {spec.key}
                    </span>
                    <span className="sm:w-2/3 text-sm font-medium text-gray-800">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="mt-6 bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <MessageSquare className="mr-2 text-blue-600" size={20} />
            Ratings & Reviews
          </h2>
          {product.numReviews > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {product.rating.toFixed(1)}
              </div>
              <div className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                STAR <Star className="w-2.5 h-2.5 ml-1 fill-current" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Post a Review */}
          <div className="p-6 border-r border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Rate this product
            </h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    Your Rating:
                  </span>
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={ratingValue}
                        className={`transition-colors duration-200 ${
                          ratingValue <= (hover || rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <Star
                          size={28}
                          fill={
                            ratingValue <= (hover || rating)
                              ? "currentColor"
                              : "none"
                          }
                          strokeWidth={1.5}
                        />
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Write a review
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded p-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition h-32 resize-none"
                    placeholder="Tell us what you like or don't like about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                {reviewPosted ? (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded text-sm flex items-center animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="mr-2" size={18} /> Review submitted
                    successfully!
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider text-xs ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLoading ? "Submitting..." : "Submit Review"}
                  </button>
                )}
                {isError && rating !== 0 && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded text-sm flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {message}
                  </div>
                )}
              </form>
            ) : (
              <div className="bg-gray-50 p-6 rounded text-center">
                <p className="text-gray-600 mb-4">
                  Please log in to share your experience with this product.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                >
                  Login to Review
                </button>
              </div>
            )}
          </div>

          {/* User Reviews List */}
          <div className="p-6 bg-gray-50/30">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              User Reviews
            </h3>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center ${rev.rating >= 4 ? "bg-green-600" : rev.rating >= 3 ? "bg-yellow-500" : "bg-red-500"}`}
                      >
                        {rev.rating}{" "}
                        <Star size={8} fill="currentColor" className="ml-0.5" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">
                        {rev.name}
                      </span>
                      <CheckCircle2 size={12} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400">
                        Certified Buyer
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-1">
                      {rev.comment}
                    </p>
                    <span className="text-[10px] text-gray-500">
                      Posted on{" "}
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Star className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No reviews yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
