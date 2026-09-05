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
 * Run from app/: npm run figures:optimize
 * Single file (for spot-checking): npm run figures:optimize -- --only=Chariot
 */
import { copyFile, readdir, stat, unlink } from 'node:fs/promises'
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

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready])

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })
let ok = 0
let totalBefore = 0
let totalAfter = 0

for await (const file of walkMeshGlbs(figuresDir)) {
  const rel = path.relative(figuresDir, file)
  if (onlyFilter && !rel.split(path.sep).join('/').includes(onlyFilter)) continue

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
  `Done. ${ok} file(s) optimized. ${(totalBefore / 1e6).toFixed(0)}MB -> ${(totalAfter / 1e6).toFixed(0)}MB`,
)
