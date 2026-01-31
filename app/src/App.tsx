import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login, Home } from './pages'
import { AuthGuard } from './components/AuthGuard'
import { useAuthStore } from './store/authStore'
import { Game } from './pages/Game'

function App() {

  const RootRedirect = () => {
    const userId = useAuthStore(state => state.userId)
    return <Navigate to={userId ? '/home' : '/login'} replace />
}

  return (
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
            path="/home"
            element={
                <AuthGuard>
                    <Home />
                </AuthGuard>
            }
        />
        <Route
            path="/game"
            element={
                <AuthGuard>
                    <Game />
                </AuthGuard>
            }
        />
    </Routes>
</BrowserRouter>
  )
}

export default App
