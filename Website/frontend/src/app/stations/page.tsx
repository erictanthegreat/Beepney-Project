'use client';

import React, { useRef, useState, useEffect } from 'react';
import Header from '../../components/ui/header';
import { MapPinIcon } from '@heroicons/react/24/outline';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

const StationsPage = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Update header height dynamically on first render
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (mapContainerRef.current && mapboxgl.accessToken) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [123.1900, 13.6200],
        zoom: 14,
      });

      map.addControl(new mapboxgl.NavigationControl());

      return () => {
        map.remove();
      };
    }
  }, []);

  return (
    <>
      <Header ref={headerRef} />

      <main className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-[${headerHeight}px] left-0 w-[350px] h-full border-r border-[#D1D1D1] p-6 flex flex-col items-center justify-center z-10`}
        >
          <MapPinIcon className="h-[150px] w-[150px] text-[#1E86DA] mb-4" />
          <p className="text-center text-lg text-[#737F83]">
            Click anywhere to put a station location or click a station to edit.
          </p>
        </aside>

        {/* Map Content */}
        <div
          className="ml-[350px] flex-1"
          style={{ height: `calc(100vh - ${headerHeight}px)` }}
        >
          <div
            ref={mapContainerRef}
            className="map-container" 
          />
        </div>
      </main>
    </>
  );
};

export default StationsPage;