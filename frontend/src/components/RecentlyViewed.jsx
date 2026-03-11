import { useSelector } from "react-redux";
import ProductCard from "./ProductCard";
import { Clock } from "lucide-react";

const RecentlyViewed = () => {
  const { recentlyViewed } = useSelector((state) => state.users);

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50/50 mt-12 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Recently Viewed
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Pick up right where you left off
            </p>
          </div>
        </div>

        {/* Horizontal scroll on mobile, Grid on desktop */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 custom-scrollbar hide-scroll-mobile">
          {recentlyViewed.map((product) => (
            <div key={product._id} className="min-w-[260px] sm:min-w-0 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
