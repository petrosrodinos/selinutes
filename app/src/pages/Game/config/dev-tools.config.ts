export const DEV_TOOLS_OPTIONS = {
    DEV_MODE: 'devMode',
    SHOW_OBSTACLES: 'showObstacles',
    SHUFFLE_FIGURES: 'shuffleFigures',
} as const

export type DevToolsOption = (typeof DEV_TOOLS_OPTIONS)[keyof typeof DEV_TOOLS_OPTIONS]

export const DEV_TOOLS_OPTION_LABELS = {
    [DEV_TOOLS_OPTIONS.DEV_MODE]: 'Dev mode',
    [DEV_TOOLS_OPTIONS.SHOW_OBSTACLES]: 'Show obstacles',
    [DEV_TOOLS_OPTIONS.SHUFFLE_FIGURES]: 'Shuffle figures',
} as const
