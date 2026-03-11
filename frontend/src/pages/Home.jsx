import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchRecommendations } from "../slices/productSlice";
import ProductCard from "../components/ProductCard";
import BannerCarousel from "../components/BannerCarousel";
import RecentlyViewed from "../components/RecentlyViewed";
import { ChevronRight, Star, TrendingUp, Zap } from "lucide-react";

// Category color palette for recommendation badges
const CATEGORY_COLORS = {
  Mobiles: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
    dot: "bg-violet-500",
  },
  Electronics: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    dot: "bg-blue-500",
  },
  Fashion: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-100",
    dot: "bg-pink-500",
  },
  Home: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    dot: "bg-amber-500",
  },
  Furniture: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
    dot: "bg-orange-500",
  },
  Appliances: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-100",
    dot: "bg-teal-500",
  },
  default: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-100",
    dot: "bg-gray-500",
  },
};

// Trending Recommendations Section — powered by Elasticsearch
const TrendingByCategory = ({ recommendations, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="bg-white p-6 md:p-8 shadow-sm rounded-3xl border border-gray-100">
        <div className="flex items-center mb-8 border-b border-gray-100 pb-4">
          <div className="animate-pulse bg-gray-200 h-6 w-64 rounded-full" />
        </div>
        <div className="space-y-10">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="animate-pulse bg-gray-100 h-5 w-40 rounded-full mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="animate-pulse bg-gray-50 h-72 rounded-3xl"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="bg-white p-6 md:p-8 shadow-sm rounded-3xl border border-gray-100 flex flex-col">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 relative z-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center">
          <TrendingUp className="mr-2 text-blue-600" size={24} />
          Trending by Category
          <span className="ml-3 inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
            <Zap size={9} className="fill-blue-600" /> AI Picks
          </span>
        </h2>
      </div>

      <div className="space-y-12">
        {recommendations.map(({ category, products }) => {
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
          const displayProducts = products.slice(0, 4);
          if (displayProducts.length === 0) return null;

          return (
            <div key={category} className="flex flex-col">
              {/* Category Sub-Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}
                    />
                    {category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold hidden sm:block">
                    Top {displayProducts.length} picks
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/products?category=${category}`)}
                  className="flex items-center text-[10px] font-bold text-gray-500 hover:text-blue-600 transition-colors group"
                >
                  View All
                  <ChevronRight
                    size={13}
                    className="ml-0.5 group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      ...product,
                      images: product.images || [],
                      rating: product.rating || 0,
                      numReviews: product.numReviews || 0,
                      discountPercentage: product.discountPercentage || 0,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const ProductSection = ({ title, icon: Icon, filter, products, category }) => {
  const navigate = useNavigate();
  const filteredProducts = products.filter(filter).slice(0, 4);

  if (filteredProducts.length === 0) return null;

  const handleViewAll = () => {
    if (category) {
      navigate(`/products?category=${category}`);
    } else if (title === "Featured Highlights") {
      navigate("/products?featured=true");
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="bg-white p-6 md:p-8 shadow-sm rounded-3xl border border-gray-100 flex flex-col">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 relative z-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center">
          {Icon && <Icon className="mr-2 text-blue-600" size={24} />}
          {title}
          <div className="ml-3 w-1.5 h-1.5 bg-blue-600 rounded-full hidden md:block"></div>
        </h2>
        <button
          onClick={handleViewAll}
          className="flex items-center text-[10px] md:text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-all uppercase tracking-wider shadow-md shadow-blue-100 group"
        >
          View All{" "}
          <ChevronRight
            size={16}
            className="ml-1 group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const {
    products,
    isLoading,
    isError,
    message,
    recommendations,
    recommendationsLoading,
  } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
    dispatch(fetchRecommendations());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse bg-gray-200 h-64 w-full rounded-3xl mb-12"></div>

          <h2 className="text-xl font-bold mb-6 uppercase tracking-tight text-gray-900">
            Scanning Offers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white p-4 h-80 rounded-3xl shadow-sm flex flex-col"
              >
                <div className="bg-gray-200 h-40 w-full mb-6 rounded-2xl"></div>
                <div className="bg-gray-200 h-4 w-3/4 mb-3 rounded-full"></div>
                <div className="bg-gray-200 h-4 w-1/2 mb-auto rounded-full"></div>
                <div className="bg-gray-200 h-8 w-full mt-4 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-bold uppercase tracking-widest shadow-sm border border-red-100 flex flex-col items-center">
          <span className="text-2xl mb-2">Oops!</span>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-12 pt-6">
        {/* Banner Carousel */}
        <div className="group rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50">
          <BannerCarousel />
        </div>

        {/* Featured Highlights */}
        <ProductSection
          title="Featured Highlights"
          icon={Star}
          filter={(p) => p.isFeatured}
          products={products}
        />

        {/* AI-Powered Trending Recommendations */}
        <TrendingByCategory
          recommendations={recommendations}
          isLoading={recommendationsLoading}
        />

        <ProductSection
          title="Smartphones & Gadgets"
          filter={(p) => p.category === "Mobiles"}
          products={products}
          category="Mobiles"
        />

        <ProductSection
          title="Top Electronics"
          filter={(p) => p.category === "Electronics"}
          products={products}
          category="Electronics"
        />

        <ProductSection
          title="Fashion Styles"
          filter={(p) => p.category === "Fashion"}
          products={products}
          category="Fashion"
        />

        <ProductSection
          title="Home & Comfort"
          filter={(p) => p.category === "Home" || p.category === "Furniture"}
          products={products}
          category="Home,Furniture"
        />

        <ProductSection
          title="Kitchen & Appliances"
          filter={(p) => p.category === "Appliances"}
          products={products}
          category="Appliances"
        />
        
        {/* Recently Viewed */}
        <div className="pt-8">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
};

export default Home;
