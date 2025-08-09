import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import "@fontsource/poppins";
import BackButton from "@/components/Backbutton";
import DropDown from "@/components/ui/DropDown";
import FareIcon from "@/assets/images/fare.svg";
import OriginIcon from "@/assets/images/loc.svg";
import DestIcon from "@/assets/images/loc 2.svg";

export default class Renting extends Component {
  state = {
    vehicleType: "",
    paymentMethod: "",
  };

  render() {
    return (
      <FlatList
        data={[]} // No list items, we just want scroll behavior
        ListHeaderComponent={
          <>
            <BackButton />
            <Text style={fareStyles.header}>Calculate Your Ride</Text>
            <Text
              style={{
                marginLeft: 25,
                color: "#595959",
                fontFamily: "Poppins",
              }}
            >
              Calculate your fare for a fair trip.
            </Text>

            <View style={fareStyles.container}>
              <View style={fareStyles.cont}>
                <TouchableOpacity>
                  <OriginIcon style={fareStyles.icon} />
                </TouchableOpacity>
                <TextInput
                  style={{ marginTop: 5, flex: 1 }}
                  placeholder="Enter Origin"
                />
              </View>

              <View style={fareStyles.cont}>
                <TouchableOpacity>
                  <DestIcon style={fareStyles.icon} />
                </TouchableOpacity>
                <TextInput
                  style={{ marginTop: 5, flex: 1 }}
                  placeholder="Enter Destination"
                />
              </View>

              <DropDown
                data={["Regular", "Student"]}
                onSelect={(value) => this.setState({ vehicleType: value })}
              />

              <DropDown
                data={[
                  "E-Tricycles",
                  "Trycicle",
                  "Taxi",
                  "Pedicab",
                  "PUJ Traditional",
                  "PUJ Modern",
                  "UV Express",
                  "PUB Traditional",
                  "PUB Modern",
                ]}
                onSelect={(value) => this.setState({ paymentMethod: value })}
              />

              <TouchableOpacity
                style={fareStyles.button}
                onPress={() =>
                  console.log(
                    "Selected:",
                    this.state.vehicleType,
                    this.state.paymentMethod
                  )
                }
              >
                <Text style={fareStyles.buttText}>Calculate Fare</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 30 }}>
              <Text style={fareStyles.fare}>Detailed Fare Matrices</Text>
              <TouchableOpacity style={fareStyles.fareButton}>
                <FareIcon style={fareStyles.fare} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Text style={fareStyles.fare2}>Ride History</Text>
              <TouchableOpacity style={fareStyles.fareButton}>
                <Text style={fareStyles.fareButton2}>See all</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={() => null}
        keyExtractor={(_, index) => index.toString()}
      />
    );
  }
}

const fareStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#073051",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 40,
    width: "100%",
    alignItems: "center",
  },
  buttText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    elevation: 2,
  },
  cont: {
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
    height: 60,
    borderColor: "#073051",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
    height: 60,
    borderColor: "#073051",
    fontFamily: "Poppins",
    color: "#9A9A9A",
    paddingLeft: 20,
  },
  fare: {
    fontWeight: "bold",
    fontSize: 23,
    color: "#073051",
    marginTop: 5,
    marginLeft: 10,
    fontFamily: "Poppins",
  },
  fare2: {
    fontWeight: "bold",
    fontSize: 23,
    color: "#073051",
    marginTop: 5,
    marginLeft: 10,
    marginRight: 97,

    fontFamily: "Poppins",
  },
  fareButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    borderWidth: 1,
    paddingVertical: 10,
    marginLeft: 40,
    borderRadius: 15,
    width: "27.5%",
    alignItems: "center",
  },
  fareButton2: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBCBCB",
    color: "#1E86DA",
    borderRadius: 15,
    width: 50,
    height: 20,
    flexDirection: "row",
    fontFamily: "Poppins",
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
});
