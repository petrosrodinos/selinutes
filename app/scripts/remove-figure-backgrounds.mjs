/**
 * Remove flat backgrounds from figure images under src/assets/figures.
 *
 * Per folder (e.g. .../variant-A/): if figure.jpg / figure.jpeg exists, it is the
 * source and the result is always written to figure.png (overwrites existing PNG).
 * Otherwise figure.png is updated in place.
 *
 * Usage:
 *   npm run figures:remove-bg
 *   npm run figures:remove-bg -- --dry-run
 *   npm run figures:remove-bg -- --include-references
 *   npm run figures:remove-bg -- --tolerance=48 --edge-threshold=48
 */
import { readdir, access, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const figuresDir = path.join(__dirname, '../src/assets/figures')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const includeReferences = args.includes('--include-references')
const deleteJpgAfterPng = args.includes('--delete-jpg-after-png')

const toleranceArg = args.find((a) => a.startsWith('--tolerance='))
const edgeThresholdArg = args.find((a) => a.startsWith('--edge-threshold='))

const tolerance = clampInt(toleranceArg ? Number(toleranceArg.split('=')[1]) : 32, 1, 255)
const edgeThreshold = clampInt(edgeThresholdArg ? Number(edgeThresholdArg.split('=')[1]) : tolerance, 1, 255)

function clampInt(value, min, max) {
  const n = Number.isFinite(value) ? Math.round(value) : min
  return Math.max(min, Math.min(max, n))
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Collect figure sources: one job per directory — JPG wins over PNG.
 */
async function collectFigureJobs(dir) {
  /** @type {Map<string, { source: string, outputPng: string, removeSourceJpg?: boolean }>} */
  const jobs = new Map()

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      if (!entry.isFile()) continue
      const lower = entry.name.toLowerCase()
      if (lower === 'figure.png' || lower === 'figure.jpg' || lower === 'figure.jpeg') {
        const folder = currentDir
        const existing = jobs.get(folder)
        const isJpg = lower === 'figure.jpg' || lower === 'figure.jpeg'
        const pngOut = path.join(folder, 'figure.png')
        if (isJpg) {
          jobs.set(folder, { source: full, outputPng: pngOut, removeSourceJpg: true })
        } else if (!existing) {
          jobs.set(folder, { source: full, outputPng: full })
        }
      }
      if (includeReferences) {
        if (lower === 'reference.png' || lower === 'reference.jpg' || lower === 'reference.jpeg') {
          const folder = currentDir
          const key = `${folder}::reference`
          const existing = jobs.get(key)
          const isJpg = lower === 'reference.jpg' || lower === 'reference.jpeg'
          const pngOut = path.join(folder, 'reference.png')
          if (isJpg) {
            jobs.set(key, { source: full, outputPng: pngOut, removeSourceJpg: true })
          } else if (!existing) {
            jobs.set(key, { source: full, outputPng: full })
          }
        }
      }
    }
  }

  await walk(dir)
  return [...jobs.values()]
}

function estimateBackgroundColor(data, width, height) {
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  const stride = 4

  const sample = (x, y) => {
    const i = (y * width + x) * stride
    const a = data[i + 3]
    if (a === 0) return
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count += 1
  }

  for (let x = 0; x < width; x += 1) {
    sample(x, 0)
    sample(x, height - 1)
  }
  for (let y = 1; y < height - 1; y += 1) {
    sample(0, y)
    sample(width - 1, y)
  }

  if (count === 0) return [255, 255, 255]
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)]
}

function removeEdgeConnectedBackground(data, width, height, bgR, bgG, bgB) {
  const total = width * height
  const visited = new Uint8Array(total)
  const queue = new Uint32Array(total)
  let qStart = 0
  let qEnd = 0
  const stride = 4

  const enqueueIfBackground = (x, y, threshold) => {
    const idx = y * width + x
    if (visited[idx]) return
    const i = idx * stride
    const a = data[i + 3]
    if (a === 0) return
    const dist = colorDistance(data[i], data[i + 1], data[i + 2], bgR, bgG, bgB)
    if (dist <= threshold) {
      visited[idx] = 1
      queue[qEnd++] = idx
    }
  }

  for (let x = 0; x < width; x += 1) {
    enqueueIfBackground(x, 0, edgeThreshold)
    enqueueIfBackground(x, height - 1, edgeThreshold)
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueueIfBackground(0, y, edgeThreshold)
    enqueueIfBackground(width - 1, y, edgeThreshold)
  }

  while (qStart < qEnd) {
    const idx = queue[qStart++]
    const x = idx % width
    const y = (idx / width) | 0

    const i = idx * stride
    data[i + 3] = 0

    if (x > 0) enqueueIfBackground(x - 1, y, tolerance)
    if (x < width - 1) enqueueIfBackground(x + 1, y, tolerance)
    if (y > 0) enqueueIfBackground(x, y - 1, tolerance)
    if (y < height - 1) enqueueIfBackground(x, y + 1, tolerance)
  }
}

async function processOne(sourcePath, outputPngPath) {
  const image = sharp(sourcePath, { failOn: 'none' }).ensureAlpha()
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info

  if (!width || !height) {
    throw new Error('invalid dimensions')
  }

  const bgColor = estimateBackgroundColor(data, width, height)
  removeEdgeConnectedBackground(data, width, height, bgColor[0], bgColor[1], bgColor[2])

  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer()
}

let processed = 0
let fromJpg = 0
let pngInPlace = 0
let skipped = 0
let deletedJpg = 0

const jobs = await collectFigureJobs(figuresDir)

for (const job of jobs) {
  const relSource = path.relative(figuresDir, job.source)
  const relOut = path.relative(figuresDir, job.outputPng)
  const isJpgSource = /\.jpe?g$/i.test(job.source)

  try {
    const output = await processOne(job.source, job.outputPng)

    if (!dryRun) {
      await writeFile(job.outputPng, output)
      if (deleteJpgAfterPng && isJpgSource && job.removeSourceJpg && job.source !== job.outputPng) {
        await unlink(job.source)
        deletedJpg += 1
      }
    }

    processed += 1
    if (isJpgSource && job.source !== job.outputPng) {
      fromJpg += 1
      console.log(`${dryRun ? 'dry-run' : 'ok'}: ${relSource} -> ${relOut}`)
    } else {
      pngInPlace += 1
      console.log(`${dryRun ? 'dry-run' : 'ok'}: ${relOut} (png updated)`)
    }
  } catch (err) {
    skipped += 1
    console.log(`failed: ${relSource}`)
    console.error(err)
    process.exitCode = 1
  }
}

console.log(
  `Done. jobs=${jobs.length}, processed=${processed}, from_jpg=${fromJpg}, png_in_place=${pngInPlace}, skipped=${skipped}, deleted_jpg=${deletedJpg}, tolerance=${tolerance}, edge_threshold=${edgeThreshold}, include_references=${includeReferences}`,
)
