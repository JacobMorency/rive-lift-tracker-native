import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import supabase from "../lib/supabaseClient";
import { AuthContextType } from "@/types/workout";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [userData, setUserData] = useState<AuthContextType["userData"]>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) console.error("Error fetching session:", error.message);
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      }

      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) fetchUserData(session.user.id);
        else setUserData(null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string): Promise<void> => {
    const { data, error } = await supabase
      .from("users")
      .select("first_name, last_name, email")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error.message);
    } else {
      setUserData(data);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
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

export default AuthProvider;
