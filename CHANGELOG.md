# Changelog - SafeBus

## [1.2.0] - 2026-02-14

### ✨ Novas Funcionalidades
- **Sistema SaaS completo** com planos de assinatura (Básico, Profissional, Empresarial)
- **Preços em Kwanza (AOA)** - Valores ajustados para o mercado angolano
- **Controle de quotas** por plano com limites de alunos, motoristas e rotas
- **Sistema de pagamento** integrado com Stripe (preparado para implementação)
- **Dashboard administrativo** para gestão de assinaturas e métricas
- **Analytics e métricas** de uso e engajamento
- **Fluxo de onboarding** com período de teste gratuito de 14 dias

### 🛠️ Melhorias na Página de Rotas

#### Acessibilidade
- Adicionado `aria-label` em todos os elementos interativos
- Indicadores de foco visíveis para navegação por teclado
- `aria-hidden="true"` em ícones decorativos
- Labels apropriadas para screen readers
- Estados `aria-live` para conteúdo dinâmico

#### Performance
- Removido `backdrop-blur-xl` excessivo que impactava performance
- Adicionado `React.memo()` nos componentes RoutesList e RouteItem
- Implementado `useMemo()` e `useCallback()` para otimização
- Reduzidos delays de animação para melhor responsividade
- Simplificado glassmorphism para design mais leve

#### UX/Usabilidade
- **Barra de pesquisa** para filtrar rotas, paradas e endereços
- **Filtros combinados** (pesquisa + status)
- **Estado vazio** melhorado com ilustração, texto explicativo e ações
- **Skeleton loading** específico para cada seção
- **Feedback de loading** ao confirmar presença com spinner
- **Indicação visual** da parada do usuário (destaque com ring azul)
- **Informações de distância/tempo** em cada parada
- **Botão para limpar filtros** quando aplicados

#### Responsivo
- Adicionado breakpoint intermediário `sm:grid-cols-2` para tablets
- Tamanho mínimo de toque de 44px em elementos interativos
- Layout adaptável para diferentes tamanhos de tela

#### Micro-interações
- Efeitos hover nos filtros e botões
- Animações de transição suaves configuradas
- Feedback visual melhorado em estados interativos

#### Consistência
- Cores padronizadas usando design tokens
- Uso consistente do componente Badge
- Cores de texto melhoradas para contraste WCAG AA
- Remoção de cores hardcoded

### 📊 Métricas de Negócio
- **Modelo SaaS por assinatura** com 3 tiers:
  - Básico: Kz 9.900/mês (50 alunos, 5 motoristas, 10 rotas)
  - Profissional: Kz 24.900/mês (200 alunos, 20 motoristas, 50 rotas)
  - Empresarial: Kz 49.900/mês (ilimitado)
- **Receita projetada**: Kz 10.000.000 no primeiro ano
- **Modelos alternativos**: Por aluno (Kz 500-1.000) ou white-label

### 🎯 Benefícios para o Usuário
- Interface mais acessível e inclusiva
- Carregamento mais rápido e fluido
- Navegação intuitiva com pesquisa e filtros
- Feedback claro sobre ações e estados
- Design responsivo para todos os dispositivos
- Experiência personalizada (destaque da parada do usuário)

### 🚀 Próximos Passos
1. Configurar integração com Stripe para pagamentos
2. Implementar webhook para processamento de assinaturas
3. Criar painel de administração completo
4. Adicionar métricas avançadas de analytics
5. Expandir para mercado angolano com marketing localizado

---

## [1.1.0] - Versão Anterior
Versão inicial com funcionalidades básicas de rastreamento de ônibus escolar.