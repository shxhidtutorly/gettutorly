
import React, { useState } from 'react'; import { Check, Star } from 'lucide-react'; import { Button } from '@/components/ui/button'; import { Card, CardContent, CardHeader } from '@/components/ui/card'; import { Link } from 'react-router-dom'; import Footer from '@/components/layout/Footer'; import BostonLogo from '@/components/ui/Boston-University-Logo.png'; import ChicagoLogo from '@/components/ui/Chicago-University-Logo.png'; import GeorgetownLogo from '@/components/ui/Georgetown-University-Logo.png'; import HarvardLogo from '@/components/ui/Harvard-University-Logo.png'; import HowardLogo from '@/components/ui/Howard-University-Logo.png'; import OhioStateLogo from '@/components/ui/Ohio-State-University-Logo.png'; import OtagoLogo from '@/components/ui/Otago-University-Logo.png'; import PittsburghLogo from '@/components/ui/Pittsburgh-University-Logo.png'; import StanfordLogo from '@/components/ui/Stanford-University-Logo.png';

const features = [ 'Math Chat - Solve math problems with AI', 'AI Notes - Generate smart notes from files', 'Summarize - Quickly summarize any text', 'Flashcards - Create and review flashcards', 'Quizzes - Test your knowledge', 'AI Doubt Chain - Break down complex concepts', 'Create Plan - Plan your study sessions', 'AI Assistant - Get personalized help', 'Study Plans - Create study plans', 'View Progress - Track your learning' ];

const plans = [ { name: 'Basic', priceMonthly: 8.99, priceYearly: 4.99, yearlyBilled: 59.88, badge: 'Starter Plan', buttonText: 'Start Free Trial' }, { name: 'Scholar', priceMonthly: 11.99, priceYearly: 7.99, yearlyBilled: 95.88, badge: 'Most Popular', buttonText: 'Start Free Trial' }, { name: 'Premium', priceMonthly: 13.99, priceYearly: 9.99, yearlyBilled: 119.88, badge: 'Best for Power Users', buttonText: 'Start Free Trial' } ];

const Pricing = () => { const [isYearly, setIsYearly] = useState(true);

return ( <div className="min-h-screen bg-gradient-to-b from-[#0d0d0d] via-[#1a1a1a] to-black text-white"> <div className="container mx-auto px-6 py-20 text-center"> <h1 className="text-5xl font-bold mb-4">Tutorly Pricing</h1> <p className="text-lg mb-8 text-gray-300"> Powerful. Affordable. Built to Supercharge Your Learning Journey. </p>

<div className="flex items-center justify-center gap-4 bg-gray-800 p-2 rounded-full w-max mx-auto mb-10">
      <button
        onClick={() => setIsYearly(false)}
        className={`px-6 py-2 rounded-full transition ${
          !isYearly ? 'bg-spark-primary text-white font-bold' : 'text-gray-400'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setIsYearly(true)}
        className={`px-6 py-2 rounded-full transition ${
          isYearly ? 'bg-spark-primary text-white font-bold' : 'text-gray-400'
        }`}
      >
        Yearly <span className="ml-1 text-green-400">Save 44%</span>
      </button>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-20">
      {plans.map((plan) => (
        <Card key={plan.name} className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-6">
          <CardHeader className="mb-4">
            <div className="text-sm font-semibold text-spark-primary mb-2">{plan.badge}</div>
            <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
            <div className="text-xl">
              ${isYearly ? plan.priceYearly : plan.priceMonthly}
              <span className="text-sm text-gray-400">/month</span>
            </div>
            {isYearly && (
              <p className="text-sm text-gray-500">Billed annually (${plan.yearlyBilled}/year)</p>
            )}
          </CardHeader>
          <CardContent className="text-left space-y-3">
            {features.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="text-green-400 w-5 h-5" />
                {f}
              </div>
            ))}
            <Button className="w-full mt-6" asChild>
              <Link to="/signup">{plan.buttonText}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="text-center mb-20">
      <h3 className="text-2xl font-bold mb-4">Trusted by Students from Top Universities</h3>
      <div className="flex flex-wrap justify-center items-center gap-6 grayscale">
        {[BostonLogo, ChicagoLogo, GeorgetownLogo, HarvardLogo, HowardLogo, OhioStateLogo, OtagoLogo, PittsburghLogo, StanfordLogo].map((logo, i) => (
          <img key={i} src={logo} alt="university" className="h-12 md:h-14" />
        ))}
      </div>
    </div>

    <div className="bg-[#141414] p-10 rounded-2xl shadow-lg max-w-5xl mx-auto mb-24">
      <h3 className="text-3xl font-bold mb-4">What Our Users Say</h3>
      <div className="grid md:grid-cols-3 gap-6 text-left text-gray-200">
        <div className="bg-[#1f1f1f] p-4 rounded-xl">
          <p>“Tutorly helped me ace my finals. The AI Notes and Flashcards saved hours of study time!”</p>
          <p className="mt-2 text-sm text-gray-400">— Aanya, Harvard University</p>
        </div>
        <div className="bg-[#1f1f1f] p-4 rounded-xl">
          <p>“I love the Math Chat and Doubt Chain. It explains every step so clearly!”</p>
          <p className="mt-2 text-sm text-gray-400">— Raj, Stanford University</p>
        </div>
        <div className="bg-[#1f1f1f] p-4 rounded-xl">
          <p>“Flashcards + AI Assistant = my new best friends before every test.”</p>
          <p className="mt-2 text-sm text-gray-400">— Leah, University of Chicago</p>
        </div>
      </div>
    </div>
  </div>

  <Footer />
</div>

); };

export default Pricing;

