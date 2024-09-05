// copy package.json to dist folder

import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import { copyFile } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Delete dist folder
const dist = path.resolve(__dirname, 'dist')

if (fs.existsSync(dist)) {
    fs.rmdirSync(dist, {recursive: true})
    console.log('dist folder deleted')
}

// run tsc in sync
exec('tsc', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`)
        console.error(stdout)
        return
    }

    // Copy package.json to dist folder
    const source = path.resolve(__dirname, 'package.json')
    const destination = path.resolve(__dirname, 'dist', 'package.json')

    copyFile(source, destination)
        .then(() => console.log('package.json copied to dist folder'))
        .catch((error) => console.error(error))

    // Copy src/types.d.ts to dist folder
    const sourceTypes = path.resolve(__dirname, 'src', 'types.d.ts')
    const destinationTypes = path.resolve(__dirname, 'dist', 'types.d.ts')

    copyFile(sourceTypes, destinationTypes)
        .then(() => console.log('types.d.ts copied to dist folder'))
        .catch((error) => console.error(error))

    // publish to npm
    exec('npm publish', {cwd: path.resolve(__dirname, 'dist')}, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`)
            return
        }
        console.log(stdout)
    })
})

