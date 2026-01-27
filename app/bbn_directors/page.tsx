// app/bbn_directors/page.tsx

import AboutTeamSection from "@/components/shared/admin/bbn/AboutTeam";
import DirectorGridWithFilters from "@/components/shared/admin/bbn/BbnDirectorsGrid";




export default function AboutPage() {
  return (
    <div className="p-10 space-y-10">
      <AboutTeamSection/>
    <DirectorGridWithFilters/>
    </div>
  )
}