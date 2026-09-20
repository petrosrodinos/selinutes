import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import heroImage from '../../assets/landing/selinutes-hero.jpg'
import detailImage from '../../assets/landing/selinutes-detail.jpg'
import ctaImage from '../../assets/landing/selinutes-cta.jpg'
import { useAuthStore } from '../../store/authStore'

const rise = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const modes = [
  {
    num: 'I',
    title: 'Single player',
    desc: 'Face the bot. Choose your board size and difficulty, then test your command.',
  },
  {
    num: 'II',
    title: 'Two players offline',
    desc: 'Same device, two players. Pass and play a quiet duel of pure tactics.',
  },
  {
    num: 'III',
    title: 'Online',
    desc: 'Create a game, share the code, and play your rival in real time.',
  },
]

const mechanics = [
  {
    num: '01',
    title: 'Caves',
    desc: 'Enter any cave and exit from any other. Reposition an army in an instant.',
  },
  {
    num: '02',
    title: 'Revival',
    desc: 'The Necromancer can revive fallen units when the Necromancer, Monarch, Duchess, and Warlock share a row.',
  },
  {
    num: '03',
    title: 'Zompie mode',
    desc: 'Revived units return with reduced strength. The right tactics still win.',
  },
  {
    num: '04',
    title: 'Unique units',
    desc: 'Command the Monarch, Duchess, Paladin, Chariot, Hoplites, and more.',
  },
]

export const LandingPage = () => {
  const navigate = useNavigate()
  const user_uuid = useAuthStore((state) => state.user_uuid)
  const isLoggedIn = Boolean(user_uuid)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGetStarted = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const handlePrimaryAction = useCallback(() => {
    navigate(isLoggedIn ? '/home' : '/login')
  }, [isLoggedIn, navigate])

  const handleRules = useCallback(() => {
    navigate('/rules')
  }, [navigate])

  return (
    <div className="bg-ink text-paper antialiased" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <nav
        aria-label="Main navigation"
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          isScrolled ? 'bg-ink/85 shadow-lg shadow-black/20 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 sm:px-10">
          <span className="font-serif text-2xl text-paper">Selinutes</span>
          <div className="flex items-center gap-5">
            <a
              href="#modes"
              className="hidden cursor-pointer text-[10px] uppercase tracking-[0.24em] text-paper/60 transition-colors hover:text-gold sm:block"
            >
              Ways to play
            </a>
            <a
              href="#mechanics"
              className="hidden cursor-pointer text-[10px] uppercase tracking-[0.24em] text-paper/60 transition-colors hover:text-gold sm:block"
            >
              Mechanics
            </a>
            <button
              type="button"
              onClick={handleGetStarted}
              className="cursor-pointer border border-gold/60 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              Enter the battlefield
            </button>
          </div>
        </div>
      </nav>

      <header id="top" className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-ink">
        <motion.img
          src={heroImage}
          alt="A gold monarch and units on a dark Selinutes game board"
          className="absolute inset-0 h-full w-full object-cover object-center"
          width={1920}
          height={1080}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 12, ease: [0.4, 0, 0.2, 1], repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />

        <motion.div
          className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-between px-6 py-8 sm:px-10"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="h-9 sm:h-10" aria-hidden="true" />

          <div className="max-w-[720px] pb-4">
            <motion.span variants={rise} className="mb-6 block text-[11px] uppercase tracking-[0.3em] text-gold">
              Monarchs · Units · Obstacles · Caves
            </motion.span>
            <motion.h1
              variants={rise}
              className="max-w-[10ch] font-serif text-[clamp(3.4rem,7vw,6.4rem)] leading-[0.92] text-paper"
            >
              The reign is decided on the board.
            </motion.h1>
            <motion.p variants={rise} className="mt-6 max-w-[46ch] text-base leading-relaxed text-paper/75 sm:text-lg">
              Conquer the board alone, with a friend, or online. Command every unit through shifting terrain and turn
              a fallen army into a second chance.
            </motion.p>
            <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="group inline-flex cursor-pointer items-center gap-3 bg-gold px-7 py-4 text-sm font-medium uppercase tracking-[0.16em] text-ink ring-1 ring-gold transition-transform duration-300 hover:-translate-y-0.5"
              >
                Play the first turn <span className="text-base transition-transform group-hover:translate-x-1">→</span>
              </button>
              <button
                type="button"
                onClick={handleRules}
                className="inline-flex cursor-pointer items-center gap-2 text-sm uppercase tracking-[0.16em] text-paper/70 transition-colors hover:text-gold"
              >
                <span className="h-px w-6 bg-gold/60" />
                Check the rules
              </button>
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-parch">
            <span>Single player · Pass &amp; play · Online</span>
            <motion.span
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              className="hidden h-8 w-px origin-top bg-gold/60 sm:block"
            />
          </div>
        </motion.div>
      </header>

      <main>
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-[1280px] px-6 py-24 sm:px-10 sm:py-32">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-12 sm:gap-8">
              <div className="sm:col-span-3">
                <span className="text-[11px] uppercase tracking-[0.28em] text-gold">No. 02</span>
                <span className="mt-4 block font-serif text-4xl text-parch">The premise</span>
              </div>
              <div className="sm:col-span-9">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
                  className="mb-8 h-px w-full origin-left bg-gold/30"
                />
                <p className="font-serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.12] text-paper">
                  Every board is a new campaign. Obstacles alter movement, caves redraw the map, and mystery boxes can
                  reverse the fate of an army.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-8 border-t border-paper/10 pt-8 sm:grid-cols-4">
                  <div>
                    <span className="font-serif text-4xl text-gold">3</span>
                    <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-parch">Board sizes</span>
                  </div>
                  <div>
                    <span className="font-serif text-4xl text-gold">6</span>
                    <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-parch">Terrain types</span>
                  </div>
                  <div>
                    <span className="font-serif text-4xl text-gold">∞</span>
                    <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-parch">Tactical paths</span>
                  </div>
                  <div>
                    <span className="font-serif text-4xl text-gold">1</span>
                    <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-parch">Crown to defend</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modes" className="border-t border-paper/10 bg-ink text-paper">
          <div className="mx-auto max-w-[1280px] px-6 py-24 sm:px-10 sm:py-32">
            <div className="mb-16 flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-[0.28em] text-gold">No. 03</span>
                <h2 className="mt-3 max-w-[15ch] font-serif text-[clamp(2.4rem,4vw,3.6rem)] leading-tight">
                  Three ways to take the crown
                </h2>
              </div>
              <span className="hidden text-[10px] uppercase tracking-[0.26em] text-parch sm:block">How you play</span>
            </div>
            <div className="grid grid-cols-1 gap-px bg-paper/10 sm:grid-cols-3">
              {modes.map(({ num, title, desc }) => (
                <article
                  key={num}
                  className="group bg-ink p-8 transition-colors duration-300 hover:bg-[#1b1915]"
                >
                  <span className="font-serif text-5xl text-parch transition-colors group-hover:text-gold">
                    {num}
                  </span>
                  <h3 className="mt-6 font-serif text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/65">{desc}</p>
                  <span className="mt-6 block h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="mechanics" className="bg-paper text-ink">
          <div className="mx-auto max-w-[1280px] px-6 py-24 sm:px-10 sm:py-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <span className="text-[11px] uppercase tracking-[0.28em] text-gold">No. 04</span>
                <h2 className="mt-3 font-serif text-[clamp(2.4rem,4vw,3.5rem)] leading-tight">
                  A board built for depth
                </h2>
                <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-ink/70">
                  Choose 12×12, 12×16, or 12×20. Caves, trees, rocks, lakes, rivers, and canyons shape movement while
                  mystery boxes keep every encounter uncertain.
                </p>
                <img
                  src={detailImage}
                  alt="Golden monarch beside a cave on a carved game board"
                  className="mt-10 aspect-[4/5] w-full object-cover"
                  width={1080}
                  height={1350}
                  loading="lazy"
                />
              </div>
              <div className="lg:col-span-7">
                <span className="text-[11px] uppercase tracking-[0.28em] text-gold">No. 05</span>
                <h2 className="mt-3 font-serif text-[clamp(2.1rem,3vw,2.8rem)] leading-tight">Special mechanics</h2>
                <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
                  {mechanics.map(({ num, title, desc }) => (
                    <div key={num} className="flex items-start gap-6 py-7">
                      <span className="font-serif text-2xl text-gold">{num}</span>
                      <div>
                        <h3 className="font-serif text-2xl">{title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink/65">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="play" className="relative overflow-hidden bg-ink text-paper">
          <img
            src={ctaImage}
            alt="Two Selinutes armies facing each other beneath a spotlight"
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={900}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-ink/75" />
          <div className="relative mx-auto max-w-[1280px] px-6 py-28 text-center sm:px-10 sm:py-40">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gold">The board is set</span>
            <h2 className="mx-auto mt-6 max-w-[14ch] font-serif text-[clamp(3rem,6vw,5rem)] leading-[0.98]">
              Your reign begins here.
            </h2>
            <p className="mx-auto mt-6 max-w-[44ch] text-base leading-relaxed text-paper/70 sm:text-lg">
              Enter your name, choose your battlefield, and make the first move.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="group inline-flex cursor-pointer items-center gap-3 bg-gold px-8 py-4 text-sm font-medium uppercase tracking-[0.16em] text-ink ring-1 ring-gold transition-transform hover:-translate-y-0.5"
              >
                {isLoggedIn ? 'Continue your reign' : 'Enter the battlefield'}{' '}
                <span className="text-base transition-transform group-hover:translate-x-1">→</span>
              </button>
              <button
                type="button"
                onClick={handleRules}
                className="inline-flex cursor-pointer items-center gap-2 text-sm uppercase tracking-[0.16em] text-paper/70 transition-colors hover:text-gold"
              >
                <span className="h-px w-6 bg-gold/60" />
                Check the rules
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-ink text-paper">
        <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10">
          <div className="flex flex-col items-start justify-between gap-4 border-t border-paper/10 pt-8 sm:flex-row sm:items-center">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-xl">Selinutes</span>
              <span className="text-[10px] uppercase tracking-[0.24em] text-parch">A strategic board game</span>
            </div>
            <a
              href="https://logiqdev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-[10px] uppercase tracking-[0.24em] text-parch transition-colors hover:text-gold"
            >
              Powered by logiqdev
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
