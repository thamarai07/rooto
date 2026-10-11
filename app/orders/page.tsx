import React from 'react'
import OrdersPage from '@/components/myorders/OrdersPage'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PromoStrip from '@/components/PromoStrip'
export default function page() {
    return (
        <div>
            <Header />
            <OrdersPage />
            <PromoStrip placement="orders" className="my-8" />
            <Footer />
        </div>
    )
}
