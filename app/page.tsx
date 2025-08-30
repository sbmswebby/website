import AboutUs from "@/components/AboutUs";
import Academy from "@/components/Academy";
import Awards from "@/components/Awards";
import Competitions from "@/components/CompetitionsSection";
import Contact from "@/components/Contact";
import Events from "@/components/Events";
import FairyCursor from "@/components/FairyCursor";
import Gallery from "@/components/Gallary";
import Hero from "@/components/HeroSection";
import { ImageGallery } from "@/components/ImageGallery";
import LoadingScreen from "@/components/LoadingScreen";
import Magazine from "@/components/Magazines";
import MediaCoverage from "@/components/MediaCoverage";
import Seminars from "@/components/Seminars";




export default function HomePage() {
  return (
    <>

    <div className="flex  flex-col p-12">
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
      <ImageGallery />
      <MediaCoverage />
      <Magazine />
      <Contact />

    </div>
    </>
  );
}