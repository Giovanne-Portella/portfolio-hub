<div align="center">

# 🌐 Portfolio Hub

**Site pessoal de portfolio com painel administrativo privado — terminal-style, reativo e responsivo**

[![Netlify Status](https://api.netlify.com/api/v1/badges/placeholder/deploy-status)](https://netlify.com)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-estrutura">Estrutura</a> •
  <a href="#-setup">Setup</a> •
  <a href="#-como-usar">Como Usar</a>
</p>

</div>

---

## 📋 Sobre

Portfolio profissional completo com **página pública** para visitantes e **painel administrativo** privado para gerenciamento de conteúdo. Inspirado no GitHub Dark Theme, com terminal-style splash screen, player de música ambiente reativo, visualização de certificados e projetos com integração GitHub, avatar pixel-art personalizável e carrossel de depoimentos de clientes/colaboradores.

<details>
<summary><strong>📸 Preview</strong></summary>
<br>

| Página Pública | Painel Admin |
|:-:|:-:|
| Splash screen estilo terminal Linux | Dashboard com CRUD completo |
| Hero com foto, bio e redes sociais | Upload de imagens/PDFs via Supabase Storage |
| Certificados organizados por categoria | Gerenciamento de categorias e progresso |
| Projetos com techs e README viewer | Extração automática de horas de PDFs |
| Carrossel de feedbacks com modal | Aprovação de feedbacks pendentes |
| Avatar pixel-art animado | Editor visual de avatar com prévia em tempo real |

</details>

## ✨ Funcionalidades

### 🖥️ Splash Screen — Terminal Boot
- Tela de entrada estilo terminal Linux com prompt `guest@portfolio:~$ ./welcome.sh`
- Sequência de boot com mensagens `[ OK ]` e barra de progresso animada
- Mensagem de boas-vindas digitada caractere por caractere com **som de tecla** (Web Audio API)
- Botão "Prosseguir" para transição suave ao site
- Ao prosseguir, a música ambiente começa automaticamente
- Totalmente responsivo — fullscreen em mobile

### 🌍 Página Pública
- **Hero Section** — Foto, nome, título, localização, redes sociais e avatar pixel-art animado
- **Sobre Mim** — Bio com informações de contato, empresa atual e tempo de serviço calculado automaticamente
- **Certificados** — Organizados por categoria com sidebar, barra de progresso, contagem de horas e thumbnails (imagem ou primeira página de PDF via pdf.js)
- **Projetos** — Cards com badges de destaque, tecnologias auto-detectadas via GitHub API, horas e links
- **Empresas** — Grid de empresas/clientes com logo, descrição e link para o site
- **GitHub & Tecnologias** — Estatísticas em tempo real (repos, commits/semana, followers, stars) e badges coloridos de tecnologias
- **Feedbacks** — Carrossel de depoimentos aprovados com "Ver mais" → modal completo (nome, profissão, rede social)
- **Modal de Certificado** — Zoom com suporte a imagem e PDF, link da credencial, cópia de link e arquivos complementares
- **README Viewer** — Modal terminal-style que busca e renderiza README.md do GitHub com marked.js + DOMPurify
- **Deep Linking** — Links diretos para certificados via `?cert={id}` com highlight animado
- **Seções Colapsáveis** — Estado salvo em localStorage
- **Animações Type-In** — Texto digitado no scroll com efeito de cursor terminal
- **Design Responsivo** — Otimizado para desktop, tablet (768px), mobile (480px) e small mobile (360px); todos os modais em bottom-sheet no mobile; avatar companion e elementos fixos reposicionados em telas pequenas

### 👾 Avatar Pixel-Art
- Avatar sprite 100×160px totalmente customizável no painel admin
- Partes personalizáveis: tom de pele, cor do cabelo, barba, olhos, óculos, camisa e calça
- Opções de estilo: tipo de cabelo, formato do rosto, acessórios
- **Estados animados autônomos:** idle, wave, code, study, phone, thinking — alterna automaticamente
- Prévia em tempo real com chips de estado no editor admin

### 🎵 Player de Música & Reactor
- **YouTube Floating Player** — Playlist gerenciada pelo admin com shuffle e skip
- **Controles** — Play/pause, volume, shuffle, skip com toast do nome da música
- **Music Reactor** — Efeito ambient glow reativo com 3 camadas de frequência (bass, mid, treble) simuladas via osciladores senoidais a 60fps
- **CTA de Playlist no Footer** — Após a música iniciar, um botão "Ver playlist" aparece no rodapé
- **Modal de Playlist Terminal-Style** — Lista todas as tracks com thumbnail do YouTube, nome da música, canal (via noembed.com) e link direto para o vídeo — mesmo visual de terminal do README viewer

### 💬 Sistema de Feedbacks
- **Formulário externo** — Deploy independente no Netlify ([feedback-form](../feedback-form/)), mesma identidade visual
  - Modal de boas-vindas estilo terminal
  - Campos: nome, profissão, feedback (ilimitado), link de rede social opcional (LinkedIn, Instagram, GitHub, X, etc.)
  - POST direto ao Supabase com `approved: false`
- **Carrossel no portfolio** — Exibe apenas feedbacks aprovados, Swiper com 1/2/3 cards por breakpoint
  - Cards de altura igual, texto limitado a 5 linhas + botão "Ver mais"
  - "Ver mais" abre modal completo e pausa o autoplay; retoma ao navegar
  - Link de rede social detectado automaticamente pelo domínio
- **Admin** — Listagem com filtros (Todos / Pendentes / Aprovados), leitura completa em modal, aprovar/revogar/excluir

### 🔒 Painel Administrativo
- **Login Seguro** — Autenticação via Supabase Auth
- **Perfil** — Nome, foto, título, bio, contato, currículo PDF, GitHub username, empresa e WhatsApp
- **Avatar** — Editor visual pixel-art com swatches de cor, chips de estilo e prévia ao vivo
- **Redes Sociais** — CRUD com 11 plataformas pré-definidas e auto-preenchimento de ícones
- **Categorias** — Organização de certificados por área
- **Certificados** — Upload de imagem/PDF, progresso, emissor, credencial, horas (extração automática de PDFs) e arquivos complementares (Excel, SQL, PowerBI, etc.)
- **Projetos** — Título, descrição, imagem, GitHub, demo, tecnologias (auto-fetch via API), horas e destaque
- **Empresas** — Logo, nome, descrição e link de site
- **Rádio** — Gerenciamento da playlist (nome + YouTube ID, ativar/desativar)
- **Feedbacks** — Aprovação de depoimentos recebidos pelo formulário externo

### 🛡️ Segurança
- **RLS (Row Level Security)** — Leitura pública restrita; escrita/atualização apenas pelo owner autenticado
- **Feedbacks RLS** — INSERT público (sem auth), SELECT público somente onde `approved = true`, UPDATE/DELETE apenas para auth
- **Proteção XSS** — `escapeHtml()` + `escapeAttr()` em todo conteúdo renderizado + DOMPurify para Markdown
- **Headers de Segurança** — X-Frame-Options, CSP, Referrer-Policy via `netlify.toml`

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Uso |
|--------|-----------|-----|
| **Frontend** | HTML5 / CSS3 / JavaScript ES6+ | Interface pública e painel admin |
| **Estilização** | CSS Custom Properties + Grid/Flexbox | Design system responsivo |
| **Carrossel** | [Swiper](https://swiperjs.com/) 11 | Carrossel de feedbacks |
| **Ícones** | [Font Awesome](https://fontawesome.com/) 6 | Ícones de UI e redes sociais |
| **Fontes** | [Google Fonts](https://fonts.google.com/) (Inter) | Tipografia |
| **PDF** | [PDF.js](https://mozilla.github.io/pdf.js/) 3.11 | Thumbnails e extração de texto de PDFs |
| **Markdown** | [marked.js](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) v3 | README rendering seguro |
| **Áudio** | Web Audio API | Som de teclas na splash screen |
| **Vídeo** | YouTube IFrame API | Player de música ambiente |
| **Auth** | [Supabase Auth](https://supabase.com/auth) | Login/logout do admin |
| **Database** | [Supabase PostgreSQL](https://supabase.com/database) | Armazenamento de dados |
| **Storage** | [Supabase Storage](https://supabase.com/storage) | Upload de imagens e PDFs |
| **Hosting** | [Netlify](https://netlify.com/) | Deploy, CDN e headers de segurança |

---

## 📁 Estrutura

```
Portfolio/
│
├── index.html                  # 🌍 Página pública (splash + portfolio)
│
├── admin/
│   ├── index.html              # 🔒 Painel administrativo (CRUD)
│   └── login.html              # 🔑 Tela de login
│
├── css/
│   ├── style.css               # 🎨 Manifesto de imports (público)
│   ├── admin.css               # 🎨 Manifesto de imports (admin)
│   ├── modules/                # 📦 Módulos CSS da página pública
│   │   ├── _variables.css      #    Variáveis CSS (design tokens)
│   │   ├── _base.css           #    Reset e elementos base
│   │   ├── _buttons.css        #    Componentes de botão
│   │   ├── _navbar.css         #    Barra de navegação
│   │   ├── _hero.css           #    Seção hero
│   │   ├── _sections.css       #    Seções genéricas
│   │   ├── _about.css          #    Seção "Sobre mim"
│   │   ├── _certificates.css   #    Certificados e sidebar
│   │   ├── _projects.css       #    Cards de projetos
│   │   ├── _companies.css      #    Grid de empresas
│   │   ├── _feedbacks.css      #    Carrossel de feedbacks + modal
│   │   ├── _readme-modal.css   #    Modal README viewer
│   │   ├── _cert-modal.css     #    Modal de certificado
│   │   ├── _footer.css         #    Rodapé
│   │   ├── _ui.css             #    Componentes UI (toast, spinner...)
│   │   ├── _animations.css     #    Animações type-in
│   │   ├── _github.css         #    Stats GitHub e badges
│   │   ├── _music.css          #    Player de música
│   │   ├── _avatar.css         #    Avatar pixel-art
│   │   ├── _splash.css         #    Splash screen terminal
│   │   └── _responsive.css     #    Todas as media queries
│   └── admin/                  # 📦 Módulos CSS do painel admin
│       ├── _variables-base.css #    Variáveis e reset
│       ├── _sidebar.css        #    Sidebar + mobile header
│       ├── _content.css        #    Área de conteúdo principal
│       ├── _forms.css          #    Formulários e botões
│       ├── _components.css     #    Modais, toast, listas, avatar editor
│       └── _responsive.css     #    Responsividade do admin
│
├── js/
│   ├── config.js               # ⚙️  Credenciais do Supabase
│   ├── portfolio.js            # 📄 Entry point da página pública
│   ├── auth.js                 # 🛡️  Guard de autenticação
│   ├── admin.js                # 🔧 Entry point do painel admin
│   ├── modules/                # 📦 Módulos JS públicos
│   │   ├── utils.js            #    escapeHtml, escapeAttr, calcTimeSince
│   │   ├── splash.js           #    Splash screen boot sequence
│   │   ├── navbar.js           #    Barra de navegação
│   │   ├── profile.js          #    Seção de perfil
│   │   ├── social.js           #    Redes sociais
│   │   ├── certificates.js     #    Certificados, sidebar, PDF thumbnails
│   │   ├── collapsible.js      #    Seções colapsáveis
│   │   ├── cert-modal.js       #    Modal de certificado
│   │   ├── projects.js         #    Cards de projetos
│   │   ├── companies.js        #    Grid de empresas
│   │   ├── feedbacks.js        #    Carrossel Swiper + modal de feedback
│   │   ├── readme-modal.js     #    README viewer modal
│   │   ├── animations.js       #    Animação type-in
│   │   ├── github.js           #    Dados GitHub e badges de tecnologia
│   │   ├── avatar.js           #    Avatar pixel-art (SVG gerado em JS)
│   │   └── music.js            #    Player YouTube e music reactor
│   └── admin/                  # 📦 Módulos JS do admin
│       ├── core.js             #    Navegação, modais, toast, uploadFile
│       ├── profile.js          #    CRUD de perfil + upload de foto/currículo
│       ├── avatar.js           #    Editor visual do avatar pixel-art
│       ├── social.js           #    CRUD de redes sociais
│       ├── categories.js       #    CRUD de categorias de certificados
│       ├── certificates.js     #    CRUD de certificados + extração de horas
│       ├── cert-files.js       #    Arquivos complementares de certificados
│       ├── projects.js         #    CRUD de projetos
│       ├── companies.js        #    CRUD de empresas
│       ├── radio.js            #    CRUD de tracks do player de rádio
│       └── feedbacks.js        #    Moderação de feedbacks
│
├── supabase-schema.sql         # 🗄️ Schema SQL (tabelas + RLS + storage)
├── netlify.toml                # ☁️  Configuração do Netlify
└── README.md                   # 📖 Documentação
```

### 🗄️ Schema do Banco de Dados

```
profiles ──────────────────── Perfil (nome, foto, bio, contato, empresa, avatar_config)
social_links ──────────────── Redes sociais (plataforma, URL, ícone, ordem)
certificate_categories ────── Categorias (nome, descrição, ordem)
certificates ──────────────── Certificados (nome, imagem/PDF, emissor, progresso, horas)
certificate_project_files ─── Arquivos complementares (Excel, SQL, PBIX, etc.)
projects ──────────────────── Projetos (título, GitHub, demo, tecnologias[], horas)
companies ─────────────────── Empresas/clientes (nome, logo, site, descrição)
radio_tracks ──────────────── Playlist do rádio (nome, YouTube ID, ativo)
feedbacks ─────────────────── Depoimentos (nome, profissão, texto, rede social, aprovado)
```

**Buckets de Storage:** `avatars` · `resumes` · `certificates` · `projects` · `companies` · `project-files`

---

## 🚀 Setup

### Pré-requisitos

- Conta no [Supabase](https://supabase.com) (grátis)
- Conta no [Netlify](https://netlify.com) (grátis)
- Conta no [GitHub](https://github.com)

### 1️⃣ Configurar Supabase

1. Crie um novo projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor** e execute todo o conteúdo de `supabase-schema.sql`
3. Vá em **Authentication > Users** e crie seu usuário admin:
   - Clique em **Add User > Create New User**
   - Preencha email e senha
   - Marque **Auto Confirm User**

### 2️⃣ Configurar Credenciais

1. No Supabase, vá em **Settings > API**
2. Copie o **Project URL** e a **anon public key**
3. Edite `js/config.js`:

```js
const SUPABASE_URL = 'https://SEU_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY';
```

### 3️⃣ Deploy no Netlify

1. Faça push do projeto para o GitHub
2. No Netlify, clique em **Add new site > Import an existing project**
3. Selecione o repositório
4. Publish directory: `.` | Build command: _(vazio)_
5. **Deploy site** ✅

### 4️⃣ Formulário de Feedbacks (opcional)

O formulário de coleta de feedbacks é um projeto separado em [`../feedback-form/`](../feedback-form/).

1. Crie um novo site no Netlify apontando para a pasta `feedback-form/`
2. Configure as credenciais do Supabase em `feedback-form/js/config.js`
3. Após o deploy, atualize `FEEDBACK_FORM_URL` em `js/modules/feedbacks.js` com a URL do formulário

---

## 📖 Como Usar

### Acessar o Admin

```
https://seusite.netlify.app/admin/login.html
```

### Seções do Painel

| Seção | O que gerencia |
|:-----:|:--------------|
| 👤 **Perfil** | Nome, foto, título, bio, email, telefone, empresa, currículo PDF e GitHub |
| 👾 **Avatar** | Pixel-art customizável — skin, cabelo, roupa, acessórios e estados animados |
| 🔗 **Redes Sociais** | LinkedIn, GitHub, Instagram, X, YouTube, Discord, WhatsApp, Telegram, etc. |
| 📂 **Categorias** | Agrupamentos de certificados (Hard Skills, Soft Skills, etc.) |
| 📜 **Certificados** | Upload de imagem/PDF, emissor, progresso, horas (extração automática) e arquivos extras |
| 💻 **Projetos** | Título, descrição, GitHub, demo, tecnologias (auto-fetch), horas e destaque |
| 🏢 **Empresas** | Logo, nome, descrição e link do site |
| 🎵 **Rádio** | Tracks da playlist (nome + YouTube ID, ativar/desativar) |
| 💬 **Feedbacks** | Moderar depoimentos: aprovar, revogar ou excluir |

### Fluxo Recomendado

```
1. Perfil → 2. Redes Sociais → 3. Avatar → 4. Categorias → 5. Certificados → 6. Projetos → 7. Empresas → 8. Rádio
```

---

## 📄 Licença

Este projeto é de uso pessoal. Sinta-se livre para usá-lo como base para seu próprio portfolio.

---

<div align="center">


</div>
