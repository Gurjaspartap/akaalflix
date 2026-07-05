import { movies } from "@/data";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = movies.find(m => m.id === id);

  if (!movie) {
    notFound();
  }

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 1, 1.25, 1.5, 2], // Speed controls
    controlBar: {
      skipButtons: {
        forward: 10,
        backward: 10
      }
    },
    userActions: {
      hotkeys: true // Enables space to pause, F to fullscreen, arrows to skip
    },
    sources: [{
      src: movie.videoUrl,
      type: 'video/mp4'
    }]
  };

  return (
    <ProtectedRoute>
      <div style={{ backgroundColor: '#000', minHeight: '100vh', position: 'relative', marginTop: '-70px', zIndex: 1100 }}>
        {/* Absolute back button overlay on video */}
        <Link href="/" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 50, color: 'white' }}>
          <ArrowLeft size={32} />
        </Link>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '50px' }}>
          <VideoPlayer options={videoJsOptions} movieId={movie.id} />
          
          <div style={{ padding: '2rem', color: 'white' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{movie.title}</h1>
            <p style={{ fontSize: '1.2rem', color: '#b3b3b3' }}>{movie.description}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
