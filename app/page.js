
"use client";

import NotificationButton from "@/features/notifications/components/NotificationButton";
import { useNotification } from "@/features/notifications/context/NotificationContext";

export default function DashboardPage() {
    const { token, permission, notification } = useNotification();

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                {/* Notification Enable Button */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                    <NotificationButton />

                    {/* Show token info for debugging */}
                    {token && (
                        <div className="mt-4 p-4 bg-gray-100 rounded">
                            <p className="text-sm text-gray-600 mb-2">FCM Token:</p>
                            <code className="text-xs break-all">{token}</code>
                        </div>
                    )}
                </div>

                {/* Display latest notification */}
                {notification && (
                    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            Latest Notification
                        </h3>
                        <p className="text-blue-800">
                            <strong>Title:</strong> {notification.notification?.title}
                        </p>
                        <p className="text-blue-800">
                            <strong>Body:</strong> {notification.notification?.body}
                        </p>
                    </div>
                )}

                {/* Your other dashboard content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Card 1</h3>
                        <p className="text-gray-600">Your content here</p>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Card 2</h3>
                        <p className="text-gray-600">Your content here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
