/**
 * Projects Data - Catálogo compartido de proyectos
 *
 * SOLID: Single Responsibility — este archivo SOLO contiene el catálogo de proyectos.
 * DRY: Elimina la duplicación total entre ProjectsComponent y ProjectsFullComponent.
 * Open/Closed: Añadir proyectos aquí sin tocar los componentes.
 */

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
    title: "Plataforma de Trading Cuantitativo",
    description: "Optimización de tiempos de respuesta en milisegundos para visualización de datos en tiempo real con baja latencia.",
    tags: ["React", "TypeScript"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwCaianNlgRy6JAAjWuKi23q_CwoRW81ZhLZ2mw3xELX2OQyt_oN56r4k-pZz3ZbROEDh-uIMyOJPR5mlpP4qFpNF9LRcJpbvv8TvN2pHO4LAgprP_-MXIF3pSuvMOdX5ezzpzdxwYK9pdP1YQ8zAGXP4nObaCjwyM6qGG_h6Tyw0DOf5TJt-Ke-Np_A_aPhzZ7T2kjsjfxJhaSNQTAy5ADhoydw-rtCa5F7yD6T-pITicc_5hmUF2U2uftx_R9_HE6kfQ3llYkqg",
    span: "col-8",
    aspect: "aspect-16-9"
  },
  {
    id: 2,
    title: "Editorial Framework",
    description: "Un motor de renderizado estático optimizado para tipografía fluida y layouts de rejilla compleja con enfoque editorial.",
    tags: ["Astro"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvfe-tKWQpq78QUMT2k35p5r7kMkO_NN_LSORs7WGY08tRCCtA4wLmnl-qSa9cJlM9ym3JzBJgc74sFMjxyYUN8u-knodYAUG9MJt57YrV34x124Y7tut6Xj5HyuTXLHq-bwUQMidASB--IUWWTj6R5JCHiJcf390xQTAuhD33xPkzE9bUbz9eeJtWVpKmHbxPB70WYDhaesbnRf7uDaZmvbETUuYYkZL4koYwhQYPBGrrR-o5H5HxfnEiJYt9L1BV8xfEGSx9D68",
    span: "col-4",
    aspect: "aspect-square"
  },
  {
    id: 3,
    title: "Core Banking Interface",
    description: "Arquitectura de microservicios segura con una interfaz de usuario minimalista para transacciones de alta fidelidad.",
    tags: ["Angular"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_drMuKDOEwPwu2dnfMtNA3MVlVrGjJC3a2TrCWVbP8xrte2Bn9QAWuwhUfjhNtNdjNFj4Zv3wf5DTqzORKiwpveLC_bEbxnCCkiaUS7hQwKzsAdsNiagnKwaWwJRE2z9-Y1KPTSianwWl8AkTee4x13lW0hlP_WzRGNO01eTuYSRL31770i6MZVKuivAGkEigBm7wdmMvsqEt6Bfwniv5EjfFexCXlsEUNOwDCz_PNb-BLZUStGiZFm2PBc8BdFHrftTkWD2DDpQ",
    span: "col-4",
    aspect: "aspect-video"
  },
  {
    id: 4,
    title: "DevOps Analytics",
    description: "Visualización de flujos de CI/CD y métricas de infraestructura con un enfoque en la observabilidad estética y funcional.",
    tags: ["React"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA3nIu4CNREPxY2_yzFZGrFUUluUEwumy76y-0ULn_LY1_9RXmztzHwtVKka2r8jMo7_KLNd-8xMRxbqW3V33rrf6d7z0Omc9r7goTb66fX8Eck5nz2DHzTr-0AdEAbu4fi3BddxexW4mYmLyjIu_W4-PQxqwQ0ulsYXFsif4qVlCLUA8kTKBamAyeh_GD9zAftyWs0uO01GynyWs5fsquwaDMvXsIX-gXwsaEcjhRiG-b8iCrVoHHkIsHwONeM-RbIIFyRsb0Peg",
    span: "col-4",
    aspect: "aspect-video"
  },
  {
    id: 5,
    title: "Component Library",
    description: "Un sistema de diseño atómico escalable construido para la consistencia visual en productos de nivel empresarial.",
    tags: ["Next.js"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBY0z1tDb76lMif4H201FGfr3H3laRQOikRaHVcJJaUYhwFojU0rrXZad6HQaObDGzpHY2_35UuZqgj5TVMp6fQllbAb16EFs0cwmlPsPQYqJ9pyL3xU3nunUcsOG6TGj0IdyLkVVEuLvmBnbxi06EDhzvqVzMOakseUKY5wOloQKk4wCxhMPuIWFz8jjx5BRcnCnGVGhp_hnYtxPzvrWJpl1kNKu9AMLQOzsmcBLvFBM9ofYDlUaZOyQVz6rfYd-yiE6EGYfCt4dM",
    span: "col-4",
    aspect: "aspect-video"
  },
  {
    id: 6,
    title: "Micro-Frontend Architecture",
    description: "Orquestador Shell con Astro + 2 MFEs independientes (React/Angular). Module Federation con EventBus tipado para comunicación.",
    tags: ["Astro", "React", "Angular"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwCaianNlgRy6JAAjWuKi23q_CwoRW81ZhLZ2mw3xELX2OQyt_oN56r4k-pZz3ZbROEDh-uIMyOJPR5mlpP4qFpNF9LRcJpbvv8TvN2pHO4LAgprP_-MXIF3pSuvMOdX5ezzpzdxwYK9pdP1YQ8zAGXP4nObaCjwyM6qGG_h6Tyw0DOf5TJt-Ke-Np_A_aPhzZ7T2kjsjfxJhaSNQTAy5ADhoydw-rtCa5F7yD6T-pITicc_5hmUF2U2uftx_R9_HE6kfQ3llYkqg",
    span: "col-8",
    aspect: "aspect-16-9"
  },
  {
    id: 7,
    title: "E-Commerce API - Hexagonal Architecture",
    description: "REST API hexagonal: Domain entities, Use Cases, Ports (IPaymentGateway) y Adapters (StripeAdapter). SOLID + Strategy pattern.",
    tags: ["NestJS", "TypeScript", "PostgreSQL"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_drMuKDOEwPwu2dnfMtNA3MVlVrGjJC3a2TrCWVbP8xrte2Bn9QAWuwhUfjhNtNdjNFj4Zv3wf5DTqzORKiwpveLC_bEbxnCCkiaUS7hQwKzsAdsNiagnKwaWwJRE2z9-Y1KPTSianwWl8AkTee4x13lW0hlP_WzRGNO01eTuYSRL31770i6MZVKuivAGkEigBm7wdmMvsqEt6Bfwniv5EjfFexCXlsEUNOwDCz_PNb-BLZUStGiZFm2PBc8BdFHrftTkWD2DDpQ",
    span: "col-4",
    aspect: "aspect-video"
  },
  {
    id: 8,
    title: "CRM Dashboard - Angular Signals",
    description: "Dashboard 100% signals: 15 computed values reactivos, zoneless change detection. Reducción 40% en tiempo de renderizado.",
    tags: ["Angular", "Signals"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvfe-tKWQpq78QUMT2k35p5r7kMkO_NN_LSORs7WGY08tRCCtA4wLmnl-qSa9cJlM9ym3JzBJgc74sFMjxyYUN8u-knodYAUG9MJt57YrV34x124Y7tut6Xj5HyuTXLHq-bwUQMidASB--IUWWTj6R5JCHiJcf390xQTAuhD33xPkzE9bUbz9eeJtWVpKmHbxPB70WYDhaesbnRf7uDaZmvbETUuYYkZL4koYwhQYPBGrrR-o5H5HxfnEiJYt9L1BV8xfEGSx9D68",
    span: "col-4",
    aspect: "aspect-square"
  },
  {
    id: 9,
    title: "Cloud Marketplace - Event Sourcing",
    description: "Plataforma B2B event-driven: 8 microservicios independientes. Kafka + CQRS + Redis para cache distribuido.",
    tags: ["Kafka", "Redis", "Kubernetes"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA3nIu4CNREPxY2_yzFZGrFUUluUEwumy76y-0ULn_LY1_9RXmztzHwtVKka2r8jMo7_KLNd-8xMRxbqW3V33rrf6d7z0Omc9r7goTb66fX8Eck5nz2DHzTr-0AdEAbu4fi3BddxexW4mYmLyjIu_W4-PQxqwQ0ulsYXFsif4qVlCLUA8kTKBamAyeh_GD9zAftyWs0uO01GynyWs5fsquwaDMvXsIX-gXwsaEcjhRiG-b8iCrVoHHkIsHwONeM-RbIIFyRsb0Peg",
    span: "col-4",
    aspect: "aspect-video"
  },
] as const;

/** Vista previa: los primeros 5 proyectos para la home page */
export const PROJECTS_PREVIEW: readonly Project[] = PROJECTS_CATALOG.slice(0, 5);
