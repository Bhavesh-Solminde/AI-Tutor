import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Stats } from '@/components/stats'
import { FeaturesBento } from '@/components/features-bento'
import { LiveDemo } from '@/components/live-demo'
import { HowItWorks } from '@/components/how-it-works'
import { Testimonials } from '@/components/testimonials'
import { FooterCta } from '@/components/footer-cta'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <FeaturesBento />
        <LiveDemo />
        <HowItWorks />
        <Testimonials />
        <FooterCta />
      </main>
      <Footer />
    </div>
  )
}
