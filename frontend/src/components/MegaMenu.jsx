import { Link } from "react-router-dom";
import {
  ChevronDown,
  Smartphone,
  Laptop,
  Shirt,
  ChefHat,
  Armchair,
  Tv,
  Gamepad,
  ShoppingBasket,
} from "lucide-react";

const categories = [
  { name: "Mobiles", icon: Smartphone },
  { name: "Electronics", icon: Laptop },
  { name: "Fashion", icon: Shirt },
  { name: "Home", icon: ChefHat },
  { name: "Appliances", icon: Tv },
  { name: "Furniture", icon: Armchair },
  { name: "Toys", icon: Gamepad },
  { name: "Grocery", icon: ShoppingBasket },
];

const MegaMenu = () => {
  return (
    <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-gray-100/80 sticky top-[72px] z-40 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Horizontal Scrollable Container */}
        <div className="flex items-center md:justify-center py-4 overflow-x-auto gap-6 sm:gap-10 md:gap-14 no-scrollbar scroll-smooth">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="flex items-center flex-col min-w-[70px] shrink-0 group cursor-pointer relative"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 shadow-sm border border-gray-100 group-hover:border-blue-100 group-hover:shadow-md">
                  <Icon size={22} className="stroke-[1.5]" />
                </div>
                <span className="mt-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-gray-500 group-hover:text-blue-600 transition-colors flex items-center whitespace-nowrap">
                  {category.name}{" "}
                  <ChevronDown
                    size={10}
                    className="ml-1 opacity-50 group-hover:rotate-180 transition-transform"
                  />
                </span>

                {/* Active Indicator Glow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-1 bg-blue-600 rounded-full group-hover:w-full transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              </Link>
            );
          })}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
};

export default MegaMenu;
