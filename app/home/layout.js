// app/(home)/layout.js
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import {NotificationProvider} from "@/features/notifications/context/NotificationContext";
import NotificationModal from "@/features/notifications/components/NotificationModal";
import KylePet from "@/features/kyle/pet/KylePet";
import { AskKyleProvider } from "@/features/kyle/ask/AskKyleProvider";

export default function ProtectedLayout({children}) {
    return (<ProtectedRoute>
            <NotificationProvider>
                <NotificationModal/>
                <AskKyleProvider>
                    <KylePet />
                    {children}
                </AskKyleProvider>
            </NotificationProvider>
        </ProtectedRoute>);
}
