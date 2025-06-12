import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/sign-up");
  }, [navigate]);

  return null; // Optional: show loader or animation
};

export default SignInPage;
