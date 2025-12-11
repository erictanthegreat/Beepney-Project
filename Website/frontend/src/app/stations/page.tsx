"use client";

import React, { useRef, useState, useEffect } from "react";
import Header from "../../components/ui/header";
import {
  ArrowLeftIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export interface Destination {
  id: string;
  vehicleType: string;
  destination: string;
  count: number;
}

export interface Station {
  id: string | number | null;
  name: string;
  location: string;
  operationTimeAM: string;
  operationTimePM: string;
  vehicleTypes: string[];
  coordinates: [number, number] | null;
  destinations: Destination[];
}

const defaultStation: Station = {
  id: null,
  name: "",
  location: "",
  operationTimeAM: "08:00",
  operationTimePM: "21:00",
  vehicleTypes: [],
  coordinates: null,
  destinations: [],
};

const insertStation = async (station: Station): Promise<Station | null> => {
  const { data, error } = await supabase
    .from("stations")
    .insert([
      {
        name: station.name,
        location: station.location,
        operation_time_am: station.operationTimeAM,
        operation_time_pm: station.operationTimePM,
        vehicle_types: station.vehicleTypes,
        coordinates: station.coordinates,
      },
    ])
    .select();

  if (error) {
    console.error("Error inserting station:", error);
    alert("Error saving station data. Please try again.");
    return null;
  }

  const createdStation = data?.[0] ?? null;
  if (createdStation && station.destinations.length > 0) {
    const destinationsPayload = station.destinations.map((d) => ({
      station_id: createdStation.id,
      vehicle_type: d.vehicleType,
      destination: d.destination,
      count: d.count,
    }));
    const { error: destErr } = await supabase
      .from("station_destinations")
      .insert(destinationsPayload);
    if (destErr) console.error("Error inserting destinations:", destErr);
  }

  return createdStation as Station;
};

const updateStation = async (station: Station): Promise<Station | null> => {
  const { data, error } = await supabase
    .from("stations")
    .update({
      name: station.name,
      location: station.location,
      operation_time_am: station.operationTimeAM,
      operation_time_pm: station.operationTimePM,
      vehicle_types: station.vehicleTypes,
      coordinates: station.coordinates,
    })
    .eq("id", station.id)
    .select();

  if (error) {
    console.error("Error updating station:", error);
    alert("Error updating station data.");
    return null;
  }

  if (station.destinations) {
    await supabase
      .from("station_destinations")
      .delete()
      .eq("station_id", station.id);
    const destinationsPayload = station.destinations.map((d) => ({
      station_id: station.id!,
      vehicle_type: d.vehicleType,
      destination: d.destination,
      count: d.count,
    }));
    if (destinationsPayload.length > 0) {
      const { error: destErr } = await supabase
        .from("station_destinations")
        .insert(destinationsPayload);
      if (destErr) console.error("Error upserting destinations:", destErr);
    }
  }

  return (data?.[0] as Station) ?? null;
};

const deleteStation = async (id: string | number): Promise<boolean> => {
  await supabase.from("station_destinations").delete().eq("station_id", id);
  const { error } = await supabase.from("stations").delete().eq("id", id);
  if (error) {
    console.error("Error deleting station:", error);
    alert("Error deleting station.");
    return false;
  }
  return true;
};

const fetchStations = async (): Promise<Station[]> => {
  const { data: stations, error } = await supabase.from("stations").select("*");
  if (error) {
    console.error("Error fetching stations:", error);
    return [];
  }

  if (!stations || stations.length === 0) return [];

  const stationIds = stations.map((s: any) => s.id);
  const { data: dests } = await supabase
    .from("station_destinations")
    .select("*")
    .in("station_id", stationIds);

  return stations.map((s: any) => ({
    ...s,
    vehicleTypes: s.vehicle_types ?? [],
    destinations: (dests || [])
      .filter((d: any) => d.station_id === s.id)
      .map((d: any) => ({
        id: d.id,
        vehicleType: d.vehicle_type,
        destination: d.destination,
        count: d.count,
      })),
  })) as Station[];
};

interface LabeledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const LabeledInput = ({ label, ...props }: LabeledInputProps) => (
  <div>
    <label className="text-[#073051] text-sm font-bold">{label}</label>
    <input
      {...props}
      className="w-full mt-1 p-2 border rounded-[15px] placeholder-[#D1D1D1]"
      style={{ borderColor: "#D1D1D1", color: "#000" }}
    />
  </div>
);

interface TimeRangeInputProps {
  valueAM: string;
  valuePM: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const TimeRangeInput = ({
  valueAM,
  valuePM,
  onChange,
  disabled,
}: TimeRangeInputProps) => (
  <div>
    <label className="text-[#073051] text-sm font-bold">Operation Time</label>
    <div className="flex gap-2 mt-1">
      <input
        name="operationTimeAM"
        type="time"
        value={valueAM}
        onChange={onChange}
        disabled={disabled}
        className="w-1/2 p-2 border rounded-[15px]"
        style={{ borderColor: "#D1D1D1", color: "#000" }}
      />
      <input
        name="operationTimePM"
        type="time"
        value={valuePM}
        onChange={onChange}
        disabled={disabled}
        className="w-1/2 p-2 border rounded-[15px]"
        style={{ borderColor: "#D1D1D1", color: "#000" }}
      />
    </div>
  </div>
);

const StationsPage = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const stationMarkersRef = useRef<Map<string | number, mapboxgl.Marker>>(
    new Map()
  );

  const [headerHeight, setHeaderHeight] = useState(90);
  const [isAddingStation, setIsAddingStation] = useState(false);
  const [stationData, setStationData] = useState<Station>(defaultStation);
  const [stationLandmarks, setStationLandmarks] = useState<Station[]>([]);

  const [role, setRole] = useState<string>("commuter");

  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(["All"]);

  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to check if user can edit
  const canEdit = () => role === "admin" || role === "ltfrb";

  const resetStationData = () => {
    setIsAddingStation(false);
    setStationData(defaultStation);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  // Fetch stations
  useEffect(() => {
    const loadStations = async () => {
      const stations = await fetchStations();
      setStationLandmarks(stations);
    };
    loadStations();
  }, []);

  // Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!error && data?.role) setRole(data.role);
      }
    };
    fetchRole();
  }, []);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [123.19, 13.62],
      zoom: 15,
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    // Map click handler - only allow editing for admin/ltfrb
    map.on("click", (e) => {
      if (!canEdit()) return;

      const { lng, lat } = e.lngLat;
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({
          color: "#1E86DA",
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(map);

        markerRef.current.on("dragend", () => {
          const coords = markerRef.current!.getLngLat();
          setStationData((prev) => ({
            ...prev,
            coordinates: [coords.lng, coords.lat],
          }));
        });
      }

      setStationData((prev) => ({ ...prev, coordinates: [lng, lat] }));
      setIsAddingStation(true);
    });

    return () => {
      map.remove();
    };
  }, [role]);

  // Draw saved stations
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current.clear();

    const getColor = (types: string[], activeFilters: string[]) => {
      const isAll = activeFilters.includes("All");

      if (isAll) {
        if (types.length > 1) return "#6F42C1";
        if (types.includes("TRICYCLE")) return "#FFA500";
        if (types.includes("JEEPNEY")) return "#007BFF";
        if (types.includes("VAN")) return "#28A745";
        return "#9A9A9A";
      }

      const filteredType = activeFilters.find((t) => types.includes(t));
      if (filteredType === "TRICYCLE") return "#FFA500";
      if (filteredType === "JEEPNEY") return "#007BFF";
      if (filteredType === "VAN") return "#28A745";

      return "#9A9A9A";
    };

    const filteredStations = stationLandmarks.filter((station) => {
      const term = searchTerm.toLowerCase();
      return (
        station.name.toLowerCase().includes(term) ||
        station.location.toLowerCase().includes(term) ||
        station.destinations.some((d) =>
          d.destination.toLowerCase().includes(term)
        )
      );
    });

    filteredStations.forEach((station: Station) => {
      if (!station?.coordinates || station.coordinates.length !== 2) return;

      const showStation =
        activeFilters.includes("All") ||
        station.vehicleTypes.some((t) => activeFilters.includes(t));

      if (!showStation) return;

      const id = station.id as string | number;
      const color = getColor(station.vehicleTypes, activeFilters);

      const marker = new mapboxgl.Marker({ color })
        .setLngLat(station.coordinates)
        .addTo(map);

      marker.getElement().addEventListener("click", (ev) => {
        ev.stopPropagation();

        if (markerRef.current) markerRef.current.remove();

        const draggable = canEdit();

        if (station.coordinates) {
          markerRef.current = new mapboxgl.Marker({
            color,
            draggable,
          })
            .setLngLat(station.coordinates)
            .addTo(map);

          if (draggable) {
            markerRef.current.on("dragend", () => {
              const coords = markerRef.current!.getLngLat();
              setStationData((prev) => ({
                ...prev,
                coordinates: [coords.lng, coords.lat],
              }));
            });
          }
        }

        setStationData({
          id: station.id ?? null,
          name: station.name ?? "",
          location: station.location ?? "",
          operationTimeAM: station.operationTimeAM ?? "08:00",
          operationTimePM: station.operationTimePM ?? "21:00",
          vehicleTypes: station.vehicleTypes ?? [],
          coordinates: station.coordinates ?? null,
          destinations: station.destinations ?? [],
        });

        setIsAddingStation(true);
      });

      stationMarkersRef.current.set(id, marker);
    });
  }, [stationLandmarks, role, activeFilters, searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDone = async () => {
    if (!stationData.coordinates) {
      alert("Please select a location on the map.");
      return;
    }
    if (!canEdit()) return;

    if (stationData.id) {
      const updated = await updateStation(stationData);
      if (updated) {
        const refreshed = await fetchStations();
        setStationLandmarks(refreshed);
        resetStationData();
      }
    } else {
      const created = await insertStation(stationData);
      if (created) {
        const refreshed = await fetchStations();
        setStationLandmarks(refreshed);
        resetStationData();
      }
    }
  };

  const handleDelete = async () => {
    if (!stationData.id || !canEdit()) return;
    const ok = confirm("Delete this station?");
    if (!ok) return;

    const success = await deleteStation(stationData.id);
    if (success) {
      setStationLandmarks((prev) =>
        prev.filter((s) => s.id !== stationData.id)
      );
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      resetStationData();
    }
  };

  return (
    <>
      <main className="relative h-screen w-full overflow-hidden">
        <Header ref={headerRef} />
        
        {/* Sidebar */}
        <aside
          className="fixed left-0 w-[425px] border-r border-[#D1D1D1] p-6 z-10 bg-white flex flex-col overflow-y-auto"
          style={{ top: `${headerHeight}px`, bottom: 0 }}
        >
          {!isAddingStation ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MapPinIcon className="h-[150px] w-[150px] text-[#1E86DA] mb-4" />
              <p className="text-center text-lg text-[#737F83]">
                {canEdit()
                  ? "Click anywhere to put a station location or click a station to edit."
                  : "Click on any station marker to view its details."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col grow gap-4">
              {/* Back button */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={resetStationData}
                  className="flex items-center justify-center rounded-full border-2 border-[#073051] 
                          text-[#073051] hover:bg-[#073051] hover:text-white w-[50px] h-[50px] duration-300"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-[#073051] font-semibold text-lg">
                  Go Back
                </span>
              </div>

              {/* Inputs */}
              <LabeledInput
                label="Station Name"
                name="name"
                value={stationData.name}
                onChange={handleChange}
                placeholder="Type station name here"
                disabled={!canEdit()}
              />
              <LabeledInput
                label="Location Name"
                name="location"
                value={stationData.location}
                onChange={handleChange}
                placeholder="Type location name here"
                disabled={!canEdit()}
              />
              <TimeRangeInput
                valueAM={stationData.operationTimeAM}
                valuePM={stationData.operationTimePM}
                onChange={handleChange}
                disabled={!canEdit()}
              />

              {/* Vehicle Type Toggle */}
              <div>
                <label className="text-[#073051] text-sm font-bold">
                  Types of PUVs
                </label>
                <ToggleGroup
                  type="multiple"
                  value={stationData.vehicleTypes}
                  onValueChange={(values: string[]) =>
                    setStationData((prev) => ({
                      ...prev,
                      vehicleTypes: values,
                    }))
                  }
                  variant="outline"
                  className="mt-2 flex w-full h-11"
                  disabled={!canEdit()}
                >
                  {["JEEPNEY", "TRICYCLE", "VAN"].map((type) => {
                    const isActive = stationData.vehicleTypes.includes(type);
                    const fileName = isActive
                      ? `/${type.toLowerCase().replace("-", "")}_w.svg`
                      : `/${type.toLowerCase().replace("-", "")}.svg`;

                    return (
                      <ToggleGroupItem
                        key={type}
                        value={type}
                        className="flex-1 flex justify-center items-center h-full
                                border border-[#D1D1D1] rounded-none first:rounded-l-[15px] last:rounded-r-[15px]
                                data-[state=on]:bg-[#1E86DA] data-[state=on]:border-[#1E86DA] data-[state=on]:text-white
                                cursor-pointer transition-colors duration-200"
                      >
                        <Image
                          src={fileName}
                          alt={type}
                          width={type === "TRICYCLE" ? 48 : 40}
                          height={type === "TRICYCLE" ? 48 : 40}
                          priority
                        />
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </div>

              {/* Destinations & Count Table */}
              <div>
                <label className="text-[#073051] text-sm font-bold">
                  Count of Available Vehicles & Destinations
                </label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full text-center border-collapse">
                    <thead className="bg-[#F5F5F5] text-[#073051] text-sm">
                      <tr>
                        <th className="p-2 text-center font-medium">
                          Type of
                          <br /> Vehicles
                        </th>
                        <th className="p-2 text-center font-medium">
                          Destinations
                        </th>
                        <th className="p-2 text-center font-medium">Count</th>
                        {canEdit() && (
                          <th className="p-2 text-center font-medium">
                            Delete
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {stationData.destinations.map((d, index) => (
                        <tr key={d.id} className="border-t text-center">
                          <td className="p-2">
                            {canEdit() ? (
                              <Select
                                value={d.vehicleType}
                                onValueChange={(value: string) => {
                                  const newDest = [...stationData.destinations];
                                  newDest[index].vehicleType = value;
                                  setStationData((prev) => ({
                                    ...prev,
                                    destinations: newDest,
                                  }));
                                }}
                                disabled={!canEdit()}
                              >
                                <SelectTrigger className="w-[70px] justify-center">
                                  <SelectValue>
                                    {d.vehicleType === "JEEPNEY" && (
                                      <Image
                                        src="/jeepney.svg"
                                        alt="Jeepney"
                                        width={36}
                                        height={36}
                                      />
                                    )}
                                    {d.vehicleType === "EXPRESS-VAN" && (
                                      <Image
                                        src="/van.svg"
                                        alt="Van"
                                        width={36}
                                        height={36}
                                      />
                                    )}
                                    {d.vehicleType === "TRICYCLE" && (
                                      <Image
                                        src="/tricycle.svg"
                                        alt="Tricycle"
                                        width={44}
                                        height={44}
                                      />
                                    )}
                                  </SelectValue>
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectItem value="JEEPNEY">
                                    <Image
                                      src="/jeepney.svg"
                                      alt="Jeepney"
                                      width={36}
                                      height={36}
                                      className="mx-auto"
                                    />
                                  </SelectItem>
                                  <SelectItem value="EXPRESS-VAN">
                                    <Image
                                      src="/van.svg"
                                      alt="Van"
                                      width={36}
                                      height={36}
                                      className="mx-auto"
                                    />
                                  </SelectItem>
                                  <SelectItem value="TRICYCLE">
                                    <Image
                                      src="/tricycle.svg"
                                      alt="Tricycle"
                                      width={44}
                                      height={44}
                                      className="mx-auto"
                                    />
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <>
                                {d.vehicleType === "JEEPNEY" && (
                                  <Image
                                    src="/jeepney.svg"
                                    alt="Jeepney"
                                    width={36}
                                    height={36}
                                    className="mx-auto"
                                  />
                                )}
                                {d.vehicleType === "EXPRESS-VAN" && (
                                  <Image
                                    src="/van.svg"
                                    alt="Van"
                                    width={36}
                                    height={36}
                                    className="mx-auto"
                                  />
                                )}
                                {d.vehicleType === "TRICYCLE" && (
                                  <Image
                                    src="/tricycle.svg"
                                    alt="Tricycle"
                                    width={44}
                                    height={44}
                                    className="mx-auto"
                                  />
                                )}
                              </>
                            )}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={d.destination}
                              placeholder="ex. Iriga"
                              onChange={(e) => {
                                const newDest = [...stationData.destinations];
                                newDest[index].destination = e.target.value;
                                setStationData((prev) => ({
                                  ...prev,
                                  destinations: newDest,
                                }));
                              }}
                              className="border rounded px-2 py-1 w-[100px] text-center"
                              disabled={!canEdit()}
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-2">
                              {canEdit() && (
                                <>
                                  <button
                                    onClick={() => {
                                      const newDest = [
                                        ...stationData.destinations,
                                      ];
                                      newDest[index].count = Math.max(
                                        0,
                                        newDest[index].count - 1
                                      );
                                      setStationData((prev) => ({
                                        ...prev,
                                        destinations: newDest,
                                      }));
                                    }}
                                    className="bg-[#1E86DA] text-white px-2 rounded"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newDest = [
                                        ...stationData.destinations,
                                      ];
                                      newDest[index].count += 1;
                                      setStationData((prev) => ({
                                        ...prev,
                                        destinations: newDest,
                                      }));
                                    }}
                                    className="bg-[#1E86DA] text-white px-2 rounded"
                                  >
                                    +
                                  </button>
                                </>
                              )}
                              <span>{d.count}</span>
                            </div>
                          </td>
                          {canEdit() && (
                            <td className="p-2">
                              <button
                                onClick={() => {
                                  const newDest =
                                    stationData.destinations.filter(
                                      (_, i) => i !== index
                                    );
                                  setStationData((prev) => ({
                                    ...prev,
                                    destinations: newDest,
                                  }));
                                }}
                                className="text-[#073051] font-bold"
                              >
                                ✕
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {canEdit() && (
                        <tr>
                          <td colSpan={4} className="text-center p-2">
                            <button
                              onClick={() =>
                                setStationData((prev) => ({
                                  ...prev,
                                  destinations: [
                                    ...prev.destinations,
                                    {
                                      id: Date.now().toString(),
                                      vehicleType: "JEEPNEY",
                                      destination: "",
                                      count: 0,
                                    },
                                  ],
                                }))
                              }
                              className="text-[#1E86DA] font-semibold flex items-center justify-center gap-1"
                            >
                              + <span>Add Destination</span>
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-2">
                {canEdit() && (
                  <>
                    <button
                      onClick={handleDone}
                      className="w-full bg-[#208FCB] hover:bg-[#1478C9] text-white py-2 rounded-[10px] duration-200"
                    >
                      Done
                    </button>

                    {stationData.id && (
                      <button
                        onClick={handleDelete}
                        className="w-full border border-red-500 text-red-600 hover:bg-red-50 py-2 rounded-[10px] duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Map Container with Overlay */}
        <div
          className="relative ml-[425px] flex-1 h-full"
          style={{ height: `calc(100vh - ${headerHeight}px)` }}
        >
          {/* Search + Filter Overlay */}
          <div className="absolute top-4 left-4 z-50 flex flex-col items-start gap-2">
            {/* Search Bar */}
            <div className="relative w-full max-w-md md:w-[320px] min-w-0 bg-white rounded-[15px] shadow-md">
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-[#D1D1D1] rounded-[15px] px-4 py-2 pr-10 text-black placeholder-[#9A9A9A] outline-none"
              />
              <button className="absolute inset-y-0 right-2 flex items-center justify-center text-[#073051]">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                className="group flex items-center space-x-2 border border-[#D1D1D1] bg-white px-4 py-2 rounded-[15px] text-[#9A9A9A] hover:bg-[#D1D1D1] hover:text-[#6B6B6B] transition-colors duration-200"
                onClick={() => setShowFilter((prev) => !prev)}
              >
                <FunnelIcon className="h-5 w-5 text-[#073051] group-hover:text-[#6B6B6B]" />
              </button>

              {showFilter && (
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3 space-y-3 text-sm text-gray-700">
                  {["All", "TRICYCLE", "JEEPNEY", "VAN"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.includes(type)}
                        onChange={() => {
                          if (type === "All") {
                            setActiveFilters(["All"]);
                          } else {
                            setActiveFilters((prev) => {
                              const newFilters = prev.includes(type)
                                ? prev.filter((f) => f !== type)
                                : [...prev.filter((f) => f !== "All"), type];
                              return newFilters.length === 0
                                ? ["All"]
                                : newFilters;
                            });
                          }
                        }}
                      />
                      <span
                        className={`flex items-center gap-2 ${activeFilters.includes(
                          type
                        )}`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full ${
                            type === "All"
                              ? "bg-[#6F42C1]"
                              : type === "TRICYCLE"
                              ? "bg-[#FFA500]"
                              : type === "JEEPNEY"
                              ? "bg-[#007BFF]"
                              : type === "VAN"
                              ? "bg-[#28A745]"
                              : "bg-gray-400"
                          }`}
                        />
                        {type.charAt(0).toUpperCase() +
                          type.slice(1).toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actual Map */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </main>
    </>
  );
};

export default StationsPage;
