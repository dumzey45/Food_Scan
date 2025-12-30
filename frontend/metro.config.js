const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Keep .bin support
config.resolver.assetExts.push("bin");

// Stub react-native-fs to a harmless module (prevents "Unable to resolve" error)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "react-native-fs": require.resolve("expo-constants"), // Safe stub (or use "expo-asset")
};

// Block the specific file that causes the react-native-fs require
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : []),
  /node_modules\/@tensorflow\/tfjs-react-native\/dist\/bundle_resource_io\.js$/,
];

// Apply NativeWind last
module.exports = withNativeWind(config, { input: "./global.css" });
