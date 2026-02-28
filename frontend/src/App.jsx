import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Clothes from './pages/Clothes'
import Accessories from './pages/Accessories'
import Outfits from './pages/Outfits'
import Laundry from './pages/Laundry'
import Weather from './pages/Weather'
import Analytics from './pages/Analytics'

export default function App() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/clothes" element={<Clothes />} />
                    <Route path="/accessories" element={<Accessories />} />
                    <Route path="/outfits" element={<Outfits />} />
                    <Route path="/laundry" element={<Laundry />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/analytics" element={<Analytics />} />
                </Routes>
            </main>
        </div>
    )
}
