import CtaBanner from '../components/marketing/CtaBanner'
import Events from '../components/marketing/Events'
import FeatureStrip from '../components/marketing/FeatureStrip'
import Footer from '../components/marketing/Footer'
import Hero from '../components/marketing/Hero'
import HowItWorks from '../components/marketing/HowItWorks'
import ImpactBand from '../components/marketing/ImpactBand'
import LiveFood from '../components/marketing/LiveFood'
import Navbar from '../components/marketing/Navbar'
import Newsletter from '../components/marketing/Newsletter'
import StoriesCarousel from '../components/marketing/StoriesCarousel'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureStrip />
        <HowItWorks />
        <LiveFood />
        <ImpactBand />
        <StoriesCarousel />
        <CtaBanner />
        <Events />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}