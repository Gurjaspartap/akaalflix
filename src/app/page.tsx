import { movies } from "@/data";
import { Play, Info } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const heroMovie = movies[0];

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="hero" 
        style={{
          backgroundImage: `linear-gradient(to top, var(--bg-primary) 0%, transparent 100%), url(${heroMovie.thumbnail})`
        }}
      >
        <div className="hero-content container">
          <h1 className="hero-title">{heroMovie.title}</h1>
          <p className="hero-desc">{heroMovie.description}</p>
          <div className="hero-buttons">
            <Link href={`/watch/${heroMovie.id}`} className="btn btn-primary">
              <Play size={24} fill="currentColor" /> Play
            </Link>
            <button className="btn btn-secondary">
              <Info size={24} /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Movie Rows */}
      <div className="container" style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Trending Now</h2>
        <div className="movie-row">
          {movies.map((movie) => (
            <Link href={`/watch/${movie.id}`} key={movie.id} className="movie-card">
              <img src={movie.thumbnail} alt={movie.title} className="movie-img" />
              <div className="movie-card-info">
                <h3>{movie.title}</h3>
                <Play size={32} className="play-icon" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
