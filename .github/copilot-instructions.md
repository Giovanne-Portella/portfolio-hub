# Portfolio Hub — AI Context Document

## Overview

Portfolio pessoal com **página pública** e **painel administrativo** privado. Stack: HTML5/CSS3/Vanilla JS (sem frameworks), Supabase (Auth + PostgreSQL + Storage), Netlify (hosting + CDN). Tema inspirado no GitHub Dark.

**URL de produção:** `gm-portfolio-hub.netlify.app`  
**Repositório:** `Giovanne-Portella/portfolio-hub`, branch `main`  
**Supabase URL:** `https://wejrqqqblubxlwmztzmt.supabase.co`

---

## Estrutura de Arquivos

```
Portfolio/
├── index.html              # Página pública (splash + todas as seções)
├── admin/
│   ├── index.html          # Painel admin (CRUD completo)
│   └── login.html          # Tela de login Supabase Auth
├── css/
│   ├── style.css           # Manifesto @import — carrega css/modules/*
│   ├── admin.css           # Manifesto @import — carrega css/admin/*
│   ├── modules/            # Módulos CSS da página pública (18 arquivos)
│   │   ├── _variables.css  # Design tokens (:root)
│   │   ├── _base.css       # Reset e elementos base
│   │   ├── _buttons.css    # Botões
│   │   ├── _navbar.css     # Navbar
│   │   ├── _hero.css       # Seção hero
│   │   ├── _sections.css   # Seções genéricas
│   │   ├── _about.css      # Sobre mim
│   │   ├── _certificates.css # Certificados + sidebar
│   │   ├── _projects.css   # Projetos
│   │   ├── _readme-modal.css # README viewer modal
│   │   ├── _footer.css     # Rodapé
│   │   ├── _cert-modal.css # Modal de certificado
│   │   ├── _ui.css         # Toast, spinner, collapsible
│   │   ├── _animations.css # Type-in e keyframes
│   │   ├── _github.css     # GitHub stats e badges
│   │   ├── _responsive.css # Todas as media queries (antes de music/splash)
│   │   ├── _music.css      # Player de música
│   │   └── _splash.css     # Splash screen terminal
│   └── admin/              # Módulos CSS do admin (6 arquivos)
│       ├── _variables-base.css
│       ├── _sidebar.css
│       ├── _content.css
│       ├── _forms.css
│       ├── _components.css
│       └── _responsive.css
├── js/
│   ├── config.js           # SUPABASE_URL + SUPABASE_ANON_KEY
│   ├── portfolio.js        # Entry point público — chama init functions no DOMContentLoaded
│   ├── admin.js            # Entry point admin — chama init functions no DOMContentLoaded
│   ├── auth.js             # Guard de autenticação
│   ├── modules/            # Módulos JS da página pública (13 arquivos)
│   │   ├── utils.js        # slugify, escapeHtml, escapeAttr, calcTimeSince
│   │   ├── splash.js       # Splash screen boot sequence + áudio
│   │   ├── navbar.js       # setupNavbar()
│   │   ├── profile.js      # loadProfile()
│   │   ├── social.js       # loadSocialLinks()
│   │   ├── certificates.js # loadCertificates(), sidebar, PDF thumbnails
│   │   ├── collapsible.js  # setupCollapsible()
│   │   ├── cert-modal.js   # setupModal(), loadCertProjectFiles()
│   │   ├── projects.js     # loadProjects()
│   │   ├── readme-modal.js # openReadme(), closeReadmeModal()
│   │   ├── animations.js   # setupTypeInAnimation()
│   │   ├── github.js       # loadGitHubData(), LANG_COLORS, badges
│   │   └── music.js        # YouTube player, musicReactor, YT_TRACKS
│   └── admin/              # Módulos JS do admin (7 arquivos)
│       ├── core.js         # Navegação, modais, toast, uploadFile()
│       ├── profile.js      # loadProfile(), setupProfileForm()
│       ├── social.js       # loadSocialLinks(), setupSocialForm()
│       ├── categories.js   # loadCategories(), updateCategoryDropdowns()
│       ├── certificates.js # loadCertificates(), setupCertificateForm()
│       ├── cert-files.js   # setupCertProjectFiles(), loadCertProjectFiles()
│       └── projects.js     # loadProjects(), setupProjectForm()
├── supabase-schema.sql     # Schema DDL (tabelas + RLS + storage)
├── supabase-migration.sql  # Migrações adicionais
├── netlify.toml            # Headers de segurança + redirects
├── favicon.svg
└── README.md
```

### Convenção de Módulos CSS
- Arquivos em `css/modules/` e `css/admin/` prefixados com `_` (convenção SCSS, sem build tool)
- `style.css` e `admin.css` são manifestos puros de `@import` — **não adicionar estilos diretamente neles**
- A ordem dos imports em `style.css` é intencional: `_responsive.css` deve vir **antes** de `_music.css` e `_splash.css` para preservar a cascata original

### Convenção de Módulos JS
- JS usa `<script>` tags ordenadas (sem ES modules / type="module")
- Todas as variáveis `let`/`const` de nível superior e funções são acessíveis globalmente pelos scripts carregados depois
- `portfolio.js` e `admin.js` são **apenas entry points** — contêm somente o `DOMContentLoaded` que chama funções definidas nos módulos
- `utils.js` deve ser carregado **primeiro** (funções utilitárias usadas por todos os outros módulos)

---

## Design System (CSS Variables)

```css
--primary: #58a6ff       /* Azul principal */
--primary-dark: #388bfd
--primary-light: #79c0ff
--accent: #3fb950        /* Verde de destaque */
--accent-dark: #2ea043
--bg: #0d1117            /* Fundo principal */
--bg-alt: #161b22        /* Fundo alternativo (cards, navbar) */
--card-bg: #161b22
--text: #e6edf3          /* Texto principal */
--text-secondary: #8b949e
--text-muted: #6e7681
--border: #30363d
--radius: 12px
--radius-sm: 8px
```

Seção de certificados (`.section-alt`) usa fundo `#010409`.

### Breakpoints Responsivos
- **Tablet:** `max-width: 768px`
- **Mobile:** `max-width: 480px`
- **Small mobile:** `max-width: 360px`

---

## Funcionalidades Principais

### Splash Screen (Tapete de Entrada)
- **Primeira visita:** Terminal Linux completo — boot lines com `[ OK ]`, barra de progresso, mensagem de boas-vindas digitada com som de teclas (Web Audio API), botão "Prosseguir"
- **Visitas seguintes:** (cache em `localStorage.portfolio_visited`) — terminal rápido mostra "Seja bem vindo novamente!" e auto-desaparece em ~1.8s
- **Transição:** `body.site-loading` → `body.site-loaded` com fade-in das seções
- **Música:** Inicia automaticamente ao clicar em "Prosseguir" (user gesture para autoplay)
- **Mobile:** Texto "Toque para iniciar" (em vez de "Clique"), terminal fullscreen

### Certificados
- **Sidebar:** Lista de categorias com progresso, horas, contagem
- **Mobile:** Sidebar vira scroll horizontal com snap, gradientes de fade nas bordas e hint "deslize para ver mais"
- **Cards:** Thumbnails de imagem ou primeira página de PDF (via pdf.js)
- **Modal:** Zoom com suporte a imagem/PDF, credencial, cópia de link, arquivos complementares
- **Deep linking:** `?cert={id}` abre e destaca o certificado
- **Horas:** Extração automática de PDFs via `extractHoursFromPdf()` no admin

### Projetos
- **Cards:** Badge de destaque, tecnologias (auto-fetch via GitHub API), horas, links
- **README Viewer:** Modal terminal-style que busca e renderiza README.md via GitHub API + marked.js + DOMPurify

### GitHub & Tecnologias
- Estatísticas: repos, commits/semana, followers, stars
- Badges coloridos de tecnologias (120+ cores predefinidas no JS)
- Dados agregados de GitHub repos + tabela projects do Supabase

### Music Player & Reactor
- YouTube IFrame API com playlist de 4 tracks, seleção aleatória
- **Music Reactor:** Ambient glow com 3 camadas (bass, mid, treble) simuladas via osciladores senoidais a 60fps, z-index 9998
- Flutuante no canto inferior direito, toast ao trocar música

### Animações
- **Type-in:** Elementos com classe `.type-in` são digitados no scroll via IntersectionObserver
- **Seções colapsáveis:** Estado salvo em `localStorage`

---

## Banco de Dados (Supabase)

### Tabelas
| Tabela | Campos chave |
|--------|-------------|
| `profiles` | full_name, avatar_url, title, bio, email, phone, location, github_username, resume_url, company_name, company_url, company_start_date, whatsapp |
| `social_links` | platform, url, icon, display_order |
| `certificate_categories` | name, description, display_order |
| `certificates` | name, image_url, issuer, completed, progress, hours, completed_at, credential_url, category_id, display_order |
| `certificate_files` | certificate_id, file_name, file_url, description |
| `projects` | title, description, image_url, github_url, demo_url, technologies (text[]), featured, hours, display_order |

### RLS
- **SELECT:** Público (sem autenticação)
- **INSERT/UPDATE/DELETE:** Apenas `auth.uid() = user_id`

### Storage Buckets
- `avatars` — Fotos de perfil
- `certificates` — Imagens/PDFs de certificados
- `certificate-files` — Arquivos complementares
- `projects` — Imagens de projetos

---

## Cache Busting

O `index.html` usa query strings para cache busting:
```html
<link rel="stylesheet" href="css/style.css?v=XX">
<script src="js/portfolio.js?v=XX"></script>
```
**Sempre incrementar a versão** ao alterar `style.css` ou `portfolio.js`.

---

## Bibliotecas Externas (CDN)

| Lib | Versão | Uso |
|-----|--------|-----|
| Supabase JS | v2 | Client SDK (`supabase` global) |
| Font Awesome | 6.5.1 | Ícones |
| Google Fonts | Inter | Tipografia |
| PDF.js | 3.11.174 | Thumbnails + extração de texto |
| marked.js | latest | Markdown → HTML |
| DOMPurify | v3 | Sanitização XSS |
| Swiper | v11 | Carregado via CDN mas não mais usado (pode ser removido) |
| YouTube IFrame API | — | Player de música |

---

## Segurança

- `escapeHtml()` e `escapeAttr()` em todo conteúdo dinâmico renderizado
- DOMPurify para markdown (README viewer)
- RLS no Supabase para proteção de escrita
- Headers de segurança via `netlify.toml` (X-Frame-Options, CSP, Referrer-Policy)

---

## Convenções de Código

- **CSS:** Sections separadas por `/* === SECTION NAME === */`, propriedades em ordem lógica
- **JS:** Funções nomeadas, `async/await` para Supabase, nenhum framework
- **HTML:** Semantic tags, IDs para elementos dinâmicos
- **Commits:** Conventional Commits em português (`feat:`, `fix:`, `docs:`)
- **Idioma dos commits/variáveis:** Commits em português, código em inglês
- **Admin:** Formulários com modais, toast notifications, validação no submit

---

## Problemas Conhecidos / Notas

1. **Swiper.js** ainda está importado via CDN no `index.html` mas não é mais usado (substituído por CSS Grid). Pode ser removido para economizar bandwidth.
2. **YouTube autoplay** depende de user gesture — no splash completo o clique em "Prosseguir" habilita. No splash de retorno (auto-dismiss), há fallback para play no primeiro click/scroll do site.
3. **PDF.js worker** precisa ser inicializado antes do uso: `pdfjsLib.GlobalWorkerOptions.workerSrc = '...'`
4. **Horas de certificados:** Extração de PDF usa regex `/(\d+)\s*h(?:oras?)?\b/i` sobre texto joined sem espaços (para evitar separar números como "80" em "8 0").
