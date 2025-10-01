import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export interface AuthContextType {
  user: User | null;
  userData: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  loading: boolean;
  refreshUserData?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [userData, setUserData] = useState<AuthContextType["userData"]>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      console.log("🔐 Checking for existing session...");

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Session error:", error.message);
      } else {
        console.log(
          "✅ Session check:",
          session ? "Found session" : "No session"
        );
        if (session) {
          console.log("📋 Session details:", {
            user: session.user?.email,
            expires: session.expires_at,
            access_token: session.access_token ? "exists" : "missing",
          });
        }
      }

      setUser(session?.user || null);
      setUserData(null); // Skip user data for now
      setLoading(false);
      console.log("🔐 Auth init complete");
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "🔄 Auth state changed:",
          event,
          session ? "session exists" : "no session"
        );
        setUser(session?.user || null);
        setUserData(null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string): Promise<void> => {
    try {
      console.log("👤 Step 1: Fetching user data for:", userId);
      console.log("👤 Step 2: Making Supabase query to users table...");

      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name, email")
        .eq("id", userId)
        .single();

      console.log("👤 Step 3: Supabase query completed");

      if (error) {
        console.error("❌ Error fetching user data:", error.message);
        console.log("👤 Error code:", error.code);
        // If user doesn't exist in users table, create a basic record
        if (error.code === "PGRST116") {
          console.log(
            "👤 Step 4: User not found in users table, creating basic record..."
          );
          setUserData({
            first_name: "",
            last_name: "",
            email: "",
          });
          console.log("👤 Step 5: Basic user data set");
        }
      } else {
        console.log("👤 Step 4: User data fetched successfully:", data);
        setUserData(data);
        console.log("👤 Step 5: User data state updated");
      }
    } catch (error) {
      console.error("❌ fetchUserData failed:", error);
      console.log("👤 Error: Setting empty user data...");
      // Set empty user data to prevent infinite loading
      setUserData({
        first_name: "",
        last_name: "",
        email: "",
      });
      console.log("👤 Error: Empty user data set");
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (!user) return;
    await fetchUserData(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
