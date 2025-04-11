"use client";
import { useAuth } from "../../config/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Login = () => {
    const { user, login: loginUser } = useAuth(); // Destructure user from useAuth
    const router = useRouter();

    // useEffect for redirecting if the user is already logged in
    useEffect(() => {
      if (user) {
        router.push("/"); // Redirect to the home page if the user is already logged in
      }
    }, [user, router]);

  
    const handleLogin = async () => {
      try {
        await loginUser(); // Call the login function
        router.push("/"); // Redirect to the home page after successful login
      } catch (error) {
        console.error("Login failed:", error); // Handle any errors that occur during login
      }
    };


  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;
