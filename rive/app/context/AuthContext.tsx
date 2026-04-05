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

      if (session?.user) {
        console.log("👤 Fetching user data...");
        await fetchUserData(session.user.id);
      } else {
        setUserData(null);
      }

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

        if (session?.user) {
          fetchUserData(session.user.id).catch(console.error);
        } else {
          setUserData(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string): Promise<void> => {
    try {
      console.log("👤 Fetching user data for:", userId);

      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name, email")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Error fetching user data:", error.message);
        // If user doesn't exist in users table, set empty data
        if (error.code === "PGRST116") {
          console.log("👤 User not found in users table, setting empty data");
          setUserData({
            first_name: "",
            last_name: "",
            email: "",
          });
        }
      } else {
        console.log("✅ User data fetched:", data);
        setUserData(data);
      }
    } catch (error) {
      console.error("❌ fetchUserData failed:", error);
      // Set empty user data to prevent infinite loading
      setUserData({
        first_name: "",
        last_name: "",
        email: "",
      });
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
