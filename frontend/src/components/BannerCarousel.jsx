import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const banners = [
  {
    id: 1,
    type: "gradient",
    bg: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900",
    title: "Huge Electronics Sale",
    subtitle: "Up to 50% Off on Smartphones & Laptops",
    cta: "Grab Deals",
    tag: "Big Billion Days",
    link: "/products?category=Electronics",
  },
  {
    id: 2,
    type: "gradient",
    bg: "bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600",
    title: "Fashion New Arrivals",
    subtitle: "Step into the New Season with Style",
    cta: "Explore Now",
    tag: "Trending Now",
    link: "/products?category=Fashion",
  },
  {
    id: 3,
    type: "gradient",
    bg: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700",
    title: "Home Makeover Event",
    subtitle: "Furniture & Decor starting at ₹999",
    cta: "Shop Collection",
    tag: "Limited Time",
    link: "/products?category=Furniture",
  },
];

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent(current === banners.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? banners.length - 1 : current - 1);
  };

  return (
    <div className="relative w-full h-[260px] md:h-[340px] overflow-hidden group rounded-[2rem] shadow-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <div
              className={`w-full h-full ${banner.bg} flex items-center px-10 md:px-24 text-white relative overflow-hidden`}
            >
              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 mix-blend-overlay"></div>
              <div
                className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-white/20 rounded-full blur-2xl mix-blend-overlay animate-bounce"
                style={{ animationDuration: "4s" }}
              ></div>

              {/* Content */}
              <div className="relative z-10 max-w-2xl transform transition-all duration-700 translate-y-0 opacity-100">
                {banner.tag && (
                  <div className="mb-6 inline-block">
                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-lg shadow-lg">
                      {banner.tag}
                    </span>
                  </div>
                )}

                <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight leading-none drop-shadow-xl flex flex-col">
                  {banner.title.split(" ").map((word, i) => (
                    <span
                      key={i}
                      className={i === 0 ? "text-white/90" : "text-white"}
                    >
                      {word}{" "}
                    </span>
                  ))}
                </h2>

                <p className="text-sm md:text-base text-white/90 mb-6 font-medium tracking-wide drop-shadow-md border-l-3 border-white/50 pl-4 py-0.5">
                  {banner.subtitle}
                </p>

                <Link
                  to={banner.link}
                  className="group/btn bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold text-[11px] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 uppercase tracking-widest flex items-center w-fit"
                >
                  {banner.cta}
                  <ArrowRight
                    size={14}
                    strokeWidth={3}
                    className="ml-2 group-hover/btn:translate-x-1 transition-transform text-blue-600"
                  />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/30 text-white hover:text-gray-900"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-md p-3 rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/30 text-white hover:text-gray-900"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 overflow-hidden ${
              current === i
                ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          >
            {current === i && (
              <div className="w-full h-full bg-white animate-[pulse_2s_ease-in-out_infinite]"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
