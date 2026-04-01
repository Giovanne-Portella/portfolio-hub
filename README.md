<div align="center">

# 🌐 Portfolio

**Site pessoal de portfolio com painel administrativo privado**

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

Portfolio profissional completo com **página pública** para visitantes e **painel administrativo** privado para gerenciamento de conteúdo. Inspirado no estilo do LinkedIn, com seções de perfil, certificados organizados por categoria em carrosséis, projetos e redes sociais.

<details>
<summary><strong>📸 Preview</strong></summary>
<br>

| Página Pública | Painel Admin |
|:-:|:-:|
| Hero com foto, bio e redes sociais | Dashboard com CRUD completo |
| Certificados em carrossel por categoria | Upload de imagens via Supabase Storage |
| Cards de projetos com techs | Gerenciamento de categorias e progresso |

</details>

## ✨ Funcionalidades

### 🌍 Página Pública
- **Hero Section** — Foto, nome, título, localização e redes sociais
- **Sobre Mim** — Bio estilo LinkedIn com informações de contato
- **Certificados** — Organizados por categoria com carrossel (Swiper.js), barra de progresso e status de conclusão
- **Projetos** — Cards com tecnologias, links do GitHub e demo
- **Modal de Zoom** — Visualização ampliada dos certificados
- **Design Responsivo** — Mobile-first, funciona em qualquer dispositivo

### 🔒 Painel Administrativo
- **Login Seguro** — Autenticação via Supabase Auth
- **Gerenciamento de Perfil** — Nome, foto, título, bio, contato e currículo
- **Redes Sociais** — CRUD com auto-preenchimento de ícones por plataforma
- **Categorias** — Organização de certificados por área (ex: Hard Skills, Soft Skills)
- **Certificados** — Upload de imagem, progresso, emissor, link da credencial
- **Projetos** — Título, descrição, GitHub, demo, tecnologias, destaque

### 🛡️ Segurança
- **RLS (Row Level Security)** — Leitura pública, escrita apenas pelo owner
- **Proteção XSS** — Sanitização de todo conteúdo renderizado
- **Headers de Segurança** — X-Frame-Options, CSP, Referrer-Policy via Netlify

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Uso |
|--------|-----------|-----|
| **Frontend** | HTML5 / CSS3 / JavaScript ES6+ | Interface pública e painel admin |
| **Estilização** | CSS Custom Properties + Grid/Flexbox | Design system responsivo |
| **Carrossel** | [Swiper.js](https://swiperjs.com/) v11 | Carrossel de certificados por categoria |
| **Ícones** | [Font Awesome](https://fontawesome.com/) 6 | Ícones de UI e redes sociais |
| **Fontes** | [Google Fonts](https://fonts.google.com/) (Inter) | Tipografia |
| **Auth** | [Supabase Auth](https://supabase.com/auth) | Login/logout do admin |
| **Database** | [Supabase PostgreSQL](https://supabase.com/database) | Armazenamento de dados |
| **Storage** | [Supabase Storage](https://supabase.com/storage) | Upload de imagens |
| **Hosting** | [Netlify](https://netlify.com/) | Deploy e CDN |

---

## 📁 Estrutura

```
Portfolio/
│
├── index.html                  # 🌍 Página pública do portfolio
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
│   ├── portfolio.js            # 📄 Lógica da página pública
│   ├── auth.js                 # 🛡️ Guard de autenticação
│   └── admin.js                # 🔧 CRUD do painel admin
│
├── supabase-schema.sql         # 🗄️ Schema SQL (tabelas + RLS + storage)
├── netlify.toml                # ☁️ Configuração do Netlify
└── README.md                   # 📖 Documentação
```

### 🗄️ Schema do Banco de Dados

```
profiles ──────── Perfil do usuário (nome, foto, bio, contato)
social_links ──── Redes sociais (plataforma, URL, ícone)
certificate_categories ── Categorias (nome, descrição, ordem)
certificates ──── Certificados (nome, imagem, emissor, progresso)
projects ─────── Projetos (título, GitHub, demo, tecnologias)
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
| 👤 **Perfil** | Nome, foto, título, bio, email, telefone, localização |
| 🔗 **Redes Sociais** | LinkedIn, GitHub, Instagram, Twitter, YouTube, etc. |
| 📂 **Categorias** | Agrupamentos de certificados (Hard Skills, Soft Skills...) |
| 📜 **Certificados** | Upload de imagem, emissor, progresso, data, link da credencial |
| 💻 **Projetos** | Título, descrição, GitHub, demo, tecnologias, destaque |

### Fluxo Recomendado

```
1. Preencher Perfil → 2. Adicionar Redes Sociais → 3. Criar Categorias → 4. Cadastrar Certificados → 5. Adicionar Projetos
```

---

## 📄 Licença

Este projeto é de uso pessoal. Sinta-se livre para usá-lo como base para seu próprio portfolio.

---

<div align="center">

**Feito com ❤️ usando HTML, CSS, JavaScript e Supabase**

</div>
