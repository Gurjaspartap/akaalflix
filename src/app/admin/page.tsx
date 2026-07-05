"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { movies } from "@/data";

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalWatchEvents: 0,
    recentEvents: [] as any[]
  });
  
  const [filterEmail, setFilterEmail] = useState("");

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      alert("Unauthorized Access");
      router.push("/");
      return;
    }

    if (profile?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, profile, loading]);

  const fetchAnalytics = async () => {
    try {
      // Fetch Users and create a map for emails
      const usersSnap = await getDocs(collection(db, "users"));
      let activeSubs = 0;
      const userMap: Record<string, string> = {};
      
      usersSnap.forEach(doc => {
        const data = doc.data();
        if (data.subscription_status === 'active') activeSubs++;
        userMap[doc.id] = data.email || "Unknown Email";
      });

      // Fetch Watch Events
      const q = query(collection(db, "watch_events"), orderBy("timestamp", "desc"), limit(50));
      const eventsSnap = await getDocs(q);
      const recent = [] as any[];
      eventsSnap.forEach(doc => {
        const data = doc.data();
        const movie = movies.find(m => m.id === data.movieId);
        recent.push({
          id: doc.id,
          ...data,
          movieTitle: movie ? movie.title : "Unknown Movie",
          userEmail: userMap[data.userId] || data.userId, // Fallback to ID if email not found
          date: data.timestamp?.toDate().toLocaleString()
        });
      });

      setStats({
        totalUsers: usersSnap.size,
        activeSubscribers: activeSubs,
        totalWatchEvents: eventsSnap.size,
        recentEvents: recent
      });
    } catch (e) {
      console.error("Error fetching analytics", e);
    }
  };

  const formatWatchTime = (seconds: number) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const filteredEvents = stats.recentEvents.filter(event => 
    event.userEmail.toLowerCase().includes(filterEmail.toLowerCase())
  );

  if (loading || profile?.role !== 'admin') {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Checking Permissions...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '50px', color: 'white' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Admin Analytics Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Total Registered Users</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold' }}>{stats.totalUsers}</p>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Active Subscriptions</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold' }}>{stats.activeSubscribers}</p>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Total Watch Events</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold' }}>{stats.totalWatchEvents}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Watch Activity (Last 50)</h2>
        <input 
          type="text" 
          placeholder="Filter by Email..." 
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white', width: '250px' }}
        />
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1rem' }}>Movie</th>
              <th style={{ padding: '1rem' }}>User Email</th>
              <th style={{ padding: '1rem' }}>Watch Time</th>
              <th style={{ padding: '1rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{event.movieTitle}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{event.userEmail}</td>
                <td style={{ padding: '1rem' }}>{formatWatchTime(event.secondsWatched)}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{event.date}</td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No watch events match your filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
