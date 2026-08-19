const figureAssetModules = import.meta.glob(
  ['../assets/figures/**/*.{glb,png,jpg,jpeg,webp,gif,bmp,tiff,svg}', '../assets/figure-3d-skins/**/*.glb'],
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>

export const resolveFigureAssetUrl = (relativeAssetPath: string): string | null => {
  const normalizedPath = relativeAssetPath.replace(/\\/g, '/')
  const modulePath = `../assets/${normalizedPath}`
  return figureAssetModules[modulePath] ?? null
}
