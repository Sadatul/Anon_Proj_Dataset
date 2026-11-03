import React from "react";
import { motion } from "framer-motion";
import { IoIosArrowRoundForward } from "react-icons/io";
import heroBg from "../../assets/hero-bg.png"; 

const Banner = () => {
  const banner = {
    title: "Lead with Kindness, Shine with Action",
    description:
      "The future depends on the choices we make today. As a volunteer, you have the power to inspire change, create opportunities, and touch lives in ways that truly matter. From helping communities grow to building hope where it's needed most, your actions will shape a better tomorrow — and it all begins with one simple step: choosing to make a difference.",
    buttonText: "Browse Opportunities",
  };

  return (
    <div 
      className="relative w-full min-h-[70vh] bg-cover bg-center bg-no-repeat flex items-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6 Jost"
          >
            {banner.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-sm md:text-lg text-white/90 leading-relaxed mb-8"
          >
            {banner.description}
          </motion.p>

          {/* Blue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <button className="flex items-center gap-2 px-8 py-4 bg-[#024870] text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 group">
              <span className="text-lg">{banner.buttonText}</span>
              <IoIosArrowRoundForward className="text-2xl group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Banner;