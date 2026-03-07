import { useState } from "react";
import {
  X,
  Upload,
  Loader,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  ChevronDown,
  Smartphone,
  Laptop,
  Shirt,
  ChefHat,
  Tv,
  Armchair,
  Gamepad,
  ShoppingBasket,
  Sparkles,
  Settings,
  ListChecks,
} from "lucide-react";
import axios from "axios";

const CATEGORIES = [
  { name: "Mobiles", icon: Smartphone },
  { name: "Electronics", icon: Laptop },
  { name: "Fashion", icon: Shirt },
  { name: "Home", icon: ChefHat },
  { name: "Appliances", icon: Tv },
  { name: "Furniture", icon: Armchair },
  { name: "Toys", icon: Gamepad },
  { name: "Grocery", icon: ShoppingBasket },
];

const ProductModal = ({ onClose, onSubmit, product, title: modalTitle }) => {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    brand: product?.brand || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    stockCount: product?.stockCount || 0,
    images: product?.images || [],
    discountPercentage: product?.discountPercentage || 0,
    highlights: product?.highlights?.length ? product.highlights : [""],
    specifications: product?.specifications?.length
      ? product.specifications
      : [{ key: "", value: "" }],
    isFeatured: !!product?.isFeatured,
    isActive: product?.isActive !== undefined ? product.isActive : true,
  });

  const [activeTab, setActiveTab] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" ||
              name === "stockCount" ||
              name === "discountPercentage"
            ? Number(value)
            : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileFormData = new FormData();
    fileFormData.append("image", file);

    setUploading(true);
    setUploadError("");

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post("/api/upload", fileFormData, config);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.data],
      }));
      setUploading(false);
    } catch (error) {
      setUploadError(error.response?.data?.error || "Upload failed");
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData((prev) => ({ ...prev, highlights: newHighlights }));
  };

  const addHighlight = () => {
    setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, ""] }));
  };

  const removeHighlight = (index) => {
    if (formData.highlights.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const removeSpec = (index) => {
    if (formData.specifications.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitInternal = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      highlights: formData.highlights.filter((h) => h && h.trim()),
      specifications: formData.specifications.filter(
        (s) => s.key && s.key.trim() && s.value && s.value.trim(),
      ),
    };
    onSubmit(submissionData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">
                {modalTitle}
              </h2>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                Product Management Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex px-8 pt-6 border-b border-gray-100 bg-white gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: "general", label: "General Info", icon: Settings },
            { id: "features", label: "Highlights & Specs", icon: ListChecks },
            {
              id: "inventory",
              label: "Pricing & Availability",
              icon: ShoppingBasket,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full animate-in slide-in-from-bottom-1" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmitInternal}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-[#fafbfc]"
        >
          {activeTab === "general" && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-400 font-bold text-sm text-gray-800 transition-all placeholder:text-gray-300"
                    placeholder="e.g. iPhone 15 Pro Max"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-400 font-bold text-sm text-gray-800 transition-all placeholder:text-gray-300"
                    placeholder="e.g. Apple"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-400 font-bold text-sm text-gray-800 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-400 font-bold text-sm text-gray-800 transition-all placeholder:text-gray-300 resize-none"
                  placeholder="Tell customers about your amazing product..."
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                  Product Media (Max 5)
                </label>
                <div className="grid grid-cols-5 gap-4">
                  {formData.images.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <label className="aspect-square bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 group transition-all">
                      {uploading ? (
                        <Loader
                          className="text-blue-600 animate-spin"
                          size={24}
                        />
                      ) : (
                        <>
                          <Upload
                            className="text-gray-300 group-hover:text-blue-500 mb-1"
                            size={20}
                          />
                          <span className="text-[9px] font-black text-gray-400 group-hover:text-blue-600 uppercase">
                            Add Image
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
                {uploadError && (
                  <p className="text-[10px] text-red-500 mt-2 font-bold animate-pulse italic">
                    # {uploadError}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" /> Key
                    Highlights
                  </h3>
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} /> Add Point
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2 group">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) =>
                          handleHighlightChange(index, e.target.value)
                        }
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-gray-700 transition-all"
                        placeholder="Feature point..."
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="p-3 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
                    <Settings size={16} className="text-blue-600" />{" "}
                    Specifications
                  </h3>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 gap-3 group items-center relative pr-10"
                    >
                      <input
                        type="text"
                        placeholder="Attribute (e.g. RAM)"
                        value={spec.key}
                        onChange={(e) =>
                          handleSpecChange(index, "key", e.target.value)
                        }
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-gray-700 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 16GB)"
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecChange(index, "value", e.target.value)
                        }
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-gray-700 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(index)}
                        className="absolute right-2 p-1 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-400 font-black text-lg text-blue-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-400 font-black text-lg text-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] ml-1">
                    Stock Level
                  </label>
                  <input
                    type="number"
                    name="stockCount"
                    value={formData.stockCount}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none focus:border-blue-400 font-black text-lg text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <label className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-3xl cursor-pointer hover:border-blue-200 transition-all group">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isFeatured ? "bg-blue-600 border-blue-600" : "border-gray-200 group-hover:border-blue-400"}`}
                  >
                    {formData.isFeatured && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <span className="block text-sm font-black text-gray-800 uppercase italic leading-none">
                      Featured Item
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Pin to Home Highlights
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-3xl cursor-pointer hover:border-blue-200 transition-all group">
                  <div
                    className={`w-10 h-5 rounded-full relative transition-all ${formData.isActive ? "bg-green-500" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isActive ? "left-6" : "left-1"}`}
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-gray-800 uppercase italic leading-none">
                      Publish Status
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {formData.isActive
                        ? "Visible to customers"
                        : "Hidden from store"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white flex justify-between items-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
            Ensure all *required fields are completed
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-500 font-black uppercase text-xs tracking-widest hover:bg-gray-100 rounded-2xl transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSubmitInternal}
              disabled={uploading}
              className={`px-10 py-3 bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center gap-2 group ${
                uploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200"
              }`}
            >
              {product ? "Synchronize Updates" : "Publish Product"}
              <CheckCircle
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
