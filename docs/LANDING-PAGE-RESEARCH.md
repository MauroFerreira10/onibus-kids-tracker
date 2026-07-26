# SafeBus Landing Page — Research & Plano de Implementação

> Gerado em Julho 2026 · Kenilson Ventura

---

## 1. Inspirações — Landing Page Design 2026

### Tendências Actuais

| Tendência | Descrição | Aplicação SafeBus |
|-----------|-----------|-------------------|
| **Dark Blue + Gold** | Paletes escuras com acentos metálicos/dourados — transmite segurança e premium | ✅ Já usamos safebus-blue (#1E3A8A) + safebus-yellow (#FBBF24) |
| **Bento Grids** | Painéis modulares assimétricos com bordas arredondadas | ⬜ Implementar na secção de features |
| **Micro-interacções** | Pequenas animações em hover/scroll em botões, ícones, cards | ⬜ Adicionar mais hover states e micro-motion |
| **Typography-heavy** | Headlines grandes com sans-serif bold (tipo Inter Display) + tracking negativo | ⬜ Podemos aumentar hero para 80px+ |
| **Glassmorphism** | Efeitos de vidro com backdrop-blur em navbars, badges, cards | ✅ Já temos na badge (backdrop-blur) |
| **Scroll-driven animations** | Parallax, horizontal scroll, progress bars | ✅ Já implementámos horizontal scroll + parallax |
| **3D Elements** | Rotações perspectiva, tilt em cards, depth layers | ✅ Já temos rotateY e scale nos features |
| **Mobile-first navigation** | Bottom nav, hamburger simplificado | ⬜ Melhorar mobile nav |
| **Gradientes subtis** | Overlays de gradiente em imagens hero | ✅ Já temos gradient overlay |
| **Counters animados** | Números que contam ao scroll | ✅ Já implementámos stats |
| **Showreel / Vídeo hero** | Background em loop, muted, autoplay | ⬜ Podemos substituir imagem estática |
| **Cursor customizado** | Cursor com efeito de glow/follow | ⬜ Opcional premium |
| **Autenticação social** | "Continue with Google/Apple" inline no hero | ⬄ Já temos "Já tenho conta" + "Começar Grátis" |

### Inspirações Directas (Estilo SafeBus)

1. **Uber Freight / Uber Movement** — Azul escuro + acentos amarelos, mapas, tracking em tempo real
2. **Onfleet** — Dashboard delivery tracking com mapas e notificações
3. **BusBud / Moovit** — Transporte público, rotas, tempo real
4. **Pipedrive** — Clean SaaS com bento grids e cores escuras
5. **Linear** — Dark theme premium, micro-interacções, typography bold
6. **WorkOS** — Single sans-serif, pill buttons, hero com gradiente e estatísticas
7. **Vercel** — Dark blue, grid background, typography bold, métricas

### Padrões GSAP para Robusto

- **ScrollTrigger pin + scrub** (já usamos no "Como Funciona")
- **Staggered text reveal** por palavra/letra (melhorar hero headline)
- **MorphSVG** para ícones que se transformam
- **Flip** para transições de layout suaves
- **Custom easing** com `"power4.out"` e `"expo.out"` para sensação premium
- **Clip-path reveal** em imagens e secções
- **Progress bar** que avança com o scroll

---

## 2. Skills, Hooks e Agentes Disponíveis

### Skills Instaladas no Projecto

| Skill | Localização | Utilidade |
|-------|-------------|-----------|
| **frontend-design** | `.agents/skills/` | Criação de componentes React/TS premium |
| **ui-styling** | `.agents/skills/` | shadcn/ui, Tailwind, dark mode |
| **ui-ux-pro-max** | `.agents/skills/` | 84 estilos, 192 paletas, 74 font pairings, GSAP presets |
| **design** | `.agents/skills/` | Brand identity, tokens, logo generation |
| **design-system** | `.agents/skills/` | Token architecture, component specs, slides |
| **brand** | `.agents/skills/` | Brand voice, assets, consistency |
| **banner-design** | `.agents/skills/` | Social media banners, ads |
| **slides** | `.agents/skills/` | HTML presentations com Chart.js |
| **core-web-vitals** | `.agents/skills/` | Optimização LCP, CLS, INP |
| **find-skills** | `.agents/skills/` | Descoberta de novas skills |
| **senior-frontend** | `.agents/skills/senior-frontend/` | React, Next.js, TypeScript, Tailwind, performance |
| **impeccable** | `.agents/skills/impeccable/` | UX review, visual hierarchy, anti-patterns, design audit |
| **premium-frontend-design** | `.agents/skills/premium-frontend-design/` | WebGL, shaders, animações premiadas, Awwwards quality |
| **responsive-design** | `.agents/skills/responsive-design/` | Container queries, fluid typography, mobile-first |
| **redeisgn-existing-projects** | `.agents/skills/redesign-skill/` | Upgrade de projectos existentes para qualidade premium |
| **industrial-brutalist-ui** | `.agents/skills/brutalist-skill/` | UI industrial, grids rígidos, contraste extremo |
| **minimalist-ui** | `.agents/skills/minimalist-skill/` | Editorial clean, warm monochrome, flat bento |

### Plugins/MCPs Disponíveis

| Plugin | Função |
|--------|--------|
| **Supabase** | MCP server para DB, auth, storage, edge functions |
| **Figma MCP** | Leitura de design tokens, componentes, variantes |
| **Browser Tools** | Testing e debug de UI |

### NPM Packages Recomendados

| Package | Uso |
|---------|-----|
| `gsap` | ✅ Já instalado (v3.15.0) |
| `@gsap/react` | Integração React-first com GSAP |
| `lenis` | Smooth scroll — essencial para ScrollTrigger preciso |
| `framer-motion` | Alternativa React-first (mas já temos GSAP) |
| `react-intersection-observer` | Trigger de animações sem GSAP |
| `@use-gesture/react` | Gestos touch/mouse para cards e sliders |
| `react-spring` | Spring animations para micro-interacções |
| `tailwindcss-animate` | Animações CSS utility para Tailwind |
| `postcss-preset-env` | Features CSS futuras |

---

## 3. Estado Actual (Checklist Completo)

### ✅ Implementado
- [x] Arva design system adaptado (bone canvas, pill buttons, serif headlines)
- [x] Cores SafeBus (safebus-blue #1E3A8A, safebus-yellow #FBBF24)
- [x] Hero image local (designmd/ PNG)
- [x] Navbar transparente → sólida ao scroll (threshold 60px)
- [x] Marquee strip (amarelo, repeating checkmarks)
- [x] GSAP parallax hero (scrub 1.5, translateY)
- [x] GSAP staggered entrance (badge → h1 lines → p → btns → social)
- [x] GSAP count-up stats (100+, 50+, 5000+, 98%)
- [x] GSAP 3D tilt cards (rotateY -8 → 0, scale 0.9 → 1, random stagger)
- [x] GSAP alternating benefits (x: ±50, stagger 0.18)
- [x] GSAP horizontal scroll pin ("Como Funciona", 3 steps, scrub 1.4)
- [x] GSAP CTA entrance (stagger 0.15)
- [x] Fallback visibility (setHeroReady after 3s)
- [x] `tsc --noEmit` limpo
- [x] `vite build` compila sem erros

### ⬄ Melhorável
- [ ] Mobile nav hamburger menu
- [ ] Responsividade refinada (tablets)
- [ ] Loading states / skeleton
- [ ] SEO meta tags
- [ ] Acessibilidade (aria labels, focus management)

### ⬜ Não Implementado
- [ ] Smooth scroll (lenis)
- [ ] Secção de testemunhos/depoimentos
- [ ] Secção de preços / pricing cards
- [ ] FAQ accordion
- [ ] Partículas/background animado
- [ ] Video hero
- [ ] Modo escuro
- [ ] Testes unitários
- [ ] i18n (multi-idioma)
- [ ] Analytics tracking
- [ ] Cookie consent banner

---

## 4. Plano de Implementação — Próximas Melhorias

### Fase 1: Base (Já Concluída)

Estrutura da landing page completa com GSAP, cores SafeBus, design system Arva.

### Fase 2: Polimento Premium (Recomendado Agora)

| # | Tarefa | Esforço | Impacto | Dependências |
|---|--------|---------|---------|--------------|
| 1 | Instalar `lenis` e integrar com ScrollTrigger | 1h | 🔥 Alto — scroll suave transforma percepção | NPM install |
| 2 | Refinar hero headline: split text reveal (GSAP SplitText ou manual) | 1.5h | 🔥 Alto — primeira impressão | GSAP já presente |
| 3 | Adicionar depoimentos reais com fotos, star ratings, carrossel | 2h | 🔥 Alto — prova social | Nenhuma |
| 4 | Adicionar partículas/background animado com canvas ou CSS | 2h | 🔥 Alto — wow factor | Nenhuma |
| 5 | Melhorar mobile navigation (hamburger + drawer animado) | 1h | ⚡ Médio | Nenhuma |
| 6 | Adicionar FAQ com accordion animado | 1h | ⚡ Médio | Nenhuma |
| 7 | Micro-interacções: hover nos cards feature (scale, shadow, icon bounce) | 1h | ⚡ Médio | Nenhuma |

### Fase 3: Performance & Qualidade

| # | Tarefa | Esforço | Impacto |
|---|--------|---------|---------|
| 8 | Web Vitals: lazy loading imagens, preload hero, reduzir CLS | 1h | 🔥 Alto |
| 9 | Testes a11y (axe-core, keyboard navigation, focus trap) | 2h | ⚡ Médio |
| 10 | SEO: meta tags, Open Graph, structured data | 1h | 🔥 Alto |
| 11 | Bundle analysis e code splitting | 1h | ⚡ Médio |

### Fase 4: Expansão

| # | Tarefa | Esforço | Impacto |
|---|--------|---------|---------|
| 12 | Secção de preços (3 tiers: Basic, Pro, Enterprise) | 2h | 🔥 Alto — conversão |
| 13 | Modo escuro com Tailwind `dark:` | 2h | ⚡ Médio |
| 14 | i18n (pt, en, es) com react-i18next | 3h | ⚡ Médio |
| 15 | Video hero background (loop muted autoplay) | 1.5h | 🔥 Alto — impacto visual |

---

## 5. Arquitectura de Componentes (Proposta Futura)

```
src/
  components/
    landing/
      Hero.tsx              (imagem + gradiente + badge + título + CTAs)
      MarqueeStrip.tsx      (strip amarelo com checkmarks)
      Navbar.tsx            (transparent → solid on scroll)
      StatsCounter.tsx      (números com count-up)
      FeaturesGrid.tsx      (bento grid com 3D tilt)
      BenefitsList.tsx      (alternating benefits)
      HowItWorks.tsx        (horizontal scroll pin + steps)
      Testimonials.tsx      (depoimentos com carrossel)
      PricingCards.tsx      (tabela de preços)
      FAQ.tsx               (accordion)
      CTASection.tsx        (call-to-action final)
      Footer.tsx            (multi-column)
      ParticleBackground.tsx (canvas particles)
      ScrollProgress.tsx    (progress bar no topo)
    ui/
      PillButton.tsx        (botão universal Arva)
      SectionTitle.tsx      (label + headline + subtexto)
      AvatarGroup.tsx       (grupo de avatares)
      AnimatedCounter.tsx   (componente de contagem)
```

---

## 6. Recursos & Inspiração Visual

### Cores SafeBus (Actuais)

| Cor | Hex | Uso |
|-----|-----|-----|
| safebus-blue | `#1E3A8A` | Fundo hero, navbar, stats, benefits, CTA, footer |
| safebus-yellow | `#FBBF24` | Marquee strip, CTAs, highlights, acentos |
| white | `#FFFFFF` | Texto sobre azul, botões outline |
| bone | `#f1efdf` | Fundo de secções claras |
| charcoal | `#212529` | Texto em fundo claro |

### Fontes

- **Cormorant Garamond** (substituto Reckless) — headlines serif (`serif` class)
- **Inter** — body e UI sans

### GSAP Patterns a Explorar

```typescript
// 1. Split text reveal (hero headline)
// Ideal: cada palavra/letra entra com rotateX e stagger
tl.fromTo(words, { y: 60, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, stagger: 0.04 })

// 2. Clip-path reveal (imagens e secções)
gsap.fromTo(section, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' })

// 3. Parallax layers (profundidade com translateZ)
gsap.to(layer1, { y: -100, scrollTrigger: { scrub: true } })
gsap.to(layer2, { y: -200, scrollTrigger: { scrub: true } })

// 4. Progress indicator
gsap.to(progressBar, { scaleX: 1, scrollTrigger: { trigger: body, start: 'top top', end: 'bottom bottom', scrub: true } })

// 5. Reveal cards on scroll (power4.out)
gsap.fromTo(cards, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, ease: 'power4.out' })
```

---

## 7. Notas Técnicas

- **Build**: `pnpm run build` (Vite + TypeScript)
- **Lint**: `pnpm run lint` (ESLint)
- **Typecheck**: `tsc --noEmit`
- **Dev**: `pnpm run dev` (Vite dev server na porta 5173)
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS v3 + GSAP v3.15
- **Estado**: Autenticação via `AuthContext` (Supabase)
- **Routing**: React Router v6 (`src/App.tsx`)

### Links Úteis

- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP Ease Visualizer](https://gsap.com/docs/v3/Eases/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lenis Smooth Scroll](https://lenis.darkroom.engineering/)
- [Awwwards — Direcções de Design](https://www.awwwards.com/)
- [Referências Dark Blue + Gold](https://dribbble.com/search/dark-blue-gold-landing)

---

> **Próximo Passo**: Instalar `lenis` + refinamentos de animação GSAP, ou começar pelos depoimentos/prova social.
