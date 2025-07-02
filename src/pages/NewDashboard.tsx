import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useUserStats } from "@/hooks/useUserStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import AnimeChat from "@/components/dashboard/AnimeChat"; // Commented out until component exists
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

const NewDashboard = () => {
  const { user } = useUser();
  const { stats, loading } = useUserStats();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getGreeting = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) {
        setGreeting("Good morning");
      } else if (hour < 18) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }
    };

    getGreeting();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <p className="text-lg">Please sign in to continue.</p>
          <Button onClick={() => window.location.href = '/signin'}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow">
              {greeting}, {user.fullName || "Student"}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome to your personalized learning dashboard
            </p>
          </div>

          {/* Quick Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notes Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats?.notes_created || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep writing to solidify your knowledge!
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Materials Uploaded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats?.materials_created || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your knowledge with the community.
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quizzes Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats?.quizzes_taken || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Test your knowledge and track your progress.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Study Resources */}
          <section className="mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Continue Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
                <CardHeader>
                  <CardTitle>AI Notes Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate notes quickly using AI.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => window.location.href = '/ai-notes'}
                  >
                    Go to AI Notes
                  </Button>
                </CardContent>
              </Card>

              <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
                <CardHeader>
                  <CardTitle>Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create and review flashcards for effective learning.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => window.location.href = '/flashcards'}
                  >
                    Go to Flashcards
                  </Button>
                </CardContent>
              </Card>

              <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
                <CardHeader>
                  <CardTitle>Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Quickly summarize long texts and articles.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => window.location.href = '/summaries'}
                  >
                    Go to Summaries
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* AI Chat Section */}
          <section className="mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              AI Chat Assistant
            </h2>
            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardContent>
                {/* <AnimeChat /> */}
                <p className="text-sm text-muted-foreground">
                  Get instant help and answers from our AI assistant.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => window.location.href = '/chat'}
                >
                  Start Chatting
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default NewDashboard;
