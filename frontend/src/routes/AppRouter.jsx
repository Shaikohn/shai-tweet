import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'
import FeedPage from '../pages/FeedPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import SearchPage from '../pages/SearchPage'

export default function AppRouter() {
	return (
		<BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<FeedPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/search" element={<SearchPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
	)
}

