
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthForm = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome to GetTutorly</CardTitle>
        <CardDescription>
          Sign in or create an account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="space-y-4">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary hover:bg-primary/90",
                  card: "shadow-none border-none",
                  headerTitle: "text-2xl font-bold",
                  headerSubtitle: "text-muted-foreground"
                }
              }}
            />
          </TabsContent>
          <TabsContent value="signup" className="space-y-4">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary hover:bg-primary/90",
                  card: "shadow-none border-none",
                  headerTitle: "text-2xl font-bold",
                  headerSubtitle: "text-muted-foreground"
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
