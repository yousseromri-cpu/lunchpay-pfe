import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Search,
  MapPin,
  Wallet,
  Star,
  SlidersHorizontal,
  Store,
  BadgePercent,
  UtensilsCrossed,
} from "lucide-react";
import "./Recommendations.css";

type Merchant = {
  id: number;
  name: string;
  category: string;
  cuisine: string;
  distanceKm: number;
  avgPrice: number;
  rating: number;
  discount: number;
  recommendedScore: number;
  image: string;
};

const merchants: Merchant[] = [
  {
    id: 1,
    name: "Green Bowl",
    category: "Healthy Food",
    cuisine: "Healthy",
    distanceKm: 1.2,
    avgPrice: 18,
    rating: 4.8,
    discount: 10,
    recommendedScore: 96,
    image: "/images/merchant-1.jpg",
  },
  {
    id: 2,
    name: "Pasta Corner",
    category: "Restaurant",
    cuisine: "Italian",
    distanceKm: 2.5,
    avgPrice: 24,
    rating: 4.6,
    discount: 15,
    recommendedScore: 89,
    image: "/images/merchant-2.jpg",
  },
  {
    id: 3,
    name: "Sushi Express",
    category: "Restaurant",
    cuisine: "Japanese",
    distanceKm: 3.1,
    avgPrice: 32,
    rating: 4.9,
    discount: 5,
    recommendedScore: 91,
    image: "/images/merchant-3.jpg",
  },
  {
    id: 4,
    name: "Burger Hub",
    category: "Fast Food",
    cuisine: "American",
    distanceKm: 0.9,
    avgPrice: 16,
    rating: 4.4,
    discount: 20,
    recommendedScore: 87,
    image: "/images/merchant-4.jpg",
  },
  {
    id: 5,
    name: "Le Délice Tunisien",
    category: "Restaurant",
    cuisine: "Tunisian",
    distanceKm: 1.8,
    avgPrice: 20,
    rating: 4.7,
    discount: 12,
    recommendedScore: 94,
    image: "/images/merchant-5.jpg",
  },
  {
    id: 6,
    name: "Coffee & Wrap",
    category: "Cafe",
    cuisine: "Snacks",
    distanceKm: 0.6,
    avgPrice: 12,
    rating: 4.5,
    discount: 8,
    recommendedScore: 88,
    image: "/images/merchant-6.jpg",
  },
];

export default function Recommendations() {
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [maxBudget, setMaxBudget] = useState(30);
  const [sortBy, setSortBy] = useState("recommended");

  const cuisines = ["All", ...Array.from(new Set(merchants.map((m) => m.cuisine)))];

  const filteredMerchants = useMemo(() => {
    let data = merchants.filter((merchant) => {
      const matchesSearch =
        merchant.name.toLowerCase().includes(search.toLowerCase()) ||
        merchant.category.toLowerCase().includes(search.toLowerCase()) ||
        merchant.cuisine.toLowerCase().includes(search.toLowerCase());

      const matchesCuisine =
        selectedCuisine === "All" || merchant.cuisine === selectedCuisine;

      const matchesBudget = merchant.avgPrice <= maxBudget;

      return matchesSearch && matchesCuisine && matchesBudget;
    });

    if (sortBy === "recommended") {
      data = [...data].sort((a, b) => b.recommendedScore - a.recommendedScore);
    } else if (sortBy === "rating") {
      data = [...data].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "distance") {
      data = [...data].sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === "price") {
      data = [...data].sort((a, b) => a.avgPrice - b.avgPrice);
    }

    return data;
  }, [search, selectedCuisine, maxBudget, sortBy]);

  return (
    <div className="rec-page">
      <div className="rec-shell">
        <section className="rec-hero premium-card">
          <div className="rec-hero-left">
            <div className="rec-kicker">
              <Sparkles size={16} />
              Recommendation System
            </div>

            <h1 className="rec-title">
              Smart merchant suggestions
              <span className="text-gradient"> powered by LunchPay.</span>
            </h1>

            <p className="rec-subtitle">
              Discover the best merchants for employees based on budget, cuisine,
              proximity, discount opportunities and recommendation score.
            </p>

            <div className="rec-hero-actions">
              <Link to="/enterprise/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
              <Link to="/enterprise/employees" className="btn-primary">
                Manage Employees
              </Link>
            </div>
          </div>

          <div className="rec-hero-right glass-soft">
            <div className="rec-mini-stat">
              <span>Top matches</span>
              <strong>{filteredMerchants.length}</strong>
            </div>
            <div className="rec-mini-stat">
              <span>Budget cap</span>
              <strong>{maxBudget} TND</strong>
            </div>
            <div className="rec-mini-stat">
              <span>Best score</span>
              <strong>
                {filteredMerchants.length > 0
                  ? filteredMerchants[0].recommendedScore
                  : 0}
                %
              </strong>
            </div>
          </div>
        </section>

        <section className="rec-filters premium-card">
          <div className="rec-filter-head">
            <div className="rec-filter-title">
              <SlidersHorizontal size={18} />
              Filters & smart ranking
            </div>
          </div>

          <div className="rec-filter-grid">
            <div className="rec-input-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search merchant, category or cuisine"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
            >
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>

            <div className="rec-budget-box">
              <label>Max budget: {maxBudget} TND</label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
              />
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recommended">Sort by Recommendation</option>
              <option value="rating">Sort by Rating</option>
              <option value="distance">Sort by Distance</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </section>

        <section className="rec-grid">
          {filteredMerchants.map((merchant) => (
            <article key={merchant.id} className="rec-card premium-card">
              <div className="rec-image-wrap">
                <img src={merchant.image} alt={merchant.name} className="rec-image" />
                <div className="rec-score-badge">
                  <Sparkles size={14} />
                  {merchant.recommendedScore}% match
                </div>
              </div>

              <div className="rec-card-body">
                <div className="rec-card-top">
                  <div>
                    <h3>{merchant.name}</h3>
                    <p>{merchant.category}</p>
                  </div>
                  <div className="rec-rating">
                    <Star size={14} />
                    {merchant.rating}
                  </div>
                </div>

                <div className="rec-tags">
                  <span><UtensilsCrossed size={14} /> {merchant.cuisine}</span>
                  <span><MapPin size={14} /> {merchant.distanceKm} km</span>
                  <span><Wallet size={14} /> {merchant.avgPrice} TND</span>
                  <span><BadgePercent size={14} /> {merchant.discount}% off</span>
                </div>

                <div className="rec-card-footer">
                  <div className="rec-card-note">
                    Recommended for employees with this budget profile.
                  </div>

                  <button className="btn-primary rec-btn">
                    <Store size={16} />
                    View merchant
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}