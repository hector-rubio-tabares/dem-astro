import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const reactDist = join(root, 'apps', 'portfolio-react-mf', 'dist')
const angularDistPrimary = join(root, 'apps', 'portfolio-angular-mf', 'dist', 'portfolio-angular-mf', 'browser')
const angularDistFallback = join(root, 'apps', 'portfolio-angular-mf', 'dist', 'portfolio-angular-mf')

const shellPublic = join(root, 'apps', 'portfolio-shell-astro', 'public', 'mf')
const shellReact = join(shellPublic, 'react')
const shellAngular = join(shellPublic, 'angular')

function resetDir(path) {
  rmSync(path, { recursive: true, force: true })
  mkdirSync(path, { recursive: true })
}

function requirePath(path, message) {
  if (!existsSync(path)) {
    throw new Error(message)
  }
}

requirePath(reactDist, 'React dist no existe. Ejecuta pnpm build:react-mf primero.')

const angularDist = existsSync(angularDistPrimary)
  ? angularDistPrimary
  : angularDistFallback

requirePath(angularDist, 'Angular dist no existe. Ejecuta pnpm build:angular-mf primero.')

resetDir(shellReact)
resetDir(shellAngular)

cpSync(reactDist, shellReact, { recursive: true })
cpSync(angularDist, shellAngular, { recursive: true })

console.log('Micro-frontends sincronizados en apps/portfolio-shell-astro/public/mf')
