import React, { useEffect, useRef } from "react";

type Props = {
  image: string;                // your screenshot URL
  title?: string;
  description?: string;
};

export default function ScrollImageFeature({
  image,
  title = "Understand complex topics in a flash",
  description = "Get straight to the point with AI-generated notes and summaries. Upload a link, video, PDF, or voice and instantly get structured smart notes."
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
              // reveal with small stagger
              el.style.transitionDelay = `${i * 120}ms`;
              el.classList.remove("opacity-0", "translate-y-6");
              el.classList.add("opacity-100", "translate-y-0");
            });
            observer.unobserve(root);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-black py-28 md:py-40">
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
      >
        {/* Text */}
        <div className="text-white">
          <h2
            data-reveal
            className="opacity-0 translate-y-6 transition-all duration-700 text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
          >
            {title}
          </h2>
          <p
            data-reveal
            className="opacity-0 translate-y-6 transition-all duration-700 text-lg md:text-xl text-zinc-300 leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* Image */}
        <div className="relative">
          <div
            data-reveal
            className="opacity-0 translate-y-6 transition-all duration-700"
          >
            <img
              src={image}
              alt="Tutorly feature screenshot"
              loading="lazy"
              className="w-full rounded-2xl border-4 border-white shadow-[8px_8px_0_0_rgba(255,255,255,1)]"
            />
            {/* soft glow behind the image */}
            <div
              className="absolute -inset-6 -z-10 rounded-3xl blur-2xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 40%, rgba(168,85,247,0.35), rgba(59,130,246,0.15) 60%, transparent 75%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
