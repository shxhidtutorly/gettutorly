
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, BookOpen, Zap, Target } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Tutorly
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your AI-powered study companion for smarter learning
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/signup')} size="lg">
              Get Started
            </Button>
            <Button variant="outline" onClick={() => navigate('/signin')} size="lg">
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Brain className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>AI Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Generate smart notes from your study materials</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>Study Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Personalized study schedules and tracking</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Flashcards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Interactive flashcards for quick reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Target className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Track your learning progress and achievements</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
