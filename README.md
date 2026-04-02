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

Portfolio profissional completo com **página pública** para visitantes e **painel administrativo** privado para gerenciamento de conteúdo. Inspirado no GitHub Dark Theme, com terminal-style splash screen, player de música ambiente reativo, visualização de certificados e projetos com integração GitHub.

<details>
<summary><strong>📸 Preview</strong></summary>
<br>

| Página Pública | Painel Admin |
|:-:|:-:|
| Splash screen estilo terminal Linux | Dashboard com CRUD completo |
| Hero com foto, bio e redes sociais | Upload de imagens/PDFs via Supabase Storage |
| Certificados organizados por categoria | Gerenciamento de categorias e progresso |
| Projetos com techs e README viewer | Extração automática de horas de PDFs |

</details>

## ✨ Funcionalidades

### 🖥️ Splash Screen — Terminal Boot
- **Tela de entrada** estilo terminal Linux com prompt `guest@portfolio:~$ ./welcome.sh`
- Sequência de boot com mensagens `[ OK ]` e barra de progresso animada
- Mensagem de boas-vindas digitada caractere por caractere com **som de tecla** (Web Audio API)
- Botão "Prosseguir" para transição suave ao site
- Ao prosseguir, a música ambiente começa automaticamente
- Totalmente responsivo — fullscreen em mobile

### 🌍 Página Pública
- **Hero Section** — Foto, nome, título, localização e redes sociais com ícones dinâmicos
- **Sobre Mim** — Bio com informações de contato, empresa atual e tempo de serviço
- **Certificados** — Organizados por categoria com sidebar, barra de progresso, contagem de horas e thumbnails (imagem ou primeira página de PDF via pdf.js)
- **Projetos** — Cards com badges de destaque, tecnologias auto-detectadas via GitHub API, horas e links
- **GitHub & Tecnologias** — Estatísticas em tempo real (repos, commits/semana, followers, stars) e badges coloridos de tecnologias
- **Modal de Certificado** — Zoom com suporte a imagem e PDF, link da credencial, cópia de link e arquivos complementares
- **README Viewer** — Modal terminal-style que busca e renderiza README.md do GitHub com marked.js + DOMPurify
- **Deep Linking** — Links diretos para certificados via `?cert={id}` com highlight animado
- **Seções Colapsáveis** — Estado salvo em localStorage
- **Animações Type-In** — Texto digitado no scroll com efeito de cursor terminal
- **Design Responsivo** — Otimizado para desktop, tablet (768px), mobile (480px) e small mobile (360px)

### 🎵 Player de Música & Reactor
- **YouTube Floating Player** — Playlist de 4 tracks com seleção aleatória
- **Controles** — Play/pause com toast de nome da música
- **Music Reactor** — Efeito ambient glow reativo com 3 camadas de frequência (bass, mid, treble) simuladas via osciladores senoidais a 60fps

### 🔒 Painel Administrativo
- **Login Seguro** — Autenticação via Supabase Auth
- **Perfil** — Nome, foto, título, bio, contato, currículo, GitHub username, empresa e WhatsApp
- **Redes Sociais** — CRUD com 11 plataformas pré-definidas e auto-preenchimento de ícones
- **Categorias** — Organização de certificados por área (Hard Skills, Soft Skills, etc.)
- **Certificados** — Upload de imagem/PDF, progresso, emissor, credencial, horas (extração automática de PDFs) e arquivos complementares (Excel, SQL, PowerBI, etc.)
- **Projetos** — Título, descrição, imagem, GitHub, demo, tecnologias (auto-fetch via API), horas e destaque

### 🛡️ Segurança
- **RLS (Row Level Security)** — Leitura pública, escrita apenas pelo owner
- **Proteção XSS** — `escapeHtml()` + `escapeAttr()` em todo conteúdo renderizado + DOMPurify para Markdown
- **Headers de Segurança** — X-Frame-Options, CSP, Referrer-Policy via Netlify

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Uso |
|--------|-----------|-----|
| **Frontend** | HTML5 / CSS3 / JavaScript ES6+ | Interface pública e painel admin |
| **Estilização** | CSS Custom Properties + Grid/Flexbox | Design system responsivo |
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
│   ├── style.css               # 🎨 Estilos da página pública
│   └── admin.css               # 🎨 Estilos do painel admin
│
├── js/
│   ├── config.js               # ⚙️ Credenciais do Supabase
│   ├── portfolio.js            # 📄 Lógica da página pública + splash + music
│   ├── auth.js                 # 🛡️ Guard de autenticação
│   └── admin.js                # 🔧 CRUD do painel admin
│
├── supabase-schema.sql         # 🗄️ Schema SQL (tabelas + RLS + storage)
├── netlify.toml                # ☁️ Configuração do Netlify
└── README.md                   # 📖 Documentação
```

### 🗄️ Schema do Banco de Dados

```
profiles ──────────────── Perfil do usuário (nome, foto, bio, contato, empresa)
social_links ──────────── Redes sociais (plataforma, URL, ícone, ordem)
certificate_categories ── Categorias (nome, descrição, ordem)
certificates ──────────── Certificados (nome, imagem/PDF, emissor, progresso, horas)
certificate_files ─────── Arquivos complementares (Excel, SQL, PBIX, etc.)
projects ──────────────── Projetos (título, GitHub, demo, tecnologias, horas)
```

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

---

## 📖 Como Usar

### Acessar o Admin

```
https://seusite.netlify.app/admin/login.html
```

### Seções do Painel

| Seção | O que gerencia |
|:-----:|:--------------|
| 👤 **Perfil** | Nome, foto, título, bio, email, telefone, empresa, currículo e GitHub |
| 🔗 **Redes Sociais** | LinkedIn, GitHub, Instagram, X, YouTube, Discord, WhatsApp, Telegram, etc. |
| 📂 **Categorias** | Agrupamentos de certificados (Hard Skills, Soft Skills...) |
| 📜 **Certificados** | Upload de imagem/PDF, emissor, progresso, horas (extração automática), credencial e arquivos complementares |
| 💻 **Projetos** | Título, descrição, GitHub, demo, tecnologias (auto-fetch), horas e destaque |

### Fluxo Recomendado

```
1. Preencher Perfil → 2. Adicionar Redes Sociais → 3. Criar Categorias → 4. Cadastrar Certificados → 5. Adicionar Projetos
```

---

## 📄 Licença

Este projeto é de uso pessoal. Sinta-se livre para usá-lo como base para seu próprio portfolio.

---

<div align="center">

**Feito com ❤️ usando HTML, CSS, JavaScript, Supabase e Web Audio API**

</div>
