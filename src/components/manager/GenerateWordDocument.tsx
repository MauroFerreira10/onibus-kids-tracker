import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface GenerateWordDocumentProps {
  onGenerate: () => void;
}

export const GenerateWordDocument = ({ onGenerate }: GenerateWordDocumentProps) => {
  const generateDocument = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Relatório de Funcionalidades do Projeto SafeBus",
              heading: HeadingLevel.HEADING_1,
              alignment: "center"
            }),
            new Paragraph({}),
            new Paragraph({
              text: "1. Funcionalidades do Sistema",
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: "1.1. Autenticação e Perfis de Usuário",
              children: [
                new TextRun("• Login e logout de usuários\n"),
                new TextRun("• Cadastro de novos usuários (motorista, gestor, responsável, aluno)\n"),
                new TextRun("• Recuperação de senha\n"),
                new TextRun("• Controle de acesso por tipo de usuário\n"),
                new TextRun("• Edição de perfil\n")
              ]
            }),
            new Paragraph({
              text: "1.2. Gestão de Rotas",
              children: [
                new TextRun("• Cadastro, edição e visualização de rotas\n"),
                new TextRun("• Definição de paradas\n"),
                new TextRun("• Atribuição de motoristas e veículos às rotas\n"),
                new TextRun("• Visualização de rotas no mapa\n"),
                new TextRun("• Monitoramento em tempo real das rotas\n")
              ]
            }),
            new Paragraph({
              text: "1.3. Painel do Motorista",
              children: [
                new TextRun("• Visualização de rotas atribuídas\n"),
                new TextRun("• Registro de início e fim de viagem\n"),
                new TextRun("• Controle de presença dos alunos\n"),
                new TextRun("• Envio de notificações rápidas (atraso, chegada, alerta)\n"),
                new TextRun("• Rastreamento de localização do veículo\n")
              ]
            }),
            new Paragraph({
              text: "1.4. Painel do Gestor",
              children: [
                new TextRun("• Gerenciamento de motoristas, alunos e pais\n"),
                new TextRun("• Visualização de relatórios de viagens\n"),
                new TextRun("• Gestão de convites para novos usuários\n"),
                new TextRun("• Cadastro e atualização de veículos\n")
              ]
            }),
            new Paragraph({
              text: "1.5. Sistema de Notificações",
              children: [
                new TextRun("• Notificações em tempo real para pais, motoristas e gestores\n"),
                new TextRun("• Alertas de atraso, chegada e problemas na rota\n"),
                new TextRun("• Histórico de notificações\n")
              ]
            }),
            new Paragraph({
              text: "1.6. Chat e Comunicação",
              children: [
                new TextRun("• Chat entre usuários (motorista, gestor, pais)\n"),
                new TextRun("• Histórico de conversas\n")
              ]
            }),
            new Paragraph({
              text: "1.7. Relatórios e Histórico",
              children: [
                new TextRun("• Relatórios de viagens realizadas\n"),
                new TextRun("• Histórico de presença dos alunos\n"),
                new TextRun("• Relatórios de uso do sistema\n")
              ]
            }),
            new Paragraph({}),
            new Paragraph({
              text: "2. Diagrama de Caso de Uso (Textual)",
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: "Atores:",
              children: [
                new TextRun("\n• Gestor\n• Motorista\n• Responsável\n• Aluno\n• Sistema de Notificações\n")
              ]
            }),
            new Paragraph({
              text: "Principais Casos de Uso:",
              children: [
                new TextRun("\n• Gestor cadastra rotas, motoristas, veículos e alunos\n"),
                new TextRun("• Gestor visualiza relatórios e histórico de viagens\n"),
                new TextRun("• Motorista inicia e finaliza viagens\n"),
                new TextRun("• Motorista registra presença dos alunos\n"),
                new TextRun("• Motorista envia notificações rápidas\n"),
                new TextRun("• Responsável visualiza localização do ônibus em tempo real\n"),
                new TextRun("• Responsável recebe notificações de chegada/atraso\n"),
                new TextRun("• Todos os usuários podem se comunicar via chat\n"),
                new TextRun("• Sistema envia notificações automáticas\n")
              ]
            }),
            new Paragraph({}),
            new Paragraph({
              text: "Fluxo de um Caso de Uso Exemplo: 'Motorista inicia viagem'",
              heading: HeadingLevel.HEADING_3
            }),
            new Paragraph({
              children: [
                new TextRun("1. Motorista faz login no sistema\n"),
                new TextRun("2. Seleciona a rota atribuída\n"),
                new TextRun("3. Clica em 'Iniciar Viagem'\n"),
                new TextRun("4. Sistema registra o horário de início\n"),
                new TextRun("5. Sistema começa a rastrear a localização do veículo\n"),
                new TextRun("6. Pais e gestores recebem notificação de início da viagem\n")
              ]
            }),
            new Paragraph({}),
            new Paragraph({
              children: [
                new TextRun({ text: "Este relatório foi gerado automaticamente a partir da análise do código-fonte do projeto SafeBus.", italics: true })
              ]
            })
          ]
        }
      ]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "relatorio-funcionalidades-safebus.docx");
  };

  return (
    <button
      onClick={generateDocument}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Baixar Relatório Completo (Word)
    </button>
  );
}; 