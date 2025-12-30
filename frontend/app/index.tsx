import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import "../global.css";
import FoodDetails from "./FoodDetails";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios"

// No extra imports or polyfills needed — Expo SDK 54 has fetch built-in

const TUTORIAL_KEY = "hasSeenTutorial";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [prediction, setPrediction] = useState<{
    label: string;
    confidence: number;
  } | null>(null);

  const [modelError, setModelError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const cameraRef = useRef<any>(null);


  // First-time tutorial check
  useEffect(() => {
    (async () => {
      const hasSeen = await AsyncStorage.getItem(TUTORIAL_KEY);
      if (!hasSeen) {
        setShowTutorial(true);
      }
    })();
  }, []);

 const scanFood = async () => {
  if (!cameraRef.current || isScanning) return;

  setIsScanning(true);
  setModelError(null);

  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      skipProcessing: true,
    });

    // Create form data
    const formData = new FormData();
    formData.append("image", {
      uri: photo.uri,
      name: "food.jpg",
      type: "image/jpeg",
    } as any);

    // ⚠️ use your LOCAL IP, not localhost
    const response = await axios.post(
      "https://food-scan.onrender.com/predict",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 20000,
      }
    );

    setPrediction({
      label: response.data.label,
      confidence: response.data.confidence,
    });
  } catch (err: any) {
    console.log("Scan error:", err?.message || err);
    setModelError("Scan failed – check connection");
  } finally {
    setIsScanning(false);
  }
};

  const closeTutorial = async () => {
    setShowTutorial(false);
    await AsyncStorage.setItem(TUTORIAL_KEY, "true");
  };

  if (!permission) return <View className="bg-black flex-1" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white text-3xl font-bold text-center mb-6">
          Camera Access Needed
        </Text>
        <Text className="text-gray-400 text-lg text-center mb-12 px-4">
          Allow camera to scan food and check freshness instantly
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text className="bg-blue-600 text-white text-xl font-bold px-16 py-5 rounded-full">
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  if (modelError) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-red-400 text-3xl font-bold text-center mb-6">
          Connection Error
        </Text>
        <Text className="text-gray-400 text-lg text-center px-4">
          {modelError}
        </Text>
      </View>
    );
  }

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

        {/* Header */}
        <View className="absolute top-0 left-0 right-0 pt-12 pb-4 px-6 bg-gradient-to-b from-black/70 to-transparent">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-4xl font-extrabold">
                Food Scanner
              </Text>
              <Text className="text-blue-400 text-lg font-medium">
                AI Freshness Detector
              </Text>
            </View>

            <TouchableOpacity onPress={() => setTorch(!torch)}>
              <View className="bg-black/60 p-4 rounded-full">
                <Text className="text-3xl">{torch ? "🔦" : "⚫"}</Text>
                <Text className="text-white text-xs mt-1 text-center">
                  {torch ? "ON" : "OFF"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Frame + Instruction */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View className="w-80 h-80 border-4 border-blue-600 rounded-3xl" />
          <Text className="text-blue-400 text-lg font-bold mt-4">
            Place food inside the frame
          </Text>
        </View>

        {/* Scan Button */}
        <View className="absolute top-[75%] left-0 right-0 items-center px-8">
          <TouchableOpacity onPress={scanFood} disabled={isScanning}>
            <View
              className={`rounded-full px-9 py-6 ${isScanning ? "bg-gray-600" : "bg-blue-600"}`}
            >
              <Text className="text-white text-2xl font-extrabold text-center">
                {isScanning ? "Scanning..." : "SCAN FOOD"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Result Overlay */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-16">
          {prediction && (
            <FoodDetails
              confidence={prediction.confidence}
              label={prediction.label}
              onClose={() => setPrediction(null)}
            />
          )}
        </View>
      </View>
      {/* Tutorial Modal */}
      <Modal visible={showTutorial} transparent animationType="slide">
        <View className="flex-1 bg-transparent items-center justify-center px-8  ">
          <View className="bg-gray-900 rounded-2xl p-10 items-center w-full max-w-lg">
            <Text className="text-blue-400 text-5xl font-extrabold mb-8">
              Welcome! 👋 
            </Text>

            <Text className="text-white text-3xl font-bold text-center mb-10">
              How to Use Food Scanner
            </Text>

            <View className="space-y-8 mb-12 w-full">
              <View className="flex-row items-start">
                <Text className="text-blue-400 text-3xl font-bold mr-6">1</Text>
                <Text className="text-gray-200 text-lg flex-1">
                  Point camera at fruit or vegetable
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-blue-400 text-3xl font-bold mr-6">2</Text>
                <Text className="text-gray-200 text-lg flex-1">
                  Fit it inside the blue frame
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-blue-400 text-3xl font-bold mr-6">3</Text>
                <Text className="text-gray-200 text-lg flex-1">
                  Tap the big blue button below
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-blue-400 text-3xl font-bold mr-6">4</Text>
                <Text className="text-gray-200 text-lg flex-1">
                  See instant Fresh/Rotten result!
                </Text>
              </View>
            </View>

            <Text className="text-gray-400 text-center mb-12 italic text-lg">
              Tip: Good lighting = better accuracy. Use torch if needed 🔦
            </Text>

            <TouchableOpacity onPress={closeTutorial}>
          <Text className="text-white bg-blue-600 p-4 rounded">Lets Go!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
