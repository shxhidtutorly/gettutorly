import { SignIn, SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <Card className="w-full max-w-md border-none shadow-2xl bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to GetTutorly</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700 rounded-md mb-4">
              <TabsTrigger value="signin" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignIn
                appearance={{
                  elements: {
                    card: "shadow-none border-none bg-transparent text-white",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                    headerTitle: "text-2xl font-bold text-white",
                    headerSubtitle: "text-gray-400",
                    formFieldLabel: "text-white",
                    formFieldInput: "bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500",
                    footerActionLink: "text-blue-500 hover:text-blue-600",
                  }
                }}
                redirectUrl="/dashboard"
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignUp
                appearance={{
                  elements: {
                    card: "shadow-none border-none bg-transparent text-white",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                    headerTitle: "text-2xl font-bold text-white",
                    headerSubtitle: "text-gray-400",
                    formFieldLabel: "text-white",
                    formFieldInput: "bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500",
                    footerActionLink: "text-blue-500 hover:text-blue-600",
                  }
                }}
                redirectUrl="/dashboard"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
