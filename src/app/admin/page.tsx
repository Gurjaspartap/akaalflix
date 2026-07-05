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
      // Fetch Users
      const usersSnap = await getDocs(collection(db, "users"));
      let activeSubs = 0;
      usersSnap.forEach(doc => {
        if (doc.data().subscription_status === 'active') activeSubs++;
      });

      // Fetch Watch Events
      const q = query(collection(db, "watch_events"), orderBy("timestamp", "desc"), limit(10));
      const eventsSnap = await getDocs(q);
      const recent = [] as any[];
      eventsSnap.forEach(doc => {
        const data = doc.data();
        const movie = movies.find(m => m.id === data.movieId);
        recent.push({
          id: doc.id,
          ...data,
          movieTitle: movie ? movie.title : "Unknown Movie",
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
          <h3 style={{ color: 'var(--text-secondary)' }}>Recent Watch Events</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold' }}>{stats.recentEvents.length}</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent Watch Activity (Last 10)</h2>
      <div style={{ background: 'var(--card-bg)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1rem' }}>Movie</th>
              <th style={{ padding: '1rem' }}>User ID</th>
              <th style={{ padding: '1rem' }}>Seconds Watched</th>
              <th style={{ padding: '1rem' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentEvents.map(event => (
              <tr key={event.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{event.movieTitle}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{event.userId}</td>
                <td style={{ padding: '1rem' }}>{Math.round(event.secondsWatched)}s</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{event.date}</td>
              </tr>
            ))}
            {stats.recentEvents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No watch events recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
