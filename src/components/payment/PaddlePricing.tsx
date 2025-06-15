
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

declare global {
  interface Window {
    Paddle?: {
      Environment: {
        set: (env: string) => void;
      };
      Setup: (config: { token: string }) => void;
      Checkout: {
        open: (config: {
          items: { priceId: string; quantity: number }[];
          customer?: { email?: string };
          customData?: Record<string, any>;
          successUrl?: string;
          cancelUrl?: string;
          settings?: {
            allowLogout?: boolean;
            displayMode?: string;
            theme?: string;
            locale?: string;
          };
        }) => void;
      };
    };
  }
}

const PaddlePricing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    // Load Paddle.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set('production');
        window.Paddle.Setup({
          token: 'live_70323ea9dfbc69d45414c712687'
        });
        setPaddleLoaded(true);
        console.log('Paddle loaded successfully');
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load Paddle script:', error);
      toast.error("Payment system failed to load. Please refresh the page.");
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleSubscribe = (priceId: string, planName: string) => {
    if (loading) {
      toast.info("Please wait while we check your authentication status...");
      return;
    }

    if (!user) {
      toast.info("Please sign in to continue with your subscription");
      navigate("/signin", { state: { returnTo: "/pricing", autoCheckout: true } });
      return;
    }

    if (!paddleLoaded || !window.Paddle) {
      toast.error("Payment system is still loading, please try again in a moment");
      return;
    }

    setLoadingPlan(priceId);
    toast.success("Redirecting to checkout...");

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email || '' },
        customData: {
          user_id: user.id,
          planName: planName
        },
        successUrl: 'https://gettutorly.com/pricing?sub=success',
        cancelUrl: 'https://gettutorly.com/pricing?sub=cancel',
        settings: {
          allowLogout: false,
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en'
        }
      });
      console.log('Paddle checkout opened for:', planName);
    } catch (error) {
      console.error('Failed to open Paddle checkout:', error);
      toast.error("Failed to open checkout, please try again");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Starter",
      subtitle: "Monthly",
      price: "$9.99",
      priceId: "pri_01jxq0pfrjcd0gkj08cmqv6rb1",
      period: "/month",
      description: "Perfect for individual learners",
      features: [
        "Unlimited AI summaries",
        "Basic flashcards",
        "Quiz generation",
        "Email support",
        "Mobile app access"
      ],
      popular: false,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Pro",
      subtitle: "Quarterly",
      price: "$19.99",
      priceId: "pri_01jxq0wydxwg59kmha33h213ab",
      period: "/quarter",
      description: "Best for serious students",
      features: [
        "Everything in Starter",
        "Advanced AI features",
        "Priority support",
        "Team collaboration",
        "Export options",
        "Custom integrations",
        "Analytics dashboard"
      ],
      popular: true,
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Pro",
      subtitle: "Yearly",
      price: "$199.99",
      priceId: "pri_01jxq11xb6dpkzgqr27fxkejc3",
      period: "/year",
      description: "Save 17% with annual billing",
      features: [
        "Everything in Pro Quarterly",
        "2 months free",
        "Priority onboarding",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "Dedicated support"
      ],
      popular: false,
      color: "from-green-500 to-green-600",
      savings: "Save $40"
    }
  ];

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Unlock your learning potential with AI-powered tools
          </p>
          <Badge variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400">
            <Crown className="w-4 h-4 mr-2" />
            Secure Payment by Paddle
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={`${plan.name}-${plan.subtitle}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
                    Most Popular
                  </Badge>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                    {plan.savings}
                  </Badge>
                </div>
              )}

              <Card 
                className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all relative overflow-hidden ${
                  plan.popular ? 'ring-2 ring-purple-500/50' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-5`} />
                
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {plan.subtitle}
                    </Badge>
                  </div>
                  
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.price}
                    <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">
                      {plan.period}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                </CardHeader>

                <CardContent className="relative z-10">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.priceId, `${plan.name} ${plan.subtitle}`)}
                    disabled={!paddleLoaded || loadingPlan === plan.priceId || loading}
                    className={`w-full py-3 text-white font-semibold ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    }`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {loadingPlan === plan.priceId ? 'Opening...' : 
                     !paddleLoaded ? 'Loading...' : 
                     !user ? 'Sign In to Subscribe' : 'Subscribe Now'}
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                    Cancel anytime • Secure checkout
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Questions? Contact our support team for help choosing the right plan.
          </p>
          {!user && (
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
              Please sign in to access subscription options
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaddlePricing;
