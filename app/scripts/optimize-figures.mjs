/**
 * Rewrites mesh.glb files under src/assets/figures in place:
 * prune unused data, dedupe accessors/textures, decimate geometry (the
 * source meshes are raw AI-generated exports with ~500k triangles each),
 * convert textures to WebP (lossy), and apply Meshopt compression.
 *
 * Geometry simplification targets a low vertex ratio because these pieces
 * render small on a game board — full statue-level detail is wasted there
 * and was the actual cause of the 3D board's slowness (95 files, ~15MB /
 * ~500k tris each, ~1.3GB total, loaded and rendered simultaneously).
 * Meshopt-compressed output is decoded automatically by drei's useGLTF
 * (three-stdlib wires up MeshoptDecoder already), so no client changes
 * are needed to read the optimized files.
 *
 * Files already carrying EXT_meshopt_compression are skipped by default —
 * re-simplifying an already-decimated mesh would destroy it further. This
 * makes it safe to run over the whole tree any time a new figure is added:
 * only the new/untouched mesh.glb files actually get processed.
 *
 * Run from app/ whenever a new figure's mesh.glb is added, before committing:
 *   npm run figures:optimize
 * Single file (for spot-checking): npm run figures:optimize -- --only=Chariot
 * Re-optimize files that were already processed: npm run figures:optimize -- --force
 */
import { copyFile, open, readdir, stat, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, simplify, textureCompress, weld, meshopt } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const figuresDir = path.join(__dirname, '../src/assets/figures')

const onlyFilter = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length)
const force = process.argv.includes('--force')

async function* walkMeshGlbs(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      yield* walkMeshGlbs(full)
    } else if (e.name === 'mesh.glb') {
      yield full
    }
  }
}

// Cheap check (reads only the GLB header + JSON chunk) so re-running over the
// whole tree doesn't have to fully decode every already-optimized mesh.
async function alreadyOptimized(file) {
  const handle = await open(file, 'r')
  try {
    const head = Buffer.alloc(20)
    await handle.read(head, 0, 20, 0)
    const jsonChunkLength = head.readUInt32LE(12)
    const jsonBuf = Buffer.alloc(jsonChunkLength)
    await handle.read(jsonBuf, 0, jsonChunkLength, 20)
    const json = JSON.parse(jsonBuf.toString('utf8'))
    return Boolean(json.extensionsUsed?.includes('EXT_meshopt_compression'))
  } catch {
    return false
  } finally {
    await handle.close()
  }
}

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready])

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })
let ok = 0
let skipped = 0
let totalBefore = 0
let totalAfter = 0

for await (const file of walkMeshGlbs(figuresDir)) {
  const rel = path.relative(figuresDir, file)
  if (onlyFilter && !rel.split(path.sep).join('/').includes(onlyFilter)) continue

  if (!force && (await alreadyOptimized(file))) {
    skipped += 1
    continue
  }

  const tmp = `${file}.tmp-opt.glb`
  const before = (await stat(file)).size
  process.stdout.write(`optimize: ${rel} (${(before / 1e6).toFixed(1)}MB) … `)
  try {
    const doc = await io.read(file)
    await doc.transform(
      prune(),
      dedup(),
      weld(),
      simplify({ simplifier: MeshoptSimplifier, ratio: 0.02, error: 0.01 }),
      textureCompress({
        encoder: sharp,
        targetFormat: 'webp',
        quality: 85,
      }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    )
    await io.write(tmp, doc)
    const after = (await stat(tmp)).size
    await copyFile(tmp, file)
    await unlink(tmp)
    totalBefore += before
    totalAfter += after
    ok += 1
    console.log(`ok -> ${(after / 1e6).toFixed(2)}MB (${(100 * (1 - after / before)).toFixed(0)}% smaller)`)
  } catch (err) {
    console.log('failed')
    console.error(err)
    try {
      await unlink(tmp)
    } catch {
      /* ignore */
    }
    process.exitCode = 1
  }
}

console.log(
  `Done. ${ok} file(s) optimized, ${skipped} already-optimized file(s) skipped. ` +
    `${(totalBefore / 1e6).toFixed(0)}MB -> ${(totalAfter / 1e6).toFixed(0)}MB`,
)
