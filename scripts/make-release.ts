// copy package.json to dist folder

import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import { copyFile } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine project root (one level above scripts)
const root = path.resolve(__dirname, '..')

// Delete dist folder
const dist = path.resolve(root, 'ai-dist')

if (process.argv.includes('--publish')) {
    if (fs.existsSync(dist)) {
        fs.rmdirSync(dist, {recursive: true})
        console.log('dist folder deleted')
    }
}

// run tsc in sync
exec('tsc', {cwd: root}, (error, stdout) => {
    if (error) {
        console.error(`exec error: ${error}`)
        console.error(stdout)
        return
    }

    // Copy package.json to dist folder
    const source = path.resolve(root, 'package.json')
    const destination = path.resolve(root, 'dist', 'package.json')

    copyFile(source, destination)
        .then(() => console.log('package.json copied to dist folder'))
        .catch((error) => console.error(error))

    // publish to npm
    if (process.argv.includes('--publish')) {
        exec('npm publish', {cwd: path.resolve(root, 'dist')}, (error, stdout) => {
            if (error) {
                console.error(`exec error: ${error}`)
                return
            }
            console.log(stdout)
        })
    }
})
