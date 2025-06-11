import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

const SignUpPage = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-4">
      <div className="w-full max-w-md space-y-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8 transition-transform transform hover:scale-[1.015] duration-300 ease-in-out">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md">
            Join GetTutorly
          </h1>
          <p className="text-gray-400">
            Create an account to start your learning journey
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "bg-transparent shadow-none",
              card: "bg-gray-900 border border-gray-700 shadow-lg rounded-xl",
              headerTitle: "text-white text-2xl font-semibold",
              headerSubtitle: "text-gray-400 text-sm",
              socialButtonsBlockButton:
                "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 transition duration-200",
              socialButtonsIconButton:
                "bg-gray-800 hover:bg-gray-700 border border-gray-700 transition duration-200",
              formFieldLabel: "text-gray-300",
              formFieldInput:
                "bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-md px-4 py-2 transition-shadow duration-300 focus:shadow-blue-500/30",
              formFieldInput__error: "border-red-500",
              formFieldHintText: "text-gray-500 text-xs",
              formFieldErrorText: "text-red-500 text-sm",
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition-all duration-200 shadow hover:shadow-blue-500/40",
              footerActionText: "text-gray-400",
              footerActionLink: "text-blue-500 hover:text-blue-600 font-medium transition",
              logoImage: "hidden",
            },
            variables: {
              colorPrimary: "#2563EB",
              colorBackground: "#111827",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
