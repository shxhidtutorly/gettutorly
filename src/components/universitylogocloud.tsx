"use client"
import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"

const universityLogos = [
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Harvard-University-Logo.png",
    alt: "Harvard University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Stanford-University-Logo.png",
    alt: "Stanford University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Columbia-University-Logo.png",
    alt: "Columbia University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Chicago-University-Logo.png",
    alt: "University of Chicago",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Florida-University-Logo.png",
    alt: "University of Florida",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Brown-Unversity-Logo.png",
    alt: "Brown University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Georgetown-University-Logo.png",
    alt: "Georgetown University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Northeastern-University-Logo.png",
    alt: "Northeastern University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Ohio-State-University-Logo.png",
    alt: "Ohio State University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Oregon-State-University-Logo-1.png",
    alt: "Oregon State University",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Pittsburgh-University-Logo.png",
    alt: "University of Pittsburgh",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/South-Carolina.png",
    alt: "University of South Carolina",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Melbourne-University-Logo.png",
    alt: "University of Melbourne",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Otago-University-Logo.png",
    alt: "University of Otago",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Auckland-University-Logo.png",
    alt: "University of Auckland",
  },
];


export function UniversityLogoCloud() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.6, 
      y: 30,
      rotateY: -10 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        duration: 0.6
      }
    }
  };

  return (
    <div className="w-full relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>

      {/* Logo grid */}
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 relative z-10"
      >
          {universityLogos.map((logo, i) => (
            <motion.div
              key={`${logo.alt}-${i}`}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              {/* Card with glassmorphism effect */}
              <div className="relative flex items-center justify-center w-full h-20 sm:h-24 md:h-28 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-xl transition-all duration-300">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.alt}
                  className="object-contain max-h-[70%] max-w-[80%] filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="text-white text-xs text-center font-medium px-2">${logo.alt}</div>`;
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom compatible section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="text-center mt-12 pt-8 border-t border-white/10"
        >
          <div className="text-sm text-gray-400 mb-3">
            Compatible with
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Canvas</span>
            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Blackboard</span>
            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Moodle</span>
            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10">Google Classroom</span>
          </div>
        </motion.div>
      </div>
  );
}
