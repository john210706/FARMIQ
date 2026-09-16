import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  Search, X, MapPin, ShieldCheck, AlertCircle,
} from "lucide-react";
import { machineryData } from "../data/machineryData";
import { MachineCardPro } from "../components/MachineCardPro";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function MachinesScreen({ navigateTo, t }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [apiMachineryData, setApiMachineryData] = useState(machineryData);
  const [lat, setLat] = useState("10.7905");
  const [lng, setLng] = useState("79.1378");
  const [isLoading, setIsLoading] = useState(false);

  const categories = useMemo(() => [
    { id: "all", label: t.catAll },
    { id: "tractors", label: t.catTractors },
    { id: "harvesters", label: t.catHarvesters },
    { id: "tillage", label: t.catTillage },
    { id: "sprayers", label: t.catSprayers },
  ], [t]);

  const fetchNearbyMachinery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/machinery/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Could not load machinery");
      const data = await res.json();
      setApiMachineryData(data);
    } catch (err) {
      console.error("Error fetching machinery:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchNearbyMachinery(); }, []);

  const filteredMachines = useMemo(() => {
    const formattedData = apiMachineryData.map((m) => ({
      id: m.id,
      name: m.name,
      brand: m.name.split(" ")[0],
      type: m.category,
      category: ({ TRACTOR: "tractors", HARVESTER: "harvesters", TILLAGE: "tillage", SPRAYER: "sprayers" })[m.category] || m.category,
      pricePerHour: m.pricePerHour,
      hp: m.horsepower ?? m.hp,
      distanceKm: m.distance || 0,
      distance: m.distance ? `${m.distance} km` : "Nearby",
      owner: m.owner?.fullName || m.owner || "Verified Owner",
      ownerRating: 4.8,
      image: m.imageUrl || m.image,
      implements: ["Rotavator", "Cultivator"],
      fuelType: m.fuelType || "Diesel",
      badges: m.distance <= 2 ? [t.badges_fastDispatch, t.badges_topRated] : [t.badges_verified],
    }));

    return formattedData
      .filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") return a.pricePerHour - b.pricePerHour;
        if (sortBy === "priceDesc") return b.pricePerHour - a.pricePerHour;
        if (sortBy === "distance") return a.distanceKm - b.distanceKm;
        if (sortBy === "rating") return b.ownerRating - a.ownerRating;
        return 0;
      });
  }, [searchQuery, activeCategory, sortBy, apiMachineryData, t]);

  return (
    <div className="screen">
      <div className="marketplace-header">
        <span className="topbar-subtitle">{t.marketplaceSub}</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, margin: "4px 0 8px" }}>
          {t.marketplaceHeading}
        </h2>
        <p style={{ color: "var(--slate-500)", fontSize: "14px" }}>{t.marketplaceDescription}</p>

        {/* GEO SEARCH WIDGET */}
        <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", background: "var(--primary-50)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--primary-200)" }}>
          <MapPin size={20} style={{ color: "var(--primary-700)" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--primary-900)" }}>{t.myFarmGps}</span>
            <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Lat (e.g. 10.79)" style={{ width: "90px", padding: "4px 8px", border: "1px solid var(--slate-300)", borderRadius: "4px", fontSize: "12px" }} />
            <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Lng (e.g. 79.13)" style={{ width: "90px", padding: "4px 8px", border: "1px solid var(--slate-300)", borderRadius: "4px", fontSize: "12px" }} />
            <button onClick={fetchNearbyMachinery} style={{ background: "var(--primary-600)", color: "white", border: "none", padding: "6px 16px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
              {isLoading ? t.scanningBtn : t.findNearestBtn}
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="search-filter-card">
        <div className="search-input-row">
          <div className="search-field-box">
            <Search size={18} style={{ color: "var(--slate-400)" }} />
            <input type="text" placeholder={t.searchMachineryPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ color: "var(--slate-400)" }}>
                <X size={16} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <select className="form-control" style={{ minHeight: "44px", width: "180px" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recommended">{t.sortRecommended}</option>
              <option value="distance">{t.sortDistance}</option>
              <option value="priceAsc">{t.sortPriceLow}</option>
              <option value="priceDesc">{t.sortPriceHigh}</option>
              <option value="rating">{t.sortRating}</option>
            </select>
          </div>
        </div>
        <div className="filter-pills-row">
          {categories.map((cat) => (
            <button key={cat.id} className={`filter-pill ${activeCategory === cat.id ? "active" : ""}`} onClick={() => setActiveCategory(cat.id)}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* DISCOVERY MAP */}
      <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--slate-200)", marginBottom: "20px" }}>
        <MapContainer center={[parseFloat(lat) || 10.7905, parseFloat(lng) || 79.1378]} zoom={12} style={{ height: "100%", width: "100%", zIndex: 1 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
          <Marker position={[parseFloat(lat) || 10.7905, parseFloat(lng) || 79.1378]}>
            <Popup><strong>{t.destinationFarmMarker}</strong></Popup>
          </Marker>
          {apiMachineryData.map((m) =>
            m.latitude && m.longitude ? (
              <Marker key={m.id} position={[m.latitude, m.longitude]}>
                <Popup><strong>{m.name}</strong><br />{m.distance} km<br />₹{m.pricePerHour}{t.perHour}</Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      {/* RESULTS META */}
      <div className="results-meta-bar">
        <span className="results-count">
          {t.showing} <strong>{filteredMachines.length} {t.verifiedMachinesRadius}</strong>
        </span>
        <span style={{ fontSize: "12px", color: "var(--slate-500)" }}>
          <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px", color: "var(--primary-600)" }} />
          {t.qualityInspected100}
        </span>
      </div>

      {/* MACHINERY LIST */}
      <div className="machine-list">
        {filteredMachines.map((machine) => (
          <MachineCardPro key={machine.id} machine={machine} detailed onBook={() => navigateTo("booking", machine)} t={t} />
        ))}
        {filteredMachines.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--white)", borderRadius: "var(--radius-lg)" }}>
            <AlertCircle size={36} style={{ color: "var(--slate-400)", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{t.noMachineryFound}</h3>
            <button className="btn-secondary" style={{ marginTop: "16px" }} onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
              {t.resetFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
