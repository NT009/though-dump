"use client"; // This tells Next.js to render this component on the client-side, which is required for using hooks like useState and useEffect

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// 1. Define the shape of our Authentication Context
// This dictates what data and functions will be available to any component that uses this context.
interface AuthContextType {
  isAuthenticated: boolean; // Is the user currently logged in?
  login: (username: string) => void; // Function to trigger a login
  logout: () => void; // Function to trigger a logout
  isLoading: boolean; // Are we currently checking the login status?
}

// 2. Create the Context
// We initialize it with 'undefined'. It will be properly populated by the AuthProvider component below.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the Provider Component
// This component wraps our entire application (inside layout.tsx) and manages the auth state.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Next.js hooks for programmatic navigation (redirecting) and reading the current URL
  const router = useRouter(); 
  const pathname = usePathname();

  // 4. Initialization Effect (Runs once when the app loads)
  // We check the browser's localStorage to see if a session exists from a previous visit.
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
    setIsLoading(false); // We finished checking, so stop loading
  }, []);

  // 5. Route Protection Effect (Runs whenever the auth state or URL changes)
  useEffect(() => {
    // We only want to enforce redirects AFTER we've finished the initial loading check
    if (!isLoading) {
      // If NOT logged in, and trying to access a protected page (like Home or Vault), kick them to /login
      if (!isAuthenticated && pathname !== "/login" && pathname !== "/signup") {
        router.replace("/login"); // .replace() doesn't add to browser history, preventing the "back button loop"
      } 
      // If ALREADY logged in, and trying to access /login or /signup, send them to the Home page
      else if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 6. The Login Function
  // Saves the state in the browser (localStorage) so it persists across refreshes, and updates React state.
  const login = (username: string) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", username);
    setIsAuthenticated(true);
    router.replace("/"); // Send them to the homepage after successful login
  };

  // 7. The Logout Function
  // Clears the data from localStorage and updates React state.
  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    router.replace("/login"); // Send them to the login screen after logging out
  };

  // 8. Loading State UI
  // While we are checking localStorage on initial load, show a spinner so the user doesn't see a flash of the wrong page.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 9. Provide the Context
  // We wrap the children (the rest of the app) and pass down the state and functions we defined.
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 10. Create a Custom Hook
// This is a helper function so that other components can easily access our auth context 
// by simply calling `const { login, logout, isAuthenticated } = useAuth();`
export function useAuth() {
  const context = useContext(AuthContext);
  // This ensures developers don't try to use useAuth outside of the Provider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
