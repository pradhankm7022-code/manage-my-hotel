import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import RoomTypes from './pages/RoomTypes'
import Bookings from './pages/Bookings'
import BookingNew from './pages/BookingNew'
import BookingDetail from './pages/BookingDetail'
import Housekeeping from './pages/Housekeeping'
import Public from './pages/Public'

export default function App() {
  return (
    <BrowserRouter basename="/manage-my-hotel">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute><Layout><Rooms /></Layout></ProtectedRoute>
          } />
          <Route path="/rooms/types" element={
            <ProtectedRoute><Layout><RoomTypes /></Layout></ProtectedRoute>
          } />
          <Route path="/rooms/:id" element={
            <ProtectedRoute><Layout><RoomDetail /></Layout></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><Layout><Bookings /></Layout></ProtectedRoute>
          } />
          <Route path="/bookings/new" element={
            <ProtectedRoute><Layout><BookingNew /></Layout></ProtectedRoute>
          } />
          <Route path="/bookings/:id" element={
            <ProtectedRoute><Layout><BookingDetail /></Layout></ProtectedRoute>
          } />
          <Route path="/housekeeping" element={
            <ProtectedRoute><Layout><Housekeeping /></Layout></ProtectedRoute>
          } />
          <Route path="/public" element={<Public />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
