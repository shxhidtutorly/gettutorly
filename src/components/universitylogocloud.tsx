"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"

const universityLogos = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Harvard_University_logo.svg/200px-Harvard_University_logo.svg.png",
    alt: "Harvard",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/MIT_logo.svg/200px-MIT_logo.svg.png",
    alt: "MIT",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Stanford_University_seal_2003.svg/200px-Stanford_University_seal_2003.svg.png",
    alt: "Stanford",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png",
    alt: "Yale",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Princeton_shield.svg/200px-Princeton_shield.svg.png",
    alt: "Princeton",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Columbia_University_shield.svg/200px-Columbia_University_shield.svg.png",
    alt: "Columbia",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/University_of_Pennsylvania_coat_of_arms.svg/200px-University_of_Pennsylvania_coat_of_arms.svg.png",
    alt: "UPenn",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Caltech_logo.svg/200px-Caltech_logo.svg.png",
    alt: "Caltech",
  },
]

export function UniversityLogoCloud() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-4 gap-8 justify-items-center items-center py-8"
    >
      {universityLogos.map((logo, i) => (
        <motion.div
          key={logo.alt}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: i * 0.15, duration: 0.6, type: "spring" }}
          className="flex flex-col items-center"
        >
          <img
            src={logo.src}
            alt={logo.alt}
            title={logo.alt}
            width={80}
            height={80}
            className="object-contain rounded-md shadow-lg bg-white/90 p-2"
            loading="lazy"
          />
          <span className="mt-2 text-sm text-center text-gray-700 dark:text-gray-200">{logo.alt}</span>
        </motion.div>
      ))}
    </div>
  )
}
