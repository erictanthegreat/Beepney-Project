import React, { Component } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Table from "../../components/ui/TableComponent";
import "@fontsource/poppins";
import ProfileIcon from "../../assets/images/profile.svg";
import NotifIcon from "../../assets/images/notif.svg";
import JeepIcon from "../../assets/images/jeep.svg";
import TrikeIcon from "../../assets/images/tricycle.svg";
import BusIcon from "../../assets/images/bus.svg";
import FCIcon from "../../assets/images/fc icon.svg";
import RHIcon from "../../assets/images/ride history.svg";
import DDIcon from "../../assets/images/scan.svg";
import RideHIcon from "../../assets/images/ride hailing.svg";
import FareIcon from "../../assets/images/fare.svg";
import { router } from "expo-router";

export default class DriverHome extends Component {
  state = {
    activeTab: 1,
  };

  setActiveTab = (tab: number) => {
    this.setState({ activeTab: tab });
  };

  renderTable = () => {
    const tableData = [
      {
        headers: ["Distance (kms.)", "Jeepney"],
        data: [
          ["Regular 1- 4 Kilometers", "₱13.00"],
          ["Succeeding Kilometers", "₱1.80 p/kms"],
          ["Student/Elder/PWD/Solo Parent", "₱10.40"],
          ["Succeeding Kilometers", "₱1.44 p/kms"],
        ],
      },
      {
        headers: ["Distance (kms.)", "Tricycle"],
        data: [
          ["Regular 1- 4 Kilometers", "₱15.00"],
          ["Succeeding Kilometers", "₱7.50 p/500 m"],
          ["Student/Elder/PWD/Solo Parent", "₱13.00"],
          ["Succeeding Kilometers", "₱6.50 p/500 m"],
        ],
      },
      {
        headers: ["Distance (kms.)", "Bus"],
        data: [
          ["Regular 1- 4 Kilometers", "₱15.00"],
          ["Succeeding Kilometers", "₱7.50 p/500 m"],
          ["Student/Elder/PWD/Solo Parent", "₱13.00"],
          ["Succeeding Kilometers", "₱6.50 p/500 m"],
        ],
      },
    ];

    return (
      <Table
        headers={tableData[this.state.activeTab - 1].headers}
        data={tableData[this.state.activeTab - 1].data}
      />
    );
  };

  render() {
    const { activeTab } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => router.push("/(profile)/DriverProfile")}
          >
            <ProfileIcon style={iconStyles.prof} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 15,
              color: "#073051",
              marginTop: 60,
              marginLeft: 5,
              fontFamily: "Poppins",
            }}
          >
            {" "}
            Hello, Ayath!{" "}
          </Text>

          <TouchableOpacity>
            <NotifIcon style={iconStyles.notif} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={styles.text}>Overview</Text>
            <View style={styles.segmentContainer}>
              {[1, 2, 3].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.segmentButton,
                    activeTab === tab && styles.activeButton,
                  ]}
                  onPress={() => this.setActiveTab(tab)}
                >
                  <Text
                    style={
                      activeTab === tab
                        ? styles.activeText
                        : styles.inactiveText
                    }
                  >
                    {tab === 1 && (
                      <JeepIcon
                        fill={activeTab === tab ? "#ffffff" : "#888888"}
                        width={28}
                        height={28}
                      />
                    )}
                    {tab === 2 && (
                      <TrikeIcon
                        fill={activeTab === tab ? "#ffffff" : "#888888"}
                        width={28}
                        height={28}
                      />
                    )}
                    {tab === 3 && (
                      <BusIcon
                        fill={activeTab === tab ? "#ffffff" : "#888888"}
                        width={30}
                        height={30}
                      />
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Table */}
          {this.renderTable()}

          {/* Detailed Fare Matrices*/}
          <View style={styles.container}>
            <Text style={fareStyle.fare}>Detailed Fare Matrices</Text>
            <TouchableOpacity style={fareStyle.button}>
              <FareIcon style={iconStyles.fare} />
            </TouchableOpacity>
          </View>

          {/* Other Features */}
          <View style={featStyles.container}>
            <TouchableOpacity
              onPress={() => router.push("/(feat)/FareCalculator")}
              style={featStyles.featureButton}
            >
              <FCIcon style={featStyles.icon} />
              <Text style={featStyles.text}>Fare Calculator</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(feat)/ScanDriverDets")}
              style={featStyles.featureButton}
            >
              <DDIcon style={featStyles.icon} />
              <Text style={featStyles.text}>Generate QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(feat)/RideHistory")}
              style={featStyles.featureButton}
            >
              <RHIcon style={featStyles.icon} />
              <Text style={featStyles.text}>Ride History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(driver)/DriverRideHailing")}
              style={featStyles.featureButton}
            >
              <RideHIcon style={featStyles.icon} />
              <Text style={featStyles.text}>Ride-Hailing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    fontFamily: "Poppins",
  },
  text: {
    fontWeight: "bold",
    fontSize: 23,
    color: "#073051",
    fontFamily: "Poppins",
  },

  segmentContainer: {
    flexDirection: "row",
    borderRadius: 20,
    overflow: "hidden",
    height: 40,
    width: 167,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  segmentButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#1E86DA",
    color: "#fff",
  },
  inactiveText: {
    color: "#777",
  },
  activeText: {
    color: "#fff",
  },
});

const iconStyles = StyleSheet.create({
  prof: {
    marginTop: 60,
    marginLeft: 20,
  },
  notif: {
    marginTop: 60,
    marginLeft: 165,
  },
  fare: {
    marginTop: 5,
    alignItems: "center",
  },
});

const fareStyle = StyleSheet.create({
  fare: {
    fontWeight: "bold",
    fontSize: 23,
    color: "#073051",
    marginTop: 5,
    marginLeft: 10,
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    borderWidth: 1,
    paddingVertical: 10,
    marginLeft: 40,
    borderRadius: 15,
    marginTop: 15,
    width: "27.5%",
    alignItems: "center",
  },
});

const featStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 25,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
  },
  featureButton: {
    width: "47%",
    marginBottom: 20,
    alignItems: "center",
  },
  text: {
    color: "#1E86DA",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Poppins",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
