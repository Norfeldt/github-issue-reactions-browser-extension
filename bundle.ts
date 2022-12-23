import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'
import * as archiver from 'archiver'

import { version } from './package.json'

type Browser = 'chrome' | 'firefox'

const writeToDist = (browser: Browser, fileName: string, content: any) =>
  fs.writeFileSync(path.join(__dirname, 'dist', browser, fileName), content)

// MANIFESTS
const commonManifest = {
  name: 'Github Issue Reactions',
  version,
  description:
    'List a link of reactions on a github issue and pull request page',
  content_scripts: [
    {
      matches: ['*://*.github.com/*'],
      js: ['index.js'],
      run_at: 'document_end',
    },
  ],
  icons: {
    '16': 'icon_16.png',
    '48': 'icon_48.png',
    '128': 'icon_128.png',
    '256': 'icon_256.png',
  },
  host_permissions: ['https://www.github.com/', 'http://www.github.com/'],
}

const chromeManifest = {
  manifest_version: 3,
  ...commonManifest,
}
writeToDist('chrome', 'manifest.json', JSON.stringify(chromeManifest, null, 2))

const { host_permissions, ...firefoxManifest } = {
  manifest_version: 2,
  ...commonManifest,
  permissions: commonManifest.host_permissions,
}
writeToDist(
  'firefox',
  'manifest.json',
  JSON.stringify(firefoxManifest, null, 2)
)

// ICONS
const iconFiles = fs.readdirSync(path.join(__dirname, 'assets', 'icons'))
for (const iconFile of iconFiles) {
  const iconData = fs.readFileSync(
    path.join(__dirname, 'assets', 'icons', iconFile)
  )
  writeToDist('chrome', iconFile, iconData)
  writeToDist('firefox', iconFile, iconData)
}

// CONTENT SCRIPT

// If it should z(h)ip it when done
const callBack = (browser: Browser) => {
  if (process.argv.includes('zip')) {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })
    const output = fs.createWriteStream(
      path.join(__dirname, `${browser}_${version}.zip`)
    )
    archive.pipe(output)
    archive.directory(path.join(__dirname, 'dist', `${browser}`), false)
    archive.finalize()
  }
}

const tscCommand = (browser: Browser) =>
  `yarn tsc --outDir dist/${browser} src/index.ts`
child_process.exec(tscCommand('chrome'), () => callBack('chrome'))
child_process.exec(tscCommand('firefox'), () => callBack('firefox'))
