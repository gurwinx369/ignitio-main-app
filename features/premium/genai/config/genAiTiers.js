export const GENAI_TIERS = {
    beginner: {
        key: "beginner",
        released: true,
        minWeek: 1,
        maxWeek: 4,
        route: "/home/premium/genai/beginner",
    },
    intermediate: {
        key: "intermediate",
        released: true,
        minWeek: 5,
        maxWeek: 8,
        route: "/home/premium/genai/intermediate",
    },
    advanced: {
        key: "advanced",
        released: false,
        minWeek: 9,
        maxWeek: 12,
        route: "/home/premium/genai/advanced",
    },
};
