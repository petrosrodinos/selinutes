import { Navbar } from '../../components/Navbar'

export const RulesPage = () => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(180,83,9,0.08),transparent)] pointer-events-none" />

      <Navbar showBackButton />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-100/95 mb-2">
          Game rules
        </h1>
        <p className="text-stone-400 mb-12">
          Setting obstacles and figures
        </p>

        <section className="mb-14">
          <h2 className="text-xl font-bold text-stone-100 mb-4 flex items-baseline gap-2">
            <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm font-semibold">1</span>
            Game board and obstacles
          </h2>
          <p className="text-stone-400 mb-4">
            The game board comes in three sizes:
          </p>
          <div className="overflow-x-auto rounded-xl border border-stone-700/60 bg-stone-900/50">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr className="border-b border-stone-700/60">
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Board size</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Dimensions</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Total obstacles</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Breakdown</th>
                </tr>
              </thead>
              <tbody className="text-stone-300 text-sm">
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Small</td>
                  <td className="py-3.5 px-4">12×12</td>
                  <td className="py-3.5 px-4">18</td>
                  <td className="py-3.5 px-4 text-stone-400">2 Cave, 2 Tree, 2 Rock, 4 Lake, 3 River, 3 Canyon, 2 MysteryBox</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Medium</td>
                  <td className="py-3.5 px-4">12×16</td>
                  <td className="py-3.5 px-4">20</td>
                  <td className="py-3.5 px-4 text-stone-400">2 Cave, 3 Tree, 3 Rock, 4 Lake, 3 River, 3 Canyon, 2 MysteryBox</td>
                </tr>
                <tr className="hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Large</td>
                  <td className="py-3.5 px-4">12×20</td>
                  <td className="py-3.5 px-4">24</td>
                  <td className="py-3.5 px-4 text-stone-400">2 Cave, 3 Tree, 3 Rock, 5 Lake, 4 River, 4 Canyon, 3 MysteryBox</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="mt-6 space-y-2 text-stone-400 text-sm">
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">Cave:</strong> Figures entering a cave can exit from any other cave on the board.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">Tree, Rock, River, Lake, Canyon:</strong> Movement restrictions vary per figure (see Section 4).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">MysteryBox:</strong> Special interactive square (effect depends on game variant or player rules).</span>
            </li>
          </ul>
        </section>

        <section className="mb-14">
          <h2 className="text-xl font-bold text-stone-100 mb-4 flex items-baseline gap-2">
            <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm font-semibold">2</span>
            Figures and starting positions
          </h2>
          <p className="text-stone-400 mb-4">
            Figures are arranged in three lines for each player:
          </p>
          <div className="overflow-x-auto rounded-xl border border-stone-700/60 bg-stone-900/50">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-stone-700/60">
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Line</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Small (12×12)</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Medium (12×16)</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Large (12×20)</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Figures</th>
                </tr>
              </thead>
              <tbody className="text-stone-300 text-sm">
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Topline</td>
                  <td className="py-3.5 px-4">12</td>
                  <td className="py-3.5 px-4">20</td>
                  <td className="py-3.5 px-4">24</td>
                  <td className="py-3.5 px-4 text-stone-400">Ram-Tower, Chariot, Saboteur, Paladin, Vezier, Monarch, Duchess, Druid, Paladin, Saboteur, Chariot, Ram-Tower</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Semi-Topline</td>
                  <td className="py-3.5 px-4">11</td>
                  <td className="py-3.5 px-4">19</td>
                  <td className="py-3.5 px-4">23</td>
                  <td className="py-3.5 px-4 text-stone-400">12 Hoplites</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Semi-Bottomline</td>
                  <td className="py-3.5 px-4">2</td>
                  <td className="py-3.5 px-4">2</td>
                  <td className="py-3.5 px-4">2</td>
                  <td className="py-3.5 px-4 text-stone-400">12 Hoplites</td>
                </tr>
                <tr className="hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Bottomline</td>
                  <td className="py-3.5 px-4">1</td>
                  <td className="py-3.5 px-4">1</td>
                  <td className="py-3.5 px-4">1</td>
                  <td className="py-3.5 px-4 text-stone-400">Ram-Tower, Chariot, Saboteur, Paladin, Vezier, Monarch, Duchess, Druid, Paladin, Saboteur, Chariot, Ram-Tower</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-xl font-bold text-stone-100 mb-4 flex items-baseline gap-2">
            <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm font-semibold">3</span>
            Figures – points value
          </h2>
          <div className="overflow-x-auto rounded-xl border border-stone-700/60 bg-stone-900/50">
            <table className="w-full min-w-[380px] border-collapse">
              <thead>
                <tr className="border-b border-stone-700/60">
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Figure</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Points</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-amber-200/90 bg-stone-800/60">Zompie mode points</th>
                </tr>
              </thead>
              <tbody className="text-stone-300 text-sm">
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Monarch</td>
                  <td className="py-3.5 px-4">210</td>
                  <td className="py-3.5 px-4 text-stone-500">–</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Duchess</td>
                  <td className="py-3.5 px-4">27</td>
                  <td className="py-3.5 px-4 text-stone-500">–</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Ram-Tower</td>
                  <td className="py-3.5 px-4">20</td>
                  <td className="py-3.5 px-4 text-stone-500">–</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Chariot</td>
                  <td className="py-3.5 px-4">16</td>
                  <td className="py-3.5 px-4">13</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Paladin</td>
                  <td className="py-3.5 px-4">15</td>
                  <td className="py-3.5 px-4">12</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Saboteur</td>
                  <td className="py-3.5 px-4">12</td>
                  <td className="py-3.5 px-4">9</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Druid / Necromancer</td>
                  <td className="py-3.5 px-4">13</td>
                  <td className="py-3.5 px-4 text-stone-500">–</td>
                </tr>
                <tr className="border-b border-stone-700/40 hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Vezier / Warlock</td>
                  <td className="py-3.5 px-4">11</td>
                  <td className="py-3.5 px-4 text-stone-500">–</td>
                </tr>
                <tr className="hover:bg-stone-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-200">Hoplite</td>
                  <td className="py-3.5 px-4">3</td>
                  <td className="py-3.5 px-4 text-stone-500">–</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-stone-400 text-sm">
            <strong className="text-stone-300">Revival:</strong> Necromancer can revive low-value units (Ram, Chariot, Bomber, Paladin). Lowest points: 9.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-xl font-bold text-stone-100 mb-6 flex items-baseline gap-2">
            <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm font-semibold">4</span>
            Figures – movement and abilities
          </h2>

          <div className="space-y-10">
            <div className="pl-0">
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.1 Hoplite</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves 3 steps forward on the first move; afterwards, moves 2 steps.</li>
                <li>Can shoot 1 step sideways (either direction).</li>
                <li>Can pass through caves.</li>
                <li>Cannot pass through river, lake, or canyon.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.2 Ram-Tower</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves in a cross-like pattern (orthogonal) any number of steps.</li>
                <li>Can shoot up to 5 steps in a cross pattern.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.3 Chariot</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves in corner patterns: 2-1, 1-2, 2-2, 3-1, 1-3 steps.</li>
                <li>Can pass over other figures on its path.</li>
                <li>Units killed by Chariot cannot be revived until Chariot is destroyed.</li>
                <li>Shooting range: 4 steps in a corner pattern only.</li>
                <li>Can pass through rivers (up to 2 steps wide).</li>
                <li>Cannot pass through lake, canyon, cave.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.4 Bomber</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves 1 or 2 steps in cross or X patterns.</li>
                <li>Cannot attack or shoot directly.</li>
                <li>When placed, triggers a net of explosives within 2 steps. Same-type figures ignited if a figure enters the range.</li>
                <li>Can pass through river (1 step wide), cave, canyon.</li>
                <li>Cannot pass through lake.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.5 Paladin</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves sideways any number of steps.</li>
                <li>Shoots up to 3 steps sideways.</li>
                <li>Can pass through river (1 step wide), cave, canyon.</li>
                <li>Cannot pass through lake.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.6 Warlock (Vezier)</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves in 2-step corner patterns.</li>
                <li>Can pass over figures in its path.</li>
                <li>Can swap positions with any Hoplite and the Monarch.</li>
                <li>Can pass through lake and cave.</li>
                <li>Cannot pass through river or canyon.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.7 Monarch</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves in any direction, 1 step at a time.</li>
                <li>Shoots 1 step in any direction.</li>
                <li>Can pass through cave.</li>
                <li>Cannot pass through river, lake, canyon.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.8 Duchess</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves in any direction.</li>
                <li>Shoots up to 9 steps in any direction.</li>
                <li>Can pass through river.</li>
                <li>Cannot pass through lake, canyon, cave.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-amber-200/90 mb-3">4.9 Necromancer (Druid)</h3>
              <ul className="space-y-1.5 text-stone-400 text-sm">
                <li>Moves in any direction.</li>
                <li>Shoots 1 step in any direction.</li>
                <li>Can revive Ram, Chariot, Bomber, Paladin if Monarch, Duchess, and Warlock are in original positions.</li>
                <li>Can shoot freeze stuns within 8 steps (range decreases by 2 for each revival).</li>
                <li>Revived figures cannot use long-range attacks. Bomber attacks normally as Zompie.</li>
                <li>Can pass through lake and cave.</li>
                <li>Cannot pass through river or canyon.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-stone-100 mb-4 flex items-baseline gap-2">
            <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm font-semibold">5</span>
            Special rules
          </h2>
          <ul className="space-y-2 text-stone-400 text-sm">
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">Caves:</strong> Entering one cave allows exit from any other cave on the board.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">Rivers, Lakes, Canyons:</strong> Each figure has specific movement restrictions (see Section 4).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">Explosions:</strong> Bomber triggers affect same-type figures in a 2-step range.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">Revival:</strong> Necromancer revives select units; revived units may have limited abilities.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500/80 mt-0.5">•</span>
              <span><strong className="text-stone-300">Zompie Mode:</strong> Certain figures have a weakened point value after revival.</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
