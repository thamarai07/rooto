import React from 'react'
import OrdersPage from '@/components/myorders/OrdersPage'
import Header from '@/components/header'
import Footer from '@/components/footer'
export default function page() {
    return (
        <div>
            <Header />
            <OrdersPage />
            <Footer />
        </div>
    )
}
