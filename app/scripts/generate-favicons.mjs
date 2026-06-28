import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const pngSource = join(publicDir, 'logo-512.png')
const svgSource = join(publicDir, 'logo.svg')

const source = existsSync(pngSource) ? pngSource : svgSource
const input = existsSync(pngSource) ? pngSource : readFileSync(svgSource)

const sizes = [
  { name: 'logo.png', size: 256 },
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
]

await Promise.all(
  sizes.map(({ name, size }) => {
    const pipeline = typeof input === 'string' ? sharp(input) : sharp(input)
    return pipeline.resize(size, size).png({ compressionLevel: 9 }).toFile(join(publicDir, name))
  }),
)

console.log(`Generated favicon PNGs from ${source}`)
