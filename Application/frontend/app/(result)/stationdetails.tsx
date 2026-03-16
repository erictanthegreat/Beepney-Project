import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import "@fontsource/poppins";
import { useLocalSearchParams } from "expo-router";
import BackButton from "@/components/Backbutton";
import StationDetailsCard from "@/components/ViewStationCard";
import ViewStationTable from "@/components/ViewStationTable";
import { supabase } from "@/scripts/supabase";

interface StationDestination {
  vehicle_type: string;
  destination: string;
  count: number;
}

interface Vehicle {
  type: string;
  destination: string;
  count: number;
}

// Converts "HH:MM:SS" or "HH:MM" military time to "H:MM AM/PM"
const formatTime = (time: string | null | undefined): string => {
  if (!time) return "N/A";

  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${hour}:${minute} ${period}`;
};

export default function StationDetails() {
  const { id } = useLocalSearchParams();
  const [station, setStation] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (id) {
      fetchStationDetails(id as string);
    }
  }, [id]);

  const fetchStationDetails = async (stationId: string) => {
    const { data: stationData, error: stationError } = await supabase
      .from("stations")
      .select("*")
      .eq("id", stationId)
      .single();

    if (stationError) {
      console.error("Error fetching station:", stationError);
      return;
    }
    setStation(stationData);

    const { data: destinationRows, error: destinationError } = await supabase
      .from("station_destinations")
      .select("vehicle_type, destination, count")
      .eq("station_id", stationId);

    if (destinationError) {
      console.error("Error fetching destinations:", destinationError);
      return;
    }

    const transformedData: Vehicle[] = (destinationRows || []).map(
      (row: StationDestination) => ({
        type: row.vehicle_type,
        destination: row.destination,
        count: row.count,
      }),
    );

    setVehicleData(transformedData);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <BackButton />
      <Text style={stationStyles.header}>{station?.name || "Loading..."}</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={stationStyles.container}>
          {station && (
            <StationDetailsCard
              location={station.location}
              operation_time_am={formatTime(station.operation_time_am)}
              operation_time_pm={formatTime(station.operation_time_pm)}
              vehicle_types={station.vehicle_types}
            />
          )}
        </View>

        <Text style={stationStyles.subheader}>
          Destinations & Current Available Vehicles
        </Text>

        <View>
          <ViewStationTable data={vehicleData} />
        </View>
      </ScrollView>
    </View>
  );
}

const stationStyles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 25,
    marginLeft: 20,
    marginTop: 10,
    color: "#073051",
    fontFamily: "Poppins",
    marginBottom: 20,
  },
  container: {
    alignItems: "center",
  },
  subheader: {
    color: "#073051",
    fontSize: 17,
    margin: 20,
    fontWeight: "bold",
  },
});
