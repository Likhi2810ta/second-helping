import Audience from '../components/marketing/Audience'
import CtaBanner from '../components/marketing/CtaBanner'
import Events from '../components/marketing/Events'
import Faq from '../components/marketing/Faq'
import FeatureStrip from '../components/marketing/FeatureStrip'
import Footer from '../components/marketing/Footer'
import Hero from '../components/marketing/Hero'
import HowItWorks from '../components/marketing/HowItWorks'
import ImpactBand from '../components/marketing/ImpactBand'
import LiveFood from '../components/marketing/LiveFood'
import Navbar from '../components/marketing/Navbar'
import Newsletter from '../components/marketing/Newsletter'
import Reveal from '../components/marketing/Reveal'
import StoriesCarousel from '../components/marketing/StoriesCarousel'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle()
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureStrip />
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <LiveFood />
        </Reveal>
        <Reveal>
          <Audience />
        </Reveal>
        <Reveal>
          <ImpactBand />
        </Reveal>
        <Reveal>
          <StoriesCarousel />
        </Reveal>
        <Reveal>
          <CtaBanner />
        </Reveal>
        <Reveal>
          <Events />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
