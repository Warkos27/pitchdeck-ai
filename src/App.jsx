import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import TopBar from './components/layout/TopBar';
import LandingPage from './pages/LandingPage';
import PitchForm from './components/PitchForm';

// HOC (Higher-Order Component) para proteger rutas
const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) return <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white">Autenticando identidad...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0C] font-sans">
        {/* Pasamos el estado global al TopBar para que la UI reaccione */}
        <TopBar user={user} />
        
        <main className="pt-[72px]">
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route 
              path="/editor" 
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <PitchForm />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;