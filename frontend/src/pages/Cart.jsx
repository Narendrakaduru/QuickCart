import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCart, updateCart } from "../slices/cartSlice";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";

const Cart = () => {
  const dispatch = useDispatch();
  const { cart, isLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCart({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(updateCart({ productId, quantity: 0 }));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
           <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 tracking-tight">
          Please login to view your cart
        </h2>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (isLoading && !cart) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500 text-xl font-medium">
        Loading your cart...
      </div>
    );
  }

  const cartItems = cart?.items || [];

  // Calculate Prices Dynamically
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );
  const basePrice = cartItems.reduce((acc, item) => {
    const originalPrice =
      item.product.price / (1 - (item.product.discountPercentage || 0) / 100);
    return acc + originalPrice * item.quantity;
  }, 0);
  const totalDiscount = basePrice - totalPrice;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-2 block">
              Your Bag
            </span>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center tracking-tight">
              Shopping Cart{" "}
              <div className="ml-4 w-2 h-2 bg-blue-600 rounded-full hidden md:block"></div>
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center text-xs font-bold text-blue-600 border-2 border-blue-600/20 px-6 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-md hover:shadow-blue-100 hover:border-blue-600"
          >
            <ShoppingBag size={16} className="mr-2" /> Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {cartItems.length > 0 ? (
                <div className="divide-y divide-gray-50 p-2 md:p-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="p-4 md:p-6 flex flex-col sm:flex-row gap-6 hover:bg-blue-50/30 transition-all duration-300 group/item relative rounded-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/0 to-blue-50/50 opacity-0 group-hover/item:opacity-100 transition-opacity rounded-2xl"></div>
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-3 shrink-0 shadow-sm relative z-10 group-hover/item:scale-105 transition-transform duration-500">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between relative z-10">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <Link
                              to={`/product/${item.product._id}`}
                              className="text-lg font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors uppercase tracking-tight line-clamp-2"
                            >
                              {item.product.title}
                            </Link>
                            <button
                              onClick={() => handleRemoveItem(item.product._id)}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 hover:bg-red-500 hover:text-white hover:rotate-90 transition-all duration-300"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="mt-3 inline-flex items-center text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                            QuickCart Assured
                          </div>

                          <div className="mt-4 flex items-center space-x-3">
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            {item.product.discountPercentage > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-400 line-through tracking-tight">
                                  ₹
                                  {(
                                    (item.product.price /
                                      (1 -
                                        item.product.discountPercentage /
                                          100)) *
                                    item.quantity
                                  ).toFixed(2)}
                                </span>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider">
                                  {item.product.discountPercentage}% Off
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Quantity
                          </p>
                          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                item.quantity <= 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 bg-white shadow-sm hover:text-blue-600 hover:scale-105 active:scale-95"
                              }`}
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>

                            <div className="w-10 text-center">
                              <span className="text-sm font-bold text-gray-900">
                                {item.quantity}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity + 1,
                                )
                              }
                              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all hover:scale-105 active:scale-95"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 px-4 text-center">
                  <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-400 rotate-6 shadow-lg shadow-blue-50">
                    <ShoppingBag size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                    Your cart feels light!
                  </h2>
                  <p className="text-gray-500 mb-10 text-lg font-medium max-w-md mx-auto leading-relaxed">
                    There is nothing in your bag. Let's add some items.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all uppercase shadow-lg shadow-blue-200 tracking-wider text-[11px]"
                  >
                    Start Shopping Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          {cartItems.length > 0 && (
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 sticky top-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
                  Price Details ({cartItems.length} items)
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm font-bold">Total MRP</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{basePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm font-bold">Discount on MRP</span>
                    <span className="text-sm font-bold text-green-600">
                      -₹{totalDiscount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm font-bold">Platform Fee</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹20.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm font-bold">Shipping Fee</span>
                    <span className="text-sm font-bold text-green-600">
                      FREE
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 pb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold uppercase text-gray-900 tracking-tight">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-blue-600 tracking-tight">
                      ₹{(totalPrice + 20).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="w-full flex justify-center items-center bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-100 text-sm mb-4"
                >
                  Proceed to Checkout
                </Link>

                {totalDiscount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">
                      You save ₹{totalDiscount.toFixed(2)} on this order
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Safe Payment
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1">
                      100% secure processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
