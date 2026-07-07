import { MapView } from "@/components/map/MapView";

export const metadata = { title: "SkillTree · Carte" };

export default async function MapPage({ searchParams }: { searchParams: Promise<{ skill?: string }> }) {
  const { skill } = await searchParams;
  return (
    <div className="h-full w-full">
      <MapView initialSkill={skill} />
    </div>
  );
}
