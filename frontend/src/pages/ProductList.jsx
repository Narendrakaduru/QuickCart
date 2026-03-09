import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchProducts } from "../slices/productSlice";
import ProductCard from "../components/ProductCard";

const ProductList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  const featuredParam = searchParams.get("featured");

  const { products, isLoading, isError, message } = useSelector(
    (state) => state.products,
  );

  // Filter States
  const [priceRange, setPriceRange] = useState(200000);
  const [sortBy, setSortBy] = useState("Relevance");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ keyword: searchParam }));
  }, [dispatch, searchParam]);

  // Extract unique categories from products
  const categories = products
    ? [...new Set(products.map((p) => p.category))]
    : [];

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Derive filtered and sorted products
  const filteredProducts = products
    ? products
        .filter((p) => {
          // Apply category filter from URL if present
          if (categoryParam) {
            const searchCategories = categoryParam
              .split(",")
              .map((s) => s.trim().toLowerCase());
            const productCategory = p.category.toLowerCase();

            if (
              !searchCategories.includes(productCategory) &&
              productCategory !== categoryParam.toLowerCase()
            ) {
              return false;
            }
          }

          // Apply featured filter from URL if present
          if (featuredParam === "true" && !p.isFeatured) {
            return false;
          }

          // Apply dynamic category filters
          if (
            selectedCategories.length > 0 &&
            !selectedCategories.includes(p.category)
          ) {
            return false;
          }

          // Apply price filter
          if (p.price > priceRange) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (sortBy === "Price -- Low to High") return a.price - b.price;
          if (sortBy === "Price -- High to Low") return b.price - a.price;
          if (sortBy === "Newest First")
            return new Date(b.createdAt) - new Date(a.createdAt);
          return 0; // Relevance (Default)
        })
    : [];

  return (
    <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row gap-4">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 bg-white shadow-sm rounded-sm p-4 hidden md:block self-start shrink-0">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4">Filters</h2>

        {/* Price Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase text-xs tracking-wider">
            Price
          </h3>
          <input
            type="range"
            min="0"
            max="200000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹0</span>
            <span>Up to ₹{priceRange}</span>
          </div>
        </div>

        {/* Categories (Dynamic) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase text-xs tracking-wider">
            Categories
          </h3>
          <div className="space-y-2 text-sm">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                <span className="group-hover:text-blue-600 transition-colors uppercase text-[11px] font-medium tracking-tight">
                  {category}
                </span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-gray-400 italic">
                No categories found
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-white shadow-sm rounded-sm p-4">
        <div className="border-b pb-3 mb-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {searchParam ? (
              <>
                Search results for "
                <span className="text-blue-600">{searchParam}</span>"
              </>
            ) : categoryParam ? (
              `${categoryParam} Products`
            ) : featuredParam === "true" ? (
              "Featured Products"
            ) : (
              "All Products"
            )}
            <span className="text-sm text-gray-500 font-normal ml-2">
              (Showing {filteredProducts.length} results)
            </span>
          </h1>

          <div className="hidden sm:flex items-center space-x-2 text-sm font-medium text-gray-600">
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-none bg-transparent focus:outline-none cursor-pointer hover:text-blue-600 font-bold"
            >
              <option>Relevance</option>
              <option>Price -- Low to High</option>
              <option>Price -- High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center py-8">{message}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <img
              src="https://via.placeholder.com/150?text=No+Items"
              alt="No items"
              className="mx-auto mb-4 opacity-50"
            />
            <h3 className="text-lg font-medium text-gray-700">
              Sorry, no products found!
            </h3>
            <p className="text-gray-500 mt-2">
              Please check the spelling or try searching for something else
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
