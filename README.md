# Entre mil coisas

Organizador pessoal da Martina: agenda, tarefas sem data, lembretes antecipados,
rotinas semanais, hábitos, evolução e categorias personalizáveis.

Conquistas: contador pessoal sem fumar, economia proporcional ao tempo,
marcos, histórico de peso e meta opcional, aplicações e gastos de medicamentos.
Dados pessoais são carregados do banco após autenticação; não são incluídos no fonte.

## Publicação

GitHub Pages: branch `main`, pasta `/docs`.
Endereço: https://entremilcoisas.mamadesign.com.br
O arquivo `docs/CNAME` contém o endereço configurado.

## Desenvolvimento

Node 22 ou superior. `npm ci`, `npm run dev`, `npm run build`.
O build gera a pasta `docs`. Versionar tanto o fonte quanto o build.

## Dados e acesso

Supabase: login existente da Mama, sessão própria deste app.
Tabelas exclusivas: `emc_access`, `emc_notebooks`, `emc_achievement_settings`,
`emc_weight_logs` e `emc_medication_logs`.
Somente pessoas explicitamente autorizadas em `emc_access` acessam o próprio caderno.
A chave no cliente é **publishable**; o acesso aos dados é controlado por RLS.
Não há chaves administrativas, senhas nem dados pessoais neste repositório.

Os arquivos em `sql/` documentam as estruturas já aplicadas. Não executar novamente em produção.
A importação inicial dos registros do app anterior foi feita diretamente no banco;
não consta neste repositório público.

## Verificação

Build TypeScript/Vite; testes transacionais de salvamento, edição de categorias,
preservação das tarefas ao excluir categoria, conclusão de ocorrências e hábitos,
e bloqueio de leitura/escrita por conta não autorizada.
