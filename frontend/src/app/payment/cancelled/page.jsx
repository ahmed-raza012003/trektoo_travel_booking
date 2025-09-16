"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";

const PaymentCancelledPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
                <p className="text-gray-600 mb-6">
                    Your payment was cancelled. No charges have been made to your account.
                </p>
                
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/activities')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Activities
                    </button>
                    
                    <button
                        onClick={() => router.push('/profile')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        View My Bookings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelledPage;
