// app/(home)/layout.js
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import {NotificationProvider} from "@/features/notifications/context/NotificationContext";
import NotificationModal from "@/features/notifications/components/NotificationModal";
import KylePet from "@/features/kyle/pet/KylePet";

export default function ProtectedLayout({children}) {
    return (<ProtectedRoute>
            <NotificationProvider>
                <NotificationModal/>
                <KylePet />
                {children}
            </NotificationProvider>
        </ProtectedRoute>);
}
