import AboutUs from "@/components/AboutUs";
import Academy from "@/components/Academy";
import Awards from "@/components/Awards";
import Backend from "@/components/Backend";
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
import RegistrationForm from "@/components/RegistrationForm";
import Seminars from "@/components/Seminars";
import { AuthProvider } from "@/components/auth/AuthProvider"
import { SignInForm } from "@/components/auth/SignInForm";


export default function HomePage() {
  return (
    <>
    <SignInForm />

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
      <RegistrationForm />

    </div>
    </>
  );
}