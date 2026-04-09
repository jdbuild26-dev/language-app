
"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { Topic, MOCK_TOPICS } from "./mockData";

interface Point extends Topic {
  x: number;
  y: number;
}

const WIDTH = 1000;
const HEIGHT = 800;
const MARGIN = 50;

const LEVEL_COLORS: Record<string, string> = {
  A1: "#4F46E5", // Indigo
  A2: "#0891B2", // Cyan
  B1: "#059669", // Emerald
  B2: "#D97706", // Amber
  C1: "#DC2626", // Red
  C2: "#7C3AED", // Violet
};

const STATUS_COLORS = {
  completed: "#22c55e", // Green
  "in-progress": "#eab308", // Yellow
  untested: "#94a3b8", // Grey
  locked: "#1e293b", // Dark
};

export default function TopicMap({ topics }: { topics: Topic[] }) {
  const [zoom, setZoom] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom(prev => Math.min(Math.max(prev + delta, 1), 5));
    }
  };

  // Generate points with a more organic distribution
  const points = useMemo(() => {
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    
    return topics.map((topic) => {
      const levelIndex = levels.indexOf(topic.level);
      
      // Categorical clustering
      const categories = Array.from(new Set(topics.map(t => t.category)));
      const catIndex = categories.indexOf(topic.category);
      
      // Spiral placement based on level
      const baseAngle = (levelIndex / levels.length) * Math.PI * 2;
      const catAngle = (catIndex / categories.length) * (Math.PI / 3);
      const angle = baseAngle + catAngle;
      
      const radius = 100 + levelIndex * 120;
      
      return {
        ...topic,
        x: WIDTH / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 60,
        y: HEIGHT / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 60,
      };
    });
  }, [topics]);

  // Calculate Voronoi cells
  const voronoi = useMemo(() => {
    const delaunay = d3.Delaunay.from(points.map(p => [p.x, p.y]));
    return delaunay.voronoi([0, 0, WIDTH, HEIGHT]);
  }, [points]);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 1), 5));
  };


  const getColor = (topic: Topic) => {
    if (topic.status === "completed") return "#22c55e";
    if (topic.status === "in-progress") {
      if (topic.mastery > 50) return "#eab308";
      return "#f97316"; // Orange
    }
    if (topic.status === "untested") return "#94a3b8";
    return "#334155"; // Locked
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={() => handleZoom(0.5)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button 
          onClick={() => handleZoom(-0.5)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 p-3 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700 text-xs text-slate-300">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Learning</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-slate-400"></div>
          <span>Untested</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-800"></div>
          <span>Locked</span>
        </div>
      </div>

      {/* SVG Map */}
      <motion.div 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        drag
        dragConstraints={{ left: -WIDTH, right: WIDTH, top: -HEIGHT, bottom: HEIGHT }}
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onWheel={handleWheel}
      >
        <svg 
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`} 
          className="w-full h-full"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="grad-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Paths for Voronoi Cells */}
          {points.map((point, i) => {
            const path = voronoi.renderCell(i);
            const color = getColor(point);
            const isSelected = selectedTopic?.id === point.id;

            return (
              <g key={point.id}>
                <motion.path
                  d={path}
                  fill={color}
                  fillOpacity={point.status === "locked" ? 0.3 : 0.6}
                  stroke={isSelected ? "#fff" : "rgba(255,255,255,0.1)"}
                  strokeWidth={isSelected ? 3 : 1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ 
                    fillOpacity: 0.9, 
                    scale: 1.01,
                    filter: point.status === "completed" ? "url(#glow)" : "none"
                  }}
                  onClick={() => setSelectedTopic(point)}
                  className="transition-all duration-300 cursor-pointer"
                />
                
                {/* Labels for important cells or when zoomed in */}
                {zoom > 1.5 && (
                  <text
                    x={point.x}
                    y={point.y}
                    textAnchor="middle"
                    fill="white"
                    fontSize={12 / zoom}
                    className="pointer-events-none font-bold"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                  >
                    {point.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Level Markers */}
          {["A1", "A2", "B1", "B2"].map((level, i) => {
             const angle = (i / 6) * Math.PI * 2;
             const radius = 150 + i * 100;
             const x = WIDTH / 2 + Math.cos(angle) * radius;
             const y = HEIGHT / 2 + Math.sin(angle) * radius;
             
             return (
               <text
                 key={level}
                 x={x}
                 y={y - 40}
                 fill="white"
                 fontSize={40 / zoom}
                 fontWeight="bold"
                 fillOpacity={0.2}
                 className="pointer-events-none"
               >
                 {level}
               </text>
             );
          })}
        </svg>
      </motion.div>

      {/* Info Popover */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4 w-64 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl z-20"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white pr-4">{selectedTopic.name}</h3>
              <button 
                onClick={() => setSelectedTopic(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                {selectedTopic.level}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                {selectedTopic.category}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Mastery</span>
                <span>{selectedTopic.mastery}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedTopic.mastery}%` }}
                  className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                />
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors">
              Practice Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
