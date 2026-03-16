import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const ELEMENT_TAG = 'portfolio-angular-mf';

async function registerElement() {
  if (customElements.get(ELEMENT_TAG)) {
    return;
  }

  const app = await createApplication(appConfig);
  const angularElement = createCustomElement(App, { injector: app.injector });
  customElements.define(ELEMENT_TAG, angularElement);
}

registerElement().catch((err) => console.error(err));
