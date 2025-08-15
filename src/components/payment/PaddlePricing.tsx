
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";


const IS_DEV = import.meta.env.DEV;

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const plans: PricingPlan[] = [
  {
    id: "pro",
    name: "Tutorly Pro – Monthly Plan",
    price: "$5.99",
    interval: "month",
    description: "Perfect for regular students with 4-day trial",
    features: [
      "4-day free trial",
      "Unlimited AI summaries",
      "Unlimited flashcard sets",
      "Advanced quiz features",
      "Unlimited file uploads",
      "Priority support",
      "Export to PDF"
    ],
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "premium",
    name: "Tutorly Premium – Quarterly",
    price: "$9.99",
    interval: "quarter",
    description: "Best value for dedicated learners with 4-day trial",
    features: [
      "4-day free trial",
      "Everything in Pro",
      "Quarterly billing savings",
      "Advanced analytics",
      "Custom study plans",
      "Priority support",
      "Team collaboration features"
    ],
    icon: <Crown className="h-6 w-6" />,
    color: "from-yellow-400 to-orange-500"
  },
  {
    id: "max",
    name: "Tutorly Max – Annual Plan",
    price: "$36.00",
    interval: "year",
    description: "Maximum savings for serious students with 4-day trial",
    features: [
      "4-day free trial",
      "Everything in Premium",
      "Annual billing - biggest savings",
      "Custom AI models",
      "Advanced integrations",
      "24/7 phone support",
      "Personal learning coach"
    ],
    icon: <Star className="h-6 w-6" />,
    color: "from-green-400 to-blue-500"
  }
];

export default function PaddlePricing() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Initialize Paddle when component mounts
  useEffect(() => {
    const initPaddle = async () => {
      try {
        // Load Paddle.js
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.onload = () => {
          if (window.Paddle) {
            window.Paddle.Environment.set('sandbox'); // Change to 'production' for live
            window.Paddle.Setup({ 
              vendor: process.env.VITE_PADDLE_VENDOR_ID || 'your-vendor-id',
              eventCallback: function(data) {
                console.log('Paddle event:', data);
              }
            });
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to initialize Paddle:', error);
      }
    };

    initPaddle();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive"
      });
      return;
    }

    const priceIds = {
      'pro': 'pri_01jxq0pfrjcd0gkj08cmqv6rb1',
      'premium': 'pri_01jxq0wydxwg59kmha33h213ab',
      'max': 'pri_01jxq11xb6dpkzgqr27fxkejc3'
    };

    const priceId = priceIds[planId];
    if (!priceId) {
      toast({
        title: "Invalid plan",
        description: "Please select a valid subscription plan.",
        variant: "destructive"
      });
      return;
    }

    setLoading(planId);

    try {
      // Option 1: Direct Paddle Checkout (recommended)
      if (window.Paddle) {
        window.Paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customerEmail: user.email || '',
          customData: {
            firebaseUid: user.id
          },
          successUrl: `${window.location.origin}/dashboard?sub=success`,
          cancelUrl: `${window.location.origin}/pricing?sub=cancel`,
        });
      } else {
        // Option 2: Server-side session creation as fallback
        const response = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email || '',
            price_id: priceId,
            user_id: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const { checkout_url } = await response.json();
        window.open(checkout_url, '_blank');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Learning Journey
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered studying with our flexible pricing plans.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full bg-white/5 backdrop-blur-lg border-white/10 ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/{plan.interval}</span>
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                     className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Start ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">
            All plans include a 4-day free trial. Cancel anytime.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ No setup fees</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
