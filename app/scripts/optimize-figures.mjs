/**
 * Rewrites mesh.glb files under src/assets/figures in place:
 * prune unused data, dedupe accessors/textures, convert textures to WebP (lossy).
 * (Texture resize is omitted: gltf-transform + sharp can throw "size is not iterable"
 * when ImageUtils.getSize fails on some embedded formats, e.g. WebP in GLB.)
 *
 * Run from app/: npm run figures:optimize
 */
import { copyFile, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, textureCompress } from '@gltf-transform/functions'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const figuresDir = path.join(__dirname, '../src/assets/figures')

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

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
let ok = 0
for await (const file of walkMeshGlbs(figuresDir)) {
  const rel = path.relative(figuresDir, file)
  const tmp = `${file}.tmp-opt.glb`
  process.stdout.write(`optimize: ${rel} … `)
  try {
    const doc = await io.read(file)
    await doc.transform(
      prune(),
      dedup(),
      textureCompress({
        encoder: sharp,
        targetFormat: 'webp',
        quality: 85,
      }),
    )
    await io.write(tmp, doc)
    await copyFile(tmp, file)
    ok += 1
    console.log('ok')
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

console.log(`Done. ${ok} file(s) optimized.`)
