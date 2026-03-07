import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
} from "../slices/orderSlice";
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
  Clock,
  Search,
} from "lucide-react";
import ProductModal from "../components/ProductModal";
import UserModal from "../components/UserModal";
import ConfirmModal from "../components/ConfirmModal";

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
    isLoading: ordersLoading,
    isError: ordersError,
    message: ordersMessage,
  } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");

  // Product Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // User Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Confirm Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'product' or 'user'

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      if (activeTab === "inventory") {
        dispatch(fetchProducts({}));
      } else if (activeTab === "users" && user.role === "superadmin") {
        dispatch(fetchUsers());
      } else if (activeTab === "orders") {
        dispatch(getAllOrdersAdmin());
      }
    }
  }, [dispatch, user, activeTab]);

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
    }
    setIsConfirmOpen(false);
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
        </div>
      </div>

      {activeTab === "inventory" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Product</th>
                  <th className="p-4 font-bold">Created By</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold text-right">Actions</th>
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

                    return filtered.map((product) => (
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
                        <span className="font-medium text-gray-800 text-sm max-w-[200px] truncate">
                          {product.title}
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
                      <td className="p-4 text-right">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Items</th>
                  <th className="p-4 font-bold">Total</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
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
                        (order.user?.name || "").toLowerCase().includes(search) ||
                        (order._id || "").toLowerCase().includes(search) ||
                        (order.paymentStatus || "").toLowerCase().includes(search) ||
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

                    return filtered.map((order) => (
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
                              ? new Date(order.createdAt).toLocaleDateString()
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
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase w-fit ${
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
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase w-fit ${
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
                              dispatch(
                                updateOrderStatus({
                                  id: order._id,
                                  status: e.target.value,
                                }),
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
        </div>
      ) : (
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Joined</th>
                  <th className="p-4 font-bold text-right">Actions</th>
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

                    return filtered.map((userItem) => (
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
        </div>
      )}

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
