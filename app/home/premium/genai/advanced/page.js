import { GENAI_TIERS } from "@/features/premium/genai/config/genAiTiers";
import GenAiTierRoadmap from "@/features/premium/genai/components/GenAiTierRoadmap";
import { redirect } from "next/navigation";

export default function AdvancedRoute() {
    const tier = GENAI_TIERS.advanced;
    
    if (!tier.released) {
        redirect("/home/premium/genai");
    }

    return (
        <GenAiTierRoadmap
            tierKey={tier.key}
            minWeek={tier.minWeek}
            maxWeek={tier.maxWeek}
        />
    );
}
