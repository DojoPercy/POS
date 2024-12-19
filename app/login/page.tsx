"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClipLoader from "react-spinners/ClipLoader";
import { jwtDecode } from "jwt-decode";
import { serialize } from 'cookie';


interface FormData {
  email: string;
  password: string;
}

interface DecodedToken {
  role: string; 
  [key: string]: any; 
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post("/api/login", formData);
      
      if (response.status === 200) {
        // Save the token in localStorage
        const token = response.data.token;
        if (!token) throw new Error("Token is missing in the response.");
        localStorage.setItem("token", token);
  
        // // Decode the token to extract the role
        // const decoded: DecodedToken = jwtDecode(token);
  
       
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
        router.push("/");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Login failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Utensils className="mx-auto h-12 w-12 text-gray-900" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Restaurant POS Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="your@email.com"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white flex justify-center items-center">
              {loading ? (
                <ClipLoader
                  color={"#fff"}
                  loading={loading}
                  cssOverride={{}}
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <p className="text-center text-sm text-gray-500">
          Need help? Contact IT Support
        </p>
      </div>
    </div>
  );
};

export default Login;
