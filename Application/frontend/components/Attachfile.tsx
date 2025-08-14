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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import CaptureIcon from "../assets/images/capture.svg";
import AttachIcon from "../assets/images/attach file.svg";
import BackButtonIcon from "../assets/images/backbutton.svg";
import CamGridIcon from "../assets/images/Scan Grid.svg";

interface Props {
  label?: string;
  onImageSelected?: (uri: string | null) => void;
}

export default function IDCaptureButton({
  label = "Tap here to take the back picture of the ID",
  onImageSelected,
}: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const openCustomCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setIsCameraOpen(true);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);
      onImageSelected?.(photo.uri);
      setIsCameraOpen(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Gallery permission is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onImageSelected?.(uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    onImageSelected?.(null);
  };

  const handlePress = () => {
    const options: AlertButton[] = [
      { text: "Take Photo", onPress: openCustomCamera, style: "default" },
      {
        text: "Choose from Gallery",
        onPress: () => void pickFromGallery(),
        style: "default",
      },
    ];

    if (imageUri) {
      options.push({
        text: "Remove Image",
        onPress: () => removeImage(),
        style: "destructive",
      });
    }

    options.push({ text: "Cancel", onPress: () => {}, style: "cancel" });

    Alert.alert("Select Option", "What do you want to do?", options);
  };

  return (
    <View>
      <TouchableOpacity style={styles.buttonId} onPress={handlePress}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
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

      {/* Custom Camera Modal */}
      <Modal visible={isCameraOpen} animationType="slide">
        <CameraView
          style={{ flex: 1 }}
          ref={cameraRef}
          facing={ImagePicker.CameraType.back}
        >
          <TouchableOpacity
            onPress={() => setIsCameraOpen(false)}
            style={styles.backButton}
          >
            <BackButtonIcon />
          </TouchableOpacity>
          <View style={styles.grid}>
            <CamGridIcon />
          </View>

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
    justifyContent: "center",
  },
  buttonId: {
    height: 120,
    width: 300,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  buttonText: {
    color: "#073051",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 12,
  },
  grid: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  imagePreview: {
    width: "120%",
    height: "120%",
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 20,
  },
  captureBtn: {
    backgroundColor: "#ffffffff",
    paddingVertical: 30,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
});
