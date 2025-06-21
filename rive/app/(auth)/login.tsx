import { Text, View, TextInput, SafeAreaView, Pressable } from "react-native";
import { useState } from "react";
import supabase from "../../lib/supabaseClient";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Divider from "../../components/ui/divider";
import Toast from "react-native-toast-message";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [emailEmpty, setEmailEmpty] = useState<boolean>(false);
  const [passwordEmpty, setPasswordEmpty] = useState<boolean>(false);
  const [isPasswordActive, setIsPasswordActive] = useState<boolean>(false);

  const router = useRouter();

  const handleLoginSuccess = (
    user: User | null,
    session: Session | null
  ): void => {
    if (user && session) {
      router.push("/home");
    }
    // TODO: Handle case where login fails or user is null
  };

  const handleLogin = async (): Promise<void> => {
    setEmailEmpty(false);
    setPasswordEmpty(false);
    setErrorMessage("");

    let hasError = false;

    if (!email) {
      setEmailEmpty(true);
      hasError = true;
    }

    if (!password) {
      setPasswordEmpty(true);
      hasError = true;
    }

    // Stops the form from being submitted if a field is blank
    if (hasError) {
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }
      handleLoginSuccess(data.user, data.session);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: "Invalid email or password.",
      });
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-base-100 justify-center items-center">
      <View className="w-full max-w-md space-y-5 px-4">
        <Text className="text-center text-2xl font-bold text-primary-content mb-4">
          Sign In
        </Text>

        <View className="items-center">
          <View className="bg-primary rounded-full h-20 w-20 justify-center items-center">
            <Text className="text-4xl">{isPasswordActive ? "🙈" : "💪"}</Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray mb-1">Email</Text>
          <TextInput
            className="border border-gray text-primary-content rounded-md p-3 w-full"
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
          />
          {emailEmpty && (
            <Text className="text-error text-sm mt-1">
              Email cannot be empty.
            </Text>
          )}
          {errorMessage && (
            <Text className="text-error text-sm mt-1">{errorMessage}</Text>
          )}
        </View>

        <View>
          <Text className="text-gray mb-1">Password</Text>
          <TextInput
            className="border border-gray text-primary-content rounded-md p-3 w-full"
            placeholder="Password"
            secureTextEntry
            onChangeText={(text) => {
              setPassword(text);
              setIsPasswordActive(true);
            }}
            value={password}
            onBlur={() => setIsPasswordActive(false)}
          />
          {passwordEmpty && (
            <Text className="text-error text-sm mt-1">
              Password cannot be empty.
            </Text>
          )}
          {errorMessage && (
            <Text className="text-error text-sm mt-1">{errorMessage}</Text>
          )}
          <Text className="text-right mb-4 mt-4 text-primary">
            Forgot Password?
          </Text>
        </View>

        <Pressable className="bg-primary rounded-md py-3" onPress={handleLogin}>
          <Text className="text-center text-white font-medium">Login</Text>
        </Pressable>

        <Divider>OR</Divider>

        <Pressable className="border border-white rounded-md py-3 mb-4 flex-row items-center justify-center gap-2">
          <AntDesign name="google" size={24} color="white" />
          <Text className="text-center text-primary-content font-bold">
            Sign in with Google
          </Text>
        </Pressable>

        <Pressable className="border border-white rounded-md py-3 mb-4 flex-row items-center justify-center gap-2">
          <AntDesign name="apple1" size={24} color="white" />
          <Text className="text-center text-primary-content font-bold">
            Sign in with Apple
          </Text>
        </Pressable>

        <View>
          <Text className="text-secondary text-center">
            Google and Apple sign-in are coming soon!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
