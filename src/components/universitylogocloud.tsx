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
  const titleRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isTitleInView = useInView(titleRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      y: 50,
      rotateX: -15 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-black to-slate-800 py-20 px-4 w-full overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.1)_50%,transparent_75%)] bg-[length:60px_60px]"></div>
      
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header section */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-4"
          >
            <span className="text-sm font-semibold text-blue-400 tracking-wide uppercase">
              Trusted Worldwide
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Loved by students from{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              top global universities
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Join thousands of students from prestigious institutions worldwide who trust our platform
          </motion.p>
        </div>

        {/* Logo grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
        >
          {universityLogos.map((logo, i) => (
            <motion.div
              key={`${logo.alt}-${i}`}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.1, 
                rotateY: 5,
                z: 10,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              {/* Card background with glassmorphism effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300"></div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300"></div>
              
              {/* Logo container */}
              <div className="relative flex items-center justify-center w-full h-28 md:h-32 lg:h-36 p-4">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.alt}
                  className="object-contain max-h-full max-w-full filter brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback for broken images
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="text-white text-xs text-center font-medium">${logo.alt}</div>`;
                  }}
                />
              </div>
              
              {/* University name on hover */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-black/80 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap backdrop-blur-sm border border-white/10">
                  {logo.alt}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="text-center mt-16"
        >
          <div className="text-sm text-gray-400 mb-4">
            Compatible with learning management systems worldwide
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-xs text-gray-500">
            <span>Canvas</span>
            <span>Blackboard</span>
            <span>Moodle</span>
            <span>Google Classroom</span>
            <span>Microsoft Teams</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
