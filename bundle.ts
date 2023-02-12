import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'
import * as archiver from 'archiver'

import { version } from './package.json'

console.log('Bundling started')

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
  permissions: ['storage'],
  icons: {
    '16': 'icon_16.png',
    '48': 'icon_48.png',
    '128': 'icon_128.png',
    '256': 'icon_256.png',
  },
  host_permissions: ['https://www.github.com/', 'http://www.github.com/'],
}

// CHROME
const chromeManifest = {
  manifest_version: 3,
  ...commonManifest,
}
writeToDist('chrome', 'manifest.json', JSON.stringify(chromeManifest, null, 2))

// FIREFOX
const { host_permissions, ...firefoxManifest } = {
  manifest_version: 2,
  ...commonManifest,
  permissions: [
    ...commonManifest.host_permissions,
    ...commonManifest.permissions,
  ],
  browser_specific_settings: {
    gecko: {
      id: '{f6ec3962-fd1d-4a7b-8dab-d211fbf91389}',
      strict_min_version: '57.0a1',
    },
  },
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
const tscCommand = (browser: Browser) => {
  const command = `yarn tsc src/index.ts --outDir dist/${browser}`
  console.log(command)

  return command
}
child_process.exec(tscCommand('chrome'), () => callBack('chrome'))
child_process.exec(tscCommand('firefox'), () => callBack('firefox'))

// If it should z(h)ip it when done
function callBack(browser: Browser) {
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

setTimeout(() => {
  const timeStampWithoutMs = new Date()
    .toISOString()
    .split('.')[0]
    .replace('T', ' ')
  console.log('Bundling finished', timeStampWithoutMs)
}, 5000)
