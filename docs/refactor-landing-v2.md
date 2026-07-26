# Refactor Landing Page — v2

## Problemas Actuais

- **Estrutura repetitiva**: label → hr → h2 → hr → p → hr → content. As 5 secções parecem variações do mesmo template.
- **Animações pobres**: só CTA tem `whileInView` fade-in. Features grid, benefits grid, how-it-works grid — estáticos.
- **hr como muleta visual**: usado para separar tudo, incluindo label de h2 (espaçamento desnecessário).
- **Hierarquia visual fraca**: label e h2 colados com hr no meio, sem relação de escala.
- **Zero micro-interacções**: cards não reagem a hover, números não animam ao scroll, steps sem progressão visual.
- **Scroll monótono**: `FlowArt` gira as secções mas todo o conteúdo aparece ao mesmo tempo.

## Stack de Animação

Já instalado:
- **framer-motion** (12.16.0) — `whileInView`, `AnimatePresence`, `useScroll`, `useTransform`
- **motion/react** (12.42.2) — hooks de baixo nível (useAnimationFrame, useMotionValue)
- **GSAP** (3.15.0) — `ScrollTrigger`, timelines
- **Lenis** (1.3.25) — smooth scroll
- **react-countup** (6.5.3) — números animados

## Plano por Secção

### 1. Hero (ScrollExpandMedia)
- **Manter** — já é o ponto alto da página
- **Adicionar**: overlay gradiente a escurecer ligeiramente após expansão (`<motion.div>` com `animate` opacity)
- **Adicionar**: seta animada "scroll down" que aparece após expansão completa (com `animate` bounce)

### 2. Missão — "Onde Estão Os Seus Filhos?"
| Antes | Depois |
|-------|--------|
| `hr` entre label e h2 | Remover hr. Label como badge flutuante |
| h2 estático | h2 com `whileInView` letter-by-letter fade-up (split em spans) |
| parágrafo estático | Parágrafo com `whileInView` + `delay` |
| — | BG sutil particle effect (reutilizar `ParticleBackground.tsx` com cor dourada) |

**Técnica**: Usar `useScroll` + `useTransform` do framer-motion para fazer o h2 responder ao scroll (leve parallax).

### 3. Funcionalidades — "Tudo Que Precisa"
| Antes | Depois |
|-------|--------|
| Grid 3 col estática | Stagger reveal — cards entram em cascata |
| Cards sem hover | Card hover: scale(1.02) + shadow + ícone rotate |
| hr separador | Remover hr. Label como inset badge |
| — | Background sutil com grelha de pontos (CSS radial-gradient) |

**Técnica**: `motion.div` com `variants` (staggerChildren) para o grid, cada card com `whileHover`.

### 4. Benefícios — "Porquê Nós?"
| Antes | Depois |
|-------|--------|
| Grid 2 col + hr | Remover hr. Transição suave de cor no BG via ScrollTrigger |
| Textos estáticos | CountUp nos números (instalar não, já temos react-countup) |
| — | Adicionar 4 stat cards com contagem regressiva ao scroll |
| — | Ícones com `whileInView` scale-in + rotate |

**Técnica**: Usar `ScrollTrigger` do GSAP para animar a mudança de cor de BG (de blue para deep blue mais escuro). `CountUp` para os stats (ex: "284+ escolas" no CTA).

### 5. Como Funciona — "Comece Em 3 Passos"
| Antes | Depois |
|-------|--------|
| Números em círculo estáticos | Números com animação de progresso (linha conectiva entre steps) |
| Texto centralizado sem conexão visual | Layout horizontal com linha SVG animada a ligar os 3 passos |
| hr separador | Remover hr |

**Técnica**: Linha horizontal entre steps com `motion.path` (stroke-dashoffset animado ao scroll). Cada step revela o conteúdo sequencialmente. Inspiração: timeline progressiva.

### 6. CTA — "Pronto Para Transformar?"
| Antes | Depois |
|-------|--------|
| Botões com fade-in básico | Botões com elastic spring + magnetic hover |
| Texto "284+ escolas" estático | CountUp verdadeiro com react-countup |
| — | Adicionar estatísticas em tempo real (3 métricas) |
| — | Efeito de "glow" nos botões que segue o rato (magnetic button) |

**Técnica**: Botões com `whileHover={{ scale: 1.05 }}` + spring. Magnetic effect via `onMouseMove` com `useMotionValue`. CountUp com `whileInView` start.

### 7. Footer
- **Manter** estrutura, apenas refinamento visual
- Adicionar fade-in do grid ao entrar em view

## Checklist de Execução

1. Separar `LandingPage.tsx` em componentes por secção (opcional, depende de tamanho)
2. Adicionar `AnimatedSection` wrapper (componente reutilizável com `whileInView` + variantes)
3. Refactor Missão: remover hr, animar h2 letter-by-letter
4. Refactor Features: stagger grid + hover cards
5. Refactor Benefícios: remover hr + CountUp stats
6. Refactor How It Works: SVG timeline + sequential reveal
7. Refactor CTA: magnetic buttons + CountUp
8. Limpar `hr` residuais do CSS
9. Build + verificar

## Riscos

- **Performance**: letter-by-letter animation no h2 pode ser pesado. Limitar a 3 palavras no max.
- **GSAP vs framer-motion**: misturar os dois pode causar conflitos de scroll. Manter GSAP só para `ScrollTrigger` de pin (já existe) + timeline complexa. framer-motion para o resto.
- **Lenis**: garantir que `stop()`/`start()` continua a funcionar com novas animações.
