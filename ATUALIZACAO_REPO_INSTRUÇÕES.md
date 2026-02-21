# Instruções para Atualizar o Repositório GitHub

Para completar a atualização do repositório no GitHub, siga estes passos:

## 1. Criar um Personal Access Token no GitHub

1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token"
3. Dê um nome ao token (ex: "safebus-token")
4. Selecione as permissões:
   - repo (todas as opções)
   - workflow
   - admin:public_key
5. Clique em "Generate token"
6. Copie o token gerado (salve em um lugar seguro)

## 2. Configurar o Git para usar o token

Execute os seguintes comandos substituindo `<SEU_TOKEN>` pelo token copiado:

```bash
git remote set-url origin https://<SEU_TOKEN>@github.com/MauroFerreira10/onibus-kids-tracker.git
```

## 3. Fazer o push para o repositório

Depois de configurar o token, execute:

```bash
git push -u origin master
```

## 4. Alternativamente: Usar Git Credential Manager

Se você preferir configurar o Git para lembrar suas credenciais:

```bash
git config --global credential.helper store
```

Depois disso, quando você fizer o push, será solicitado seu nome de usuário e token, que serão armazenados.

## 5. Verificar o status

Após o push, verifique se tudo foi atualizado corretamente:

```bash
git status
```

## Observações

- Este repositório contém todas as atualizações do sistema SafeBus Tracker:
  - Design profissional moderno
  - Sistema SaaS com planos de assinatura
  - Melhorias de acessibilidade
  - Funcionalidades de rastreamento de ônibus
  - Páginas de rotas, horários, notificações e chat
  - Todos os valores convertidos para Kwanza (AOA)
  - Melhorias de desempenho e UX

Se encontrar problemas com o push, você também pode considerar clonar o repositório original primeiro e copiar os arquivos modificados para o clone local.