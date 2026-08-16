import { Clock } from "lucide-react";

export default function PacingSummary({ pacing }) {
  if (!pacing) return null;
  
  return (
    <div className="bg-card text-card-foreground border border-border p-5 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-secondary/10 rounded-lg">
          <Clock className="w-5 h-5 text-secondary-foreground" />
        </div>
        <h3 className="font-bold text-lg">Pacing Preference</h3>
      </div>
      <p className="font-semibold mb-2">{pacing.label}</p>
      <p className="text-sm text-muted-foreground flex-grow">
        {pacing.recommendation}
      </p>
    </div>
  );
}
