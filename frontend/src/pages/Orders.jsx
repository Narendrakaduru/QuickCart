import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getMyOrders, cancelOrder } from "../slices/orderSlice";
import {
  Package,
  Calendar,
  MapPin,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  X,
} from "lucide-react";

const Orders = () => {
  const [orderToCancel, setOrderToCancel] = useState(null);
  const dispatch = useDispatch();
  const { orders, isLoading, isError, message } = useSelector(
    (state) => state.orders,
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(getMyOrders());
    }
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500 font-medium">
        Loading your orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500 font-medium">
        Error: {message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-2 block">
              Your Account
            </span>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center tracking-tight">
              Purchase History{" "}
              <div className="ml-4 w-2 h-2 bg-blue-600 rounded-full hidden md:block"></div>
            </h1>
          </div>
          <Link
            to="/"
            className="inline-flex items-center text-xs font-bold text-blue-600 border-2 border-blue-600/20 px-6 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-md hover:shadow-blue-100 hover:border-blue-600"
          >
            <ShoppingBag size={16} className="mr-2" /> Back to Store
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order._id}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500"
              >
                {/* Order Meta Header */}
                <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Order Placed
                      </p>
                      <p className="text-sm font-bold text-gray-900 flex items-center">
                        <Calendar size={14} className="mr-2 text-blue-500" />
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Total Amount
                      </p>
                      <p className="text-sm font-bold text-blue-600 tracking-tight">
                        ₹
                        {order.totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Ship To
                      </p>
                      <p className="text-sm font-bold text-gray-900 flex items-center group-hover:text-blue-600 transition-colors uppercase truncate max-w-[150px]">
                        <MapPin size={14} className="mr-2 shrink-0" />{" "}
                        {order.shippingDetails.city}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-start md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em]">
                      ID: {order._id.toUpperCase()}
                    </p>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                          order.orderStatus === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.orderStatus === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.orderStatus === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : order.orderStatus === "packed"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      {order.paymentStatus === "completed" && (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                          Verified Payment
                        </span>
                      )}
                    </div>
                    {(order.orderStatus === "ordered" ||
                      order.orderStatus === "packed") && (
                      <button
                        onClick={() => {
                          setOrderToCancel(order._id);
                        }}
                        className="mt-1 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 shadow-sm hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-[1.05] active:scale-95"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="p-2 md:p-4">
                  <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50 border border-gray-50">
                    {order.items.map((item, idx) => (
                      <Link
                        to={`/order/${order._id}/track`}
                        key={idx}
                        className="p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-blue-50/30 transition-all duration-300 group/item relative overflow-hidden"
                      >
                        {/* Interactive Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/0 to-blue-50/50 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>

                        <div className="flex items-center gap-6 relative z-10">
                          <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-3 shrink-0 shadow-sm group-hover/item:scale-105 transition-transform duration-500">
                            {item.product?.images?.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package size={32} className="text-gray-200" />
                            )}
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors uppercase tracking-tight">
                              {item.product?.title || "Archive Item"}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Qty: {item.quantity}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-sm font-bold text-gray-900">
                                ₹{item.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-3 inline-flex items-center text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                              Delivered by QuickCart Logistics
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center bg-white border border-gray-100 px-6 py-3 rounded-xl shadow-sm group-hover/item:border-blue-200 group-hover/item:shadow-md transition-all relative z-10 ml-auto md:ml-0">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover/item:text-blue-600 transition-colors mr-3">
                            Track Package
                          </span>
                          <ChevronRight
                            size={18}
                            className="text-gray-300 group-hover/item:text-blue-600 group-hover/item:translate-x-1 transition-all"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] shadow-xl shadow-blue-100/20 border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-400 rotate-6 shadow-lg shadow-blue-50">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Your history is a blank canvas.
            </h2>
            <p className="text-gray-500 mb-10 text-lg font-medium max-w-md mx-auto leading-relaxed">
              It looks like you haven't started your shopping journey with us
              yet!
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 hover:scale-[1.05] active:scale-95 transition-all uppercase shadow-lg shadow-blue-200 tracking-wider text-[11px]"
            >
              Start Shopping Now
            </Link>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setOrderToCancel(null)}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setOrderToCancel(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-sm">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                Cancel Order?
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setOrderToCancel(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => {
                    dispatch(cancelOrder(orderToCancel));
                    setOrderToCancel(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all active:scale-95"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
