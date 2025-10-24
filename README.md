# Timer App

Um aplicativo de timer moderno e intuitivo desenvolvido em React com TypeScript, oferecendo funcionalidades avançadas de notificação e interface adaptativa.

## 🚀 Funcionalidades

### ⏱️ Timer Personalizável
- Defina a duração do timer em minutos
- Nome personalizado para cada timer
- Salvamento automático no localStorage
- Persistência entre sessões

### 🔔 Sistema de Notificações
- **Notificações Sonoras**: Som personalizado usando Web Audio API
- **Notificações Visuais**: Notificações do navegador + flash na aba
- **Intervalos Configuráveis**: Defina múltiplos intervalos (ex: 1h, 30min, 15min, 5min)
- **Controle de Volume**: Ajuste o volume das notificações sonoras

### 🎨 Interface Adaptativa
- **Gradiente de Cores**: Transição suave de verde (início) para vermelho (fim)
- **Visual Agressivo**: Efeitos especiais nos últimos 20% do tempo
- **Tela Cheia**: Interface otimizada para foco total
- **Responsivo**: Funciona perfeitamente em desktop e mobile

### 📊 Informações Detalhadas
- Horário de início e fim previsto
- Progresso em tempo real
- Tempo decorrido e restante
- Próxima notificação programada

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Web Audio API** para notificações sonoras
- **localStorage** para persistência de dados
- **Web Notifications API** para alertas visuais

## 📦 Instalação

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd timer-app
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Execute o projeto**:
   ```bash
   npm start
   ```

4. **Acesse no navegador**:
   ```
   http://localhost:3000
   ```

## 🎯 Como Usar

### 1. Configuração de Timers
- Clique em "Novo Timer" para criar um timer
- Defina o nome e duração
- Configure as notificações (som/visual)
- Adicione intervalos de notificação personalizados
- Salve o timer

### 2. Executando o Timer
- Clique em "Iniciar" no timer desejado
- O timer abrirá em tela cheia
- Use os controles para pausar/continuar/parar
- Acompanhe o progresso visual e as notificações

### 3. Notificações
- **Sonoras**: Toca automaticamente nos intervalos configurados
- **Visuais**: Mostra notificações do navegador e pisca a aba
- **Finalização**: Notifica quando o timer é concluído

## 🔧 Configurações Avançadas

### Permissões do Navegador
Para notificações visuais funcionarem completamente:
1. Permita notificações quando solicitado
2. Mantenha a aba ativa para melhor experiência

### Personalização
- Ajuste o volume das notificações sonoras
- Configure intervalos personalizados
- Use nomes descritivos para organizar seus timers

## 📱 Compatibilidade

- ✅ Chrome/Chromium (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🎨 Características Visuais

### Gradiente de Cores
- **0-80%**: Transição suave de verde para amarelo
- **80-100%**: Visual agressivo em vermelho com efeitos de pulso

### Animações
- Transições suaves entre estados
- Efeitos de fade e pulse
- Interface responsiva e fluida

## 🔒 Privacidade

- Todos os dados são armazenados localmente no seu navegador
- Nenhuma informação é enviada para servidores externos
- Controle total sobre suas configurações e timers

## 🚀 Desenvolvimento

### Estrutura do Projeto
```
src/
├── components/          # Componentes React
│   ├── TimerConfig.tsx  # Página de configuração
│   └── TimerDisplay.tsx # Página do timer
├── types/              # Definições TypeScript
│   └── Timer.ts        # Interfaces do timer
├── utils/              # Utilitários
│   ├── storage.ts      # Gerenciamento do localStorage
│   └── notifications.ts # Sistema de notificações
├── App.tsx             # Componente principal
└── index.tsx           # Ponto de entrada
```

### Scripts Disponíveis
- `npm start`: Inicia o servidor de desenvolvimento
- `npm build`: Cria build de produção
- `npm test`: Executa os testes
- `npm eject`: Ejecta do Create React App

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

---

**Desenvolvido com ❤️ para produtividade e foco**
