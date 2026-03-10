import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createOrder, lockInventory, reset } from "../slices/orderSlice";
import { fetchAddresses } from "../slices/addressSlice";
import { validateCoupon, clearAppliedCoupon, resetCouponStatus } from "../slices/couponSlice";
import {
  Tag,
  Check,
  X,
  Truck,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Home,
  Building,
  AlertTriangle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isLoading: isCartLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { addresses } = useSelector((state) => state.addresses);
  const { isSuccess, isLoading, isError, message } = useSelector(
    (state) => state.orders,
  );
  const { validCoupon, isLoading: isCouponLoading, isError: isCouponError, message: couponMessage } = useSelector(
    (state) => state.coupons,
  );

  const [couponCode, setCouponCode] = useState("");

  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    addressType: "Home",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("online"); // default to Razorpay/online
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  // Auto-fill the form with a saved address during the initial load (avoids useEffect cascading render)
  if (addresses && addresses.length > 0 && !hasAutoFilled) {
    setHasAutoFilled(true);
    if (!shippingDetails.address) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setShippingDetails({
        fullName: defaultAddr.fullName || "",
        addressType: defaultAddr.addressType || "Home",
        address: defaultAddr.street || "",
        city: defaultAddr.city || "",
        state: defaultAddr.state || "",
        postalCode: defaultAddr.zip || "",
        country: defaultAddr.country || "India",
        phone: defaultAddr.phone || "",
      });
    }
  }

  const cartItems = cart?.items || [];
  const itemsTotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0,
  );

  const calculatedDiscount = validCoupon 
    ? (validCoupon.discountType === "percentage" 
        ? (itemsTotal * validCoupon.discountValue) / 100 
        : validCoupon.discountValue)
    : 0;

  const platformFee = itemsTotal < 500 ? 0 : 20;
  const finalTotal = itemsTotal + platformFee - calculatedDiscount;

  useEffect(() => {
    dispatch(reset());
    dispatch(clearAppliedCoupon());
    dispatch(resetCouponStatus());
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    if (!isCartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      if (!isLoading && !isSuccess) {
        navigate("/cart");
      }
    }
  }, [user, cart, navigate, isLoading, isSuccess, isCartLoading]);

  const [isReserved, setIsReserved] = useState(false);

  // Inventory Locking
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0 && !isReserved) {
      const lockItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));
      dispatch(lockInventory(lockItems)).then((res) => {
        if (lockInventory.fulfilled.match(res)) {
          setIsReserved(true);
        }
      });
    }
  }, [dispatch, cart, isReserved]);

  useEffect(() => {
    if (isSuccess && cartItems.length === 0) {
      navigate("/orders");
      dispatch(reset());
    }
  }, [isSuccess, navigate, dispatch, cartItems.length]);

  const handleChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectAddress = (addr) => {
    setShippingDetails({
      fullName: addr.fullName || "",
      addressType: addr.addressType || "Home",
      address: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.zip || "",
      country: addr.country || "India",
      phone: addr.phone || "",
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    dispatch(validateCoupon({ code: couponCode, purchaseAmount: itemsTotal }));
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
    setCouponCode("");
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      items: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingDetails,
      totalAmount: finalTotal,
      discountAmount: calculatedDiscount,
      couponCode: validCoupon ? validCoupon.code : "",
    };

    try {
      // 1. Create Order in our DB (sets to pending)
      const actionResponse = await dispatch(createOrder(orderData));
      
      if (createOrder.fulfilled.match(actionResponse)) {
        const createdOrder = actionResponse.payload.data;
        
        if (paymentMethod === "cod") {
          navigate("/orders");
          dispatch(reset());
          return;
        }

        // 2. Call our backend to create a Razorpay Order
        const paymentOrderRes = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/payment/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount: finalTotal,
            currency: "INR",
            receipt: createdOrder._id,
          }),
        });
        
        const paymentOrderData = await paymentOrderRes.json();
        
        if (paymentOrderData.success) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || "test_key_id",
            amount: paymentOrderData.data.amount,
            currency: paymentOrderData.data.currency,
            name: "Razorpay Payments Private Limited",
            description: "Payment for your QuickCart order",
            order_id: paymentOrderData.data.id,
            handler: async (response) => {
              // 3. Verify Payment
              const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/payment/verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: createdOrder._id,
                }),
              });
              
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                navigate("/orders");
                dispatch(reset());
              } else {
                alert("Payment verification failed. Please contact support.");
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: shippingDetails.phone,
            },
            theme: {
              color: "#2563eb",
            },
          };
          
          const rzp1 = new window.Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            alert("Payment failed: " + response.error.description);
          });
          rzp1.open();
        } else {
          // If Razorpay order fails, we still have the order in DB, 
          // but we might want to redirect them to order page to retry payment later
          alert("Could not initialize payment. Redirecting to your orders.");
          navigate("/orders");
        }
      }
    } catch (err) {
      console.error("Order completion error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-2 block">
              Secure Checkout
            </span>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center tracking-tight">
              Checkout{" "}
              <div className="ml-4 w-2 h-2 bg-blue-600 rounded-full hidden md:block"></div>
            </h1>
            {isReserved && !isError && (
              <div className="mt-4 flex items-center bg-blue-600/10 backdrop-blur-sm text-blue-700 px-4 py-3 rounded-2xl border border-blue-200/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-blue-200 shadow-lg">
                  <ShieldCheck size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-1">Items Secured</p>
                  <p className="text-xs font-bold opacity-80">Reserved for your checkout (15 min)</p>
                </div>
                <div className="ml-auto flex gap-1">
                   <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center text-xs font-bold text-blue-600 border-2 border-blue-600/20 px-6 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-md hover:shadow-blue-100 hover:border-blue-600"
          >
            <ShoppingBag size={16} className="mr-2" /> Back to Cart
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Shipping Form */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="mb-8 border-b border-gray-100 pb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center uppercase tracking-tight">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-4 text-blue-600">
                    <Truck size={24} strokeWidth={2.5} />
                  </div>
                  Delivery Address
                </h2>
              </div>

              {addresses && addresses.length > 0 && (
                <div className="mb-8">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                    Select from saved addresses
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                          shippingDetails.address === addr.street && shippingDetails.city === addr.city
                            ? 'border-blue-500 bg-blue-50/30' 
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                           <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                               {addr.addressType === 'Office' ? <Building size={14} /> : <Home size={14} />}
                           </div>
                           <h4 className="font-bold text-gray-800 text-sm leading-tight">{addr.fullName}</h4>
                           {addr.isDefault && (
                              <span className="text-[9px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">
                                Default
                              </span>
                           )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{addr.street}</p>
                        <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center mt-6 mb-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or enter manually</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingDetails.fullName}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      Address Type
                    </label>
                    <select
                      name="addressType"
                      value={shippingDetails.addressType}
                      onChange={handleChange}
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={shippingDetails.phone}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingDetails.address}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                      placeholder="Area, Street, Sector, Village"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingDetails.city}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                      placeholder="Town/City"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingDetails.state}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingDetails.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                      placeholder="6-digit Pincode"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingDetails.country}
                      onChange={handleChange}
                      required
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm font-medium transition-all"
                      placeholder="United States"
                    />
                  </div>
                </div>

                <div className="pt-8 mt-4 border-t border-gray-100">
                  <div className="mb-8 pb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center uppercase tracking-tight">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-4 text-blue-600">
                        <CreditCard size={24} strokeWidth={2.5} />
                      </div>
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div 
                      onClick={() => setPaymentMethod("online")}
                      className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all cursor-pointer group ${paymentMethod === "online" ? "bg-blue-50/50 border-blue-500" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-[5px] bg-white mr-3 shadow-sm transition-transform ${paymentMethod === "online" ? "border-blue-600 scale-110" : "border-gray-300"}`}></div>
                        <span className={`font-bold tracking-tight text-base ${paymentMethod === "online" ? "text-blue-900" : "text-gray-600"}`}>
                          Online Payment (Razorpay)
                        </span>
                      </div>
                      <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-md ${paymentMethod === "online" ? "bg-blue-600 text-white shadow-blue-200" : "bg-gray-100 text-gray-500 shadow-none"}`}>
                        Fast & Secure
                      </span>
                    </div>

                    <div 
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all cursor-pointer group ${paymentMethod === "cod" ? "bg-blue-50/50 border-blue-500" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-[5px] bg-white mr-3 shadow-sm transition-transform ${paymentMethod === "cod" ? "border-blue-600 scale-110" : "border-gray-300"}`}></div>
                        <span className={`font-bold tracking-tight text-base ${paymentMethod === "cod" ? "text-blue-900" : "text-gray-600"}`}>
                          Cash on Delivery (COD)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isError && (
                  <div className="mt-8 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start gap-3 animate-in fade-in duration-300">
                    <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-red-900 leading-snug">
                        {message.includes("-") ? message.replace(/Available: -\d+/, "Available: 0") : message}
                      </p>
                      {(message?.toLowerCase().includes("stock") || message?.toLowerCase().includes("available")) && (
                        <div className="mt-2 flex gap-4">
                          <Link to="/cart" className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 underline underline-offset-4">
                            Adjust Cart
                          </Link>
                          <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 underline underline-offset-4">
                            Refresh
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-100 flex items-center justify-center text-sm mt-8 ${isLoading ? "opacity-70 cursor-not-allowed transform-none hover:bg-blue-600" : ""}`}
                >
                  {isLoading ? "Processing Order..." : "Confirm & Place Order"}
                  {!isLoading && (
                    <ChevronRight className="ml-2" size={20} strokeWidth={3} />
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="p-6 lg:p-8 bg-white">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Order Summary
                  </h2>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-wider">
                    {cartItems.length} Items
                  </span>
                </div>

                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-blue-400 transition-colors">
                  {cartItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex gap-4 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 group/item"
                    >
                      <div className="w-16 h-16 shrink-0 bg-white border border-gray-100 rounded-xl p-2 flex justify-center items-center shadow-sm group-hover/item:scale-105 transition-transform">
                        <img
                          src={item.product?.images?.[0]}
                          alt={item.product?.title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p
                          className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight group-hover/item:text-blue-600 transition-colors"
                          title={item.product?.title}
                        >
                          {item.product?.title}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Qty:{" "}
                            <span className="text-blue-600 font-bold">
                              {item.quantity}
                            </span>
                          </p>
                          <p className="text-xs font-bold text-gray-900 tracking-tight">
                            ₹
                            {(
                              (item.product?.price || 0) * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="text-sm font-bold">Item Total</span>
                      <span className="text-sm font-black text-gray-900 tracking-tight">
                        ₹{itemsTotal.toFixed(2)}
                      </span>
                    </div>
                    {calculatedDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600 font-bold italic">
                        <span className="text-sm">Coupon Discount</span>
                        <span className="text-sm">
                          -₹{calculatedDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="text-sm font-bold">Shipping Fee</span>
                      <span className="text-sm font-black text-green-600 uppercase tracking-wider">
                        Free
                      </span>
                    </div>
                     <div className="flex justify-between items-center text-gray-600">
                       <span className="text-sm font-bold">Platform Fee</span>
                       <span className={`text-sm font-black tracking-tight ${platformFee === 0 ? "text-green-600" : "text-gray-900"}`}>
                         {platformFee === 0 ? "FREE" : `₹${platformFee.toFixed(2)}`}
                       </span>
                     </div>
                  </div>

                  {/* Coupon Application Box */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic font-medium">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                      Apply Coupon
                    </label>
                    {validCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded-xl border border-green-100">
                        <div className="flex items-center">
                          <Check size={16} className="text-green-600 mr-2" />
                          <span className="text-sm font-bold text-green-700">{validCoupon.code} Applied</span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Enter Code"
                            className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase tracking-widest font-bold"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          />
                        </div>
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isCouponLoading || !couponCode}
                          className="px-6 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-[1.05] shadow-lg shadow-blue-100"
                        >
                          {isCouponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {isCouponError && (
                      <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-black uppercase text-gray-900 tracking-tight">
                      Total Payable
                    </span>
                    <span className="text-2xl font-black text-blue-600 tracking-tight">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 shrink-0 border border-green-50">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center">
                    QuickCart Trust{" "}
                    <span className="ml-2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed pr-2">
                    100% money back guarantee on non-original or damaged
                    products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
