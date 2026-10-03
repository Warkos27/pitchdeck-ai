import { useNavigate } from 'react-router-dom';
import { Sparkles, LogOut } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../../firebase';

export default function TopBar({ user }) {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Expulsar al landing al cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.4)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-white">PitchDeck AI</span>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={() => navigate('/')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
          Agentes
        </button>

        {user ? (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-sm" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-white hidden md:inline">{user.displayName || user.email}</span>
            <button onClick={handleLogout} className="ml-2 text-gray-400 hover:text-red-400 transition-colors cursor-pointer" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={handleGoogleLogin} className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google Login
          </button>
        )}
      </div>
    </header>
  );
}