import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getOrderDetails } from "../slices/orderSlice";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ChevronLeft,
  ShoppingBag,
  Home,
  Building,
  Phone
} from "lucide-react";

const TrackOrder = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, isLoading, isError, message } = useSelector(
    (state) => state.orders,
  );

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Error: {message}
        </h2>
        <Link to="/orders" className="text-blue-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const steps = [
    {
      id: "ordered",
      label: "Order Placed",
      icon: Clock,
      desc: "We have received your order.",
    },
    {
      id: "packed",
      label: "Packed",
      icon: Package,
      desc: "Your item has been packed and is ready for shipment.",
    },
    {
      id: "shipped",
      label: "Shipped",
      icon: Truck,
      desc: "Item is on its way to your destination.",
    },
    {
      id: "delivered",
      label: "Delivered",
      icon: CheckCircle,
      desc: "Item has been delivered successfully.",
    },
  ];

  const currentStatusIndex = steps.findIndex(
    (step) => step.id === order.orderStatus,
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          to="/orders"
          className="inline-flex items-center text-xs font-black text-gray-400 hover:text-blue-600 mb-8 transition-all group uppercase tracking-widest"
        >
          <ChevronLeft
            size={16}
            className="mr-1 group-hover:-translate-x-1 transition-transform"
          />
          Back to Purchase History
        </Link>

        {/* Global Order Status Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                Order #{order._id.substring(order._id.length - 8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === "completed" ? "text-green-600" : "text-orange-600"}`}
                >
                  {order.paymentStatus} Payment
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                Total Amount
              </p>
              <p className="text-xl font-black text-gray-900">
                ₹
                {order.totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline (Vertical) */}
          <div className="lg:col-span-2 space-y-6">
            {order.orderStatus === "cancelled" && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-700 shadow-sm text-center">
                <h2 className="text-xl font-black uppercase tracking-widest mb-2">
                  Order Cancelled
                </h2>
                <p className="text-sm font-medium opacity-80">
                  This order has been cancelled and will not be delivered.
                </p>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10 flex items-center">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
                Delivery Journey
              </h2>

              <div className="relative pl-8 space-y-12">
                {/* Vertical Progress Line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                <div
                  className="absolute left-3 top-2 w-0.5 bg-blue-600 transition-all duration-1000 ease-in-out"
                  style={{
                    height: `${(currentStatusIndex / (steps.length - 1)) * 90}%`,
                  }}
                ></div>

                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const isFuture = index > currentStatusIndex;

                  return (
                    <div key={step.id} className="relative">
                      {/* Indicator Point */}
                      <div
                        className={`absolute -left-[29px] top-0 w-5 h-5 rounded-full border-4 border-white shadow transition-all duration-500 z-10 flex items-center justify-center ${
                          isCompleted
                            ? "bg-blue-600 scale-110 ring-4 ring-blue-50"
                            : "bg-gray-200"
                        }`}
                      >
                        {isCompleted && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>

                      <div
                        className={`flex items-start gap-6 transition-opacity duration-500 ${isFuture ? "opacity-40" : "opacity-100"}`}
                      >
                        <div
                          className={`p-3 rounded-xl transition-colors duration-500 ${isCurrent ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 rotate-3" : "bg-gray-50 text-gray-500"}`}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h3
                              className={`text-sm font-black uppercase tracking-wider ${isCurrent ? "text-blue-600" : "text-gray-900"}`}
                            >
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black animate-pulse uppercase tracking-tight">
                                Active Milestone
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            {step.desc}
                          </p>
                          {isCompleted && index === 0 && (
                            <p className="text-[10px] text-gray-400 font-bold mt-2 italic flex items-center">
                              <CheckCircle size={10} className="mr-1" />{" "}
                              Verified by Store Management
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logistics Support Info */}
            <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                  <Truck size={24} className="text-blue-200" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                    Need help with delivery?
                  </p>
                  <p className="text-sm font-medium opacity-80">
                    Our support team is available 24/7
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white text-blue-900 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-50 transition-colors">
                Contact Logostics
              </button>
            </div>
          </div>

          {/* Sidebar: Details & Items */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                <MapPin size={14} className="mr-2" /> Shipping Details
              </h2>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative">
                  <div className="absolute top-3 right-3 text-blue-500 bg-blue-50 p-1.5 rounded-lg">
                    {order.shippingDetails.addressType === 'Office' ? <Building size={16} /> : <Home size={16} />}
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-1">
                    Shipping To
                  </p>
                  <p className="text-sm font-bold text-gray-900 uppercase pr-8">
                    {order.shippingDetails.fullName || order.user?.name}
                  </p>
                  <div className="flex items-center text-xs font-bold text-gray-400 mt-1 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-widest text-[9px] mr-2">
                      {order.shippingDetails.addressType || 'Home'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed capitalize">
                    {order.shippingDetails.address},{" "}
                    {order.shippingDetails.city}
                    <br />
                    {order.shippingDetails.state ? `${order.shippingDetails.state}, ` : ''}{order.shippingDetails.postalCode}
                    <br />
                    {order.shippingDetails.country}
                  </p>
                  {order.shippingDetails.phone && (
                    <p className="text-sm font-medium text-gray-600 mt-2 flex items-center pt-2 border-t border-gray-200/60">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      {order.shippingDetails.phone}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-tighter mb-1">
                    Status Estimate
                  </p>
                  <p className="text-sm font-bold text-blue-900 italic">
                    Arriving in approx. 3 days
                  </p>
                </div>
              </div>
            </div>

            {/* Package Contents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                <Package size={14} className="mr-2" /> Package Contents (
                {order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center group">
                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-2 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                      <img
                        src={item.product?.images?.[0]}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {item.product?.title}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-xs font-black text-gray-900">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Grand Total
                </p>
                <p className="text-lg font-black text-blue-600">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
