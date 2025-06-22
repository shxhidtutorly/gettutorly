"use client"

import { Cloud, ICloud } from "react-icon-cloud"

const universityLogos = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Harvard_University_logo.svg/200px-Harvard_University_logo.svg.png",
    alt: "Harvard University",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/MIT_logo.svg/200px-MIT_logo.svg.png",
    alt: "MIT",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Stanford_University_seal_2003.svg/200px-Stanford_University_seal_2003.svg.png",
    alt: "Stanford University",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png",
    alt: "Yale University",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Princeton_shield.svg/200px-Princeton_shield.svg.png",
    alt: "Princeton University",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Columbia_University_shield.svg/200px-Columbia_University_shield.svg.png",
    alt: "Columbia University",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/University_of_Pennsylvania_coat_of_arms.svg/200px-University_of_Pennsylvania_coat_of_arms.svg.png",
    alt: "University of Pennsylvania",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Caltech_logo.svg/200px-Caltech_logo.svg.png",
    alt: "Caltech",
  },
]

export function UniversityLogoCloud() {
  return (
    <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-20 pb-20 pt-8">
      {/* @ts-ignore */}
      <Cloud
        options={{
          depth: 1,
          imageScale: 2,
          tooltip: "native",
          clickToFront: 500,
          reverse: true,
          outlineColour: "#0000",
          maxSpeed: 0.05,
          minSpeed: 0.02,
        }}
      >
        {universityLogos.map((logo, i) => (
          <a key={i} href="#" onClick={(e) => e.preventDefault()}>
            <img
              src={logo.src}
              alt={logo.alt}
              title={logo.alt}
              width={42}
              height={42}
              className="rounded-sm object-contain"
              style={{ borderRadius: "8px" }}
            />
          </a>
        ))}
      </Cloud>
    </div>
  )
}
