import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSimilarProducts } from "../slices/productSlice";
import ProductCard from "./ProductCard";
import { Sparkles } from "lucide-react";

const SimilarProducts = ({ productId }) => {
  const dispatch = useDispatch();
  const { similarProducts, similarLoading } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (productId) {
      dispatch(fetchSimilarProducts(productId));
    }
  }, [dispatch, productId]);

  if (similarLoading) {
    return (
      <section className="py-12 bg-gray-50/50 mt-12 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse bg-gray-200 h-8 w-64 rounded-full mb-8"></div>
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="min-w-[260px] sm:min-w-0 flex-shrink-0 animate-pulse bg-white h-72 rounded-3xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!similarProducts || similarProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50/50 mt-12 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Similar Products
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              You might also like these recommendations
            </p>
          </div>
        </div>

        {/* Horizontal scroll on mobile, Grid on desktop */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 custom-scrollbar hide-scroll-mobile">
          {similarProducts.map((product) => (
            <div
              key={product._id}
              className="min-w-[260px] sm:min-w-0 flex-shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;
