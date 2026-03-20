/**
 * LAYOUT CLIENT SCRIPTS
 * Lógica de theme switcher y auth gate
 * Se ejecuta en el cliente (browser)
 */

// ========== THEME SWITCHER ==========
const THEME_KEY = 'mfe-theme';

function initThemeSwitcher(): void {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');

  function getStoredTheme(): string {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function setTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // Aplicar tema al cargar
  setTheme(getStoredTheme());

  // Toggle al hacer click
  themeToggle?.addEventListener('click', () => {
    const current = getStoredTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

// ========== AUTH GATE (para rutas protegidas) ==========
const AUTH_TOKEN_KEY = 'mfe-auth-token';
const DEMO_PASSWORD = 'admin123';

function initAuthGate(): void {
  const authGate = document.getElementById('auth-gate');
  const mainView = document.getElementById('main-view');
  const authPasswordInput = document.getElementById('auth-password') as HTMLInputElement;
  const authSubmit = document.getElementById('auth-submit');

  function isAuthenticatedFromStorage(): boolean {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    return token === 'authenticated';
  }

  function setAuthenticated(): void {
    sessionStorage.setItem(AUTH_TOKEN_KEY, 'authenticated');
    if (authGate) authGate.style.display = 'none';
    if (mainView) mainView.style.display = 'block';
    updateAuthNav(); // Actualizar navegación
  }

  function checkAuth(): void {
    if (authGate && isAuthenticatedFromStorage()) {
      setAuthenticated();
    }
  }

  authSubmit?.addEventListener('click', () => {
    const password = authPasswordInput?.value || '';
    if (password === DEMO_PASSWORD) {
      setAuthenticated();
    } else {
      alert('Contraseña incorrecta. Intenta: admin123');
    }
  });

  authPasswordInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      authSubmit?.click();
    }
  });

  // Verificar auth al cargar la página
  checkAuth();
  updateAuthNav(); // Actualizar navegación al cargar
}

// ========== AUTH NAV UPDATER ==========
function updateAuthNav(): void {
  const authNavItem = document.getElementById('auth-nav-item');
  const loginLink = document.getElementById('login-link') as HTMLAnchorElement;
  
  if (!authNavItem || !loginLink) return;

  const isAuthenticated = sessionStorage.getItem(AUTH_TOKEN_KEY) === 'authenticated';
  
  if (isAuthenticated) {
    // Usuario autenticado → mostrar Logout
    loginLink.textContent = 'Logout';
    loginLink.className = 'btn-secondary btn-sm';
    loginLink.href = '#';
    loginLink.onclick = (e) => {
      e.preventDefault();
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = '/login';
    };
  } else {
    // Usuario NO autenticado → mostrar Login
    loginLink.textContent = 'Login';
    loginLink.className = 'btn-secondary btn-sm';
    loginLink.href = '/login';
    loginLink.onclick = null;
  }
}

// ========== INITIALIZATION ==========
// Ejecutar ambos inicializadores cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initAuthGate();
  });
} else {
  // Si ya cargó, ejecutar inmediatamente
  initThemeSwitcher();
  initAuthGate();
}
