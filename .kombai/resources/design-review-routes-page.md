# Design Review Results: Página de Rotas

**Review Date**: 14 de Fevereiro de 2026
**Route**: /routes
**Focus Areas**: Design Visual, UX/Usabilidade, Responsivo/Mobile, Acessibilidade, Micro-interações/Movimento, Consistência, Performance

> **Nota**: Esta revisão foi conduzida através de análise estática do código apenas. A inspeção visual via browser forneceria insights adicionais sobre renderização de layout, comportamentos interativos e aparência real.

## Resumo

A página de rotas do SafeBus apresenta uma interface visualmente atraente com uso extensivo de glassmorphism e animações, mas possui problemas críticos de acessibilidade, performance e usabilidade. Foram identificados 28 problemas ao todo: 7 críticos, 12 de alta prioridade, 7 médios e 2 baixos. As principais áreas de preocupação incluem falta de labels ARIA, uso excessivo de efeitos visuais que impactam a performance, ausência de funcionalidades de pesquisa/filtro adequadas e problemas de contraste de cores.

## Issues

| # | Issue | Criticality | Category | Location |
|---|-------|-------------|----------|----------|
| 1 | Falta de aria-label no botão de confirmação de presença | 🔴 Critical | Acessibilidade | `src/components/routes/StopsList.tsx:93-100` |
| 2 | Falta de aria-label no select de filtros | 🔴 Critical | Acessibilidade | `src/components/routes/RoutesList.tsx:34-42` |
| 3 | Nenhum feedback de estado de loading ao marcar presença | 🔴 Critical | UX/Usabilidade | `src/hooks/useRoutes.tsx:90-148` |
| 4 | AccordionTrigger sem aria-expanded explícito | 🔴 Critical | Acessibilidade | `src/components/routes/RouteItem.tsx:30-59` |
| 5 | Falta de indicadores visuais de foco para navegação por teclado | 🔴 Critical | Acessibilidade | `src/components/routes/RoutesList.tsx:34-42`, `src/components/routes/StopsList.tsx:93-100` |
| 6 | Contraste de cor insuficiente em texto sobre glassmorphism | 🔴 Critical | Acessibilidade | `src/pages/Routes.tsx:35-61` |
| 7 | Sem validação de contraste WCAG AA em badges de status | 🔴 Critical | Acessibilidade | `src/components/routes/RouteItem.tsx:38-44` |
| 8 | Uso excessivo de backdrop-blur-xl impacta performance | 🟠 High | Performance | `src/pages/Routes.tsx:24-84`, `src/components/routes/RouteItem.tsx:28-76` |
| 9 | Falta de funcionalidade de pesquisa/filtro avançado | 🟠 High | UX/Usabilidade | `src/components/routes/RoutesList.tsx:15-47` |
| 10 | Select nativo de filtro não é acessível em dispositivos móveis | 🟠 High | UX/Usabilidade | `src/components/routes/RoutesList.tsx:34-42` |
| 11 | Animações com framer-motion em cada item podem causar lag em listas grandes | 🟠 High | Performance | `src/components/routes/RoutesList.tsx:49-71` |
| 12 | Sem tratamento de erro visual quando markPresentAtStop falha | 🟠 High | UX/Usabilidade | `src/components/routes/StopsList.tsx:93-101` |
| 13 | Estado vazio muito simples, sem ações sugeridas | 🟠 High | UX/Usabilidade | `src/components/routes/EmptyRoutes.tsx:4-9` |
| 14 | Falta de skeleton loading específico para cada seção | 🟠 High | UX/Usabilidade | `src/components/routes/RoutesLoading.tsx:5-12` |
| 15 | Glassmorphism com múltiplas camadas (bg-white/70 + backdrop-blur-xl) | 🟠 High | Performance | `src/components/routes/RouteItem.tsx:60-74` |
| 16 | Falta de memoização em componentes que recebem funções como props | 🟠 High | Performance | `src/components/routes/RoutesList.tsx:15`, `src/components/routes/RouteItem.tsx:17` |
| 17 | Sem indicação de qual parada é a do usuário (se aplicável) | 🟠 High | UX/Usabilidade | `src/components/routes/StopsList.tsx:18-112` |
| 18 | Falta de informação sobre distância ou tempo até a próxima parada | 🟠 High | UX/Usabilidade | `src/components/routes/StopsList.tsx:38-107` |
| 19 | Animações com delay de 0.1s por item podem tornar a UI lenta | 🟠 High | Micro-interações | `src/components/routes/RoutesList.tsx:56-69` |
| 20 | Breakpoint responsivo ausente para tablets (md:grid-cols-2 pula direto para 4) | 🟡 Medium | Responsivo/Mobile | `src/pages/Routes.tsx:40` |
| 21 | Falta de feedback hover nos chips de filtro | 🟡 Medium | Micro-interações | `src/components/routes/RoutesList.tsx:34-42` |
| 22 | Cores hardcoded em vez de usar design tokens do tema | 🟡 Medium | Consistência | `src/components/routes/RouteItem.tsx:18-22` |
| 23 | Accordion sem animação de transição suave configurada | 🟡 Medium | Micro-interações | `src/components/routes/RoutesList.tsx:54-70` |
| 24 | Contador de resultados não é anunciado para screen readers | 🟡 Medium | Acessibilidade | `src/components/routes/RoutesList.tsx:44-46` |
| 25 | Falta de estado de loading nos cards de estatísticas | 🟡 Medium | UX/Usabilidade | `src/pages/Routes.tsx:15-60` |
| 26 | Badges de status não usam componente Badge do shadcn consistentemente | 🟡 Medium | Consistência | `src/components/routes/RouteItem.tsx:105-109` |
| 27 | Gradient de fundo pode causar problemas de legibilidade em alguns dispositivos | ⚪ Low | Visual Design | `src/pages/Routes.tsx:24` |
| 28 | Ícone Bus não tem propriedade aria-hidden | ⚪ Low | Acessibilidade | `src/components/routes/RouteItem.tsx:33`, `src/components/routes/StopsList.tsx:29` |

## Criticality Legend
- 🔴 **Critical**: Quebra funcionalidade ou viola padrões de acessibilidade
- 🟠 **High**: Impacta significativamente a experiência do utilizador ou qualidade do design
- 🟡 **Medium**: Problema notável que deve ser resolvido
- ⚪ **Low**: Melhoria desejável

## Detalhes dos Principais Problemas

### Acessibilidade (7 críticos, 3 médios, 1 baixo)

**Problemas Críticos:**
1. **Falta de ARIA labels** em elementos interativos como botões e selects impede que utilizadores de leitores de ecrã compreendam a função dos elementos
2. **Contraste de cor insuficiente** em textos sobre backgrounds com glassmorphism pode não atingir o rácio mínimo WCAG AA de 4.5:1
3. **Indicadores de foco ausentes** dificultam a navegação por teclado

**Recomendações:**
- Adicionar `aria-label` ou `aria-labelledby` em todos os botões, selects e elementos interativos
- Testar todos os pares de cores com ferramentas como WebAIM Contrast Checker
- Adicionar classes de foco visíveis: `focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`
- Usar `aria-hidden="true"` em ícones decorativos

### Performance (1 crítico, 4 altos)

**Problemas Principais:**
1. **Uso excessivo de backdrop-blur** em múltiplas camadas causa repintura constante do navegador
2. **Animações em cada item da lista** com delays individuais podem causar lag com muitas rotas
3. **Falta de memoização** em componentes que recebem funções como props causa re-renders desnecessários

**Recomendações:**
- Reduzir camadas de glassmorphism, usar apenas onde realmente necessário
- Usar `React.memo()` nos componentes RouteItem e StopsList
- Usar `useMemo()` para dados filtrados e `useCallback()` para funções passadas como props
- Considerar virtualização de lista com `react-window` ou `react-virtual` para rotas longas
- Reduzir delays de animação ou usar uma animação única para o container

### UX/Usabilidade (3 críticos, 7 altos, 2 médios)

**Problemas Principais:**
1. **Falta de feedback de loading** ao confirmar presença deixa o utilizador sem saber se a ação foi processada
2. **Filtro limitado** - apenas 3 opções, sem pesquisa ou filtros combinados
3. **Estado vazio muito simples** sem orientações ou ações sugeridas
4. **Falta de contexto** sobre qual parada pertence ao utilizador ou distância até próxima parada

**Recomendações:**
- Adicionar estado de loading nos botões com spinner e texto "A confirmar..."
- Implementar barra de pesquisa para filtrar por nome de rota, parada ou motorista
- Adicionar filtro "As minhas rotas" para utilizadores com rotas atribuídas
- Melhorar estado vazio com ilustração, texto explicativo e botão para limpar filtros
- Destacar visualmente a parada do utilizador (se aplicável)
- Mostrar tempo estimado de chegada do autocarro em cada parada

### Responsivo/Mobile (1 alto, 1 médio)

**Problemas:**
1. Select nativo pode ser difícil de usar em dispositivos móveis tácteis
2. Grid de estatísticas pula de 1 coluna para 2 (md) e depois 4 (lg) sem considerar tablets

**Recomendações:**
- Substituir select nativo por componente Select do shadcn ou chips clicáveis
- Adicionar breakpoint intermediário: `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Garantir que botões tenham tamanho mínimo de toque de 44x44px (recomendação WCAG)

### Micro-interações/Movimento (2 altos, 2 médios)

**Problemas:**
1. Delays de animação acumulados podem tornar a interface lenta
2. Falta de feedback hover em filtros
3. Accordion sem transição suave configurada

**Recomendações:**
- Reduzir ou remover delays de animação, ou aplicar apenas ao container pai
- Adicionar estados hover nos chips de filtro com mudança de cor/escala
- Configurar duração de transição no Accordion: `transition={{ duration: 0.3 }}`
- Adicionar animação de pulse no botão "Confirmar presença" para chamar atenção

### Consistência (2 médios)

**Problemas:**
1. Cores hardcoded em statusColors em vez de usar design tokens
2. Uso inconsistente do componente Badge do shadcn

**Recomendações:**
- Criar variantes de Badge no tema: `success`, `warning`, `info`
- Usar cores do tema em vez de hardcoded: `bg-green-100` → `bg-success/10`
- Padronizar uso de Badge em todos os status indicators

### Visual Design (1 baixo)

**Problema:**
- Gradient de fundo complexo pode causar problemas de legibilidade

**Recomendação:**
- Simplificar gradient ou usar fundo sólido com textura subtil

## Próximos Passos

### Prioridade Imediata (Críticos)
1. Adicionar aria-labels em todos os elementos interativos
2. Testar e corrigir contrastes de cor para WCAG AA
3. Adicionar indicadores de foco visíveis
4. Implementar estado de loading ao confirmar presença

### Curto Prazo (Altos)
1. Reduzir uso de glassmorphism e otimizar performance
2. Implementar barra de pesquisa e filtros avançados
3. Melhorar estado vazio com orientações claras
4. Adicionar memoização em componentes
5. Substituir select nativo por componente acessível

### Médio Prazo (Médios e Baixos)
1. Adicionar breakpoints responsivos intermediários
2. Implementar feedback hover em todos os elementos interativos
3. Padronizar uso de design tokens
4. Adicionar aria-hidden em ícones decorativos

## Recursos de Referência

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **React Performance Optimization**: https://react.dev/learn/render-and-commit
- **Framer Motion Performance**: https://www.framer.com/motion/guide-reduce-bundle-size/
