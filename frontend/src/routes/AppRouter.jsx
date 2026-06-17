import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'
import FeedPage from '../pages/FeedPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import SearchPage from '../pages/SearchPage'
import ThreadPage from '../pages/ThreadPage'
import ProtectedRoute from './ProtectedRoute'

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <FeedPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/tweets/:id" element={<ThreadPage />} />
                    <Route path="/search" element={<SearchPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

