import { useState } from "react";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Simplified schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    error: { username: "", password: "" }
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "admin",
    error: { username: "", password: "", fullName: "" }
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = { username: "", password: "" };
    if (!loginForm.username) newErrors.username = "Username is required";
    if (!loginForm.password) newErrors.password = "Password is required";
    
    if (newErrors.username || newErrors.password) {
      setLoginForm(prev => ({ ...prev, error: newErrors }));
      return;
    }
    
    loginMutation.mutate({
      username: loginForm.username,
      password: loginForm.password
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = { username: "", password: "", fullName: "" };
    if (!registerForm.fullName) newErrors.fullName = "Full name is required";
    if (!registerForm.username) newErrors.username = "Username is required";
    if (!registerForm.password) newErrors.password = "Password is required";
    if (registerForm.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (newErrors.username || newErrors.password || newErrors.fullName) {
      setRegisterForm(prev => ({ ...prev, error: newErrors }));
      return;
    }
    
    registerMutation.mutate({
      username: registerForm.username,
      password: registerForm.password,
      fullName: registerForm.fullName,
      role: registerForm.role
    });
  };

  // Redirect handled in App.tsx now, we don't need to do it here

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left column with form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md shadow-lg rounded-lg p-6 border">
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-center">Premium Rate Number Admin</h2>
            <p className="text-center text-gray-500">
              Sign in to your account or create a new one
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-center font-medium ${activeTab === 'login' ? 'border-b-2 border-primary' : ''}`}
              >
                Login
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 text-center font-medium ${activeTab === 'register' ? 'border-b-2 border-primary' : ''}`}
              >
                Register
              </button>
            </div>
          </div>
          
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  name="username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  placeholder="Enter your username"
                />
                {loginForm.error.username && (
                  <p className="text-sm text-red-500">{loginForm.error.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                />
                {loginForm.error.password && (
                  <p className="text-sm text-red-500">{loginForm.error.password}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 
                  "Sign In"}
              </Button>
              
              {/* Demo credentials */}
              <div className="text-center text-sm text-gray-500 mt-2">
                <p>Demo credentials</p>
                <p className="font-semibold">Username: admin</p>
                <p className="font-semibold">Password: password123</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  name="fullName"
                  value={registerForm.fullName}
                  onChange={handleRegisterChange}
                  placeholder="Enter your full name"
                />
                {registerForm.error.fullName && (
                  <p className="text-sm text-red-500">{registerForm.error.fullName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  placeholder="Choose a username"
                />
                {registerForm.error.username && (
                  <p className="text-sm text-red-500">{registerForm.error.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Create a password"
                />
                {registerForm.error.password && (
                  <p className="text-sm text-red-500">{registerForm.error.password}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 
                  "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </div>
      
      {/* Right column with hero section - Simplified */}
      <div className="flex-1 bg-primary p-6 text-white hidden md:flex md:flex-col md:justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Premium Rate Number Management Platform</h1>
          <p className="mb-6">
            A comprehensive solution for managing premium rate services, tracking calls and SMS, 
            analyzing revenue, and monitoring performance.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Real-time analytics and monitoring
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Comprehensive call and SMS tracking
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Complete revenue reporting and analysis
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Multiple service provider integrations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
