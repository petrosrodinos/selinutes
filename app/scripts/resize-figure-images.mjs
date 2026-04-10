/**
 * Normalize figure images to a fixed canvas and visual size.
 *
 * All outputs get the same canvas dimensions, and each figure's visible pixels
 * are scaled to a consistent target footprint before centering.
 *
 * Change these constants as needed:
 * - TARGET_WIDTH
 * - TARGET_HEIGHT
 * - SUBJECT_FIT_RATIO
 *
 * Usage:
 *   npm run figures:resize
 *   npm run figures:resize -- --dry-run
 */
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const figuresDir = path.join(__dirname, '../src/assets/figures')

// Editable resize constants.
const TARGET_WIDTH = 512
const TARGET_HEIGHT = 512
const SUBJECT_FIT_RATIO = 0.84 // 0..1, same visual scale target for all figures

const BACKGROUND = { r: 0, g: 0, b: 0, alpha: 0 }
const ALPHA_THRESHOLD = 8

const dryRun = process.argv.slice(2).includes('--dry-run')

async function* walkFigureImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkFigureImages(full)
      continue
    }
    if (!entry.isFile()) continue
    const lower = entry.name.toLowerCase()
    if (lower === 'figure.png' || lower === 'figure.jpg' || lower === 'figure.jpeg') {
      yield full
    }
  }
}

let processed = 0
let skipped = 0

function getAlphaBounds(raw, width, height, threshold) {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      if (raw[i + 3] <= threshold) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX || maxY < minY) return null
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

for await (const file of walkFigureImages(figuresDir)) {
  const rel = path.relative(figuresDir, file)
  try {
    const ext = path.extname(file).toLowerCase()
    const source = sharp(file, { failOn: 'none' }).ensureAlpha()
    const { data, info } = await source.raw().toBuffer({ resolveWithObject: true })
    const bounds = getAlphaBounds(data, info.width, info.height, ALPHA_THRESHOLD)

    if (!bounds) {
      skipped += 1
      console.log(`skip: ${rel} (no visible pixels)`)
      continue
    }

    const targetSubjectWidth = Math.max(1, Math.round(TARGET_WIDTH * SUBJECT_FIT_RATIO))
    const targetSubjectHeight = Math.max(1, Math.round(TARGET_HEIGHT * SUBJECT_FIT_RATIO))

    const cropped = sharp(file, { failOn: 'none' })
      .ensureAlpha()
      .extract(bounds)
      .resize({
        width: targetSubjectWidth,
        height: targetSubjectHeight,
        fit: 'inside',
        withoutEnlargement: false,
        withoutReduction: false,
      })

    const resizedSubject = await cropped.png().toBuffer()
    const output = await sharp({
      create: {
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
        channels: 4,
        background: BACKGROUND,
      },
    })
      .composite([{ input: resizedSubject, gravity: 'center' }])
      .toFormat(ext === '.png' ? 'png' : 'jpeg', ext === '.png' ? {} : { quality: 95 })
      .toBuffer()

    if (!dryRun) {
      await writeFile(file, output)
    }
    processed += 1
    console.log(
      `${dryRun ? 'dry-run' : 'ok'}: ${rel} -> ${TARGET_WIDTH}x${TARGET_HEIGHT} (subject=${Math.round(
        SUBJECT_FIT_RATIO * 100,
      )}%)`,
    )
  } catch (error) {
    skipped += 1
    console.log(`failed: ${rel}`)
    console.error(error)
    process.exitCode = 1
  }
}

console.log(
  `Done. processed=${processed}, skipped=${skipped}, size=${TARGET_WIDTH}x${TARGET_HEIGHT}, subject_fit=${Math.round(
    SUBJECT_FIT_RATIO * 100,
  )}%`,
)
