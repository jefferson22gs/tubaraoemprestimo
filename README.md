# 🦈 Tubarão Empréstimos - Fintech SaaS Platform

Uma plataforma Fintech Premium completa, projetada com arquitetura moderna, identidade visual forte (Dark/Gold/Red) e funcionalidades de ponta (PWA, IA, Automação).

## 🚀 Funcionalidades Principais

### Para o Cliente (PWA Mobile-First)
*   **Simulador de Crédito:** Interface intuitiva para simular valores e parcelas.
*   **Cadastro Wizard:** Fluxo passo-a-passo com validação de documentos, biometria (selfie) e assinatura digital.
*   **Dashboard Premium:** Visualização de saldo devedor, notificações e status.
*   **Carteira Digital:** Gestão de contratos e pagamento via **Pix Copy & Paste** (Modal com QR Code).
*   **Chatbot IA:** Assistente virtual para tirar dúvidas e negociar pagamentos.

### Para o Administrador (Gestor)
*   **Mesa de Aprovação:** Galeria de documentos com Zoom/Rotação para validar KYC.
*   **Gestão Financeira:** Configuração de taxas de juros, multas e criação de pacotes de empréstimo.
*   **CRM Completo:** Lista de clientes com Score Interno e histórico.
*   **Régua de Cobrança:** Automação de mensagens via WhatsApp/Email baseada no vencimento.
*   **Monitoramento IA:** Logs de todas as interações do chatbot com classificação de intenção.

## 🛠️ Stack Tecnológica

*   **Frontend:** React 18, Vite, TypeScript.
*   **Estilização:** Tailwind CSS (Dark Mode Nativo).
*   **Ícones:** Lucide React.
*   **Gráficos:** Recharts.
*   **Backend (Simulado):** Arquitetura de serviços (`supabaseService`, `aiService`) pronta para integração real.

## 📦 Como Rodar o Projeto

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

3.  **Acesse:** `http://localhost:5173`

## 🔑 Credenciais de Teste

O sistema possui um fluxo de autenticação simulado.

**Acesso Cliente:**
*   **Login:** Qualquer CPF válido (ex: `123.456.789-00`)
*   **Senha:** Qualquer senha
*   *Ou complete o fluxo de cadastro no Wizard.*

**Acesso Admin:**
*   Clique no botão **"ACESSAR COMO ADMIN"** na tela de login.
*   Ou use:
    *   **Login:** `admin`
    *   **Senha:** `admin`

## 📱 Dicas de Navegação

*   **Modo Mobile:** Para a melhor experiência do painel do cliente, abra as ferramentas de desenvolvedor do navegador (F12) e alterne para a visualização móvel (Ctrl+Shift+M). Você verá a **Barra de Navegação Inferior** exclusiva.
*   **Aprovação:** Faça um cadastro novo no Wizard. Depois, entre como Admin, vá em "Solicitações" e aprove o empréstimo. Volte para o login do cliente e veja o saldo atualizado no Dashboard!

---
*Tubarão Empréstimos - Crédito Rápido e Seguro.*
