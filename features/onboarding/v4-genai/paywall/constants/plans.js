export const CLIENT_SUBSCRIPTION_PLANS = [
    {
        slug: "ignitio_weekly",
        name: "Weekly",
        price: "₹149",
        period: "per week",
        checkoutDescription: "Ignitio Premium — Weekly",
        badge: null,
        helper: null,
    },
    {
        slug: "ignitio_monthly",
        name: "Monthly",
        price: "₹599",
        period: "per month",
        checkoutDescription: "Ignitio Premium — Monthly",
        badge: "Most Popular",
        recommended: true,
        helper: null,
    },
    {
        slug: "ignitio_three_monthly",
        name: "3 Months",
        price: "₹1,499",
        period: "per 3 months",
        checkoutDescription: "Ignitio Premium — 3 Months",
        badge: "Best Value",
        helper: "Save ₹298 vs 3 monthly payments",
    },
];

export const DEFAULT_SUBSCRIPTION_PLAN =
    "ignitio_monthly";

export function getClientSubscriptionPlan(slug) {
    return (
        CLIENT_SUBSCRIPTION_PLANS.find(
            (plan) => plan.slug === slug,
        ) ?? null
    );
}