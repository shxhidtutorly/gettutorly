
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUser";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings as SettingsIcon,
  User,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useFirebaseAuth();
  const { subscription, loading } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Account Settings
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Manage your account and subscription
            </p>
          </div>

          {/* User Profile */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-lg text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {subscription.plan_name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">Current Plan</p>
                    </div>
                    <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                      {subscription.status}
                    </Badge>
                  </div>

                  {subscription.is_trial && subscription.trial_end_date && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-300">
                          Trial Period
                        </span>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200">
                        Your trial ends on {formatDate(subscription.trial_end_date)}
                      </p>
                    </div>
                  )}

                  {subscription.subscription_end_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Next Billing Date
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {formatDate(subscription.subscription_end_date)}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate('/pricing')}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Change Plan
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Subscribe to unlock all features
                  </p>
                  <Button onClick={() => navigate('/pricing')}>
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
