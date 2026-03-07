import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist } from '../slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import { HeartOff } from 'lucide-react';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlist, isLoading, isError, message } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your wishlist</h2>
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-sm font-medium">Login Now</Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-500 text-xl font-medium">Loading your wishlist...</div>;
  }

  if (isError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500 font-medium">Error: {message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 shadow-sm rounded-sm mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          My Wishlist <span className="ml-3 text-lg font-normal text-gray-500">({wishlist?.length || 0} Items)</span>
        </h1>
      </div>

      {wishlist && wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {wishlist.map((product) => (
            <div key={product._id} className="relative group">
              <ProductCard product={product} />
              {/* Optional: Add a specific "Remove" button if layout needs it, 
                  but ProductCard heart icon already toggles. 
                  Maybe just highlighting it here. */}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center shadow-sm rounded-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartOff size={48} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Your wishlist is empty!</h2>
          <p className="text-gray-500 mb-8 font-light italic text-sm">Add items that you like to your wishlist. Review them anytime and easily move them to the cart.</p>
          <Link to="/" className="bg-blue-600 text-white px-10 py-3 rounded-sm font-bold shadow-md hover:bg-blue-700 transition uppercase tracking-wide">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
