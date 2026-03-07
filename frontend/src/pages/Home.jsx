import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../slices/productSlice";
import ProductCard from "../components/ProductCard";
import BannerCarousel from "../components/BannerCarousel";
import { ChevronRight } from "lucide-react";

const ProductSection = ({ title, filter, products, category }) => {
  const navigate = useNavigate();
  const filteredProducts = products.filter(filter).slice(0, 4);
  
  if (filteredProducts.length === 0) return null;

  const handleViewAll = () => {
    if (category) {
      navigate(`/products?category=${category}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="bg-white p-6 md:p-8 shadow-sm rounded-3xl border border-gray-100 flex flex-col">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 relative z-10">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center">
          {title}
          <div className="ml-4 w-2 h-2 bg-blue-600 rounded-full hidden md:block"></div>
        </h2>
        <button 
          onClick={handleViewAll}
          className="flex items-center text-[10px] md:text-xs font-black text-white bg-blue-600 px-5 py-2 md:py-2.5 rounded-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] shadow-lg shadow-blue-200 group"
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
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse bg-gray-200 h-64 w-full rounded-3xl mb-12"></div>

          <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-gray-900">
            Loading Offers
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
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-black uppercase tracking-widest shadow-sm border border-red-100 flex flex-col items-center">
          <span className="text-3xl mb-2">Oops!</span>
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

        {/* Dynamic Sections */}
        <ProductSection 
          title="Trending Now" 
          filter={() => true} 
          products={[...products].sort((a, b) => b.rating - a.rating)} 
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
      </div>
    </div>
  );
};

export default Home;
