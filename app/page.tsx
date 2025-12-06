import AboutUs from "@/components/sbms/AboutUs";
import Academy from "@/components/sbms/Academy";
import Awards from "@/components/sbms/Awards";
import Competitions from "@/components/sbms/CompetitionsSection";
import Contact from "@/components/sbms/Contact";
import Events from "@/components/sbms/Events";
import FairyCursor from "@/components/sbms/FairyCursor";
import Gallery from "@/components/shared/Gallary";
import Hero from "@/components/sbms/HeroSection";
import LoadingScreen from "@/components/sbms/LoadingScreen";
import Magazine from "@/components/sbms/Magazines";
import MediaCoverage from "@/components/sbms/MediaCoverage";
import Seminars from "@/components/sbms/Seminars";


export default function HomePage() {
  return ( 
    <>
    <div >
      <FairyCursor/>
      <LoadingScreen />

      
      <Hero />
      <AboutUs />
      <Competitions />
      <Seminars />
      <Academy />
      <Events /> 
      <Awards />
      <Gallery />
      <MediaCoverage />
      <Magazine />
      <Contact />

    </div>
    </>
  );
}