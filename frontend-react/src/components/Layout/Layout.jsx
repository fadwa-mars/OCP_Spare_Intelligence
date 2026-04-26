// src/components/Layout/Layout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
      />
      
      <main 
        style={{ 
          flex: 1,
          marginLeft: 0,
          marginTop: 0,
          padding: '20px',
          minHeight: '100vh',
          backgroundColor: '#f8f9fc',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <div className="container-fluid p-0">
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          main {
            margin-left: 280px !important;
          }
        }
        
        @media (max-width: 768px) {
          main {
            margin-left: ${isSidebarOpen ? '280px' : '0'} !important;
            padding-top: ${!isSidebarOpen ? '80px' : '20px'} !important;
            transition: margin-left 0.3s ease-in-out, padding-top 0.3s ease-in-out;
          }
        }
      `}</style>
    </div>
  )
}

export default Layout