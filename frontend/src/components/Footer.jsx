import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0a192f] text-gray-300 pt-16 pb-8 border-t border-white/5 mt-auto">
      <div className="container mx-auto px-4">
        {/* Top Section: Branding & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="text-2xl font-bold italic tracking-tight flex items-center text-white mb-6"
            >
              Quick<span className="text-blue-400">Cart</span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              Experience the future of shopping with QuickCart. We bring the
              world's finest products to your doorstep with speed and
              reliability.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 group"
                >
                  <Icon
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">
              Stay Updated
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>
            <form className="relative group">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder:text-gray-500"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center group/btn">
                <Send
                  size={18}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </button>
            </form>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 border-t border-white/5 pt-16">
          <div>
            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
              Company
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Press & Media
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  QuickCart Stories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
              Customer Care
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/help"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Track Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
              Policy
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  to="/ethics"
                  className="hover:text-blue-400 transition-colors inline-block"
                >
                  Ethics
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
              Contact
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-400 shrink-0" />
                <span>Begonia Tech Village, ORR, Bengaluru, 560103</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-400 shrink-0" />
                <span>support@quickcart.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-400 shrink-0" />
                <span>+91 800-QUICK-CART</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium text-gray-500 tracking-wider">
          <p className="uppercase">
            &copy; {new Date().getFullYear()} QUICKCART INTERNET PRIVATE
            LIMITED. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                className="h-4"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal"
                className="h-4"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
