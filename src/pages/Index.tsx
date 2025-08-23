"use client"

import React, { useState, useEffect, useRef, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  MessageSquare,
  FileText,
  Headphones,
  HelpCircle,
  Check,
  ArrowRight,
  Plus,
  Minus,
  Star,
  BookOpen,
  CreditCard,
} from "lucide-react"
import { motion, useScroll, useTransform, MotionValue, animate } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { cn } from "@/lib/utils"

// Testimonials Column Component
export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <div key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-w-xs w-full mb-6" key={i}>
                  <div className="font-bold text-sm text-black">{text}</div>
                  <div className="flex items-center gap-2 mt-4">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full border-2 border-black"
                    />
                    <div className="flex flex-col">
                      <div className="font-black tracking-tight leading-5 text-black">{name}</div>
                      <div className="leading-5 opacity-60 tracking-tight font-bold text-sm text-black">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )),
        ]}
      </motion.div>
    </div>
  );
};

// Text Gradient Scroll Context
type TextOpacityEnum = "none" | "soft" | "medium";
type ViewTypeEnum = "word" | "letter";

type TextGradientScrollContextType = {
  textOpacity?: TextOpacityEnum;
  type?: ViewTypeEnum;
};

const TextGradientScrollContext = createContext<TextGradientScrollContextType>({});

function useGradientScroll() {
  const context = useContext(TextGradientScrollContext);
  return context;
}

// Text Components
const Word = ({ children, progress, range }: { children: React.ReactNode; progress: MotionValue<number>; range: number[] }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative me-2 mt-2">
      <span style={{ position: "absolute", opacity: 0.1 }}>{children}</span>
      <motion.span style={{ transition: "all .5s", opacity: opacity }}>
        {children}
      </motion.span>
    </span>
  );
};

const Char = ({ children, progress, range }: { children: React.ReactNode; progress: MotionValue<number>; range: number[] }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  const { textOpacity } = useGradientScroll();
  return (
    <span>
      <span
        className={cn("absolute", {
          "opacity-0": textOpacity === "none",
          "opacity-10": textOpacity === "soft",
          "opacity-30": textOpacity === "medium",
        })}
      >
        {children}
      </span>
      <motion.span
        style={{
          transition: "all .5s",
          opacity: opacity,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};

const Letter = ({ children, progress, range }: { children: React.ReactNode; progress: MotionValue<number>; range: number[] }) => {
  if (typeof children === "string") {
    const amount = range[1] - range[0];
    const step = amount / children.length;
    return (
      <span className="relative me-2 mt-2">
        {children.split("").map((char: string, i: number) => {
          const start = range[0] + i * step;
          const end = range[0] + (i + 1) * step;
          return (
            <Char key={`c_${i}`} progress={progress} range={[start, end]}>
              {char}
            </Char>
          );
        })}
      </span>
    );
  }
  return null;
};

// Text Gradient Scroll Component
function TextGradientScroll({
  text,
  className,
  type = "letter",
  textOpacity = "soft",
}: {
  text: string;
  type?: ViewTypeEnum;
  className?: string;
  textOpacity?: TextOpacityEnum;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const words = text.split(" ");
  
  return (
    <TextGradientScrollContext.Provider value={{ textOpacity, type }}>
<p
  ref={ref}
  className={cn(
    "relative flex m-0 flex-wrap text-white", // default white
    className
  )}
>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return type === "word" ? (
            <Word key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          ) : (
            <Letter key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Letter>
          );
        })}
      </p>
    </TextGradientScrollContext.Provider>
  );
}

// Animated Card Component
interface AnimatedCardProps {
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  icons?: Array<{
    icon: React.ReactNode
    size?: "sm" | "md" | "lg"
    className?: string
  }>
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
}

export function AnimatedCard({ className, title, description, icons = [] }: AnimatedCardProps) {
  return (
    <div
      className={cn(
        "max-w-sm w-full mx-auto p-8 rounded-xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group",
        className
      )}
    >
      <div
        className={cn(
          "h-[15rem] md:h-[20rem] rounded-xl z-40",
          "bg-neutral-50 [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]"
        )}
      >
        <AnimatedIcons icons={icons} />
      </div>
      {title && (
        <h3 className="text-lg font-black text-black py-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm font-bold text-black max-w-sm">
          {description}
        </p>
      )}
    </div>
  )
}

function AnimatedIcons({ icons }: { icons: AnimatedCardProps["icons"] }) {
  const scale = [1, 1.1, 1]
  const transform = ["translateY(0px)", "translateY(-4px)", "translateY(0px)"]
  
  const sequence = icons.map((_, index) => [
    `.circle-${index + 1}`,
    { scale, transform },
    { duration: 0.8 },
  ])

  useEffect(() => {
    animate(sequence, {
      repeat: Infinity,
      repeatDelay: 1,
    })
  }, [])

  return (
    <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">
      <div className="flex flex-row flex-shrink-0 justify-center items-center gap-2">
        {icons.map((icon, index) => (
          <Container
            key={index}
            className={cn(
              sizeMap[icon.size || "lg"],
              `circle-${index + 1}`,
              icon.className
            )}
          >
            {icon.icon}
          </Container>
        ))}
      </div>
      <AnimatedSparkles />
    </div>
  )
}

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `rounded-full flex items-center justify-center bg-white border-4 border-black
      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`,
      className
    )}
    {...props}
  />
))
Container.displayName = "Container"

const AnimatedSparkles = () => (
  <div className="h-40 w-px absolute top-20 m-auto z-40 bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-move">
    <div className="w-10 h-32 top-1/2 -translate-y-1/2 absolute -left-10">
      <Sparkles />
    </div>
  </div>
)

const Sparkles = () => {
  const randomMove = () => Math.random() * 2 - 1
  const randomOpacity = () => Math.random()
  const random = () => Math.random()

  return (
    <div className="absolute inset-0">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 2 + 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: `2px`,
            height: `2px`,
            borderRadius: "50%",
            zIndex: 1,
          }}
          className="inline-block bg-black"
        />
      ))}
    </div>
  )
}

// AI Logo Components
const ClaudeLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    imageRendering="optimizeQuality"
    fillRule="evenodd"
    clipRule="evenodd"
    viewBox="0 0 512 512"
    className={className}
  >
    <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042" />
    <path
      fill="#1F1F1E"
      fillRule="nonzero"
      d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"
    />
  </svg>
)

const OpenAILogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M26.153 11.46a6.888 6.888 0 0 0-.608-5.73 7.117 7.117 0 0 0-3.29-2.93 7.238 7.238 0 0 0-4.41-.454 7.065 7.065 0 0 0-2.41-1.742A7.15 7.15 0 0 0 12.514 0a7.216 7.216 0 0 0-4.217 1.346 7.061 7.061 0 0 0-2.603 3.539 7.12 7.12 0 0 0-2.734 1.188A7.012 7.012 0 0 0 .966 8.268a6.979 6.979 0 0 0 .88 8.273 6.89 6.89 0 0 0 .607 5.729 7.117 7.117 0 0 0 3.29 2.93 7.238 7.238 0 0 0 4.41.454 7.061 7.061 0 0 0 2.409 1.742c.92.404 1.916.61 2.923.604a7.215 7.215 0 0 0 4.22-1.345 7.06 7.06 0 0 0 2.605-3.543 7.116 7.116 0 0 0 2.734-1.187 7.01 7.01 0 0 0 1.993-2.196 6.978 6.978 0 0 0-.884-8.27Zm-10.61 14.71c-1.412 0-2.505-.428-3.46-1.215.043-.023.119-.064.168-.094l5.65-3.22a.911.911 0 0 0 .464-.793v-7.86l2.389 1.36a.087.087 0 0 1 .046.065v6.508c0 2.952-2.491 5.248-5.257 5.248ZM4.062 21.354a5.17 5.17 0 0 1-.635-3.516c.042.025.115.07.168.1l5.65 3.22a.928.928 0 0 0 .928 0l6.898-3.93v2.72a.083.083 0 0 1-.034.072l-5.711 3.255a5.386 5.386 0 0 1-4.035.522 5.315 5.315 0 0 1-3.23-2.443ZM2.573 9.184a5.283 5.283 0 0 1 2.768-2.301V13.515a.895.895 0 0 0 .464.793l6.897 3.93-2.388 1.36a.087.087 0 0 1-.08.008L4.52 16.349a5.262 5.262 0 0 1-2.475-3.185 5.192 5.192 0 0 1 .527-3.98Zm19.623 4.506-6.898-3.93 2.388-1.36a.087.087 0 0 1 .08-.008l5.713 3.255a5.28 5.28 0 0 1 2.054 2.118 5.19 5.19 0 0 1-.488 5.608 5.314 5.314 0 0 1-2.39 1.742v-6.633a.896.896 0 0 0-.459-.792Zm2.377-3.533a7.973 7.973 0 0 0-.168-.099l-5.65-3.22a.93.93 0 0 0-.928 0l-6.898 3.93V8.046a.083.083 0 0 1 .034-.072l5.712-3.251a5.375 5.375 0 0 1 5.698.241 5.262 5.262 0 0 1 1.865 2.28c.39.92.506 1.93.335 2.913ZM9.631 15.009l-2.39-1.36a.083.083 0 0 1-.046-.065V7.075c.001-.997.29-1.973.832-2.814a5.297 5.297 0 0 1 2.231-1.935 5.382 5.382 0 0 1 5.659.72 4.89 4.89 0 0 0-.168.093l-5.65 3.22a.913.913 0 0 0-.465.793l-.003 7.857Zm1.297-2.76L14 10.5l3.072 1.75v3.5L14 17.499l-3.072-1.75v-3.5Z"
      fill="currentColor"
    />
  </svg>
)

const GeminiLogo = ({ className }: { className?: string }) => (
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z"
      fill="url(#prefix__paint0_radial_980_20147)"
    />
    <defs>
      <radialGradient
        id="prefix__paint0_radial_980_20147"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"
      >
        <stop offset=".067" stopColor="#9168C0" />
        <stop offset=".343" stopColor="#5684D1" />
        <stop offset=".672" stopColor="#1BA1E3" />
      </radialGradient>
    </defs>
  </svg>
)

// Testimonials data
const testimonials = [
  {
    text: "Tutorly's AI notes feature transformed my study sessions! It converts my messy lecture recordings into perfectly organized summaries in minutes.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Emily Johnson",
    role: "Computer Science Student",
  },
  {
    text: "The math chat is incredible! It breaks down complex calculus problems step-by-step, making everything so much clearer than my textbook.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Michael Chen",
    role: "Engineering Student",
  },
  {
    text: "I love how Tutorly creates flashcards automatically from my readings. It's like having a personal tutor that knows exactly what I need to study.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Sarah Williams",
    role: "Pre-Med Student",
  },
  {
    text: "The AI quiz feature helped me ace my finals! It generates practice tests from my notes and identifies my weak spots perfectly.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Rodriguez",
    role: "Business Student",
  },
  {
    text: "Audio recap is a game-changer! I can turn hour-long lectures into concise summaries while commuting. Tutorly saves me so much time.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Jessica Martinez",
    role: "Psychology Student",
  },
  {
    text: "The doubt solver feature is amazing! When I'm stuck on complex topics, Tutorly breaks them down into simple, digestible concepts.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Amanda Davis",
    role: "Biology Student",
  },
  {
    text: "Tutorly's AI chat understands my questions perfectly and provides detailed explanations. It's like having office hours 24/7!",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "James Wilson",
    role: "Physics Student",
  },
  {
    text: "The AI summaries are spot-on! They capture all the key points from lengthy research papers and make studying so much more efficient.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Rachel Brown",
    role: "Literature Student",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 8);

export default function LandingPage() {
  const [stickyNav, setStickyNav] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [counters, setCounters] = useState({ students: 0, countries: 0, institutions: 0 })
  const titles = ["Smart", "Next-Gen", "AI-Powered", "Effortless", "Trusted", "Supercharged"]
  const [titleNumber, setTitleNumber] = useState(0)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    setHeroLoaded(true)

    const interval = setInterval(() => {
      setTitleNumber((n) => (n + 1) % titles.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setHeroLoaded(true)

    const handleScroll = () => {
      setStickyNav(window.scrollY > 100)

      const elements = document.querySelectorAll(
        ".scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in",
      )
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top
        const elementVisible = 150

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add("visible")
        }
      })
    }

    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps

        setCounters({
          students: Math.floor(500 * progress),
          countries: Math.floor(128 * progress),
          institutions: Math.floor(200 * progress),
        })

        if (step >= steps) {
          clearInterval(timer)
          setCounters({ students: 500, countries: 128, institutions: 200 })
        }
      }, stepDuration)
    }

    window.addEventListener("scroll", handleScroll)
    setTimeout(animateCounters, 500)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const faqData = [
    {
      question: "What can Tutorly help me with?",
      answer:
        "Tutorly helps with math problems, note-taking, creating flashcards, generating quizzes, summarizing content, audio transcription, and providing personalized study assistance across all subjects.",
    },
    {
      question: "Are the notes accurate?",
      answer:
        "Yes! Our AI is trained on educational content and provides highly accurate notes. However, we always recommend reviewing and verifying important information.",
    },
    {
      question: "Can I upload PDF/DOCX?",
      answer:
        "You can upload PDFs, DOCX files, images, and even audio recordings. Tutorly will process them and help you create study materials.",
    },
    {
      question: "Is Tutorly free?",
      answer:
        "We offer a basic plan starting at $9/month with essential features. For unlimited access and advanced features, check out our Pro and Team plans.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use enterprise-grade encryption and security measures. Your data is never shared with third parties and is stored securely.",
    },
    {
      question: "Does it work on mobile?",
      answer: "Yes! Tutorly works perfectly on mobile devices, tablets, and desktops. Study anywhere, anytime.",
    },
    {
      question: "What is Doubt Chain?",
      answer:
        "Doubt Chain breaks down complex concepts into simple, connected steps, helping you understand difficult topics by building knowledge progressively.",
    },
    {
      question: "How are quizzes created?",
      answer:
        "Our AI analyzes your study materials and automatically generates relevant questions, multiple choice options, and explanations based on the content.",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

     

      {/* Hero Section */}
      <section
        id="hero"
        className={`bg-white py-20 md:py-32 relative transition-opacity duration-1000 ${
          heroLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="floating">
                <Badge className="bg-purple-500 text-white font-black text-lg px-6 py-3 brutal-border">
                  🧠 AI-POWERED LEARNING
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-black">
                MEET YOUR
                <br />
                <span className="text-purple-500">{titles[titleNumber]}</span>
                <br />
                AI TUTOR
              </h1>
              <div className="max-w-4xl mx-auto">
                <p className="text-xl md:text-2xl font-bold text-black leading-tight">
                  Transform how you learn — generate notes, flashcards, quizzes, math solutions, summaries, audio
                  recaps, and insights with Tutorly's all-in-one AI.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <a href="/signup">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                  START LEARNING FREE
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-3xl mx-auto mt-16">
              <div className="bg-gray-800 text-white p-8 brutal-border count-animation">
                <div className="text-4xl font-black">{counters.students}K+</div>
                <div className="text-lg font-bold">STUDENTS</div>
              </div>
              <div
                className="bg-purple-500 text-white p-8 brutal-border count-animation"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="text-4xl font-black">{counters.countries}+</div>
                <div className="text-lg font-bold">COUNTRIES</div>
              </div>
              <div
                className="bg-blue-600 text-white p-8 brutal-border count-animation"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="text-4xl font-black">{counters.institutions}+</div>
                <div className="text-lg font-bold">INSTITUTIONS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Preview */}
      <section className="bg-gray-50 py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">Everything You Need to Excel</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto mb-6"></div>
            <p className="text-xl font-bold text-gray-700 max-w-3xl mx-auto">
              Powerful AI tools designed for modern learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: FileText,
                title: "AI NOTES",
                desc: "Smart note generation from any content",
                bg: "bg-white",
                textColor: "text-black",
                href: "/features/ai-notes",
              },
              {
                icon: MessageSquare,
                title: "MATH CHAT",
                desc: "Solve problems with step-by-step help",
                bg: "bg-purple-500",
                textColor: "text-white",
                href: "/features/math-chat",
              },
              {
                icon: Headphones,
                title: "AUDIO RECAP",
                desc: "Convert lectures to organized notes",
                bg: "bg-blue-600",
                textColor: "text-white",
                href: "/features/audio-recap",
              },
              {
                icon: HelpCircle,
                title: "DOUBT CHAIN",
                desc: "Break down complex concepts easily",
                bg: "bg-green-600",
                textColor: "text-white",
                href: "/features/doubt-chain",
              },
              {
                icon: CreditCard,
                title: "SMART FLASHCARDS",
                desc: "Adaptive cards that evolve with you",
                bg: "bg-orange-500",
                textColor: "text-white",
                href: "/features/flashcards",
              },
              {
                icon: BookOpen,
                title: "INSTANT QUIZZES",
                desc: "Auto-generate tests from materials",
                bg: "bg-red-500",
                textColor: "text-white",
                href: "/features/tests-and-quizzes",
              },
            ].map((feature, index) => (
              <a key={index} href={feature.href}>
                <div
                  className={`${feature.bg} ${feature.textColor} p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-pointer scroll-scale-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <feature.icon className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                  <p className="font-bold text-sm mb-4">{feature.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm">EXPLORE {feature.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center scroll-fade-in">
            <a href="/features">
              <Button className="bg-gray-800 text-white font-black text-lg px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
                SEE ALL FEATURES
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trusted By Universities Section */}
      <section className="bg-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">
              Loved by students from top global universities
            </h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto mb-8"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "MIT",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/mit-logo.webp",
              },
              {
                name: "Stanford University",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/standford-logo%20(1).webp",
              },
              {
                name: "University of Pennsylvania",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/penn-uop-logo.webp",
              },
              {
                name: "Yale University",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/yu-logo.webp",
              },
              {
                name: "University of Cambridge (UOC)",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/uoc-logo.webp",
              },
              {
                name: "Tokyo University of Medicine",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tuom-logo.webp",
              },
              {
                name: "University of Toronto",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tos-uni-logo%20(1).svg",
              },
              {
                name: "Harvard University",
                logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Harvard-University-Logo.png",
              },
            ].map((university, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 scroll-slide-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={university.logo}
                  alt={university.name}
                  className="h-16 w-auto object-contain transition-all duration-300 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* Scroll Image Section */}
<section className="bg-black py-32 relative">
  <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
    
    {/* Left Text */}
    <div className="text-white space-y-6 scroll-fade-in">
      <h2 className="text-4xl md:text-5xl font-extrabold">
        Understand complex topics in a flash
      </h2>
      <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed">
        Get straight to the point quickly with AI-generated notes and summaries. 
        Simply upload your lecture, notes, or documents and instantly get 
        structured smart notes and concise explanations.
      </p>
    </div>

    {/* Right Image */}
    <div className="relative scroll-slide-right">
      <img
        src="https://dllyfsbuxrjyiatfcegk.supabase.co/storage/v1/object/public/tutorly%20images/landing%20page%20images%20/shotsnapp-1755943575%20(1).688"
        alt="Tutorly Screenshot"
        className="rounded-xl border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] w-full"
      />
    </div>
  </div>

  {/* Second Block */}
  <div className="max-w-6xl mx-auto px-6 mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
    
    {/* Left Image */}
    <div className="relative scroll-slide-left order-2 md:order-1">
      <img
        src="https://dllyfsbuxrjyiatfcegk.supabase.co/storage/v1/object/public/tutorly%20images/landing%20page%20images%20/doubtchain.png"
        alt="Doubt Chain Feature"
        className="rounded-xl border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] w-full"
      />
    </div>

    {/* Right Text */}
    <div className="text-white space-y-6 scroll-fade-in order-1 md:order-2">
      <h2 className="text-4xl md:text-5xl font-extrabold">
        Break down doubts step by step
      </h2>
      <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed">
        With Tutorly’s <span className="font-bold">Doubt Chain</span>, 
        complex concepts are broken into simple, connected steps. 
        Learn progressively and never get stuck.
      </p>
    </div>
  </div>

  {/* Third Block */}
  <div className="max-w-6xl mx-auto px-6 mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
    
    {/* Left Text */}
    <div className="text-white space-y-6 scroll-fade-in">
      <h2 className="text-4xl md:text-5xl font-extrabold">
        Organized learning on any device
      </h2>
      <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed">
        Access your study tools on desktop or mobile seamlessly. 
        Stay organized and focused with Tutorly’s intuitive dashboard.
      </p>
    </div>

    {/* Right Image */}
    <div className="relative scroll-slide-right">
      <img
        src="https://dllyfsbuxrjyiatfcegk.supabase.co/storage/v1/object/public/tutorly%20images/landing%20page%20images%20/mobile%20desktop.png"
        alt="Tutorly Dashboard"
        className="rounded-xl border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] w-full"
      />
    </div>
  </div>
</section>


      {/* Animated Card with AI Models */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Powered by Leading AI Models</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto mb-8"></div>
            <p className="text-xl font-bold text-black-700 max-w-3xl mx-auto">
              Built with the most advanced AI technologies for unmatched learning experience
            </p>
          </div>
          
          <div className="flex justify-center">
            <AnimatedCard
              title="Next-Gen AI Technology"
              description="Tutorly leverages cutting-edge AI models to deliver personalized, intelligent learning experiences tailored to your unique study needs."
              icons={[
                {
                  icon: <ClaudeLogo className="h-4 w-4" />,
                  size: "sm",
                },
                {
                  icon: <OpenAILogo className="h-6 w-6 text-black" />,
                  size: "md",
                },
                {
                  icon: <GeminiLogo className="h-8 w-8 text-black" />,
                  size: "lg",
                },
                {
                  icon: <Brain className="h-6 w-6 text-purple-500" />,
                  size: "md",
                },
                {
                  icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
                  size: "sm",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Enhanced Tutorly Call-to-Action Section */}
<section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 text-white overflow-hidden flex items-center">
  
  {/* Animated Background Elements */}
  <div className="absolute inset-0">
    <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-400 rounded-full opacity-20 animate-pulse"></div>
    <div className="absolute top-60 right-20 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce"></div>
    <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-teal-400 rounded-full opacity-15 animate-pulse"></div>
    <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-emerald-300 opacity-25 animate-spin" style={{clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'}}></div>
  </div>
  
  {/* Glowing Grid Pattern */}
  <div className="absolute inset-0 opacity-10" style={{
    backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
    backgroundSize: '50px 50px'
  }}></div>

  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
    
    {/* Left Content */}
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Floating Tag */}
      <motion.div 
        className="inline-flex items-center px-6 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-sm font-black backdrop-blur-sm"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
        Transform your learning experience
      </motion.div>
      
      {/* Main Headlines */}
      <div className="space-y-6">
        <h2 className="text-6xl lg:text-7xl font-black leading-tight">
          Master any
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 animate-pulse"> subject</span>
          <br/>with confidence
        </h2>
        <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
          Experience revolutionary AI-powered learning that adapts to your pace. 
          Build lasting knowledge through interactive sessions designed for your success.
        </p>
      </div>
      
      {/* Feature Highlights */}
      <div className="flex flex-wrap gap-4 py-4">
        {[
          { label: "Instant Understanding", color: "bg-emerald-400" },
          { label: "Smart Progress Tracking", color: "bg-green-400" },
          { label: "Personalized Learning", color: "bg-teal-400" }
        ].map((feature, index) => (
          <motion.div 
            key={index}
            className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className={`w-2 h-2 ${feature.color} rounded-full animate-pulse`}></div>
            <span className="text-sm font-bold">{feature.label}</span>
          </motion.div>
        ))}
      </div>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 pt-6">
        <motion.a 
          href="/signup"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <button className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-black text-lg transition-all duration-300 border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 overflow-hidden">
            <span className="relative z-10">Start Learning Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </motion.a>
        <motion.a 
          href="/features"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button className="px-8 py-4 border-4 border-emerald-400 hover:bg-emerald-400/10 rounded-2xl font-black text-lg transition-all duration-300 backdrop-blur-sm hover:shadow-[8px_8px_0px_0px_rgba(16,185,129,0.3)]">
            Watch Demo
          </button>
        </motion.a>
      </div>
    </motion.div>
    
    {/* Right Visual Element */}
    <motion.div 
      className="relative flex justify-center lg:justify-end"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
    >
      
      {/* Main Image Container */}
      <div className="relative w-96 h-96 lg:w-[32rem] lg:h-[32rem]">
        {/* Rotating Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-80 animate-spin" style={{ animationDuration: '20s' }}></div>
        
        {/* Image Container */}
        <div className="relative w-full h-full m-2 rounded-3xl overflow-hidden bg-gray-800 border-4 border-white/20 backdrop-blur-sm">
          <img
            src="https://dllyfsbuxrjyiatfcegk.supabase.co/storage/v1/object/public/tutorly%20images/1749549623896.jpg"
            alt="Student achieving success with Tutorly"
            className="w-full h-full object-cover"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent"></div>
        </div>
        
        {/* Floating Stats Cards */}
        <motion.div 
          className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border-4 border-black"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          animate={{ y: [0, -10, 0] }}
          style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
        >
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-600">98%</div>
            <div className="text-sm text-gray-600 font-bold">Success Rate</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-8 -left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border-4 border-black"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          animate={{ y: [0, 10, 0] }}
          style={{ animationDuration: '4s', animationIterationCount: 'infinite' }}
        >
          <div className="text-center">
            <div className="text-2xl font-black text-green-600">50K+</div>
            <div className="text-sm text-gray-600 font-bold">Students</div>
          </div>
        </motion.div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-4 left-1/2 w-8 h-8 bg-emerald-400 rounded-full opacity-60 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
        <div className="absolute top-1/2 -right-4 w-6 h-6 bg-green-400 rounded-full opacity-80 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" style={{ animationDelay: '1s' }}></div>
      </div>
    </motion.div>
  </div>
  
  {/* Bottom Decorative Wave */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1200 120" className="w-full h-20 fill-current text-emerald-500/20">
      <path d="M0,120 C300,80 600,40 1200,60 L1200,120 Z"></path>
    </svg>
  </div>
</section>
      
{/* FAQ Section */}
<section id="faq" className="bg-black py-20">
  <div className="max-w-4xl mx-auto px-4">
    {/* Section Title */}
    <div className="text-center mb-16 scroll-fade-in">
      <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">FAQs</h2>
      <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
    </div>

    {/* FAQ List */}
    <div className="space-y-6">
      {faqData.map((faq, index) => (
        <div
          key={index}
          className="bg-gray-100 border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] scroll-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Question Button */}
          <button
            className="w-full p-6 text-left flex items-center justify-between font-black text-lg hover:bg-gray-200 transition-colors text-black"
            onClick={() => setOpenFaq(openFaq === index ? null : index)}
          >
            {faq.question}
            <div className={`transition-transform duration-300 ${openFaq === index ? "rotate-45" : ""}`}>
              {openFaq === index ? (
                <Minus className="w-6 h-6 text-black" />
              ) : (
                <Plus className="w-6 h-6 text-black" />
              )}
            </div>
          </button>

          {/* Answer */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-6 border-t-2 border-black">
              <p className="font-medium text-white pt-4">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>



      {/* Final CTA */}
      <section className="bg-gray-800 text-white py-20 relative">
        <div className="max-w-4xl mx-auto px-4 text-center scroll-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">🚀 READY TO EXCEL?</h2>
          <p className="text-xl font-bold mb-8 text-gray-300">
            Join 500K+ students who are already learning smarter with Tutorly.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/signup">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all">
                START LEARNING FREE
              </Button>
            </a>
            <Button
              variant="outline"
              className="bg-transparent border-4 border-white text-white font-black text-xl px-12 py-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:bg-white hover:text-black hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              CONTACT SALES
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .nav-sticky {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 4px solid black;
          z-index: 50;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }
        
        .nav-sticky.visible {
          transform: translateY(0);
        }
        
        .brutal-border {
          border: 4px solid black;
          box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
        }
        
        .brutal-button {
          border: 4px solid black;
          box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
          transition: all 0.2s ease;
        }
        
        .brutal-button:hover {
          box-shadow: none;
          transform: translate(2px, 2px);
        }
        
        .brutal-button-glow {
          animation: glow 2s infinite alternate;
        }
        
        @keyframes glow {
          from {
            box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1), 0 0 20px rgba(168, 85, 247, 0.4);
          }
          to {
            box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1), 0 0 30px rgba(168, 85, 247, 0.6);
          }
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .count-animation {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(50px);
        }
        
        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hover-scale:hover {
          transform: scale(1.05) translateY(-5px);
        }
        
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .scroll-fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }
        
        .scroll-fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scroll-slide-left {
          opacity: 0;
          transform: translateX(-50px);
          transition: all 0.8s ease;
        }
        
        .scroll-slide-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .scroll-slide-right {
          opacity: 0;
          transform: translateX(50px);
          transition: all 0.8s ease;
        }
        
        .scroll-slide-right.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .scroll-scale-in {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.8s ease;
        }
        
        .scroll-scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }
        
        .animate-move {
          animation: move 4s linear infinite;
        }
        
        @keyframes move {
          0% {
            transform: translateX(-200px);
          }
          100% {
            transform: translateX(200px);
          }
        }
      `}</style>
    </div>
  )
}
