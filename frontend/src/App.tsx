import { useAuth } from './contexts/AuthContext'
import { LoginSignupPage } from './pages/LoginSignupPage'
import { DashboardPage } from './pages/DashboardPage'
import './styles/variables.css'
import './styles/components.css'
import './App.css'

function App() {
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="App">
      {!isAuthenticated ? (
        <LoginSignupPage onAuthSuccess={() => {}} />
      ) : (
        <DashboardPage onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
