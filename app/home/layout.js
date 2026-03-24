// app/(home)/layout.js
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import {NotificationProvider} from "@/features/notifications/context/NotificationContext";
import NotificationModal from "@/features/notifications/components/NotificationModal";

export default function ProtectedLayout({children}) {
    return (<ProtectedRoute>
            <NotificationProvider>
                <NotificationModal/>
                {children}
            </NotificationProvider>
        </ProtectedRoute>);
}
