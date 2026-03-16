import { getElementByIdOrThrow } from './mf-runtime'

type ReactMountModule = {
  mount: (container: HTMLElement, context?: Record<string, unknown>) => void
}

async function mountReact() {
  const reactSlot = getElementByIdOrThrow('react-slot')
  // @ts-expect-error Remote module is served from Astro public at runtime.
  const reactModule = (await import('/mf/react/react-mf.js')) as ReactMountModule

  if (typeof reactModule.mount !== 'function') {
    throw new Error('No se pudo montar React MF: falta mount(container).')
  }

  reactModule.mount(reactSlot, { title: 'React desde Astro' })
}

async function mountAngular() {
  const angularSlot = getElementByIdOrThrow('angular-slot')
  // @ts-expect-error Remote module is served from Astro public at runtime.
  await import('/mf/angular/main.js')

  const element = document.createElement('portfolio-angular-mf')
  angularSlot.appendChild(element)
}

async function bootstrap() {
  try {
    await Promise.all([mountReact(), mountAngular()])
  } catch (error) {
    const p = document.createElement('p')
    p.className = 'error'
    p.textContent = `Error de integracion: ${(error as Error).message}`
    document.body.appendChild(p)
  }
}

bootstrap()
