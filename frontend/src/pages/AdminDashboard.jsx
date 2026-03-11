import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../slices/productSlice";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../slices/userSlice";
import {
  getAllOrdersAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  getInventoryLocks,
} from "../slices/orderSlice";
import { fetchLogs } from "../slices/logSlice";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../slices/couponSlice";
import {
  Edit,
  Trash2,
  Plus,
  Package,
  Users,
  Shield,
  ShoppingCart,
  CheckCircle,
  Truck,
  Search,
  Activity,
  User as UserIcon,
  Server,
  AlertTriangle,
  Info,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Tag,
  Star,
  Clock,
  Unlock,
} from "lucide-react";
import ProductModal from "../components/ProductModal";
import UserModal from "../components/UserModal";
import CouponModal from "../components/CouponModal";
import ConfirmModal from "../components/ConfirmModal";
import SearchAnalytics from "../components/SearchAnalytics";
import { BarChart2 as ChartBar } from "lucide-react";

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (pages <= maxVisiblePages + 2) {
      for (let i = 1; i <= pages; i++) {
        buttons.push(renderButton(i));
      }
    } else {
      // Always show page 1
      buttons.push(renderButton(1));

      if (page > 3) {
        buttons.push(
          <span key="ellipsis-start" className="px-2 text-gray-400">
            ...
          </span>,
        );
      }

      // Show range around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(pages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        buttons.push(renderButton(i));
      }

      if (page < pages - 2) {
        buttons.push(
          <span key="ellipsis-end" className="px-2 text-gray-400">
            ...
          </span>,
        );
      }

      // Always show last page
      buttons.push(renderButton(pages));
    }

    return buttons;
  };

  const renderButton = (p) => (
    <button
      key={p}
      onClick={() => onPageChange(p)}
      className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition ${
        page === p
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {p}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-t border-gray-100 gap-4">
      <div className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-700">
          {total > 0 ? (page - 1) * 10 + 1 : 0}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-700">
          {Math.min(page * 10, total)}
        </span>{" "}
        of <span className="font-semibold text-gray-700">{total}</span> entries
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition mr-2"
          title="Previous"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex gap-1">{renderPageButtons()}</div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition ml-2"
          title="Next"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(pages)}
          disabled={page === pages}
          className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    products,
    isLoading: productsLoading,
    isError: productsError,
    message: productsMessage,
  } = useSelector((state) => state.products);
  const {
    users,
    isLoading: usersLoading,
    isError: usersError,
    message: usersMessage,
  } = useSelector((state) => state.users);
  const {
    orders,
    locks,
    isLoading: ordersLoading,
    isError: ordersError,
    message: ordersMessage,
  } = useSelector((state) => state.orders);
  const {
    logs,
    isLoading: logsLoading,
    isError: logsError,
    message: logsMessage,
  } = useSelector((state) => state.logs);
  const {
    coupons,
    isLoading: couponsLoading,
    isError: couponsError,
    message: couponsMessage,
  } = useSelector((state) => state.coupons);
  const { pagination: productPagination } = useSelector(
    (state) => state.products,
  );
  const { pagination: orderPagination } = useSelector((state) => state.orders);
  const { pagination: userPagination } = useSelector((state) => state.users);
  const { pagination: logPagination } = useSelector((state) => state.logs);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "inventory";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const setActiveTab = (tab) => {
    setSearchParams({ tab, page: 1 });
  };

  const setPage = (page) => {
    setSearchParams({ tab: activeTab, page });
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Product Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // User Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Confirm Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'product' or 'user' or 'coupon'

  // Coupon Modal States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Sorting Logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data) => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key.includes(".")) {
        const [obj, field] = sortConfig.key.split(".");
        aVal = a[obj]?.[field] ?? "";
        bVal = b[obj]?.[field] ?? "";
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const renderSortIcon = (column) => {
    if (sortConfig.key !== column)
      return (
        <ChevronDown
          size={12}
          className="ml-1 text-gray-300 opacity-50 inline"
        />
      );
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={12} className="ml-2 text-blue-600 inline" />
    ) : (
      <ChevronDown size={12} className="ml-2 text-blue-600 inline" />
    );
  };

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      if (activeTab === "inventory") {
        dispatch(fetchProducts({ page: currentPage, limit: 10 }));
      } else if (activeTab === "users" && user.role === "superadmin") {
        dispatch(fetchUsers({ page: currentPage, limit: 10 }));
      } else if (activeTab === "orders") {
        dispatch(getAllOrdersAdmin({ page: currentPage, limit: 10 }));
      } else if (activeTab === "logs" && user.role === "superadmin") {
        dispatch(fetchLogs({ page: currentPage, limit: 10 }));
      } else if (activeTab === "coupons") {
        dispatch(fetchCoupons({ page: currentPage, limit: 10 }));
      } else if (activeTab === "reservations") {
        dispatch(getInventoryLocks());
      }
    }
  }, [dispatch, user, activeTab, currentPage]);

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return null;
  }

  // Handle Products
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        await dispatch(
          updateProduct({ id: selectedProduct._id, productData: formData }),
        ).unwrap();
      } else {
        await dispatch(createProduct(formData)).unwrap();
      }
      setIsProductModalOpen(false);
    } catch (err) {
      alert(err || "Failed to save product");
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await dispatch(
        updateProduct({
          id: product._id,
          productData: { ...product, isFeatured: !product.isFeatured },
        }),
      ).unwrap();
    } catch (err) {
      alert(err || "Failed to update featured status");
    }
  };

  // Handle Users
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (userItem) => {
    setSelectedUser(userItem);
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (userData) => {
    if (selectedUser) {
      dispatch(
        updateUser({ id: selectedUser._id || selectedUser.id, userData }),
      );
    } else {
      dispatch(createUser(userData));
    }
    setIsUserModalOpen(false);
  };

  // Handle Coupons
  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsCouponModalOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setIsCouponModalOpen(true);
  };

  const handleCouponSubmit = async (formData) => {
    try {
      if (selectedCoupon) {
        await dispatch(
          updateCoupon({ id: selectedCoupon._id, couponData: formData }),
        ).unwrap();
      } else {
        await dispatch(createCoupon(formData)).unwrap();
      }
      setIsCouponModalOpen(false);
    } catch (err) {
      alert(err || "Failed to save coupon");
    }
  };

  // Handle Delete
  const handleDeleteRequest = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === "product") {
      dispatch(deleteProduct(itemToDelete));
    } else if (deleteType === "user") {
      dispatch(deleteUser(itemToDelete));
    } else if (deleteType === "coupon") {
      dispatch(deleteCoupon(itemToDelete));
    }
    setIsConfirmOpen(false);
  };

  // Handle Order Status Update — re-fetches products to reflect updated stock on delivery
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    if (newStatus === "delivered") {
      dispatch(fetchProducts({ page: currentPage, limit: 10 }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Shield className="mr-2 text-blue-600" /> Admin Control Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store inventory and access controls
          </p>
        </div>

        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-100">
          <button
            onClick={() => {
              setActiveTab("inventory");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center ${activeTab === "inventory" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Package size={16} className="mr-2" /> Inventory
          </button>
          <button
            onClick={() => {
              setActiveTab("orders");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center ${activeTab === "orders" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <ShoppingCart size={16} className="mr-2" /> Orders
          </button>
          {user.role === "superadmin" && (
            <button
              onClick={() => {
                setActiveTab("users");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center ${activeTab === "users" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <Users size={16} className="mr-2" /> Users
            </button>
          )}
          {user.role === "superadmin" && (
            <button
              onClick={() => {
                setActiveTab("logs");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center ${activeTab === "logs" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <Activity size={16} className="mr-2" /> Logs
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab("coupons");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center ${activeTab === "coupons" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Tag size={16} className="mr-2" /> Coupons
          </button>
          <button
            onClick={() => {
              setActiveTab("reservations");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center ${activeTab === "reservations" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Clock size={16} className="mr-2" /> Reservations
          </button>
          {user.role === "superadmin" && (
            <button
              onClick={() => {
                setActiveTab("analytics");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center ${activeTab === "analytics" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <ChartBar size={16} className="mr-2" /> Analytics
            </button>
          )}
        </div>
      </div>

      {activeTab === "inventory" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Product Management
            </h2>

            <div className="relative flex-1 max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                autoFocus
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Plus size={14} className="rotate-45" />
                </button>
              )}
            </div>

            <button
              onClick={handleAddProduct}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center transition whitespace-nowrap"
            >
              <Plus size={18} className="mr-1" /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th
                    onClick={() => handleSort("title")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Product {renderSortIcon("title")}
                  </th>
                  <th
                    onClick={() => handleSort("user.name")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    By {renderSortIcon("user.name")}
                  </th>
                  <th
                    onClick={() => handleSort("price")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Price {renderSortIcon("price")}
                  </th>
                  <th
                    onClick={() => handleSort("category")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Cat {renderSortIcon("category")}
                  </th>
                  <th
                    onClick={() => handleSort("stockCount")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Stock {renderSortIcon("stockCount")}
                  </th>
                  <th className="p-4 font-bold">Reserved</th>
                  <th className="p-4 font-bold text-right min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      Loading inventory...
                    </td>
                  </tr>
                ) : productsError ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-red-500 font-bold"
                    >
                      {productsMessage}
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const filtered = products.filter((p) => {
                      const search = searchTerm.toLowerCase();
                      return (
                        p.title.toLowerCase().includes(search) ||
                        p.category.toLowerCase().includes(search) ||
                        (p._id && p._id.toLowerCase().includes(search))
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-8 text-center text-gray-400 font-medium"
                          >
                            No products found matching "{searchTerm}"
                          </td>
                        </tr>
                      );
                    }

                    return sortData(filtered).map((product) => (
                      <tr
                        key={product._id}
                        className="hover:bg-gray-50/50 transition whitespace-nowrap"
                      >
                        <td className="p-4 flex items-center space-x-3">
                          <img
                            src={
                              product.images && product.images[0]
                                ? product.images[0]
                                : ""
                            }
                            alt=""
                            className="w-10 h-10 object-contain rounded border bg-white"
                          />
                          <span className="font-medium text-gray-800 text-sm max-w-[200px] truncate flex items-center gap-1">
                            {product.title}
                            {product.isFeatured && (
                              <Star
                                size={14}
                                className="text-yellow-400 fill-yellow-400 inline-block flex-shrink-0"
                              />
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">
                              {product.user?.name || "System"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {product.user?.email || ""}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-700">
                          ₹{(product.price || 0).toFixed(2)}
                        </td>
                        <td className="p-4 text-xs font-semibold text-gray-500 uppercase">
                          {product.category}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.stockCount > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {product.stockCount} Units
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.reservedCount > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
                          >
                            {product.reservedCount || 0} Locked
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleFeatured(product)}
                            className={`mr-3 p-1 rounded transition ${product.isFeatured ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" : "text-gray-300 hover:text-yellow-500 hover:bg-gray-50"}`}
                            title={
                              product.isFeatured
                                ? "Remove from Featured"
                                : "Mark as Featured"
                            }
                          >
                            <Star
                              size={18}
                              className={
                                product.isFeatured ? "fill-yellow-500" : ""
                              }
                            />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800 mr-3 p-1 hover:bg-blue-50 rounded transition"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(product._id, "product")
                            }
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={productPagination} onPageChange={setPage} />
        </div>
      ) : activeTab === "orders" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Order Management
            </h2>
            <div className="relative flex-1 max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders (ID, Customer)..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Plus size={14} className="rotate-45" />
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">
              Total Orders: {orders.length}
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th
                    onClick={() => handleSort("_id")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Order ID {renderSortIcon("_id")}
                  </th>
                  <th
                    onClick={() => handleSort("user.name")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Customer {renderSortIcon("user.name")}
                  </th>
                  <th className="p-4 font-bold">Items</th>
                  <th
                    onClick={() => handleSort("totalAmount")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Total {renderSortIcon("totalAmount")}
                  </th>
                  <th
                    onClick={() => handleSort("paymentStatus")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Status {renderSortIcon("paymentStatus")}
                  </th>
                  <th className="p-4 font-bold text-right min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordersLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : ordersError ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-red-500 font-bold"
                    >
                      {ordersMessage}
                    </td>
                  </tr>
                ) : orders && orders.length > 0 ? (
                  (() => {
                    const filtered = orders.filter((order) => {
                      const search = searchTerm.toLowerCase();
                      return (
                        (order.user?.name || "")
                          .toLowerCase()
                          .includes(search) ||
                        (order._id || "").toLowerCase().includes(search) ||
                        (order.paymentStatus || "")
                          .toLowerCase()
                          .includes(search) ||
                        (order.orderStatus || "").toLowerCase().includes(search)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-8 text-center text-gray-400 font-medium"
                          >
                            No orders found matching "{searchTerm}"
                          </td>
                        </tr>
                      );
                    }

                    return sortData(filtered).map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50/50 transition border-b border-gray-100 last:border-0"
                      >
                        <td className="p-4">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            #
                            {order._id
                              ? order._id.substring(order._id.length - 8)
                              : "..."}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">
                              {order.user?.name || "Unknown User"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium lowercase">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString()
                                : "Unknown Date"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex -space-x-2">
                            {order.items &&
                              order.items.slice(0, 3).map((item, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden z-[10]"
                                >
                                  {item.product?.images?.[0] ? (
                                    <img
                                      src={item.product.images[0]}
                                      alt=""
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                      <Package size={12} />
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-700 text-sm">
                          ₹
                          {order.totalAmount
                            ? order.totalAmount.toFixed(2)
                            : "0.00"}
                        </td>

                        {/* Payment Status Column */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase w-fit ${
                                order.paymentStatus === "completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                            <select
                              value={order.paymentStatus || "pending"}
                              onChange={(e) =>
                                dispatch(
                                  updatePaymentStatus({
                                    id: order._id,
                                    status: e.target.value,
                                  }),
                                )
                              }
                              className="bg-gray-50 border border-gray-200 rounded text-[10px] font-bold p-1 focus:border-blue-500 outline-none cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                        </td>

                        {/* Order Status Column */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase w-fit ${
                                order.orderStatus === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.orderStatus === "shipped"
                                    ? "bg-blue-100 text-blue-700"
                                    : order.orderStatus === "packed"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.orderStatus || "ordered"}
                            </span>
                            <select
                              value={order.orderStatus || "ordered"}
                              onChange={(e) =>
                                handleOrderStatusUpdate(
                                  order._id,
                                  e.target.value,
                                )
                              }
                              className="bg-gray-50 border border-gray-200 rounded text-[10px] font-bold p-1 focus:border-blue-500 outline-none cursor-pointer"
                            >
                              <option value="ordered">Ordered</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option
                                value="delivered"
                                disabled={order.paymentStatus !== "completed"}
                              >
                                Delivered{" "}
                                {order.paymentStatus !== "completed"
                                  ? "(Needs Payment)"
                                  : ""}
                              </option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={orderPagination} onPageChange={setPage} />
        </div>
      ) : activeTab === "users" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700">
              User & Access Management
            </h2>
            <div className="relative flex-1 max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Plus size={14} className="rotate-45" />
                </button>
              )}
            </div>
            <button
              onClick={handleAddUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center transition whitespace-nowrap"
            >
              <Plus size={18} className="mr-1" /> Create User
            </button>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th
                    onClick={() => handleSort("name")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    User {renderSortIcon("name")}
                  </th>
                  <th
                    onClick={() => handleSort("email")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Email {renderSortIcon("email")}
                  </th>
                  <th
                    onClick={() => handleSort("role")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Role {renderSortIcon("role")}
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Joined {renderSortIcon("createdAt")}
                  </th>
                  <th className="p-4 font-bold text-right min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : usersError ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-red-500">
                      {usersMessage}
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const filtered = users.filter((u) => {
                      const search = searchTerm.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(search) ||
                        u.email.toLowerCase().includes(search) ||
                        u.role.toLowerCase().includes(search)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-gray-400 font-medium"
                          >
                            No users found matching "{searchTerm}"
                          </td>
                        </tr>
                      );
                    }

                    return sortData(filtered).map((userItem) => (
                      <tr
                        key={userItem._id}
                        className="hover:bg-gray-50/50 transition whitespace-nowrap"
                      >
                        <td className="p-4 font-medium text-gray-800 text-sm">
                          {userItem.name}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {userItem.email}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              userItem.role === "superadmin"
                                ? "bg-purple-100 text-purple-700"
                                : userItem.role === "admin"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {userItem.role}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500 font-medium">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleEditUser(userItem)}
                            className="text-blue-600 hover:text-blue-800 mr-3 p-1 hover:bg-blue-50 rounded transition"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(
                                userItem._id || userItem.id,
                                "user",
                              )
                            }
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={userPagination} onPageChange={setPage} />
        </div>
      ) : activeTab === "logs" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700">
              System Activity Logs
            </h2>
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                onChange={(e) => {
                  if (e.target.value) {
                    dispatch(
                      fetchLogs({ page: 1, limit: 10, action: e.target.value }),
                    );
                  } else {
                    dispatch(fetchLogs({ page: 1, limit: 10 }));
                  }
                }}
              >
                <option value="">All Activities</option>
                <option value="USER_LOGIN">User Login</option>
                <option value="Product Viewed">Product Viewed</option>
                <option value="Cart Updated">Cart Updated</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Coupon Applied">Coupon Applied</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th
                    onClick={() => handleSort("status")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Status {renderSortIcon("status")}
                  </th>
                  <th
                    onClick={() => handleSort("action")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Action {renderSortIcon("action")}
                  </th>
                  <th
                    onClick={() => handleSort("user.name")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Account {renderSortIcon("user.name")}
                  </th>
                  <th
                    onClick={() => handleSort("method")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Method {renderSortIcon("method")}
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Date {renderSortIcon("createdAt")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logsLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      Loading activity logs...
                    </td>
                  </tr>
                ) : logsError ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-red-500">
                      {logsMessage}
                    </td>
                  </tr>
                ) : logs && logs.length > 0 ? (
                  (() => {
                    const filtered = logs.filter((log) => {
                      const search = searchTerm.toLowerCase();
                      return (
                        log.action.toLowerCase().includes(search) ||
                        log.description.toLowerCase().includes(search) ||
                        (log.user?.name || "").toLowerCase().includes(search)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-gray-400 font-medium"
                          >
                            No logs found matching "{searchTerm}"
                          </td>
                        </tr>
                      );
                    }

                    return sortData(filtered).map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-gray-50/50 transition whitespace-nowrap group"
                      >
                        <td className="p-4">
                          <div className="flex items-center">
                            {log.status === "error" ? (
                              <div className="bg-red-100 text-red-600 p-1.5 rounded-full mr-2">
                                <AlertTriangle size={14} />
                              </div>
                            ) : log.status === "success" ? (
                              <div className="bg-green-100 text-green-600 p-1.5 rounded-full mr-2">
                                <CheckCircle size={14} />
                              </div>
                            ) : (
                              <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full mr-2">
                                <Info size={14} />
                              </div>
                            )}
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                log.status === "error"
                                  ? "text-red-700"
                                  : log.status === "success"
                                    ? "text-green-700"
                                    : "text-blue-700"
                              }`}
                            >
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">
                              {log.action}
                            </span>
                            {(() => {
                              const colonIdx = log.description.indexOf(': ');
                              if (colonIdx !== -1) {
                                return (
                                  <>
                                    <span className="text-[10px] text-gray-400">
                                      {log.description.slice(0, colonIdx + 1)}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-medium max-w-[200px] truncate">
                                      {log.description.slice(colonIdx + 2)}
                                    </span>
                                  </>
                                );
                              }
                              return (
                                <span className="text-[10px] text-gray-500 max-w-[200px] truncate">
                                  {log.description}
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center mr-2 text-gray-400 border border-gray-200">
                              <UserIcon size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-700">
                                {log.user?.name || "Anonymous"}
                              </span>
                              <span className="text-[9px] text-gray-400">
                                {log.ipAddress || "No IP recorded"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="bg-gray-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded w-fit">
                              {log.method}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
                              {log.endpoint}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-[10px] font-bold text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ));
                  })()
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center">
                        <Server size={32} className="text-gray-200 mb-2" />
                        <span className="text-gray-400 font-medium">
                          No logs recorded yet.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={logPagination} onPageChange={setPage} />
        </div>
      ) : activeTab === "coupons" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Coupon Management
            </h2>
            <div className="relative flex-1 max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search coupons (code, type)..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Plus size={14} className="rotate-45" />
                </button>
              )}
            </div>
            <button
              onClick={handleAddCoupon}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center transition whitespace-nowrap"
            >
              <Plus size={18} className="mr-1" /> Add Coupon
            </button>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th
                    onClick={() => handleSort("code")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Code {renderSortIcon("code")}
                  </th>
                  <th
                    onClick={() => handleSort("discountType")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Type {renderSortIcon("discountType")}
                  </th>
                  <th
                    onClick={() => handleSort("discountValue")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Value {renderSortIcon("discountValue")}
                  </th>
                  <th
                    onClick={() => handleSort("usageLimit")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Usage {renderSortIcon("usageLimit")}
                  </th>
                  <th
                    onClick={() => handleSort("expiryDate")}
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition"
                  >
                    Expires {renderSortIcon("expiryDate")}
                  </th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {couponsLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      Loading coupons...
                    </td>
                  </tr>
                ) : couponsError ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-red-500">
                      {couponsMessage}
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const filtered = coupons.filter((c) => {
                      const search = searchTerm.toLowerCase();
                      return (
                        c.code.toLowerCase().includes(search) ||
                        c.discountType.toLowerCase().includes(search) ||
                        (c._id && c._id.toLowerCase().includes(search))
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-8 text-center text-gray-400 font-medium"
                          >
                            No coupons found matching "{searchTerm}"
                          </td>
                        </tr>
                      );
                    }

                    return sortData(filtered).map((coupon) => (
                      <tr
                        key={coupon._id}
                        className="hover:bg-gray-50/50 transition whitespace-nowrap"
                      >
                        <td className="p-4 font-bold text-gray-800 text-sm">
                          {coupon.code}
                        </td>
                        <td className="p-4 text-sm text-gray-600 capitalize">
                          {coupon.discountType}
                        </td>
                        <td className="p-4 font-bold text-gray-700">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue.toFixed(2)}`}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {coupon.usedCount || 0} /{" "}
                          {!coupon.usageLimit ? "Unlimited" : coupon.usageLimit}
                        </td>
                        <td className="p-4 text-xs text-gray-500 font-medium">
                          {coupon.expiryDate
                            ? new Date(coupon.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleEditCoupon(coupon)}
                            className="text-blue-600 hover:text-blue-800 mr-3 p-1 hover:bg-blue-50 rounded transition"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(coupon._id, "coupon")
                            }
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "reservations" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Active Inventory Reservations
            </h2>
            <div className="text-xs text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 italic">
              Auto-releases after 15 minutes
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Product</th>
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Quantity</th>
                  <th className="p-4 font-bold font-bold">Value</th>
                  <th className="p-4 font-bold">Expires At</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordersLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      Loading reservations...
                    </td>
                  </tr>
                ) : ordersError ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-red-500 font-bold"
                    >
                      {ordersMessage}
                    </td>
                  </tr>
                ) : locks && locks.length > 0 ? (
                  locks.map((lock) => (
                    <tr
                      key={lock._id}
                      className="hover:bg-gray-50/50 transition whitespace-nowrap"
                    >
                      <td className="p-4 flex items-center space-x-3">
                        <img
                          src={lock.product?.images?.[0] || ""}
                          alt=""
                          className="w-10 h-10 object-contain rounded border bg-white"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 text-sm max-w-[200px] truncate">
                            {lock.product?.title || "Unknown Product"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {lock.product?._id}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700">
                            {lock.user?.name || "Anonymous"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {lock.user?.email || ""}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                         <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 shadow-sm">
                           {lock.quantity} Units
                         </span>
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                        ₹{((lock.product?.price || 0) * lock.quantity).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-xs text-gray-600 font-medium">
                          <Clock size={12} className="mr-1.5 text-blue-500" />
                          {new Date(lock.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        {new Date(lock.expiresAt) > new Date() ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 italic shadow-sm opacity-70">
                            Expired
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-gray-400 font-medium italic"
                    >
                      No active reservations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "analytics" && user.role === "superadmin" ? (
        <SearchAnalytics />
      ) : null}

      {/* Modals */}
      {isProductModalOpen && (
        <ProductModal
          key={selectedProduct?._id || "new-product"}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSubmit={handleProductSubmit}
          product={selectedProduct}
          title={selectedProduct ? "Edit Product" : "Add New Product"}
        />
      )}

      {isUserModalOpen && (
        <UserModal
          key={selectedUser?._id || "new-user"}
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSubmit={handleUserSubmit}
          userItem={selectedUser}
          title={selectedUser ? "Edit User Role" : "Create New User"}
        />
      )}

      {isCouponModalOpen && (
        <CouponModal
          key={selectedCoupon?._id || "new-coupon"}
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          onSave={handleCouponSubmit}
          coupon={selectedCoupon}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to remove this ${deleteType}? This action cannot be undone.`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default AdminDashboard;
