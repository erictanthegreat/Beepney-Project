import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  AlertButton,
  Modal,
  ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import CaptureIcon from "../assets/images/capture.svg";
import AttachIcon from "../assets/images/attach file.svg";
import BackButtonIcon from "../assets/images/backbutton.svg";

interface Props {
  label?: string;
  onFileSelected?: (uri: string | null, type: "image" | "video" | null) => void;
  containerStyle?: ViewStyle;
}

export default function MediaCaptureButton({
  label = "Tap here to take or select media",
  containerStyle,
  onFileSelected,
}: Props) {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setIsCameraOpen(true);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setFileUri(photo.uri);
    setFileType("image");
    onFileSelected?.(photo.uri, "image");
    setIsCameraOpen(false);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Gallery permission is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // allow images & videos
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setFileUri(asset.uri);
      setFileType(asset.type === "video" ? "video" : "image");
      onFileSelected?.(asset.uri, asset.type === "video" ? "video" : "image");
    }
  };

  const removeFile = () => {
    setFileUri(null);
    setFileType(null);
    onFileSelected?.(null, null);
  };

  const handlePress = () => {
    const options: AlertButton[] = [
      { text: "Take Photo", onPress: openCamera, style: "default" },
      {
        text: "Choose from Gallery",
        onPress: pickFromGallery,
        style: "default",
      },
    ];

    if (fileUri) {
      options.push({
        text: "Remove File",
        onPress: removeFile,
        style: "destructive",
      });
    }

    options.push({ text: "Cancel", onPress: () => {}, style: "cancel" });
    Alert.alert("Select Option", "What do you want to do?", options);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.buttonId, containerStyle]} // merge default styles with custom
        onPress={handlePress}
      >
        {fileUri ? (
          fileType === "image" ? (
            <Image source={{ uri: fileUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={{ color: "#fff" }}>🎥 Video Selected</Text>
            </View>
          )
        ) : (
          <>
            <AttachIcon
              width={32}
              color="#D1D1D1"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.buttonText}>{label}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Camera Modal */}
      <Modal visible={isCameraOpen} animationType="slide">
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <TouchableOpacity
            onPress={() => setIsCameraOpen(false)}
            style={styles.backButton}
          >
            <BackButtonIcon />
          </TouchableOpacity>

          <View style={styles.overlay}>
            <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
              <CaptureIcon />
            </TouchableOpacity>
          </View>
        </CameraView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    alignItems: "flex-start",
  },
  buttonId: {
    height: 120,
    width: 300,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#fff",
    overflow: "hidden",
  },
  buttonText: {
    color: "#073051",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },

  imagePreview: {
    width: "120%",
    height: "120%",
    borderRadius: 10,
  },
  videoPlaceholder: {
    width: "120%",
    height: "120%",
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 20,
  },
  captureBtn: { backgroundColor: "#fff", padding: 30, borderRadius: 50 },
});
