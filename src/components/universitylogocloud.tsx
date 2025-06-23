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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-black py-12 px-2 w-full">
      <div
        ref={ref}
        className="mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 max-w-7xl"
      >
        {universityLogos.map((logo, i) => (
          <motion.div
            key={logo.alt}
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{
              delay: isInView ? i * 0.07 : 0,
              duration: 0.5,
              ease: "easeOut"
            }}
            className="flex items-center justify-center w-full h-32 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              title={logo.alt}
              className="object-contain max-h-28 max-w-11/12"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
