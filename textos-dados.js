/* ============================================================
   Textos padrão de indeferimento e pendência — DADOS.

   Extraído de "Textos padrão para indeferimento.docx". A partir
   daqui ESTE arquivo é a fonte da verdade: editar aqui, não no
   .docx. A interface que consome estes dados está em textos.js.

   grupo  : seção principal (Fundiária | Carga | Ambiental)
   sub    : subseção; string vazia = solto direto no grupo
   titulo : o que aparece na lista e é usado na busca
   corpo  : o texto que vai para a área de transferência

   Trechos entre (*...*) são valores de exemplo — coordenada,
   nome de unidade de conservação — e precisam ser trocados
   antes do envio. A interface os destaca em amarelo.
   ============================================================ */

const TEXTOS_PADRAO = [
  {
    grupo: "Parte documental / Fundiária",
    sub: "Localização / Parcelamento de solo",
    titulo: "Localização",
    corpo:
      "Não foi possível identificar a localização do imóvel a ser conectado com as informações fornecidas na solicitação.\n\nPara permitir a identificação precisa do imóvel, é necessário apresentar uma das seguintes informações ou documentações:\n\n- Coordenadas geográficas indicadas no formulário de acesso (latitude e longitude);\n- CAR - Cadastro Ambiental Rural para casos de imóveis rurais (Endereço para emissão gratuita desse documento: www.car.gov.br);\n- Planta georreferenciada ou croqui com referências claras;\n- Matrícula do imóvel com descrição detalhada da localização;\n- Outros documentos oficiais que possibilitem a identificação do ponto de conexão.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Localização / Parcelamento de solo",
    titulo: "Localização e parcelamento",
    corpo:
      "Após análise da documentação apresentada, não foi possível identificar com precisão a área correspondente à nova unidade consumidora solicitada. Constatamos, ainda, que a referência ou coordenada informada está localizada em área irregular de parcelamento do solo. A correta localização do ponto de conexão é essencial para a avaliação dos aspectos técnicos e ambientais, definição da obra de menor custo global e atribuição adequada das responsabilidades financeiras entre as partes envolvidas.\nSolicitamos, portanto, a complementação das informações de localização da propriedade. Caso seja possível localizar a área da propriedade, mas não o ponto exato do imóvel, será considerado como local de instalação do padrão o ponto no limite da propriedade cuja obra represente o menor custo global.\nRessaltamos que, conforme inciso II do artigo 68 da REN ANEEL nº 1000/2021, o consumidor pode indicar um ponto de conexão de interesse, o qual será objeto de análise de viabilidade técnica e econômica por parte da distribuidora.\nPara que possamos dar continuidade ao processo, é necessário que a situação seja regularizada junto aos órgãos competentes e que sejam apresentados os seguintes documentos:\n- Planta georreferenciada do empreendimento (escala 1:1000);\n- Lei e/ou Decreto Municipal que comprove a aprovação do empreendimento;\n- Licença ambiental ou declaração de não passível de licenciamento, emitida pelo órgão competente;\n- Manifestação favorável da Prefeitura Municipal.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Localização / Parcelamento de solo",
    titulo: "Localização - referência sem cadastro no banco de dados CEMIG",
    corpo:
      "Após análise da documentação apresentada, não foi possível identificar com precisão a área correspondente à nova unidade consumidora solicitada. Além disso, verificamos que a referência fornecida não possui cadastro no banco de dados da CEMIG, o que impossibilita a confirmação da localização exata para atendimento. A correta localização do ponto de conexão é essencial para a avaliação dos aspectos técnicos e ambientais, definição da obra de menor custo global e atribuição adequada das responsabilidades financeiras entre as partes envolvidas.\nSolicitamos, portanto, a complementação das informações de localização da propriedade. Caso seja possível localizar a área da propriedade, mas não o ponto exato do imóvel, será considerado como local de instalação do padrão o ponto no limite da propriedade cuja obra represente o menor custo global.\nRessaltamos que, conforme inciso II do artigo 68 da REN ANEEL nº 1000/2021, o consumidor pode indicar um ponto de conexão de interesse, o qual será objeto de análise de viabilidade técnica e econômica por parte da distribuidora.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Localização / Parcelamento de solo",
    titulo: "Localização - referência / coordenada em outro município",
    corpo:
      "O local informado pertence a um município diferente do indicado na solicitação, impossibilitando a confirmação da localização exata para o atendimento. É necessária a informação correta, de acordo com a coordenada geográfica do imóvel, para a devida avaliação dos aspectos técnicos e ambientais da conexão.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Localização / Parcelamento de solo",
    titulo: "Pedido de ligação em parcelamento de solo",
    corpo:
      "O imóvel está localizado em área com características de urbanização, configurando indícios de parcelamento irregular do solo, a exemplo de subdivisão em lotes ou glebas, abertura de vias, presença de edificações e infraestrutura compartilhada. Nessas condições, o atendimento não pode prosseguir até que seja comprovada a conformidade do parcelamento perante o órgão público competente. A adequação da área deverá ser promovida pelo empreendedor responsável pelo empreendimento ou pelo poder público municipal, conforme o caso. Para comprovação da situação da área, deverá ser apresentada documentação emitida pela Prefeitura que demonstre a aprovação ou o enquadramento legal do parcelamento, como projeto urbanístico aprovado, ato de aprovação de loteamento ou desmembramento, certidão de regularização fundiária, documento de REURB, cadastro imobiliário municipal, IPTU individualizado, alvará de construção ou outro documento oficial equivalente que comprove a situação legal dos lotes e das vias de acesso. Após a conclusão das providências necessárias e apresentação da documentação pertinente, deverá ser protocolada nova solicitação acompanhada dos documentos exigidos para reanálise do pedido de atendimento.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Localização / Parcelamento de solo",
    titulo: "Pedidos abaixo do FMP sem indícios de urbanização",
    corpo:
      "A solicitação de ligação refere-se a um imóvel rural com área inferior à Fração Mínima de Parcelamento (FMP) e não possui registro de imóvel ou cadastro rural.\nDe acordo com a legislação vigente, incluindo a Lei nº 4.504/1964 (Estatuto da Terra) e Lei 4.947/1966, imóveis rurais não podem ser desmembrados em áreas menores que a FMP. Sendo assim, para comprovar a regularidade do imóvel diante a situação, é obrigatória a apresentação do Registro de Imóvel juntamente com os demais documentos que já foram apresentados nessa nota de serviço.\nSerá necessário protocolar nova solicitação de acesso com toda documentação obrigatória, incluindo a documentação que comprove a conformidade do imóvel com essas exigências legais.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Localização / Parcelamento de solo",
    titulo: "Pedido de ligação em parcelamento de solo com rede a porta",
    corpo:
      "O imóvel está localizado em área com características de urbanização, sem atividade rural, a exemplo de: múltiplas divisões do terreno (lotes ou glebas), abertura de vias, residências, infraestrutura compartilhada.\nÉ obrigatório apresentação de comprovação de regularização fundiária urbana emitida pela prefeitura, como IPTU ou alvará de construção, conforme Lei Federal nº 10.257/2001.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Coletivo sem cadastro no APR Web",
    corpo:
      "Seu pedido foi cadastrado para um padrão de uma única caixa, sendo necessária a solicitação de conexão para um padrão coletivo. Ressaltamos que esta modalidade exige que o pedido seja cadastrado no sistema APRWEB por um responsável técnico habilitado, acompanhado da documentação técnica específica:\n\n- Termo de opção de atendimento em baixa tensão, quando aplicável;\n- Formulário de orçamento de conexão/alteração de carga urbana ou rural, devidamente preenchido;\n- Planta de situação contendo a distância entre o centro de medição e o poste da Cemig, distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima, representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores;\n- Anotação de Responsabilidade Técnica (ART) paga, com o número de registro no respectivo conselho profissional e os campos de assinatura devidamente preenchidos pelo profissional responsável.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Carga acima de 75 kW sem cadastro no APR Web",
    corpo:
      "A documentação apresentada possui carga instalada superior a 75 kW. Ressaltamos que esta modalidade exige que o pedido seja cadastrado no sistema APRWEB por um responsável técnico habilitado, acompanhado da seguinte documentação técnica específica:\n\n- Termo de opção de atendimento em baixa tensão, quando aplicável;\n- Formulário de orçamento de conexão/alteração de carga urbana ou rural, devidamente preenchido;\n- Planta de situação contendo a distância entre o centro de medição e o poste da Cemig, distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima, representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores;\n- Anotação de Responsabilidade Técnica (ART) paga, com o número de registro no respectivo conselho profissional e os campos de assinatura devidamente preenchidos pelo profissional responsável.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Não anexou ART",
    corpo:
      "A documentação da Anotação de Responsabilidade Técnica (ART) não foi apresentada. É necessário anexar este documento devidamente quitado, com o número de registro no respectivo conselho profissional e os campos de assinatura preenchidos pelo profissional responsável, juntamente com os demais documentos indispensáveis já exigidos no pedido.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Não anexou planta da situação",
    corpo:
      "A documentação da planta de situação não foi apresentada. É necessário anexar este documento contendo a distância entre o centro de medição e o poste da Cemig, a distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima e a representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores, juntamente com os demais documentos indispensáveis já exigidos no pedido.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Não anexou termo de baixa atendimento em baixa tensão",
    corpo:
      "A documentação do termo de opção de atendimento em baixa tensão não foi apresentada. É necessário anexar este documento com todos os campos obrigatórios devidamente preenchidos e assinados pelo responsável técnico, juntamente com os demais documentos indispensáveis já exigidos no pedido.\n\nAcesse o termo no site: https://www.cemig.com.br/demandas-especificas",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Documentação incompleta / ausente - Rural",
    titulo: "Não apresentou documento de posse",
    corpo:
      "Após análise da documentação apresentada, identificou-se a ausência de comprovação de posse ou propriedade do imóvel rural, elemento obrigatório para prosseguimento da solicitação de conexão nova e elaboração dos estudos necessários para apresentar as condições de atendimento à sua solicitação.\nPara atendimento em área rural, é necessário apresentar documento que comprove a posse legítima do imóvel, garantindo a regularidade da instalação e a vinculação do titular ao local solicitado.\nPara dar continuidade ao processo, é necessário apresentar um dos seguintes documentos:\n- Escritura pública;\n- Contrato de compra e venda;\n- Contrato de arrendamento;\n- Termo de doação;\n- Outro documento formal que comprove a posse ou propriedade do imóvel.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Documentação incompleta / ausente - Rural",
    titulo: "Documento de posse não consta nome do solicitante",
    corpo:
      "Após análise da documentação apresentada, constatou-se que o documento de posse anexado não está emitido em nome do solicitante, o que inviabiliza a comprovação da legitimidade da ocupação do imóvel rural.\nPara atendimento em área rural, é obrigatória a apresentação de documento que comprove a posse ou propriedade do imóvel em nome do titular da solicitação. A ausência dessa vinculação impede o prosseguimento da análise técnica e a formalização do atendimento.\nPara dar continuidade ao processo, é necessário apresentar:\nDocumento de posse ou propriedade do imóvel rural (escritura pública, registro de imóvel, contrato de compra e venda, contrato de locação, termo de doação, entre outros), devidamente emitido em nome do solicitante.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Documentação incompleta / ausente - Urbano",
    titulo: "Comprovou posse, mas não comprovou regularidade",
    corpo:
      "Após análise da documentação apresentada, constatou-se que, embora tenha sido comprovada a posse do imóvel urbano, não foi apresentada documentação que comprove a regularidade da edificação perante o poder público municipal, o que inviabiliza a elaboração dos estudos necessários para apresentar as condições de atendimento à sua solicitação.\nPara atendimento em área urbana, é obrigatória a apresentação de documento que comprove a regularidade da construção, como forma de garantir a conformidade urbanística e a segurança da instalação elétrica.\nPara dar continuidade ao processo, é necessário apresentar um dos seguintes documentos:\n- Certidão de número;\n- Habite-se;\n- IPTU;\n- Registro de imóvel;\n- Escritura pública;\n- Alvará de construção;\nA ausência de qualquer desses documentos impede a formalização do atendimento solicitado.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Documentação incompleta / ausente - Urbano",
    titulo: "Comprovou regularidade, mas não comprovou posse",
    corpo:
      "Após análise da documentação apresentada, constatou-se que, embora tenha sido comprovada a regularidade da edificação urbana por meio de documento válido, não foi apresentada comprovação de posse ou propriedade do imóvel em nome do solicitante.\nPara atendimento em área urbana, é obrigatória a apresentação de documento que comprove a posse legítima do imóvel, vinculando o titular da solicitação ao local onde se pretende a conexão.\nPara dar continuidade ao processo, é necessário apresentar um dos seguintes documentos em nome do solicitante:\n- Escritura pública;\n- Registro de imóvel;\n- Contrato de compra e venda;\n- Contrato de locação;\n- Termo de doação;\n- Outro documento formal que comprove a posse ou propriedade.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "Documentação incompleta / ausente - Urbano",
    titulo: "Documento de posse não consta nome do solicitante",
    corpo:
      "Após análise da documentação apresentada, constatou-se que o documento de posse anexado não está emitido em nome do solicitante, o que inviabiliza a comprovação da legitimidade da ocupação do imóvel urbano.\nPara atendimento em área urbana, é obrigatória a apresentação de documento que comprove a posse ou propriedade do imóvel em nome do titular da solicitação. A ausência dessa vinculação impede o prosseguimento da análise técnica e a formalização do atendimento.\nPara dar continuidade ao processo, é necessário apresentar:\nDocumento de posse ou propriedade do imóvel urbano (escritura pública, registro de imóvel, contrato de compra e venda, contrato de locação, termo de doação, entre outros), devidamente emitido em nome do solicitante.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "",
    titulo: "Não apresentou formulário de carga",
    corpo:
      "O formulário de orçamento de conexão/alteração de carga urbana ou rural não foi apresentado. É obrigatório o preenchimento deste documento, com a indicação das características da instalação elétrica e da carga prevista, para que seja possível a elaboração do orçamento e definição das condições de conexão, juntamente com os demais documentos indispensáveis já exigidos no pedido.\n\nO formulário está disponível no site: https://www.cemig.com.br/demandas-especificas",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "",
    titulo: "Documentação fraudada",
    corpo:
      "Após a análise da documentação apresentada, foram identificadas inconsistências formais que comprometem a sua validade, impossibilitando a continuidade da análise técnica.\nPara que os documentos sejam aceitos, é imprescindível que atendam aos seguintes requisitos:\n- Autenticidade: Devem ser originais ou cópias autenticadas, emitidos por fontes oficiais ou profissionais legalmente habilitados.\n- Integridade: Não podem apresentar rasuras, alterações ou elementos que impeçam a verificação da veracidade.\n- Conformidade: Devem estar de acordo com os critérios estabelecidos para o tipo de solicitação em análise.\nA presença de informações ou características que inviabilizem a validação da origem ou da conformidade dos documentos impede a continuidade do processo.\nPara dar prosseguimento ao atendimento, será necessário reapresentar a documentação completa, válida e regular, conforme as exigências aplicáveis.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "",
    titulo: "Pedido de empresa sem vínculo com pessoa física",
    corpo:
      "Após análise da documentação apresentada, identificou-se que o pedido foi realizado em nome de pessoa jurídica, sem que tenha sido comprovado vínculo formal com o solicitante pessoa física.\nPara atendimento em nome de empresa, é obrigatória a apresentação de documentação que comprove a relação entre o representante e a pessoa jurídica titular da solicitação. A ausência dessa comprovação impede a validação da legitimidade do pedido e o prosseguimento da análise técnica.\nPara dar continuidade ao processo, é necessário apresentar:\n- Documento oficial da empresa (contrato social, estatuto ou equivalente);\n- Procuração ou autorização formal emitida pela empresa, com firma reconhecida, vinculando o solicitante pessoa física à pessoa jurídica requerente;\n- Documento de identificação do representante legal ou procurador.",
  },
  {
    grupo: "Carga e afins",
    sub: "Disjuntor incompatível com a carga",
    titulo: "Disjuntor bifásico",
    corpo:
      "O disjuntor especificado é incompatível com a carga ou a demanda informada. Conforme a Tabela 3 — Dimensionamento para Unidades Consumidoras Urbanas ou Rurais Atendidas por Redes de Distribuição Primárias Monofásicas (120/240 V) — Ligações de Baixa Tensão a 2 e 3 Fios, como consta na Norma de Distribuição ND-5.1 - Fornecimento de Energia Elétrica em Tensão Secundária - Rede de Distribuição Aérea - Edificações Individuais.\nO dimensionamento do disjuntor deve observar a corrente nominal compatível com a demanda calculada para a unidade consumidora, os critérios de proteção e seletividade necessários à garantia da segurança da instalação e da integridade do sistema elétrico, e os limites estabelecidos para cada faixa de carga, conforme especificado na tabela normativa.\nA especificação de um disjuntor com capacidade inferior ou superior à prevista pode resultar em sobrecarga, disparos indevidos ou falhas na proteção, comprometendo a conformidade técnica e a segurança da instalação.\n\nAcesse o nosso site e faça a simulação do Disjuntor: https://www.cemig.com.br/demandas-especificas",
  },
  {
    grupo: "Carga e afins",
    sub: "Disjuntor incompatível com a carga",
    titulo: "Disjuntor trifásico",
    corpo:
      "O disjuntor especificado é incompatível com a carga ou a demanda informada. Conforme a Tabela 2 — Dimensionamento para Unidades Consumidoras Urbanas ou Rurais Atendidas por Redes de Distribuição Secundárias Trifásicas.\nO dimensionamento do disjuntor deve observar a corrente nominal adequada à demanda calculada para a unidade consumidora, os critérios de proteção e seletividade necessários à garantia da proteção contra sobrecargas e curtos-circuitos e as faixas de capacidade definidas para cada nível de carga, conforme estabelecido na tabela normativa.\nA especificação de um disjuntor com capacidade inferior ou superior à prevista pode resultar em sobrecarga, disparos indevidos ou falhas na proteção, comprometendo a conformidade técnica e a segurança da instalação.\n\nAcesse o nosso site e faça a simulação do Disjuntor: https://www.cemig.com.br/demandas-especificas",
  },
  {
    grupo: "Carga e afins",
    sub: "Disjuntor incompatível com a carga",
    titulo: "Coletivo",
    corpo:
      "O disjuntor especificado não está adequado à demanda informada. O disjuntor geral tem a função de proteger exclusivamente as unidades consumidoras da edificação, sendo fundamental que a corrente nominal esteja compatível com a carga calculada.\n\nSerá necessário adequar a proteção geral às especificações normativas, considerando a demanda total da edificação e os parâmetros definidos na Norma de Distribuição ND-5.2 - Fornecimento de Energia Elétrica em Tensão Secundária - Rede de Distribuição Aérea - Edificações Coletivas.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Endereço da unidade consumidora não informado",
    corpo:
      "O formulário de orçamento de conexão/alteração de carga urbana ou rural foi preenchido sem o endereço da unidade consumidora. A ausência dessa informação inviabiliza a identificação precisa do local, comprometendo a análise técnica e o planejamento da conexão à rede elétrica.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Número de fases preenchido incorretamente",
    corpo:
      "O formulário de orçamento de conexão/alteração de carga urbana ou rural foi preenchido sem a indicação do número de fases da unidade consumidora. Essa informação é indispensável para garantir a compatibilidade entre os equipamentos de proteção, o padrão de entrada e a rede de distribuição.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Nome do solicitante informado no formulário divergente do documento de posse",
    corpo:
      "O formulário apresenta nome do solicitante divergente do que consta no documento de posse do imóvel. É necessário anexar documento de posse ou propriedade emitido em nome do solicitante, ou, ainda, procuração com firma reconhecida, acompanhada de documento oficial de identificação do procurador.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Disjuntor descontinuado",
    corpo:
      "O disjuntor informado no formulário está em desacordo com os padrões técnicos exigidos. O modelo de disjuntor NEMA não é aceito para novas conexões. É necessário preencher o formulário com disjuntor IEC, em conformidade com as especificações compatíveis com os dispositivos de proteção e medição homologados pela Cemig.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Entrou com pedido individual o correto seria pedido coletivo",
    corpo:
      "O pedido foi cadastrado para um padrão de apenas uma caixa, sendo necessária a solicitação de conexão para um padrão coletivo. Ressaltamos que essa modalidade exige que o pedido seja cadastrado no sistema APRWEB por um responsável técnico habilitado, acompanhado de toda a documentação técnica específica, a seguir:\n\n- Termo de opção de atendimento em baixa tensão, quando aplicável;\n- Formulário de orçamento de conexão/alteração de carga urbana ou rural, devidamente preenchido;\n- Planta de situação contendo a distância entre o centro de medição e o poste da Cemig, a distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima e a representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores;\n- Anotação de Responsabilidade Técnica (ART) paga, com o número de registro no respectivo conselho profissional e os campos de assinatura devidamente preenchidos pelo profissional responsável.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Não informou disjuntor",
    corpo:
      "O formulário de orçamento de conexão foi preenchido de forma incompleta, sem a indicação do disjuntor previsto para a instalação. A especificação do disjuntor é obrigatória para avaliação da proteção da unidade consumidora, sendo essencial para o correto dimensionamento da infraestrutura e garantia de segurança na conexão.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Não informou a carga instalada",
    corpo:
      "O formulário de orçamento de conexão não apresenta a indicação da carga instalada na unidade consumidora. Essa informação é obrigatória para a avaliação da proteção da unidade consumidora, além de ser necessária para o correto dimensionamento da infraestrutura e a análise da viabilidade técnica do atendimento.",
  },
  {
    grupo: "Carga e afins",
    sub: "",
    titulo: "Seletividade",
    corpo:
      "O projeto de padrão coletivo não atende aos critérios de seletividade entre os dispositivos de proteção instalados. A seletividade é uma exigência técnica para instalações com múltiplas unidades consumidoras, indispensável para garantir que, em caso de falha ou sobrecarga, apenas o circuito afetado seja desligado, preservando o funcionamento das demais unidades.\nSolicitamos que atualize o projeto, assegurando a seletividade entre os disjuntores gerais e individuais, bem como a revisão do formulário de orçamento de conexão e da Anotação de Responsabilidade Técnica (ART) para compatibilidade com o projeto revisado, juntamente com os demais documentos indispensáveis já exigidos no pedido.",
  },
  {
    grupo: "Carga e afins",
    sub: "Solicitação incompatível com a rede",
    titulo: "Disjuntor bipolar acima do bipolar de 63 A em rede trifásica",
    corpo:
      "O disjuntor informado no formulário é incompatível com a rede trifásica. Solicitamos a consulta à Tabela 2 — Dimensionamento para Unidades Consumidoras Urbanas ou Rurais Atendidas por Redes de Distribuição Secundárias Trifásicas — da Norma de Distribuição ND-5.1, e a consequente atualização do formulário em conformidade com a relação de carga instalada no local.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "LN - Extensão de rede",
    corpo:
      "A conexão foi solicitada, nas coordenadas {coord}, em área de abrangência da unidade de conservação {unidade}. Para que a Cemig solicite a autorização do órgão ambiental responsável, é necessário encaminhar a escritura do imóvel e/ou a Certidão de Inteiro Teor da matrícula do imóvel e, tratando-se de propriedade rural, o Cadastro Ambiental Rural (CAR), juntamente com os demais documentos indispensáveis já exigidos no pedido.\nRessaltamos que, a critério do órgão ambiental responsável pela área de conservação, outros documentos e informações complementares poderão ser solicitados posteriormente.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "LN - Extensão de rede UC Municipal",
    corpo:
      "O ponto de ligação está localizado na área de abrangência da Unidade de Conservação: APA Municipal Piranga. Neste caso a CEMIG necessitará solicitar autorização do órgão responsável pela administração Unidade de Conservação, para a execução de obras/projetos de extensão de rede de distribuição de energia elétrica. Visando subsidiar a análise do órgão ambiental, o requerente deve apresentar os seguintes documentos:\n- Comprovação de regularização fundiária: A exemplo: Escritura do Imóvel e/ou Certidão de Inteiro Teor da matrícula do imóvel, CAR - Cadastro Ambiental Rural (quando se tratar de propriedade rural) e/ou Declaração da Prefeitura atestando a regularização do imóvel perante o município.\nA critério do órgão ambiental responsável pela administração da Unidade de Conservação, outros documentos e informações complementares poderão ser solicitadas posteriormente.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "LN - UC Municipal",
    corpo:
      "O ponto de ligação está localizado na área de abrangência de Unidade de Conservação: APA Municipal Piranga Para que o cliente obtenha a ligação de energia elétrica, é necessário apresentar:\n- Comprovação de regularização fundiária: A exemplo: Escritura do Imóvel e/ou Certidão de Inteiro Teor da matrícula do imóvel, CAR - Cadastro Ambiental Rural (quando se tratar de propriedade rural), e/ou Declaração da Prefeitura atestando a regularização do imóvel perante o município.\nA critério do órgão ambiental responsável pela administração da Unidade de Conservação, outros documentos e informações complementares poderão ser solicitadas posteriormente.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "LN - EXTENSÃO - Zona de amortecimento",
    corpo:
      "A conexão foi solicitada, nas coordenadas {coord}, em área de zona de amortecimento da unidade de conservação {unidade}. Para que a Cemig solicite a autorização do órgão ambiental responsável, é necessário encaminhar a escritura do imóvel e/ou a Certidão de Inteiro Teor da matrícula do imóvel e, tratando-se de propriedade rural, o Cadastro Ambiental Rural (CAR), juntamente com os demais documentos indispensáveis já exigidos no pedido.\nRessaltamos que, a critério do órgão ambiental responsável pela área de conservação, outros documentos e informações complementares poderão ser solicitados posteriormente.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "LN - Zona de amortecimento rede a porta",
    corpo:
      "O ponto de ligação está localizado na área de abrangência de Unidade de Conservação: APA Federal Morro da Pedreira.\nPara que o cliente obtenha a ligação de energia elétrica, é necessário apresentar:\n- Comprovação de regularização fundiária: A exemplo: Escritura do Imóvel e/ou Certidão de Inteiro Teor da matrícula do imóvel, e o CAR - Cadastro Ambiental Rural (quando se tratar de propriedade rural).\nA critério do órgão ambiental responsável pela administração da Unidade de Conservação, outros documentos e informações complementares poderão ser solicitadas posteriormente.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "Rede a porta Urbano",
    corpo:
      "A conexão foi solicitada, nas coordenadas {coord}, em área de abrangência da unidade de conservação {unidade}. É necessário apresentar documento de registro do imóvel, certidão de número ou autorização emitida pelo órgão ambiental, juntamente com os demais documentos indispensáveis já exigidos no pedido.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "APP",
    corpo:
      "A conexão foi solicitada, nas coordenadas {coord}, para uma área de preservação permanente. É necessário apresentar um dos documentos a seguir: Termo de Ajustamento de Conduta, comprovação de uso antrópico consolidado, declaração de interesse social ou utilidade pública, no caso de propriedade rural ou simples declaração do órgão ambiental, juntamente com os demais documentos indispensáveis já apresentados no seu pedido.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "Reserva legal Proposta",
    corpo:
      "A conexão foi solicitada, nas coordenadas {coord}, em área de interesse de preservação ambiental de uma reserva legal, nos termos da Lei Federal nº 12.651/2012. Informamos que a Cemig não pode realizar o fornecimento de energia elétrica até que a situação seja regularizada pelos órgãos competentes.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "Reserva legal averbada",
    corpo:
      "A conexão foi solicitada, nas coordenadas {coord}, em área de reserva legal averbada, de interesse de preservação ambiental, nos termos da Lei Federal nº 12.651/2012. Informamos que a Cemig não pode realizar o fornecimento de energia elétrica para este local.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "Parcelamento com característica de chacreamento",
    corpo:
      "Após a análise das informações disponibilizadas, foi identificado que o imóvel encontra-se localizado em área caracterizada como parcelamento de solo com características de chacreamento. Nessa condição, o atendimento somente pode prosseguir mediante comprovação de regularidade do empreendimento perante os órgãos competentes. Constatou-se ainda que a liberação de carga emitida anteriormente não corresponde às exigências aplicáveis a esse tipo de área, razão pela qual não deve ser considerada.\nA continuidade do processo depende da apresentação de documentação que comprove a aprovação formal do parcelamento, bem como a regularidade ambiental e urbanística, assegurando que a área é apta a receber o fornecimento de energia elétrica. Assim, o atendimento permanece suspenso até a apresentação dos documentos obrigatórios.\nPara dar prosseguimento à análise, deverão ser apresentados:\n- Planta georreferenciada do empreendimento, em escala 1:1000;\n- Lei e/ou Decreto Municipal que comprove a aprovação do parcelamento;\n- Licença ambiental ou declaração de não passível de licenciamento, emitida pelo órgão competente;\n- Manifestação favorável da Prefeitura Municipal.",
  },
];
