import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Login, Home } from './pages'
import { AuthGuard } from './components/AuthGuard'
import { useAuthStore } from './store/authStore'
import { Game } from './pages/Game'

const queryClient = new QueryClient()

function App() {

  const RootRedirect = () => {
    const userId = useAuthStore(state => state.userId)
    return <Navigate to={userId ? '/home' : '/login'} replace />
}

  return (
    <QueryClientProvider client={queryClient}>
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
      <ToastContainer position="top-right" theme="dark" />
    </QueryClientProvider>
  )
}

export default App
