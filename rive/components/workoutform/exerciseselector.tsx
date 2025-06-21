import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import { Dumbbell, ArrowLeft } from "lucide-react-native";
import { ExercisesInWorkout, Exercise } from "@/types/workout";
import { debounce } from "lodash";
import { useAuth } from "../../hooks/useAuth";
import ExerciseSelectorButton from "./exerciseselectorbutton";
import Button from "../ui/button";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Divider from "../ui/divider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const RECENT_KEY = "recentExercises";

type ExerciseSelectorProps = {
  exerciseName: string;
  setExerciseName: (name: string) => void;
  setExerciseId: (id: number) => void;
  isSetUpdating: boolean;
  isSetsEmpty: boolean;
  exercisesInWorkout: ExercisesInWorkout[];
};

type ExerciseOption = {
  id: number;
  name: string;
  category: string;
}[];

const ExerciseSelector = ({
  exerciseName,
  setExerciseName,
  setExerciseId,
  isSetUpdating,
  isSetsEmpty,
}: ExerciseSelectorProps) => {
  const [exerciseOptions, setExerciseOptionsState] = useState<ExerciseOption>(
    []
  );
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [favoriteExercises, setFavoriteExercises] = useState<ExerciseOption>(
    []
  );
  const [favoriteExerciseIds, setFavoriteExerciseIds] = useState<Set<number>>(
    new Set()
  );
  const [recentExercises, setRecentExercises] = useState<ExerciseOption>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const filterOptions = [
    { label: "Arms", value: "Arms" },
    { label: "Chest", value: "Chest" },
    { label: "Back", value: "Back" },
    { label: "Legs", value: "Legs" },
  ];

  const fetchExercises = async (
    searchTerm: string,
    filter: string
  ): Promise<void> => {
    try {
      let query = supabase
        .from("exercise_library")
        .select("*")
        .order("name", { ascending: true });

      if (filter === "Arms") {
        query = query.in("category", ["Biceps", "Triceps", "Shoulders"]);
      } else if (filter) {
        query = query.eq("category", filter);
      }

      const { data, error } = await query
        .ilike("name", `%${searchTerm}%`)
        .range(0, 30);

      if (error) {
        console.error("Error fetching exercises:", error.message);
        return;
      }

      setExerciseOptionsState(data);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const debouncedFetch = debounce((term: string, filter: string) => {
    fetchExercises(term, filter);
  }, 300);

  useEffect(() => {
    debouncedFetch(searchValue, selectedFilter);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchValue, selectedFilter, debouncedFetch]);

  const filteredExercises = exerciseOptions.filter((ex) =>
    ex.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredFavorites = favoriteExercises.filter((ex) => {
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());

    const matchesFilter =
      selectedFilter === ""
        ? true
        : selectedFilter === "Arms"
          ? ["Biceps", "Triceps", "Shoulders"].includes(ex.category)
          : ex.category === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleSelect = (exercise: Exercise): void => {
    setExerciseName(exercise.name);
    setExerciseId(exercise.id);
    setModalVisible(false);
    addToRecentExercises(exercise);
  };

  const getRecentExercises = async (): Promise<Exercise[]> => {
    try {
      const value = await AsyncStorage.getItem(RECENT_KEY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error("Failed to load recent exercises:", error);
      return [];
    }
  };

  const addToRecentExercises = async (exercise: Exercise): Promise<void> => {
    try {
      const recent = await getRecentExercises();

      const updated = [exercise, ...recent.filter((e) => e.id !== exercise.id)];

      if (updated.length > 5) updated.pop();

      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to update recent exercises:", error);
    }
  };

  useEffect(() => {
    (async () => {
      const recent = await getRecentExercises();
      setRecentExercises(recent as ExerciseOption);
    })();
  }, []);

  // Toggle favorite exercise
  const toggleFavorite = async (exercise: Exercise): Promise<void> => {
    if (!user) return;

    try {
      const isAlreadyFavorite = favoriteExerciseIds.has(exercise.id);

      if (isAlreadyFavorite) {
        const { error } = await supabase
          .from("favorite_exercises")
          .delete()
          .match({ user_id: user.id, exercise_id: exercise.id });

        if (!error) {
          const updated = new Set(favoriteExerciseIds);
          updated.delete(exercise.id);
          setFavoriteExerciseIds(updated);
          setFavoriteExercises((prev) =>
            prev.filter((ex) => ex.id !== exercise.id)
          );
        }
      } else {
        const { error } = await supabase
          .from("favorite_exercises")
          .insert({ user_id: user.id, exercise_id: exercise.id });

        if (!error) {
          const updated = new Set(favoriteExerciseIds);
          updated.add(exercise.id);
          setFavoriteExerciseIds(updated);

          // Ensure the full exercise details are added
          const fullExercise =
            exerciseOptions.find((ex) => ex.id === exercise.id) ||
            favoriteExercises.find((ex) => ex.id === exercise.id);

          if (fullExercise) {
            setFavoriteExercises((prev) => [...prev, fullExercise]);
          }
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  useEffect(() => {
    const getFavoriteExercises = async () => {
      if (!user) return;

      try {
        const { data: favs, error: favError } = await supabase
          .from("favorite_exercises")
          .select("exercise_id")
          .eq("user_id", user.id);

        if (favError) {
          console.error(
            "Error fetching favorite exercise IDs:",
            favError.message
          );
          return;
        }

        const ids = favs.map((f) => f.exercise_id);
        setFavoriteExerciseIds(new Set(ids));

        if (ids.length > 0) {
          const { data: exercises, error: exError } = await supabase
            .from("exercise_library")
            .select("*")
            .in("id", ids);

          if (exError) {
            console.error("Error fetching exercises:", exError.message);
            return;
          }

          setFavoriteExercises(exercises);
        } else {
          setFavoriteExercises([]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    getFavoriteExercises();
  }, [user]);

  return (
    <View className="w-full">
      <TouchableOpacity
        disabled={isSetUpdating}
        onPress={() => {
          if (!isSetsEmpty) {
            Toast.show({
              type: "error",
              text1: "Cannot change exercise",
              text2: "Please clear all sets before changing the exercise.",
            });
            return;
          }
          setModalVisible(true);
        }}
        className={`${isSetUpdating ? "bg-gray" : "bg-primary"} w-full h-12 rounded items-center justify-center flex-row`}
      >
        <Text className="text-primary-content text-lg font-bold">
          {exerciseName || "Select an Exercise"}
        </Text>
        <Dumbbell size={16} stroke={"white"} style={{ marginLeft: 10 }} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={modalVisible}
        presentationStyle="fullScreen"
      >
        <View
          className="flex-1 bg-base-100 p-4"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="px-2"
            >
              <ArrowLeft size={24} stroke={"white"} />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-base-content text-lg font-bold">
              Select an Exercise
            </Text>
            <View style={{ width: 32 }} />
          </View>
          <TextInput
            placeholder="Search exercises"
            value={searchValue}
            onChangeText={setSearchValue}
            className="border border-gray text-primary-content rounded-md p-3 w-full"
          />
          <Divider>Filters</Divider>

          <View className="flex-row items-center justify-center gap-2 mb-2">
            <Switch
              value={showFavoritesOnly}
              onValueChange={setShowFavoritesOnly}
              trackColor={{ false: "#767577", true: "#ff4b8c" }}
            />
            <Text
              className={showFavoritesOnly ? "text-base-content" : "text-gray"}
            >
              Show Favorites Only
            </Text>
          </View>

          <View className="flex-row justify-center my-3 flex-wrap gap-1">
            {selectedFilter ? (
              <>
                <Button onPress={() => setSelectedFilter("")} variant="primary">
                  x
                </Button>
                <View className="rounded-md px-4 py-2 bg-primary">
                  <Text className="text-center text-lg font-bold text-primary-content">
                    {filterOptions.find((f) => f.value === selectedFilter)
                      ?.label || selectedFilter}
                  </Text>
                </View>
              </>
            ) : (
              filterOptions.map((filter) => (
                <Button
                  key={filter.value}
                  onPress={() => {
                    setSelectedFilter(filter.value);
                    setSearchValue("");
                  }}
                >
                  {filter.label}
                </Button>
              ))
            )}
          </View>

          <Divider />

          <ScrollView className="w-full">
            {recentExercises.length > 0 && showFavoritesOnly === false && (
              <View className="mb-4">
                <View>
                  <Text className="text-base-content font-bold text-2xl">
                    Recent Exercises
                  </Text>
                </View>
                {recentExercises.map((exercise) => (
                  <ExerciseSelectorButton
                    key={exercise.id}
                    exercise={exercise}
                    handleSelect={handleSelect}
                    addToRecent={addToRecentExercises}
                    isFavorite={favoriteExerciseIds.has(exercise.id)}
                    onToggleFavorite={() => toggleFavorite(exercise)}
                  />
                ))}
              </View>
            )}

            <View>
              <Text className="text-base-content font-bold text-2xl">
                {showFavoritesOnly
                  ? "Favorites"
                  : `${selectedFilter || ""} Exercises`}
              </Text>
            </View>

            {(showFavoritesOnly ? filteredFavorites : filteredExercises).map(
              (exercise) => (
                <ExerciseSelectorButton
                  key={exercise.id}
                  exercise={exercise}
                  handleSelect={handleSelect}
                  addToRecent={addToRecentExercises}
                  isFavorite={favoriteExerciseIds.has(exercise.id)}
                  onToggleFavorite={() => toggleFavorite(exercise)}
                />
              )
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default ExerciseSelector;
