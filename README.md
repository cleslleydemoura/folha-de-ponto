# 🕒 Sistema de Administração de Folha de Ponto

Este projeto é uma aplicação voltada para a **administração da jornada de trabalho dos funcionários**, com foco em controle de **horas diárias e semanais**. Ele foi desenvolvido com o objetivo de facilitar o acompanhamento da carga horária dos colaboradores, considerando inclusive **tempos de deslocamento (viagem)**.

Visualização no <a href="https://folha-de-ponto-cleslley.vercel.app/">Vercel</a>.

```https://folha-de-ponto-cleslley.vercel.app/```

## Funcionalidades

- 📋 **Formulário de Registro de Ponto**  
  O usuário pode inserir os seguintes dados:
  - Nome do Funcionário
  - Data
  - Horário de Entrada
  - Horário inicial do Almoço
  - Horário final do Almoço
  - Horário de Saída

- 📊 **Tabela de Registros**
  - Exibe todos os dados inseridos para cada funcionário.
  - Organiza os registros por funcionário e dia da semana.
  - Atualiza automaticamente a cada nova inserção.

- ⏱️ **Cálculo de Carga Horária**
  - A carga horária **diária é de 6 horas**.
  - A carga horária **semanal é de 30 horas**.
  - O sistema verifica se o funcionário **cumpriu, excedeu ou ficou abaixo da meta de horas**.
  - Exibe mensagens com:
    - Total de horas cumpridas
    - Minutos faltantes
    - Excedente de horas

- 📅 **Resumo Semanal**
  - Mostra o total de horas trabalhadas por semana.
  - Aponta se o funcionário atingiu ou não as 30h semanais.
  - Informa a diferença (positiva ou negativa) em minutos.

![image](https://github.com/user-attachments/assets/afc782c0-c8a3-4eb7-9628-2f55f33da892)
