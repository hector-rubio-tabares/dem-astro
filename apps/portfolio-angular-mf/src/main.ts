import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ProjectsComponent } from './app/projects/projects.component';
import { ProjectsFullComponent } from './app/projects/projects-full.component';
import { environment } from './environments/environment';

const ELEMENT_TAG_APP = 'portfolio-angular-mf';
const ELEMENT_TAG_PROJECTS = 'portfolio-projects';
const ELEMENT_TAG_PROJECTS_FULL = 'portfolio-projects-full';
const IS_PRODUCTION = environment.production;
const ENV_MODE = IS_PRODUCTION ? '🔴 PROD' : '🟢 DEV';

async function registerElements() {
  console.log(`[Angular MFE ${ENV_MODE}] Registrando Web Components...`);

  // Crear aplicación Angular una sola vez
  const app = await createApplication(appConfig);

  // Registrar componente principal (App)
  if (!customElements.get(ELEMENT_TAG_APP)) {
    const appElement = createCustomElement(App, { injector: app.injector });
    customElements.define(ELEMENT_TAG_APP, appElement);
    console.log(`[Angular MFE ${ENV_MODE}] ✅ ${ELEMENT_TAG_APP} registrado`);
  }

  // Registrar componente de proyectos (preview)
  if (!customElements.get(ELEMENT_TAG_PROJECTS)) {
    const projectsElement = createCustomElement(ProjectsComponent, { injector: app.injector });
    customElements.define(ELEMENT_TAG_PROJECTS, projectsElement);
    console.log(`[Angular MFE ${ENV_MODE}] ✅ ${ELEMENT_TAG_PROJECTS} registrado`);
  }

  // Registrar componente de proyectos completo (con paginación)
  if (!customElements.get(ELEMENT_TAG_PROJECTS_FULL)) {
    const projectsFullElement = createCustomElement(ProjectsFullComponent, { injector: app.injector });
    customElements.define(ELEMENT_TAG_PROJECTS_FULL, projectsFullElement);
    console.log(`[Angular MFE ${ENV_MODE}] ✅ ${ELEMENT_TAG_PROJECTS_FULL} registrado`);
  }

  console.log(`[Angular MFE ${ENV_MODE}] Web Components registrados exitosamente.`);
}

registerElements().catch((err) => console.error(err));
