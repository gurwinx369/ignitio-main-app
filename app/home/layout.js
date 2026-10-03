// app/(home)/layout.js
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import {NotificationProvider} from "@/features/notifications/context/NotificationContext";
import NotificationModal from "@/features/notifications/components/NotificationModal";
import KiboPet from "@/features/kyle/pet/KiboPet";
import { AskKyleProvider } from "@/features/kyle/ask/AskKyleProvider";
import RequiredConsentModal from "@/features/legal-consent/RequiredConsentModal";
import TimezoneSync from "@/features/timezone/TimezoneSync";

export default function ProtectedLayout({children}) {
    return (<ProtectedRoute>
            <TimezoneSync />
            <NotificationProvider>
                <NotificationModal/>
                <AskKyleProvider>
                    <KiboPet />
                    {children}
                    <RequiredConsentModal />
                </AskKyleProvider>
            </NotificationProvider>
        </ProtectedRoute>);
}
