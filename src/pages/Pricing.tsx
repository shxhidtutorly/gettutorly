import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const PricingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "Access to core features",
        "Limited AI interactions",
        "Community support",
      ],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: "$9.99/month",
      features: [
        "Unlimited AI interactions",
        "Priority support",
        "Advanced analytics",
        "Exclusive content",
      ],
      cta: "Upgrade Now",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-20">
      <div className="container mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Unlock Your Potential with Tutorly Pro</h1>
        <p className="text-gray-400 text-lg">
          Choose the plan that fits your learning style and take your studies to the next level.
        </p>
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-white mb-2">
                {plan.name}
              </CardTitle>
              <div className="text-4xl font-bold">{plan.price}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="container mx-auto mt-16 text-center">
        <p className="text-gray-500">
          Need help deciding? <a href="#" className="text-blue-500 hover:underline">Contact our support team</a>
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
