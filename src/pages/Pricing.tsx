
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      name: 'Basic',
      badge: 'Try for $0',
      badgeColor: 'bg-green-100 text-green-700',
      yearlyPrice: 4.99,
      monthlyPrice: 8.99,
      yearlyBilled: 59.88,
      description: 'Perfect for individual learners',
      features: [
        'Unlimited AI Assistant Questions',
        'Instant answers from uploaded content or the web',
        'Auto-generated notes, summaries, flashcards, and quizzes',
        'Unlimited file uploads (PDF, DOCX, MP4, YouTube, etc.)',
        'Focused Reading Mode',
        'Unlimited Library Storage',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline' as const,
    },
    {
      name: 'Scholar',
      badge: 'Most Popular',
      badgeColor: 'bg-spark-primary text-white',
      yearlyPrice: 7.99,
      monthlyPrice: 11.99,
      yearlyBilled: 95.88,
      description: 'Best for serious students',
      features: [
        'All Basic features',
        'AI Math Expert with step-by-step solutions',
        'Chrome Extension (Beta) support for learning platforms',
        'iOS App Access',
        '5 hours/month of browser-based audio recording',
        'Unlimited live lecture recording via iOS app',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Premium',
      badge: 'Try for $0',
      badgeColor: 'bg-purple-100 text-purple-700',
      yearlyPrice: 9.99,
      monthlyPrice: 13.99,
      yearlyBilled: 119.88,
      description: 'For power users and professionals',
      features: [
        'All Scholar features',
        'Upload up to 10 files/links at once',
        'Analyze Images and Diagrams with AI',
        '10 hours/month of browser-based audio recording',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-spark-gray to-spark-light">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Powerful. Affordable. Built to
            <span className="text-spark-primary"> Supercharge Learning.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. Just smarter study tools.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center mb-12 animate-fade-in-up">
          <div className="flex items-center space-x-4 bg-[#1e1e1e]/90 backdrop-blur-md rounded-full p-2 shadow-xl border border-gray-700">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                !isYearly ? 'bg-spark-primary text-white font-semibold' : 'text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                isYearly ? 'bg-spark-primary text-white font-semibold' : 'text-gray-400'
              }`}
            >
              Yearly
            </button>

            {isYearly && (
              <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-400">
                Save 44%
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-spark-primary shadow-xl scale-105' : 'hover:shadow-lg'
              } animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-4 left-4 right-4">
                <div
                  className={`${plan.badgeColor} px-3 py-1 rounded-full text-xs font-medium text-center`}
                >
                  {plan.badge}
                </div>
              </div>

              <CardHeader className="pt-16 pb-6 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>

                <div className="space-y-2">
                  <div className="text-4xl font-bold text-spark-primary">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    <span className="text-lg text-muted-foreground font-normal">/month</span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground">
                      Billed annually (${plan.yearlyBilled}/year)
                    </p>
                  )}
                  <div className="bg-spark-light px-3 py-1 rounded-full text-xs font-medium text-spark-secondary">
                    4-day free trial
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.buttonVariant}
                  size="lg"
                  className="w-full font-semibold"
                  asChild
                >
                  <Link to="/signup">{plan.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-8 animate-fade-in-up">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Your Free Trial Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students who are already supercharging their learning with Tutorly's
              AI-powered tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="px-8" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Compare Plans
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-border/50">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span>30-day money back guarantee</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;