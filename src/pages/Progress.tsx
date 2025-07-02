import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useUserStats } from "@/hooks/useUserStats";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Flame, BookOpen, MessageSquare, Headphones, GraduationCap } from "lucide-react";

const Progress = () => {
  const { user } = useUser();
  const { stats, loading } = useUserStats();

  // Mock function to fetch study sessions (replace with your actual data fetching)
  const fetchStudySessions = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: "1", title: "Math Session", duration: 60, date: "2024-01-20" },
          { id: "2", title: "History Review", duration: 45, date: "2024-01-19" },
        ]);
      }, 500);
    });
  };

  const { data: studySessions, isLoading: isSessionsLoading } = useQuery(
    ['studySessions'],
    fetchStudySessions
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow">
              📈 Your Progress
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your learning journey and see how far you've come
            </p>
          </div>

          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Materials Created
                </CardTitle>
                <Flame className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : stats?.materials_created}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total study materials you've created
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
                <BookOpen className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : stats?.notes_created}
                </div>
                <p className="text-xs text-muted-foreground">
                  Number of notes you've taken
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Doubts Asked
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : stats?.doubts_asked}
                </div>
                <p className="text-xs text-muted-foreground">
                  Questions you've asked to clarify concepts
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Audio Notes Created
                </CardTitle>
                <Headphones className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : stats?.audio_notes_created}
                </div>
                <p className="text-xs text-muted-foreground">
                  Number of audio notes you've created
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Study Time
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "Loading..." : stats?.total_study_time}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total time you've spent studying
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Study Sessions */}
          <section className="mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow mb-4">
              📚 Recent Study Sessions
            </h2>
            {isSessionsLoading ? (
              <div className="text-center py-6">Loading study sessions...</div>
            ) : studySessions && studySessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studySessions.map((session: any) => (
                  <Card
                    key={session.id}
                    className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {session.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="mr-1 inline-block h-4 w-4" />
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {session.duration} minutes
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">No study sessions recorded yet.</div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Progress;
