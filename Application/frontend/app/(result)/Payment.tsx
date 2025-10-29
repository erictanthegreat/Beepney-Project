import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";

const QR_CODE_STORAGE_KEY = "@gcash_qr_code";

export default function RideHistory() {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadQrCode();
  }, []);

  const loadQrCode = async () => {
    try {
      const savedQrCode = await AsyncStorage.getItem(QR_CODE_STORAGE_KEY);
      if (savedQrCode) {
        setQrImage(savedQrCode);
      }
    } catch (error) {
      console.error("Error loading QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQrCode = async (imageUri: string) => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(QR_CODE_STORAGE_KEY, imageUri);
      Alert.alert("Success", "QR code saved successfully!");
    } catch (error) {
      console.error("Error saving QR code:", error);
      Alert.alert("Error", "Failed to save QR code. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload your QR code!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setQrImage(imageUri);
      await saveQrCode(imageUri);
    }
  };

  const removeImage = () => {
    Alert.alert(
      "Remove QR Code",
      "Are you sure you want to remove this QR code?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(QR_CODE_STORAGE_KEY);
              setQrImage(null);
              Alert.alert("Success", "QR code removed successfully!");
            } catch (error) {
              console.error("Error removing QR code:", error);
              Alert.alert("Error", "Failed to remove QR code.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View>
          <BackButton />
          <Text style={styles.header}> Receive Payments </Text>
          <Text style={styles.subheader}>
            Receive your payment through attaching QR Code{"\n"}from e-wallets.
          </Text>
        </View>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#007DFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View>
        <BackButton />
        <Text style={styles.header}> Receive Payments </Text>
        <Text style={styles.subheader}>
          Receive your payment through attaching QR Code{"\n"}from e-wallets.
        </Text>
      </View>

      <View style={styles.container}>
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>GCash QR Code</Text>

          {qrImage ? (
            <View>
              <View style={styles.qrBox}>
                <Image
                  source={{ uri: qrImage }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrDescription}>
                Scan this QR code to send payment
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={pickImage}
                  disabled={isSaving}
                >
                  <Text style={styles.changeButtonText}>
                    {isSaving ? "Saving..." : "Change QR Code"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={removeImage}
                  disabled={isSaving}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>
                  Attach QR Code from GCash
                </Text>
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImage}
                disabled={isSaving}
              >
                <Text style={styles.uploadButtonText}>
                  {isSaving ? "Saving..." : "Upload QR Code"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.uploadDescription}>
                Tap to select your GCash QR code from gallery
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  subheader: {
    marginLeft: 25,
    color: "#595959",
    marginBottom: 30,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#595959",
  },
  qrContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
    maxWidth: 350,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#073051",
    marginBottom: 15,
    fontFamily: "Poppins",
  },
  qrBox: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007DFF",
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrDescription: {
    marginTop: 15,
    fontSize: 14,
    color: "#595959",
    textAlign: "center",
  },
  uploadContainer: {
    alignItems: "center",
    width: "100%",
  },
  placeholderBox: {
    backgroundColor: "#F5F5F5",
    padding: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 200,
  },
  placeholderText: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#007DFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadDescription: {
    marginTop: 10,
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },
  changeButton: {
    backgroundColor: "#007DFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  changeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    flex: 1,
  },
  removeButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
