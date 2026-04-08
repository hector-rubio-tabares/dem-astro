interface ContactLink {
  label: string;
  href: string;
  icon: string;
  external: boolean;
}

const CONTACT_LINKS: readonly ContactLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/hector-rubio-dev/',
    icon: '💼',
    external: true,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/HectorRubioTaba',
    icon: '⚙️',
    external: true,
  },
  {
    label: 'hector26rubio@gmail.com',
    href: 'mailto:hector26rubio@gmail.com',
    icon: '✉️',
    external: false,
  },
  {
    label: '+57 302 270 9249',
    href: 'tel:+573022709249',
    icon: '📞',
    external: false,
  },
];

export function ContactSection() {
  return (
    <section className="contact-section glass" aria-labelledby="contact-heading">
      <span className="label-sm hero-prefix">05 // CONTACT</span>
      <h2 id="contact-heading" className="headline-lg contact-title">
        ¿Trabajamos <span className="text-gradient">juntos</span>?
      </h2>
      <p className="body-lg contact-description">
        Disponible para proyectos freelance, posiciones full-time y consultas técnicas.
      </p>
      <ul className="contact-links" role="list">
        {CONTACT_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="contact-link"
              {...(link.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              <span className="contact-link-icon" aria-hidden="true">{link.icon}</span>
              <span className="contact-link-label">{link.label}</span>
              {link.external && (
                <span className="contact-link-arrow" aria-hidden="true">↗</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
