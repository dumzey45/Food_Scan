import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import "../global.css";
import FoodDetails from "./FoodDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ DO NOT use axios for multipart in Expo
const BACKEND_URL = "https://food-scan.onrender.com";

const TUTORIAL_KEY = "hasSeenTutorial";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const [torch, setTorch] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [prediction, setPrediction] = useState<{
    label: string;
    confidence: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  /* =========================
     FIRST TIME TUTORIAL
  ========================= */
  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem(TUTORIAL_KEY);
      if (!seen) setShowTutorial(true);
    })();
  }, []);

  /* =========================
     SCAN FOOD
  ========================= */
  const scanFood = async () => {
    if (!cameraRef.current || isScanning) return;

    setIsScanning(true);
    setError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      const formData = new FormData();
      formData.append("image", {
        uri: photo.uri,
        name: "food.jpg",
        type: "image/jpeg",
      } as any);

      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      const data = await res.json();

      setPrediction({
        label: data.label,
        confidence: data.confidence,
      });
    } catch (err: any) {
      console.log("❌ Scan error:", err);
      setError("Network error — backend unreachable");
    } finally {
      setIsScanning(false);
    }
  };

  const closeTutorial = async () => {
    setShowTutorial(false);
    await AsyncStorage.setItem(TUTORIAL_KEY, "true");
  };

  /* =========================
     PERMISSION STATES
  ========================= */
  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white text-3xl font-bold mb-6">
          Camera Access Needed
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text className="bg-blue-600 text-white px-10 py-4 rounded-full text-xl">
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-red-400 text-2xl font-bold mb-4">
          Connection Error
        </Text>
        <Text className="text-gray-400 text-center">{error}</Text>
      </View>
    );
  }

  /* =========================
     MAIN UI
  ========================= */
  return (
    <>
      <View className="flex-1 bg-black">
        <StatusBar translucent backgroundColor="transparent" />

        <CameraView
          ref={cameraRef}
          facing="back"
          enableTorch={torch}
          style={{ flex: 1 }}
        />

        {/* HEADER */}
        <View className="absolute top-0 left-0 right-0 pt-12 px-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-4xl font-extrabold">
                Food Scanner
              </Text>
              <Text className="text-blue-400 text-lg">
                AI Freshness Detector
              </Text>
            </View>

            <TouchableOpacity onPress={() => setTorch(!torch)}>
              <View className="bg-black/70 p-4 rounded-full">
                <Text className="text-3xl">{torch ? "🔦" : "⚫"}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* FRAME */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View className="w-80 h-80 border-4 border-blue-600 rounded-3xl" />
          <Text className="text-blue-400 mt-4 text-lg font-bold">
            Place food inside the frame
          </Text>
        </View>

        {/* BUTTON */}
        <View className="absolute bottom-[14%] left-0 right-0 items-center">
          <TouchableOpacity onPress={scanFood} disabled={isScanning}>
            <View className="bg-blue-600 px-10 py-6 rounded-full">
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-2xl font-bold">SCAN FOOD</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* RESULT */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-16">
          {prediction && (
            <FoodDetails
              label={prediction.label}
              confidence={prediction.confidence}
              onClose={() => setPrediction(null)}
            />
          )}
        </View>
      </View>

      {/* TUTORIAL */}
      <Modal visible={showTutorial} transparent animationType="slide">
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-gray-900 rounded-2xl p-8 w-full">
            <Text className="text-blue-400 text-4xl font-bold mb-6 text-center">
              Welcome 👋
            </Text>

            <Text className="text-white text-lg mb-6 text-center">
              Point camera → tap scan → get result instantly
            </Text>

            <TouchableOpacity onPress={closeTutorial}>
              <Text className="bg-blue-600 text-white text-center py-4 rounded-lg text-lg">
                Let’s Go 🚀
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
