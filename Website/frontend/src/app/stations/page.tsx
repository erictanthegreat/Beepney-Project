'use client';

import React, { useRef, useState, useEffect } from 'react';
import Header from '../../components/ui/header';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'; // Ensure correct import for ToggleGroup and Item

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

const StationsPage = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isAddingStation, setIsAddingStation] = useState(false);
  const [stationData, setStationData] = useState({
    name: '',
    location: '',
    operationTimeAM: '08:00',
    operationTimePM: '21:00',
    vehicleTypes: [] as string[], // Changed from a single string to an array
    coordinates: null as null | [number, number],
  });

  // Update header height
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  // Initialize Mapbox map and handle click
  useEffect(() => {
    if (mapContainerRef.current && mapboxgl.accessToken) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [123.1900, 13.6200],
        zoom: 14,
      });

      map.addControl(new mapboxgl.NavigationControl());

      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;

        // Remove existing marker if any
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Create a new marker and add it to the map
        const marker = new mapboxgl.Marker({ color: '#1E86DA' })
          .setLngLat([lng, lat])
          .addTo(map);

        markerRef.current = marker;

        setStationData((prev) => ({
          ...prev,
          coordinates: [lng, lat],
        }));

        setIsAddingStation(true);
      });

      // Cleanup on unmount
      return () => {
        if (markerRef.current) {
          markerRef.current.remove();
        }
        map.remove();
      };
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDone = () => {
    console.log('Station saved:', stationData);
    setIsAddingStation(false);
    setStationData({
      name: '',
      location: '',
      operationTimeAM: '08:00',
      operationTimePM: '21:00',
      vehicleTypes: [],
      coordinates: null,
    });

    // Remove marker when done adding
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  const handleBack = () => {
    setIsAddingStation(false);
    setStationData({
      name: '',
      location: '',
      operationTimeAM: '08:00',
      operationTimePM: '21:00',
      vehicleTypes: [],
      coordinates: null,
    });

    // Remove marker when going back
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  return (
    <>
      <Header ref={headerRef} />

      <main className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className="fixed left-0 w-[350px] border-r border-[#D1D1D1] p-6 z-10 bg-white flex flex-col overflow-y-auto"
          style={{ top: `${headerHeight}px`, bottom: 0 }}
        >
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
                <div
                  onClick={handleBack}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleBack()}
                  className="flex items-center justify-center rounded-full border-2 border-[#073051] cursor-pointer
                          transition-colors duration-300
                          text-[#073051] hover:bg-[#073051] hover:text-white"
                  style={{
                    width: 50,
                    height: 50,
                  }}
                >
                  <ChevronLeftIcon className="w-7 h-7" />
                </div>
                <span
                  style={{
                    color: '#073051',
                    fontWeight: 600,
                    fontSize: 20,
                    userSelect: 'none',
                  }}
                >
                  Go Back
                </span>
              </div>

              <div>
                <label className="text-[#073051] text-sm font-medium">Station Name</label>
                <input
                  name="name"
                  type="text"
                  value={stationData.name}
                  placeholder="Type station name here"
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-[15px] placeholder-[#D1D1D1]"
                  style={{ borderColor: '#D1D1D1', color: '#000' }}
                />
              </div>

              <div>
                <label className="text-[#073051] text-sm font-medium">Location Name</label>
                <input
                  name="location"
                  type="text"
                  value={stationData.location}
                  placeholder="Type location name here"
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-[15px] placeholder-[#D1D1D1]"
                  style={{ borderColor: '#D1D1D1', color: '#000' }}
                />
              </div>

              <div>
                <label className="text-[#073051] text-sm font-medium">Operation Time</label>
                <div className="flex gap-2 mt-1">
                  <input
                    name="operationTimeAM"
                    type="time"
                    value={stationData.operationTimeAM}
                    onChange={handleChange}
                    className="w-1/2 p-2 border rounded-[15px]"
                    style={{ borderColor: '#D1D1D1', color: '#000' }}
                  />
                  <input
                    name="operationTimePM"
                    type="time"
                    value={stationData.operationTimePM}
                    onChange={handleChange}
                    className="w-1/2 p-2 border rounded-[15px]"
                    style={{ borderColor: '#D1D1D1', color: '#000' }}
                  />
                </div>
              </div>

              {/* Vehicle Type ToggleGroup */}
              <div>
                <label className="text-[#073051] text-sm font-medium">Vehicle Type</label>
                <ToggleGroup
                  type="multiple"
                  value={stationData.vehicleTypes}
                  onValueChange={(values) => {
                    setStationData((prev) => ({
                      ...prev,
                      vehicleTypes: values,
                    }));
                  }}
                  variant="outline"
                  className="mt-2"
                >
                  <ToggleGroupItem value="JEEPNEY" className="w-10 h-10">
                    A
                  </ToggleGroupItem>
                  <ToggleGroupItem value="TRICYCLE" className="w-10 h-10">
                    B
                  </ToggleGroupItem>
                  <ToggleGroupItem value="EXPRESS-VAN" className="w-10 h-10">
                    C
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="mt-auto">
                <button
                  onClick={handleDone}
                  className="w-full bg-[#208FCB] hover:bg-[#1478C9] text-white py-2 rounded-[10px] transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Map Content */}
        <div
          className="ml-[350px] flex-1 h-full"
          ref={mapContainerRef}
          style={{ height: `calc(100vh - ${headerHeight}px)` }}
        ></div>
      </main>
    </>
  );
};

export default StationsPage;