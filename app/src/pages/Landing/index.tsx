import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Users,
  Globe,
  Grid3X3,
  Swords,
  Sparkles,
  Mountain,
  Box,
  Zap,
} from 'lucide-react'
import { environments } from '../../config/environments'
import { Navbar } from '../../components/Navbar'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export const LandingPage = () => {
  const navigate = useNavigate()

  const handleGetStarted = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const handleRules = useCallback(() => {
    navigate('/rules')
  }, [navigate])

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(180,83,9,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2378716c\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60 pointer-events-none" />

      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.section
          className="pt-16 pb-24 md:pt-24 md:pb-32"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center max-w-4xl mx-auto mb-6"
          >
            <span className="bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300/90 bg-clip-text text-transparent">
              {environments.APP_NAME}
            </span>
          </motion.h1>
          <motion.p variants={item} className="text-stone-400 text-center text-lg md:text-xl max-w-2xl mx-auto mb-10">
            A strategic board game of monarchs, units, and tactics. Conquer the board alone, with a friend, or online.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-900 font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-700/25 transition-all duration-200"
            >
              Enter the battlefield
            </button>
            <button
              type="button"
              onClick={handleRules}
              className="px-8 py-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold hover:bg-amber-500/20 hover:border-amber-500/60 transition-all duration-200"
            >
              Check the rules
            </button>
          </motion.div>
        </motion.section>

        <motion.section
          className="py-16 border-t border-stone-800/80"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-amber-100/95">
            How you play
          </h2>
          <p className="text-stone-400 text-center max-w-xl mx-auto mb-12">
            Three ways to enjoy the game
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="p-6 rounded-2xl border bg-stone-900/50 border-stone-700/50 hover:border-emerald-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">Single player</h3>
              <p className="text-stone-400 text-sm leading-relaxed">Face the bot. Choose board size and difficulty.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl border bg-stone-900/50 border-stone-700/50 hover:border-violet-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">Two players offline</h3>
              <p className="text-stone-400 text-sm leading-relaxed">Same device, two players. Pass and play.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl border bg-stone-900/50 border-stone-700/50 hover:border-amber-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">Online</h3>
              <p className="text-stone-400 text-sm leading-relaxed">Create a game, share the code, and play in real time.</p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="py-16 border-t border-stone-800/80"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-amber-100/95">
            Board & strategy
          </h2>
          <p className="text-stone-400 text-center max-w-xl mx-auto mb-12">
            Variable boards and obstacles shape every game
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Grid3X3, title: 'Three board sizes', desc: '12×12, 12×16, or 12×20. More space, more obstacles.' },
              { icon: Mountain, title: 'Obstacles', desc: 'Caves, trees, rocks, lakes, rivers, canyons. Each affects movement.' },
              { icon: Box, title: 'Mystery boxes', desc: 'Special squares with surprise effects and revival options.' },
              { icon: Swords, title: 'Unique units', desc: 'Monarch, Duchess, Paladin, Chariot, Hoplites, and more.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl bg-stone-900/40 border border-stone-800"
              >
                <Icon className="w-8 h-8 text-amber-500/70 mb-3" />
                <h3 className="font-semibold text-stone-200 mb-1.5">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="py-16 border-t border-stone-800/80"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-amber-100/95">
            Special mechanics
          </h2>
          <p className="text-stone-400 text-center max-w-xl mx-auto mb-12">
            Caves, revival, and Zompie mode add depth
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Caves', desc: 'Enter any cave and exit from any other. Instant repositioning.' },
              { icon: Sparkles, title: 'Revival', desc: 'Necromancer can revive fallen units when Monarch, Duchess, and Warlock are in place.' },
              { icon: Swords, title: 'Zompie mode', desc: 'Revived units return with reduced strength. Tactics still win.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5"
              >
                <Icon className="w-8 h-8 text-amber-400/80 mb-3" />
                <h3 className="font-semibold text-amber-100/90 mb-2">{title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="pt-16 pb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl bg-gradient-to-br from-stone-800/80 to-stone-900/80 border border-stone-700/50 p-8 md:p-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-amber-100/95 mb-3">
              Ready to play?
            </h2>
            <p className="text-stone-400 mb-6 max-w-md mx-auto">
              Enter your name and choose single player, offline two-player, or create an online game.
            </p>
            <button
              type="button"
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-900 font-semibold shadow-lg shadow-amber-900/30 transition-all duration-200"
            >
              Get started
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
