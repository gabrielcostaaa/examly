# Examly 📕

Plataforma inteligente para otimizar seus estudos, combinando planejamento personalizado, registro de progresso e gestão de turmas para estudantes e educadores.

![Logo do Examly](images/examly_banner_git.png)

Desenvolvido para atender ao trabalho integrador de Programação II e Banco de Dados I

-----

## Autor

**Gabriel Santos Costa** - Responsável pela concepção e desenvolvimento integral do sistema.

-----

## Orientadores

  * **Dr. Denio Duarte** - Banco de Dados 1
  * **Dr. Giancarlo Dondoni** - Programação II

-----

## Descrição do Projeto Examly

O Examly é uma plataforma digital desenvolvida para otimizar o processo de estudos de estudantes e concurseiros, abordando desafios comuns como a gestão de múltiplas disciplinas, prazos e a necessidade de revisões eficientes. O sistema visa oferecer uma solução integrada para o planejamento, registro de progresso e acompanhamento do aprendizado.

Além das funcionalidades de organização individual, o Examly incorpora um módulo de gestão de turmas, permitindo que professores e coordenadores pedagógicos criem e administrem grupos de estudo. Essa funcionalidade habilita o acompanhamento agregado do desempenho dos alunos em uma turma e a análise comparativa do progresso. O plano de ensino é diretamente associado à turma, e o aluno pode alternar entre seus planos de estudo personalizados e os planos vinculados às tur turmas das quais faz parte, com métricas e dashboards que se adaptam ao contexto selecionado.

O objetivo do Examly é aprimorar a eficácia do aprendizado e a organização, mitigando a desordem e a ansiedade frequentemente associadas à preparação para exames.

-----

## Principais Funcionalidades

  * **Gestão de Planos de Estudo**:
      * Criação e manutenção de planos de estudo personalizados para o usuário individual.
      * Aderência e visualização de planos de estudo associados a turmas.
      * Gerenciamento de disciplinas e tópicos dentro de cada plano.
  * **Registro e Análise de Estudo**:
      * Registro detalhado do tempo dedicado ao estudo, tópicos concluídos e métricas de desempenho (e.g., acertos e erros em exercícios).
      * Visualização de dashboards intuitivos que refletem o progresso e desempenho, adaptando-se ao contexto do plano de estudo (pessoal ou de turma).
  * **Sistema de Revisões Programadas**:
      * Agendamento automático de revisões baseado no conceito de repetição espaçada.
      * Notificações e controle para a conclusão das revisões pendentes.
  * **Gerenciamento de Turmas**:
      * Criação e administração de turmas por professores/coordenadores.
      * Mecanismos de busca, solicitação de entrada e envio/aceite de convites para participação em turmas pelos estudantes.
      * Acompanhamento do desempenho médio e estatísticas de progresso da turma para educadores.
  * **Autenticação e Autorização**:
      * Sistema de login seguro com autenticação JWT.
      * Controle de acesso diferenciado por perfil de usuário (Estudante, Professor/Coordenador, Administrador), garantindo a segregação de funcionalidades.

-----

## Tecnologias Utilizadas

  * **Linguagem**:
      * **Typescript**: Superconjunto do JavaScript que adiciona tipagem estática para maior segurança e manutenibilidade do código.
  * **Frontend**:
      * **React**: Biblioteca JavaScript para construção de interfaces de usuário dinâmicas e reativas.
      * **React Router DOM**: Gerenciamento de rotas e navegação na aplicação web.
      * **React Hook Form**: Solução performática e flexível para gerenciamento de formulários.
      * **CSS**: Estilização da interface.
      * **Yarn**: Gerenciador de pacotes rápido e confiável.
      * **Vite**: Ferramenta de build frontend que oferece um ambiente de desenvolvimento ágil.
  * **Backend**:
      * **Fastify**: Framework Node.js altamente performático e focado em proporcionar uma ótima experiência para desenvolvedores.
  * **Banco de Dados**:
      * **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional robusto e de código aberto, utilizado para armazenar todas as informações do sistema.

-----

## Ambiente de Desenvolvimento e Execução

Para configurar e executar o projeto Examly, são necessários os seguintes pré-requisitos: Node.js, Yarn e PostgreSQL.

As instruções detalhadas para o setup do ambiente, incluindo a instalação de dependências, configuração do banco de dados e inicialização dos servidores frontend e backend, serão fornecidas na documentação técnica complementar do projeto.

-----

## Referências

  * [Estuda.com](https://app.estuda.com/)
  * [Estratégia Concursos](https://www.estrategiaconcursos.com.br/)
