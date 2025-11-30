# SafeBus - Sistema de Monitoramento e Gestão de Transporte Escolar

## Visão Geral

O SafeBus é um sistema completo para monitoramento, gestão e comunicação no transporte escolar. Ele permite que gestores, motoristas, pais e alunos acompanhem rotas, recebam notificações, gerenciem presença e mantenham uma comunicação eficiente e segura.

## Usuários de Teste

| Tipo de Usuário | E-mail                    | Senha   |
|----------------|---------------------------|---------|
| Admin/Gestor   | maurosawilala@gmail.com   | 000000  |
| Motorista      | asdrubal@gmail.com        | 000000  |
| Aluno          | laisa@gmail.com           | 000000  |

> **Obs:** Todos os usuários de teste utilizam a mesma senha: `000000`.

## Funcionalidades Principais

### 1. Autenticação e Perfis de Usuário
- Login e logout de usuários
- Cadastro de novos usuários (motorista, gestor, responsável, aluno)
- Recuperação de senha
- Controle de acesso por tipo de usuário
- Edição de perfil

### 2. Gestão de Rotas
- Cadastro, edição e visualização de rotas
- Definição de paradas
- Atribuição de motoristas e veículos às rotas
- Visualização de rotas no mapa
- Monitoramento em tempo real das rotas

### 3. Painel do Motorista
- Visualização de rotas atribuídas
- Registro de início e fim de viagem
- Controle de presença dos alunos
- Envio de notificações rápidas (atraso, chegada, alerta)
- Rastreamento de localização do veículo

### 4. Painel do Gestor
- Gerenciamento de motoristas, alunos e pais
- Visualização de relatórios de viagens
- Gestão de convites para novos usuários
- Cadastro e atualização de veículos

### 5. Sistema de Notificações
- Notificações em tempo real para pais, motoristas e gestores
- Alertas de atraso, chegada e problemas na rota
- Histórico de notificações

### 6. Chat e Comunicação
- Chat entre usuários (motorista, gestor, pais)
- Histórico de conversas

### 7. Relatórios e Histórico
- Relatórios de viagens realizadas
- Histórico de presença dos alunos
- Relatórios de uso do sistema
- Geração de relatório completo em Word (aba Relatórios do gestor)

---

## Como Executar o Projeto Localmente (Passo a Passo Simples)

1. **Instale as dependências:**
   ```sh
   npm install
   ```
2. **Inicie o servidor de desenvolvimento:**
   ```sh
   npm run dev
   ```
3. **Acesse no navegador:**
   [http://localhost:8080](http://localhost:8080)

---

## Como Usar as Funcionalidades

### Cadastro e Login
- Acesse `/auth/register` para criar uma conta.
- Faça login em `/auth/login`.
- O tipo de usuário define o painel e permissões.

### Painel do Gestor
- Gerencie motoristas, alunos, pais e rotas.
- Acesse a aba **Relatórios** para visualizar métricas e baixar o relatório completo do sistema em Word.
- Convide novos usuários e atribua rotas e veículos.

### Painel do Motorista
- Veja suas rotas atribuídas.
- Inicie e finalize viagens.
- Marque presença dos alunos.
- Envie notificações rápidas para pais e gestores.

### Notificações
- Receba alertas em tempo real sobre atrasos, chegadas e eventos importantes.
- Veja o histórico de notificações na página de notificações.

### Chat
- Acesse a página de chat para se comunicar com outros usuários do sistema.

### Relatórios
- Na aba **Relatórios** do painel do gestor, clique em "Baixar Relatório Completo (Word)" para gerar um documento com todas as funcionalidades do sistema.

---

## Observações para o Professor
- O sistema pode ser testado com diferentes tipos de usuários para validar todas as funcionalidades.
- O relatório Word gerado na aba Relatórios do gestor contém um resumo detalhado das funcionalidades e casos de uso do sistema.
- Caso precise de dados de teste ou contas de acesso, consulte o desenvolvedor.

---

## Tecnologias Utilizadas
- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (backend e banco de dados)
- docx (geração de relatórios Word)
- file-saver (download de arquivos)

---

## Contato
- Desenvolvedor: Mauro Ferreira
- GitHub: [MauroFerreira10](https://github.com/MauroFerreira10)
- Email: [ferreiramauro331@gmail.com]
- Contacto: 947286767
