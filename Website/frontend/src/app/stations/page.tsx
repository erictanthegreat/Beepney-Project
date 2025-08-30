'use client';

import React, { useRef, useState, useEffect } from 'react';
import Header from '../../components/ui/header';
import { MapPinIcon } from '@heroicons/react/24/outline';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from "@/lib/supabase";

// ArrowLeftIcon component for back button
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" strokeWidth={2.5}
      stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

// Default station data
const defaultStation = {
  name: '',
  location: '',
  operationTimeAM: '08:00',
  operationTimePM: '21:00',
  vehicleTypes: [] as string[],
  coordinates: null as null | [number, number],
  destinations: [] as {
    id: string;
    vehicleType: string;
    destination: string;
    count: number;
  }[],
};

// Insert station into Supabase
const insertStation = async (station: any) => {
  const { data, error } = await supabase
    .from('stations')  // Ensure 'stations' matches your table name in Supabase
    .insert([{
      name: station.name,
      location: station.location,
      operation_time_am: station.operationTimeAM,
      operation_time_pm: station.operationTimePM,
      vehicle_types: station.vehicleTypes,
      coordinates: station.coordinates,
      destinations: station.destinations,
    }]);

  if (error) {
    console.error("Error inserting station:", error);
    alert("Error saving station data. Please try again.");
  } else {
    console.log("Station saved successfully:", data);
    alert("Station saved successfully!");
  }
};

// Fetch all stations from Supabase
const fetchStations = async () => {
  const { data, error } = await supabase
    .from('stations')  // Ensure this table name matches
    .select('*');

  if (error) {
    console.error("Error fetching stations:", error);
    return [];
  }
  return data;
};

// Reusable input with label
const LabeledInput = ({ label, ...props }: any) => (
  <div>
    <label className="text-[#073051] text-sm font-bold">{label}</label>
    <input
      {...props}
      className="w-full mt-1 p-2 border rounded-[15px] placeholder-[#D1D1D1]"
      style={{ borderColor: '#D1D1D1', color: '#000' }}
    />
  </div>
);

// Time input pair
const TimeRangeInput = ({ valueAM, valuePM, onChange }: any) => (
  <div>
    <label className="text-[#073051] text-sm font-bold">Operation Time</label>
    <div className="flex gap-2 mt-1">
      <input name="operationTimeAM" type="time" value={valueAM} onChange={onChange}
        className="w-1/2 p-2 border rounded-[15px]" style={{ borderColor: '#D1D1D1', color: '#000' }} />
      <input name="operationTimePM" type="time" value={valuePM} onChange={onChange}
        className="w-1/2 p-2 border rounded-[15px]" style={{ borderColor: '#D1D1D1', color: '#000' }} />
    </div>
  </div>
);

const StationsPage = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isAddingStation, setIsAddingStation] = useState(false);
  const [stationData, setStationData] = useState(defaultStation);
  const [stationLandmarks, setStationLandmarks] = useState<any[]>([]);  // Store station landmarks

  // Reset function
  const resetStationData = () => {
    setIsAddingStation(false);
    setStationData(defaultStation);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  // Get header height
  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  // Fetch stations when the component is mounted
  useEffect(() => {
    const loadStations = async () => {
      const stations = await fetchStations();
      setStationLandmarks(stations);
    };
    loadStations();
  }, []); // Empty dependency array means this runs only once when the component mounts

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [123.19, 13.62],
      zoom: 15,
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      if (markerRef.current) markerRef.current.remove();

      markerRef.current = new mapboxgl.Marker({ color: '#1E86DA' })
        .setLngLat([lng, lat]).addTo(map);

      setStationData((prev) => ({ ...prev, coordinates: [lng, lat] }));
      setIsAddingStation(true);
    });

    // Add previous station landmarks to the map
    stationLandmarks.forEach((station) => {
      new mapboxgl.Marker({ color: '#1E86DA' })
        .setLngLat(station.coordinates)
        .addTo(map);
    });

    return () => { map.remove(); };
  }, [stationLandmarks]); // Re-run the map init when stationLandmarks change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStationData((prev) => ({ ...prev, [name]: value }));
  };

  // Save station to Supabase and show it on the map
  const handleDone = async () => {
    if (!stationData.coordinates) {
      alert("Please select a location on the map.");
      return;
    }

    // Add the new station landmark to the local state
    const newStation = { ...stationData, id: Date.now().toString() };
    setStationLandmarks((prev) => [...prev, newStation]);

    // Save the station to Supabase
    await insertStation(stationData);  // Call the function to save the station data

    // Reset the form and map marker
    resetStationData();
  };

  return (
    <>
      <Header ref={headerRef} />
      
      <main className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="fixed left-0 w-[425px] border-r border-[#D1D1D1] p-6 z-10 bg-white flex flex-col overflow-y-auto"
          style={{ top: `${headerHeight}px`, bottom: 0 }}>
          {!isAddingStation ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MapPinIcon className="h-[150px] w-[150px] text-[#1E86DA] mb-4" />
              <p className="text-center text-lg text-[#737F83]">
                Click anywhere to put a station location or click a station to edit.
              </p>
            </div>
          ) : (
            <div className="flex flex-col flex-grow gap-4">
              {/* Back button */}
              <div className="flex items-center gap-3 mb-4">
                <button onClick={resetStationData}
                  className="flex items-center justify-center rounded-full border-2 border-[#073051] 
                             text-[#073051] hover:bg-[#073051] hover:text-white w-[50px] h-[50px]">
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-[#073051] font-semibold text-lg">Go Back</span>
              </div>

              {/* Inputs */}
              <LabeledInput label="Station Name" name="name" value={stationData.name}
                onChange={handleChange} placeholder="Type station name here" />
              <LabeledInput label="Location Name" name="location" value={stationData.location}
                onChange={handleChange} placeholder="Type location name here" />
              <TimeRangeInput valueAM={stationData.operationTimeAM} valuePM={stationData.operationTimePM}
                onChange={handleChange} />

              {/* Vehicle Type Toggle */}
              <div>
                <label className="text-[#073051] text-sm font-bold">Types of PUVs</label>
                <ToggleGroup
                  type="multiple"
                  value={stationData.vehicleTypes}
                  onValueChange={(values: string[]) =>
                    setStationData((prev) => ({ ...prev, vehicleTypes: values })) }
                  variant="outline"
                  className="mt-2 flex w-full h-11"
                >
                  {["JEEPNEY", "TRICYCLE", "VAN"].map((type) => (
                    <ToggleGroupItem
                      key={type}
                      value={type}
                      className="flex-1 flex justify-center items-center h-full
                                border border-[#D1D1D1] rounded-none first:rounded-l-[15px] last:rounded-r-[15px]
                                data-[state=on]:bg-[#1E86DA] data-[state=on]:border-[#1E86DA] data-[state=on]:text-white
                                cursor-pointer transition-colors duration-200"
                    >
                      {stationData.vehicleTypes.includes(type) ? (
                        <img
                          src={`/${type.toLowerCase().replace("-", "")}_w.svg`}
                          alt={type}
                          className={type === "TRICYCLE" ? "h-12 w-12" : "h-10 w-10"}
                        />
                      ) : (
                        <img
                          src={`/${type.toLowerCase().replace("-", "")}.svg`}
                          alt={type}
                          className={type === "TRICYCLE" ? "h-12 w-12" : "h-10 w-10"}
                        />
                      )}
                    </ToggleGroupItem>
                  ))}
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
                        <th className="p-2 text-center font-medium">Type of<br /> Vehicles</th>
                        <th className="p-2 text-center font-medium">Destinations</th>
                        <th className="p-2 text-center font-medium">Count</th>
                        <th className="p-2 text-center font-medium">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stationData.destinations.map((d, index) => (
                        <tr key={d.id} className="border-t text-center">
                          <td className="p-2">
                            <Select
                              value={d.vehicleType}
                              onValueChange={(value: string) => {
                                const newDest = [...stationData.destinations];
                                newDest[index].vehicleType = value;
                                setStationData((prev) => ({ ...prev, destinations: newDest }));
                              }}
                            >
                              <SelectTrigger className="w-[70px] justify-center">
                                <SelectValue placeholder="">
                                  {d.vehicleType === "JEEPNEY" && (
                                    <img src="/jeepney.svg" alt="Jeepney" className="h-9 w-9" />
                                  )}
                                  {d.vehicleType === "EXPRESS-VAN" && (
                                    <img src="/van.svg" alt="Van" className="h-9 w-9" />
                                  )}
                                  {d.vehicleType === "TRICYCLE" && (
                                    <img src="/tricycle.svg" alt="Tricycle" className="h-11 w-11" />
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="JEEPNEY">
                                  <img src="/jeepney.svg" alt="Jeepney" className="h-9 w-9 mx-auto" />
                                </SelectItem>
                                <SelectItem value="EXPRESS-VAN">
                                  <img src="/van.svg" alt="Van" className="h-9 w-9 mx-auto" />
                                </SelectItem>
                                <SelectItem value="TRICYCLE">
                                  <img src="/tricycle.svg" alt="Tricycle" className="h-11 w-11 mx-auto" />
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={d.destination}
                              placeholder="ex. Iriga"
                              onChange={(e) => {
                                const newDest = [...stationData.destinations];
                                newDest[index].destination = e.target.value;
                                setStationData((prev) => ({ ...prev, destinations: newDest }));
                              }}
                              className="border rounded px-2 py-1 w-[100px] text-center"
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  const newDest = [...stationData.destinations];
                                  newDest[index].count = Math.max(0, newDest[index].count - 1);
                                  setStationData((prev) => ({ ...prev, destinations: newDest }));
                                }}
                                className="bg-[#1E86DA] text-white px-2 rounded"
                              >
                                -
                              </button>
                              <span>{d.count}</span>
                              <button
                                onClick={() => {
                                  const newDest = [...stationData.destinations];
                                  newDest[index].count += 1;
                                  setStationData((prev) => ({ ...prev, destinations: newDest }));
                                }}
                                className="bg-[#1E86DA] text-white px-2 rounded"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => {
                                const newDest = stationData.destinations.filter((_, i) => i !== index);
                                setStationData((prev) => ({ ...prev, destinations: newDest }));
                              }}
                              className="text-[#073051] font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={4} className="text-center p-2">
                          <button
                            onClick={() =>
                              setStationData((prev) => ({
                                ...prev,
                                destinations: [
                                  ...prev.destinations,
                                  { id: Date.now().toString(), vehicleType: 'JEEPNEY', destination: '', count: 0 },
                                ],
                              }))
                            }
                            className="text-[#1E86DA] font-semibold flex items-center justify-center gap-1"
                          >
                            + <span>Add Destination</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Done button */}
              <div className="mt-auto">
                <button onClick={handleDone}
                  className="w-full bg-[#208FCB] hover:bg-[#1478C9] text-white py-2 rounded-[10px]">
                  Done
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Map */}
        <div className="ml-[425px] flex-1 h-full" ref={mapContainerRef}
          style={{ height: `calc(100vh - ${headerHeight}px)` }} />
      </main>
    </>
  );
};

export default StationsPage;