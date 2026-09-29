import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-[#16161A] text-white mt-20 self-stretch border-t-4 border-[#FF4B12]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">

        <div>
          <h2 className="text-4xl font-[Bebas_Neue] tracking-wide mb-4">
            SOLD <span className="text-[#FF4B12]">OUTS</span>
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm max-w-xs">
            Discover premium fashion with modern trends, trusted brands, and exclusive deals.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-[JetBrains_Mono] tracking-[0.2em] uppercase text-slate-500 mb-5">Shop</h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">Shirts</li>
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">Jeans</li>
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">Hoodies</li>
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">Accessories</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-[JetBrains_Mono] tracking-[0.2em] uppercase text-slate-500 mb-5">Support</h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">Contact Us</li>
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">Privacy Policy</li>
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">Return Policy</li>
            <li className="hover:text-[#FF4B12] transition-colors cursor-pointer w-fit">FAQs</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-[JetBrains_Mono] tracking-[0.2em] uppercase text-slate-500 mb-5">Follow Us</h3>
          <div className="flex gap-3 text-lg">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#FF4B12] hover:border-[#FF4B12] transition-colors">
              <FaFacebookF />
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#FF4B12] hover:border-[#FF4B12] transition-colors">
              <FaInstagram />
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#FF4B12] hover:border-[#FF4B12] transition-colors">
              <FaTwitter />
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-[#FF4B12] hover:border-[#FF4B12] transition-colors">
              <FaYoutube />
            </div>
          </div>
        </div>

      </div>

      <div className="border-t border-white/10 py-5 text-center text-slate-500 text-xs font-[JetBrains_Mono] tracking-wide">
        © 2026 SOLD OUTS. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;