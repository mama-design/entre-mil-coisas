# Entre mil coisas

Organizador pessoal da Martina: agenda, tarefas sem data, lembretes antecipados,
rotinas semanais, hábitos, evolução e categorias personalizáveis.

## Publicação

GitHub Pages: branch `main`, pasta `/docs`.
Endereço: https://entremilcoisas.mamadesign.com.br
O arquivo `docs/CNAME` contém o endereço configurado.

## Desenvolvimento

Node 22 ou superior. `npm ci`, `npm run dev`, `npm run build`.
O build gera a pasta `docs`. Versionar tanto o fonte quanto o build.

## Dados e acesso

Supabase: login existente da Mama, sessão própria deste app.
Tabelas exclusivas: `emc_access` e `emc_notebooks`.
Somente pessoas explicitamente autorizadas em `emc_access` acessam o próprio caderno.
A chave no cliente é **publishable**; o acesso aos dados é controlado por RLS.
Não há chaves administrativas, senhas nem dados pessoais neste repositório.

`sql/schema.sql` documenta a estrutura já aplicada. Não executar novamente em produção.
A importação inicial dos registros do app anterior foi feita diretamente no banco;
não consta neste repositório público.

## Verificação

Build TypeScript/Vite; testes transacionais de salvamento, edição de categorias,
preservação das tarefas ao excluir categoria, conclusão de ocorrências e hábitos,
e bloqueio de leitura/escrita por conta não autorizada.
