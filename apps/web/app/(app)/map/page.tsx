import { MapView, type MapViewKind } from "@/components/map/MapView";
import { ViewSwitcher } from "@/components/constellation/ViewSwitcher";

export const metadata = { title: "SkillTree · Carte" };

// Vue pilotée par l'URL (?view=, D6/MAP-05) — défaut et valeurs invalides -> "map".
function normalizeView(raw?: string): MapViewKind {
  return raw === "dashboards" || raw === "chart" ? raw : "map";
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; skill?: string }>;
}) {
  const { view: rawView, skill } = await searchParams;
  const view = normalizeView(rawView);
  return (
    <div className="flex h-full w-full flex-col">
      <ViewSwitcher view={view} />
      <div className="min-h-0 flex-1">
        <MapView view={view} initialSkill={skill} />
      </div>
    </div>
  );
}
