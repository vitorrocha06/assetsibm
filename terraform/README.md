# Implementação automatizada

## Introdução

Estes arquivos incluem uma série de configurações que utilizam toda a infra-estrutura necessária para utilizar este asset.

Este guia o ajudará a utilizar estes arquivos e o IBM Cloud Schematics para executar os arquivos de configuração em sua conta IBM Cloud.

---

## Requisitos

| Nome                       |                  Versão/Tipo                   |
| -------------------------- | :--------------------------------------------: |
| Conta IBM Cloud            |                   Conta paga                   |
| Usuário da conta IBM Cloud | [Editor](#acesso-do-usuário-à-conta-ibm-cloud) |
| Conta GitHub               |            [Público](#conta-github)            |

### Conta IBM Cloud

A maioria dos serviços aqui prestados utiliza o plano de tarifa livre, mas precisa de uma conta paga devido à possibilidade de cobrar quando o recurso excede o máximo do nível gratuito.

### Acesso do usuário à conta IBM Cloud

O usuário usado para criar a Chave API **<mark>DEVE TER PERMISSÃO DO EDITOR EM CADA UM DOS RECURSOS UTILIZADOS NO ASSET</mark>**. Caso o usuário não tenha, irão ocorrer erros de permissão no Terraform.

### Conta GitHub

Você precisará criar um repositório TODOS os arquivos do asset. Este repositório **<mark>DEVE TER VISIBILIDADE PÚBLICA</mark>** no momento em que os recursos são criados para que tudo funcione.

---

## Serviços e Instâncias provisionadas

A maioria dos serviços e instâncias utilizados no asset estão prontos para obter as informações sobre uma instância já existente ou para criar um novo. Alguns deles não podem utilizar um serviço ou instância existente.

A tabela abaixo mostra onde você pode usar um serviço ou instância existente, bem como o plano/tipo mínimo usado para criá-los.

| Nome                          | Aceitar um Serviço Existente | Plano Mínimo/Tipo |
| ----------------------------- | :--------------------------: | :---------------: |
| Cloud Functions (Actions)     |             Não              |         -         |
| Container Registry            |             Não              |         -         |
| Watson Assistant              |             Sim              |       Lite        |
| Cloudant                      |             Sim              |       Lite        |
| Code Engine                   |             Não              |     Standard      |
| Cognos Dashboard Embeded      |             Sim              |     Standard      |
| Cloud Object Storage          |             Sim              |       Lite        |
| Cloud Object Storage - Bucket |             Sim              |       Smart       |
| Db2                           |             Sim              |      Default      |
| Natural Langue Understanding  |             Sim              |       Lite        |

---

## Como implantar seus recursos

Para utilizar estes recursos, você terá que usar os arquivos do ativo e criar um repositório GitHub, GitLab ou Bitbucket. Você usará o IBM Cloud Schematics em sua conta para gerenciar seus recursos.

### Adicionando os arquivos no GitHub

Como requisito pra funcionar o deploy dos recuros, é necessários que os arquivos baixados (pelo portal ou pelo repositório do GitHub) seja colocado em um repositório na sua conta do GitHub.

As pastas necessárias nesse repositório são:

- cloud-functions
- curator-interface
- terraform

Esse repositório deve ter visibilidade pública, como mostra o exemplo a seguir:

![Criando um repositório público no GitHub](https://portal-de-demos-imgs.s3.us-south.cloud-object-storage.appdomain.cloud/assitant-curator-creating-github-repository.png)

### Criando um espaço de trabalho no Shcematics

Para criar um espaço de trabalho, você precisa acessar https://cloud.ibm.com/schematics/overview e clicar em adicionar espaço de trabalho. Selecione a opção "Select existing template" e cole o link do repositório que você acabou de criar no seguinte formato: (**https://github.com/}repository\>/tree/\<branch\>/terraform**). Então, você precisa selecionar a versão **terraform_v0.13** e clicar em próximo.

![Criando um espaço de trabalho no Shcematics](https://portal-de-demos-imgs.s3.us-south.cloud-object-storage.appdomain.cloud/assistant-curator-terraform-Create%20Schematics.png)

Dê um nome ao seu espaço de trabalho e clique em próximo. Verifique suas informações e clique para criar o espaço de trabalho.

Você precisa fornecer as quatro primeiras variáveis (_ibmcloud_api_key, cloud_region, resource_group, git_repo_url_), editando-as. Veja as descrições das variáveis na próxima seção para saber quais valores você precisará para definir as variáveis.

![Editing Schematics variables](https://portal-de-demos-imgs.s3.us-south.cloud-object-storage.appdomain.cloud/assistant-curator-terraform-Edit%20Variables.png)

Você pode clicar para gerar um plano, para ver o que será criado, ou clicar em aplicar o plano para provisionar seus recursos. Após os serviços serem provisionados, você pode vê-los clicando em "Recursos".

![Planejamento e Aplicação de Esquemas](https://portal-de-demos-imgs.s3.us-south.cloud-object-storage.appdomain.cloud/assistant-curator-terraform-Plans.png)

Para ver mais sobre IBM Shcematics veja a documentação completa: https://cloud.ibm.com/docs/schematics

### Declaração das variáveis

A última coisa que você precisa fazer antes de implementar seus recursos é definir os valores para as Variáveis do Terraform. Aqui você pode ver o nome, descrição, se é uma variável é obrigátoria e o recurso afetado por essa variável, para cada variável.

| Variável             | Descrição                                                                                                                                                                                                                                  | Obrigatória |        Recurso afetado         |
| -------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: | :----------------------------: |
| ibmcloud_api_key     | Credencial da IBM Cloud para conceder acesso para interagir com os recursos da nuvem.<br />Veja mais sobre em: https://www.ibm.com/docs/en/app-connect/containers_cd?topic=servers-creating-cloud-api-key                                  |     Sim     |             Todos              |
| cloud_region         | Região para criar os recursos, e onde estão os recursos existentes.<br />Veja as regiões disponíveis aqui: https://cloud.ibm.com/docs/certificate-manager?topic=certificate-manager-regions-endpoints#regions                              |     Sim     |             Todos              |
| resource_group       | Grupo de recursos para associar com as instâncias de serviços.<br />Veja seus grupos de recursos aqui: https://cloud.ibm.com/account/resource-groups                                                                                       |     Sim     |             Todos              |
| git_repo_url         | O link HTTPS para a raiz do seu diretório no repositório do GitHub.\nVeja como você pode obter este link aqui: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository#cloning-a-repository.       |     Sim     |          Code Engine           |
| dockerfile_directory | A localização do Dockerfile no repositório do GitHub.<br>Só precisa mudar se você mudar o diretório do Dockerfile.                                                                                                                         |     Não     |          Code Engine           |
| has_lite_cloudant    | Para evitar erros criando sua instância Cloudant, use esta variável para informar se você já tem alguma instância Cloudant LITE em sua conta.<br>Se você mudar esta variável para True, uma instância Cloudant Standard poderá ser criada. |     Não     |            Cloudant            |
| cloudant_name        | O nome de sua Instância Cloudant.<br /> Se nenhum nome for fornecido, o 'cloudant-instance' padrão será criado.                                                                                                                            |     Não     |            Cloudant            |
| namespace            | O namespace usado para criar as Cloud Functions (Actions)<br /> Se nenhum namespace for fornecido, o 'functions-namespace' padrão será criado.                                                                                             |     Não     |        Cloud Functions         |
| skillID              | O skillID de seu Watson Assistant.<br /> Se você ainda não tem um, [consulte a documentação](#editando-os-parâmetros-para-uma-cloud-function) mais tarde para adicioná-lo.                                                                 |     Não     |        Cloud Functions         |
| cos_name             | O nome do seu Cloud Object Storage.<br /> Se não for fornecido o nome COS, será criado o 'cos-instance' padrão.                                                                                                                            |     Não     |      Cloud Object Storage      |
| bucket_name          | O Bucket usado para armazenar os logs de seu Assistant.<br /> Se nenhum nome de Bucket for fornecido, será criado o bucket padrão 'assistant-curation'.                                                                                    |     Não     |      Cloud Object Storage      |
| nlu_name             | O nome de seu Natural Language Understanding.<br />Se não for fornecido o nome da NLU, será criada a 'nlu-instance' padrão.                                                                                                                |     Não     | Natural Language Understanding |
| db2_name             | O nome da sua Instância do Db2.<br />Se não for fornecido o nome do Db2, será criada a 'db2-instance' padrão.                                                                                                                              |     Não     |              Db2               |
| assistant_name       | O nome da sua Instância do Watson Assistant.<br />Se não for fornecido um nome do Assistant, será criado o padrão 'assistant-instance'.                                                                                                    |     Não     |        Watson Assistant        |
| cognos_name          | O nome da sua Instância do Cognos Embeded.<br />Se nenhum nome do Cognos for fornecido, será criada a 'cognos-instance' padrão.                                                                                                            |     Não     |         Cognos Embeded         |

### Acessando a aplicação

Uma vez finalizada a aplicação do seu plano, você deverá acessar os seus [projetos do Code Engine](https://cloud.ibm.com/codeengine/projects). Lá, procure pelo seu projeto que foi criado recentemente, e acessa suas aplicações. Nesta seção você encontrará sua aplicação recém criada e o link para poder acessar o asset:

![Acessando a url da aplicação](https://portal-de-demos-imgs.s3.us-south.cloud-object-storage.appdomain.cloud/assistant-curator-accessing-asset-url.png)

---

## Editando os parâmetros para uma Cloud Function

Através da criação dos recursos, são criadas as Cloud Functions, e uma delas contém alguns parâmetros utilizados posteriormente no asset para lidar com os dados. Você pode alterar estes valores mais tarde se quiser, e, alguns deles precisam ser editadas se você não tinha um recurso Watson Assistant criado anteriormente, antes da implementação de seus outros recursos.

Para editá-los, você precisa ir para **Cloud Functions -> Actions -> Procurar a Action "create-tables" -> Parameters**. Lá você encontrará os parâmetros previamente criados pelo Terraform com as informações sobre outros recursos. Se você olhar a string no valor do parâmetro "assistantConfig", você encontrará "["exemplo1", "exemplo2"]" para as keys transferNode(O(s) nó(s) em seu assistente que transfere o usuário), feedbackNode(O(s) nó(s) em seu assistente que contacta(m) o feedback) e relevantTopics(Intenções que aparecem em uma conversa que você considera relevante).

A fim de obter bons insights de seus dados, você precisa substituí-los pela informação correspondente a seu assistente. Por exemplo, em transferNode: ["talkToHuman"] ou ["talkToHuman", "problemNotSolved"]. **Sempre lembre** que estas três chaves (transferNode, feedbackNode, relevantesTopics) são uma lista no formato: ["valor1] ou ["valor1", "valor2"].

Se você quiser alterar qualquer outro valor em qualquer outro parâmetro, basta verificar se você está usando o mesmo formato e seguir os passos anteriores para acessar os parâmetros
