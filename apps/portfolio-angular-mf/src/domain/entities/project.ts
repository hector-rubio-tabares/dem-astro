export interface Project {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly image: string;
  readonly span: 'col-8' | 'col-4' | 'col-6';
  readonly aspect: 'aspect-16-9' | 'aspect-square' | 'aspect-video';
}

export const PROJECTS_CATALOG: readonly Project[] = [
  {
    id: 1,
    title: "Integración 3D Secure v2 — Nuvei",
    description: "Backend completo para 3DS v2 con pasarela Nuvei: flujos REST, Webhooks, manejo de estados de autenticación y logging seguro. Newshore by Flyr.",
    tags: [".NET 8", "ASP.NET", "REST", "Webhooks"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_drMuKDOEwPwu2dnfMtNA3MVlVrGjJC3a2TrCWVbP8xrte2Bn9QAWuwhUfjhNtNdjNFj4Zv3wf5DTqzORKiwpveLC_bEbxnCCkiaUS7hQwKzsAdsNiagnKwaWwJRE2z9-Y1KPTSianwWl8AkTee4x13lW0hlP_WzRGNO01eTuYSRL31770i6MZVKuivAGkEigBm7wdmMvsqEt6Bfwniv5EjfFexCXlsEUNOwDCz_PNb-BLZUStGiZFm2PBc8BdFHrftTkWD2DDpQ",
    span: "col-8",
    aspect: "aspect-16-9"
  },
  {
    id: 2,
    title: "SSO con Keycloak JS",
    description: "Implementación de autenticación SSO en Angular: integración Keycloak JS, manejo de tokens, sincronización de sesión entre pestañas y control login/logout. Newshore by Flyr.",
    tags: ["Angular", "Keycloak", "SSO", "TypeScript"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvfe-tKWQpq78QUMT2k35p5r7kMkO_NN_LSORs7WGY08tRCCtA4wLmnl-qSa9cJlM9ym3JzBJgc74sFMjxyYUN8u-knodYAUG9MJt57YrV34x124Y7tut6Xj5HyuTXLHq-bwUQMidASB--IUWWTj6R5JCHiJcf390xQTAuhD33xPkzE9bUbz9eeJtWVpKmHbxPB70WYDhaesbnRf7uDaZmvbETUuYYkZL4koYwhQYPBGrrR-o5H5HxfnEiJYt9L1BV8xfEGSx9D68",
    span: "col-4",
    aspect: "aspect-square"
  },
  {
    id: 3,
    title: "Migración CI/CD Azure DevOps",
    description: "Migración completa de pipelines, artefactos y paquetes NPM entre organizaciones de Azure DevOps, garantizando continuidad de despliegues en producción. Newshore by Flyr.",
    tags: ["Azure DevOps", "CI/CD", "NPM"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA3nIu4CNREPxY2_yzFZGrFUUluUEwumy76y-0ULn_LY1_9RXmztzHwtVKka2r8jMo7_KLNd-8xMRxbqW3V33rrf6d7z0Omc9r7goTb66fX8Eck5nz2DHzTr-0AdEAbu4fi3BddxexW4mYmLyjIu_W4-PQxqwQ0ulsYXFsif4qVlCLUA8kTKBamAyeh_GD9zAftyWs0uO01GynyWs5fsquwaDMvXsIX-gXwsaEcjhRiG-b8iCrVoHHkIsHwONeM-RbIIFyRsb0Peg",
    span: "col-4",
    aspect: "aspect-video"
  },
  {
    id: 4,
    title: "Lector EPUB Extendido — Bibi",
    description: "Extension de la libreria EPUB Bibi para bibliotecas digitales: subrayado, anotaciones, temas, busqueda avanzada y lectura por voz. Confa / Cajasan.",
    tags: ["JavaScript", "Laravel", "EPUB", "UX"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBY0z1tDb76lMif4H201FGfr3H3laRQOikRaHVcJJaUYhwFojU0rrXZad6HQaObDGzpHY2_35UuZqgj5TVMp6fQllbAb16EFs0cwmlPsPQYqJ9pyL3xU3nunUcsOG6TGj0IdyLkVVEuLvmBnbxi06EDhzvqVzMOakseUKY5wOloQKk4wCxhMPuIWFz8jjx5BRcnCnGVGhp_hnYtxPzvrWJpl1kNKu9AMLQOzsmcBLvFBM9ofYDlUaZOyQVz6rfYd-yiE6EGYfCt4dM",
    span: "col-4",
    aspect: "aspect-video"
  },
  {
    id: 5,
    title: "API Inventarios Postobon — .NET 8",
    description: "Backend en .NET 8 para gestion de inventarios empresariales: flujos de procesamiento por etapas, stored procedures SQL Server, Azure Functions y Entity Framework Core.",
    tags: [".NET 8", "SQL Server", "Azure Functions", "EF Core"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwCaianNlgRy6JAAjWuKi23q_CwoRW81ZhLZ2mw3xELX2OQyt_oN56r4k-pZz3ZbROEDh-uIMyOJPR5mlpP4qFpNF9LRcJpbvv8TvN2pHO4LAgprP_-MXIF3pSuvMOdX5ezzpzdxwYK9pdP1YQ8zAGXP4nObaCjwyM6qGG_h6Tyw0DOf5TJt-Ke-Np_A_aPhzZ7T2kjsjfxJhaSNQTAy5ADhoydw-rtCa5F7yD6T-pITicc_5hmUF2U2uftx_R9_HE6kfQ3llYkqg",
    span: "col-4",
    aspect: "aspect-16-9"
  },
  {
    id: 6,
    title: "Testing E2E y Carga — Playwright + JMeter",
    description: "Automatizacion E2E con Playwright para flujos criticos de autenticacion. Pruebas de carga con JMeter evaluando concurrencia, sesion y rendimiento bajo estres.",
    tags: ["Playwright", "JMeter", "E2E", "Testing"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvfe-tKWQpq78QUMT2k35p5r7kMkO_NN_LSORs7WGY08tRCCtA4wLmnl-qSa9cJlM9ym3JzBJgc74sFMjxyYUN8u-knodYAUG9MJt57YrV34x124Y7tut6Xj5HyuTXLHq-bwUQMidASB--IUWWTj6R5JCHiJcf390xQTAuhD33xPkzE9bUbz9eeJtWVpKmHbxPB70WYDhaesbnRf7uDaZmvbETUuYYkZL4koYwhQYPBGrrR-o5H5HxfnEiJYt9L1BV8xfEGSx9D68",
    span: "col-4",
    aspect: "aspect-square"
  },
  {
    id: 7,
    title: "Gestion de Tickets — Emergia",
    description: "Aplicacion interna para gestion de tickets con Angular + .NET. Controles de concurrencia, cifrado en transito, Oracle stored procedures y monitoreo con Zabbix/Nagios.",
    tags: ["Angular", ".NET", "Oracle", "Python"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_drMuKDOEwPwu2dnfMtNA3MVlVrGjJC3a2TrCWVbP8xrte2Bn9QAWuwhUfjhNtNdjNFj4Zv3wf5DTqzORKiwpveLC_bEbxnCCkiaUS7hQwKzsAdsNiagnKwaWwJRE2z9-Y1KPTSianwWl8AkTee4x13lW0hlP_WzRGNO01eTuYSRL31770i6MZVKuivAGkEigBm7wdmMvsqEt6Bfwniv5EjfFexCXlsEUNOwDCz_PNb-BLZUStGiZFm2PBc8BdFHrftTkWD2DDpQ",
    span: "col-4",
    aspect: "aspect-video"
  },
  {
    id: 8,
    title: "Portfolio Micro-Frontend",
    description: "Shell Astro 6 + React 19 + Angular 21 con Module Federation. EventBus tipado, hexagonal architecture, CSP, SPA con ClientRouter y Web Components.",
    tags: ["Astro", "React", "Angular", "Module Federation"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA3nIu4CNREPxY2_yzFZGrFUUluUEwumy76y-0ULn_LY1_9RXmztzHwtVKka2r8jMo7_KLNd-8xMRxbqW3V33rrf6d7z0Omc9r7goTb66fX8Eck5nz2DHzTr-0AdEAbu4fi3BddxexW4mYmLyjIu_W4-PQxqwQ0ulsYXFsif4qVlCLUA8kTKBamAyeh_GD9zAftyWs0uO01GynyWs5fsquwaDMvXsIX-gXwsaEcjhRiG-b8iCrVoHHkIsHwONeM-RbIIFyRsb0Peg",
    span: "col-8",
    aspect: "aspect-16-9"
  },
] as const;

export const PROJECTS_PREVIEW: readonly Project[] = PROJECTS_CATALOG.slice(0, 5);
