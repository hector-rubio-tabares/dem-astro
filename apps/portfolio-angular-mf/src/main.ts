import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { appConfig } from './infrastructure/di/providers';
import { App } from './presentation/app/app';
import { ProjectsComponent } from './presentation/projects/projects.component';
import { ProjectsFullComponent } from './presentation/projects/projects-full.component';
import { environment } from './environments/environment';

const ELEMENT_TAG_APP = 'portfolio-angular-mf';
const ELEMENT_TAG_PROJECTS = 'portfolio-projects';
const ELEMENT_TAG_PROJECTS_FULL = 'portfolio-projects-full';
const ENV_MODE = environment.production ? 'PROD' : 'DEV';

async function registerElements(): Promise<void> {
  const app = await createApplication(appConfig);

  if (!customElements.get(ELEMENT_TAG_APP)) {
    customElements.define(ELEMENT_TAG_APP, createCustomElement(App, { injector: app.injector }));
  }

  if (!customElements.get(ELEMENT_TAG_PROJECTS)) {
    customElements.define(ELEMENT_TAG_PROJECTS, createCustomElement(ProjectsComponent, { injector: app.injector }));
  }

  if (!customElements.get(ELEMENT_TAG_PROJECTS_FULL)) {
    customElements.define(ELEMENT_TAG_PROJECTS_FULL, createCustomElement(ProjectsFullComponent, { injector: app.injector }));
  }

  console.log(`[Angular MFE ${ENV_MODE}] Web Components registrados.`);
}

registerElements().catch((err: unknown) => {
  console.error('[Angular MFE] Error al registrar Web Components:', err);
});