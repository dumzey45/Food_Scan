import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface FoodDetailsProps {
  onClose: () => void;
  label: string;
  confidence: number;
}

export default function FoodDetails({
  onClose,
  label,
  confidence,
}: FoodDetailsProps) {
  const isFresh = label === "Fresh";
  const barColor = isFresh ? "bg-green-500" : "bg-red-600";
  const titleColor = isFresh ? "text-green-400" : "text-red-400";

  return (
    <View className="bg-black/90 rounded-2xl p-6 items-center">
      <Text className={`text-5xl font-bold mb-10 ${titleColor}`}>
        {label.toUpperCase()}
      </Text>

      {/* Progress Bar */}
      <View className="w-80 bg-gray-800 rounded-full h-12 mb-8 overflow-hidden">
        <View
          className={`${barColor} h-12 rounded-full items-center justify-center`}
          style={{ width: `${confidence}%` }}
        >
          <Text className="text-white font-bold text-2xl">{confidence}%</Text>
        </View>
      </View>

      <Text className="text-white text-2xl mb-12">
        {confidence}% {label}
      </Text>

      <TouchableOpacity onPress={onClose}>
        <Text className="bg-blue-600 text-white text-xl px-10 py-5 rounded-full font-bold">
          Scan Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
