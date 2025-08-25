
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen({ navigation }) {
  const handleContinue = () => {
    // go straight to Sign In (users can jump to Sign Up from there)
    navigation.navigate("SignIn");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Logo */}
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Ionicons name="calendar-outline" size={44} color="#667eea" />
        </View>
        <Text style={styles.appName}>Smart Scheduler</Text>
        <Text style={styles.tagline}>Plan less. Do more.</Text>
      </View>

      {/* Continue button (single CTA) */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>

        {/* Optional tiny note below (not a button) */}
        <Text style={styles.helperText}>
          Sign in to your account or create a new one
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  logoWrap: {
    alignItems: "center",
    marginTop: 80,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102, 126, 234, 0.1)", // matches your Sign In vibe
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: "#9ca3af",
  },
  ctaWrap: {
    marginBottom: 48,
  },
  continueBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea", // primary from your Sign In button
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 12,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  helperText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 14,
  },
});
