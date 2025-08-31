// components/PaymentModal.tsx - Fixed redirect params
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import paymongoService from "../services/paymongoService";
import { PAYMENT_METHODS } from "../config/paymongo";

const { width, height } = Dimensions.get("window");

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  originalAmount?: number;
  description: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  amount,
  originalAmount,
  description,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);

  // Generate redirect URLs once
  const successUrl = Linking.createURL("payment-result?status=success");
  const failedUrl = Linking.createURL("payment-result?status=failed");

  const processEWalletPayment = async (paymentType: string) => {
    if (amount < 20) {
      onError(
        "Payment amount must be at least ₱20.00 for PayMongo transactions."
      );
      return;
    }

    setLoading(true);
    setSelectedPaymentMethod(paymentType);

    try {
      const source = await paymongoService.createSource(
        paymentType,
        Math.round(amount * 100), // centavos
        "PHP",
        {
          success: successUrl,
          failed: failedUrl,
        }
      );

      setSourceId(source.id);
      setCheckoutUrl(source.attributes.redirect.checkout_url);
      setShowWebView(true);
    } catch (error: any) {
      console.error("Payment creation error:", error);
      onError(error.message);
      setSelectedPaymentMethod(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigation = (navState: any) => {
    const { url } = navState;
    if (url.includes("payment-result")) {
      setShowWebView(false);
      checkPaymentStatus();
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const source = await paymongoService.retrieveSource(sourceId);

      if (source.attributes.status === "chargeable") {
        onSuccess({
          sourceId: source.id,
          amount,
          paymentMethod: selectedPaymentMethod,
          status: "success",
        });
      } else if (source.attributes.status === "failed") {
        onError("Payment failed or was cancelled");
      } else {
        onError("Payment status unknown");
      }
    } catch (error: any) {
      onError(error.message);
    } finally {
      resetModal();
    }
  };

  const resetModal = () => {
    setSelectedPaymentMethod(null);
    setShowWebView(false);
    setCheckoutUrl("");
    setSourceId("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // ✅ Show WebView if paying
  if (showWebView) {
    return (
      <Modal visible={visible} animationType="slide" style={{ flex: 1 }}>
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Complete Payment</Text>
            <TouchableOpacity
              style={styles.closeWebViewButton}
              onPress={() => {
                setShowWebView(false);
                resetModal();
              }}
            >
              <Text style={styles.closeWebViewText}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleWebViewNavigation}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E86DA" />
                <Text style={styles.loadingText}>Loading payment page...</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    );
  }

  // ✅ Otherwise show method picker
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Payment Method</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Payment Amount</Text>
            <Text style={styles.amountValue}>₱{amount.toFixed(2)}</Text>

            {originalAmount && originalAmount !== amount && (
              <View style={styles.originalAmountContainer}>
                <Text style={styles.originalAmountLabel}>
                  Original Fare: ₱{originalAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <Text style={styles.minimumAmountNote}>
              *Minimum payment amount: ₱20.00
            </Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Payment Buttons */}
          <View style={styles.paymentMethodsContainer}>
            <TouchableOpacity
              style={[styles.paymentButton, styles.gcashButton]}
              onPress={() => processEWalletPayment(PAYMENT_METHODS.GCASH)}
              disabled={loading}
            >
              {loading && selectedPaymentMethod === PAYMENT_METHODS.GCASH ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.paymentButtonText}>Pay with GCash</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentButton, styles.paymayaButton]}
              onPress={() => processEWalletPayment(PAYMENT_METHODS.PAYMAYA)}
              disabled={loading}
            >
              {loading && selectedPaymentMethod === PAYMENT_METHODS.PAYMAYA ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mayapaymentButtonText}>Pay with Maya</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#073051",
    fontFamily: "Poppins",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
  },
  amountLabel: {
    fontSize: 14,
    color: "#737F83",
    fontFamily: "Poppins",
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E86DA",
    fontFamily: "Poppins",
  },
  originalAmountContainer: {
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  originalAmountLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins",
  },
  minimumAmountNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 5,
    fontFamily: "Poppins",
  },
  description: {
    fontSize: 14,
    color: "#737F83",
    textAlign: "center",
    marginTop: 5,
    fontFamily: "Poppins",
  },
  paymentMethodsContainer: {
    marginBottom: 20,
  },
  paymentButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  gcashButton: {
    backgroundColor: "#007CFF",
  },
  paymayaButton: {
    backgroundColor: "#000000ff",
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  mayapaymentButtonText: {
    color: "#2ff29e",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#737F83",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  // WebView styles
  webViewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1E86DA",
    paddingTop: 50,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Poppins",
  },
  closeWebViewButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeWebViewText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#737F83",
    fontFamily: "Poppins",
  },
});

export default PaymentModal;
