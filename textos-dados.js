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
      "Em análise a solicitação e da documentação apresentada, não foi possível identificar com precisão a área correspondente à nova unidade consumidora solicitada. A correta localização do ponto de conexão é essencial para a avaliação dos aspectos técnicos e ambientais, definição da obra de menor custo global e atribuição adequada das responsabilidades financeiras entre as partes envolvidas.\nSolicitamos a complementação das informações de localização da propriedade apresentando o CAR \"Cadastro Ambiental Rural\" para identificação do ponto de atendimento. Caso seja possível localizar a área da propriedade, mas não o ponto exato do imóvel, será considerado como local de instalação do padrão o ponto no limite da propriedade cuja obra represente o menor custo global. Ressaltamos que, conforme inciso II do artigo 68 da REN ANEEL nº 1000/2021, o consumidor pode indicar um ponto de conexão de interesse, apresentando as coordenadas, o qual será objeto de análise de viabilidade técnica e econômica por parte da distribuidora.",
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
      "Após análise da documentação apresentada, não foi possível identificar com precisão a área correspondente à nova unidade consumidora solicitada. Verificamos ainda que a referência ou coordenada informada pertence a um município distinto daquele indicado no pedido, o que impossibilita a confirmação da localização exata para atendimento. A correta localização do ponto de conexão é essencial para a avaliação dos aspectos técnicos e ambientais, definição da obra de menor custo global e atribuição adequada das responsabilidades financeiras entre as partes envolvidas.\nSolicitamos, portanto, a complementação das informações de localização da propriedade. Caso seja possível localizar a área da propriedade, mas não o ponto exato do imóvel, será considerado como local de instalação do padrão o ponto no limite da propriedade cuja obra represente o menor custo global.\nRessaltamos que, conforme inciso II do artigo 68 da REN ANEEL nº 1000/2021, o consumidor pode indicar um ponto de conexão de interesse, o qual será objeto de análise de viabilidade técnica e econômica por parte da distribuidora.",
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
      "Após análise da documentação apresentada, identificou-se a necessidade de formalização do pedido como padrão coletivo.\nConsiderando as características da instalação, que envolvem múltiplas unidades consumidoras, o atendimento deve ser realizado por meio de padrão coletivo. Essa modalidade exige que o pedido seja cadastrado no sistema APRWEB por Responsável Técnico (RT) habilitado, acompanhado da documentação técnica específica.\nPara dar continuidade à análise, é necessário que um Responsável Técnico (RT) habilitado realize o cadastro do pedido no sistema APRWEB, acompanhado dos seguintes documentos:\n - Termo de Opção de Atendimento em Baixa Tensão, quando aplicável;\n - Formulário de Orçamento de Conexão/Alteração de Carga Urbana ou Rural, devidamente preenchido;\n - Planta de Situação/Locação, contendo: Distância entre o centro de medição e o poste da Cemig; Distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima; Representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores;\n - Anotação de Responsabilidade Técnica (ART) paga, Número de registro no respectivo conselho profissional, Campos de assinatura devidamente preenchidos pelo profissional responsável.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Carga acima de 75 kW sem cadastro no APR Web",
    corpo:
      "Após análise da documentação apresentada, identificou-se que a carga instalada superior a 75 kW exige procedimento específico.\nPara solicitações de atendimento com carga instalada superior a 75 kW, é obrigatória a atuação de um Responsável Técnico (RT) habilitado, que deve cadastrar o pedido no sistema APRWEB, acompanhado da documentação técnica necessária.\nPara que a distribuidora possa analisar e apresentar as condições técnicas de atendimento, é imprescindível que o pedido seja cadastrado no sistema APRWEB pelo RT, acompanhado da seguinte documentação:\nTermo de Opção de Atendimento em Baixa Tensão, quando aplicável;\nFormulário de Orçamento de Conexão/Alteração de Carga Urbana ou Rural, devidamente preenchido;\nPlanta de Situação/Locação, contendo:\n- Termo de Opção de Atendimento em Baixa Tensão, quando aplicável;\n- Formulário de Orçamento de Conexão/Alteração de Carga Urbana ou Rural, devidamente preenchido;\n- Planta de Situação/Locação, contendo: Distância entre o centro de medição e o poste da Cemig; Distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima; Representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores;\n- Anotação de Responsabilidade Técnica (ART) paga, Número de registro no respectivo conselho profissional, Campos de assinatura devidamente preenchidos pelo profissional responsável.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Não anexou ART",
    corpo:
      "Após análise da documentação apresentada, identificou-se a ausência da Anotação de Responsabilidade Técnica (ART), documento obrigatório para prosseguimento da solicitação.\nA ART é indispensável para comprovar a responsabilidade técnica sobre o projeto e garantir a conformidade com os requisitos de segurança e qualidade exigidos pela distribuidora. Sua ausência inviabiliza a análise técnica do pedido.\nPara dar continuidade ao processo, é necessário apresentar:\nAnotação de Responsabilidade Técnica (ART) paga, contendo:\nNúmero de registro no respectivo conselho profissional;\nCampos de assinatura devidamente preenchidos pelo profissional responsável.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Não anexou planta da situação",
    corpo:
      "Após análise da documentação apresentada, identificou-se a ausência da planta de situação, elemento técnico obrigatório para avaliação da viabilidade de atendimento.\nA planta de situação é essencial para representar graficamente a localização da unidade consumidora em relação à rede existente, permitindo a verificação das distâncias envolvidas, acessos e demais condições técnicas necessárias para elaboração do orçamento de conexão.\nPara dar continuidade ao processo, é necessário apresentar a Planta de Situação/Locação, contendo:\n- Distância entre o centro de medição e o poste da Cemig;\n- Distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima;\n- Representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores.",
  },
  {
    grupo: "Parte documental / Fundiária",
    sub: "APR Web",
    titulo: "Não anexou termo de baixa atendimento em baixa tensão",
    corpo:
      "Após análise da documentação apresentada, identificou-se a ausência do Termo de Opção de Atendimento em Baixa Tensão, quando aplicável ao tipo de conexão solicitada.\nEsse documento é necessário para formalizar a escolha do atendimento em baixa tensão, especialmente em casos de carga instalada superior a 75 kW ou padrão coletivo, e deve ser emitido e assinado por Responsável Técnico (RT) habilitado.\nPara dar continuidade ao processo, é necessário apresentar:\n- Termo de Opção de Atendimento em Baixa Tensão, devidamente preenchido e assinado pelo RT responsável.",
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
      "Após análise da documentação apresentada, identificou-se a ausência do Formulário de Orçamento de Conexão/Alteração de Carga Urbana ou Rural, documento técnico obrigatório para avaliação da viabilidade de atendimento.\nEsse formulário é essencial para detalhar as características da instalação elétrica, incluindo a carga prevista, o tipo de fornecimento solicitado e demais informações técnicas necessárias para elaboração do orçamento e definição das condições de conexão.\nPara dar continuidade ao processo, é necessário apresentar:\nFormulário de Orçamento de Conexão/Alteração de Carga Urbana ou Rural, devidamente preenchido.",
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
      "Durante a análise da solicitação, verificou-se que o disjuntor especificado encontra-se incompatível com a carga e a demanda informadas.\nDe acordo com a Tabela 3 – Dimensionamento para Unidades Consumidoras Urbanas ou Rurais Atendidas por Redes de Distribuição Primárias Monofásicas (120/240 V) – Ligações de Baixa Tensão a 2 e 3 Fios, constante na Norma ND-5.1, o dimensionamento do disjuntor deve ser realizado considerando:\n- Corrente nominal compatível com a demanda calculada para a unidade consumidora;\n- Critérios de proteção e seletividade, garantindo a segurança da instalação e a integridade do sistema elétrico;\n- Limites estabelecidos para cada faixa de carga, conforme especificado na tabela normativa.\nA escolha de um disjuntor com capacidade inferior ou superior à prevista pode resultar em riscos como sobrecarga, disparos indevidos ou falhas na proteção, comprometendo a conformidade técnica e a segurança da instalação.\nPara dar continuidade ao processo, será necessário adequar o disjuntor às especificações normativas, observando a demanda informada e os parâmetros definidos na ND-5.1.",
  },
  {
    grupo: "Carga e afins",
    sub: "Disjuntor incompatível com a carga",
    titulo: "Disjuntor trifásico",
    corpo:
      "Durante a análise da solicitação, constatou-se que o disjuntor especificado se encontra incompatível com a carga e a demanda informadas.\nDe acordo com a Norma ND-5.1, especificamente a Tabela 2 – Dimensionamento para Unidades Consumidoras Urbanas ou Rurais Atendidas por Redes de Distribuição Secundárias Trifásicas, o dimensionamento do disjuntor deve observar:\n- Corrente nominal adequada à demanda calculada para a unidade consumidora;\n- Critérios de proteção e seletividade, assegurando a proteção contra sobrecargas e curtos-circuitos;\n- Faixas de capacidade definidas para cada nível de carga, conforme estabelecido na tabela normativa.\nA utilização de um disjuntor com capacidade inferior ou superior à prevista pode ocasionar sobrecarga, disparos indevidos ou falhas na proteção, comprometendo a segurança da instalação e a conformidade técnica.\nPara dar continuidade ao processo, será necessário adequar o disjuntor às especificações normativas, considerando a demanda informada e os parâmetros definidos na ND-5.1.",
  },
  {
    grupo: "Carga e afins",
    sub: "Disjuntor incompatível com a carga",
    titulo: "Coletivo",
    corpo:
      "Durante a análise da solicitação, verificou-se que o disjuntor geral informado não está adequado à demanda declarada.\nA proteção geral tem a função de proteger exclusivamente as unidades consumidoras da edificação, devendo ser dimensionada para suportar a demanda total prevista. É fundamental que a corrente nominal do disjuntor esteja compatível com a carga calculada, garantindo:\n- Segurança elétrica, evitando sobrecargas e riscos de incêndio;\n- Conformidade normativa, conforme critérios estabelecidos na ND-5.2;\n- Operação seletiva, permitindo que a proteção geral atue apenas em situações críticas, sem comprometer circuitos internos.\nImportante destacar que o disjuntor destinado à proteção do condomínio ou do sistema de combate a incêndio é instalado em paralelo ao quadro geral, atuando de forma independente, conforme exigências normativas.\nO disjuntor especificado deve estar de acordo com a Tabela 1 – Dimensionamento da Entrada de Serviço de Edificações de Uso Coletivo Atendidas por Redes de Distribuição Secundárias Trifásicas (127/220 V) – Ramal de Conexão Aéreo e Proteção Geral com Disjuntor, da Norma ND-5.2.\nPara dar continuidade ao processo, será necessário adequar a proteção geral às especificações normativas, considerando a demanda total da edificação e os parâmetros definidos na ND-5.2.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Endereço da unidade consumidora não informado",
    corpo:
      "Após análise da documentação apresentada, identificou-se que o Formulário de Orçamento de Conexão/Alteração de Carga Urbana ou Rural foi preenchido de forma incompleta, sem a indicação do endereço da unidade consumidora.\nA ausência dessa informação inviabiliza a identificação precisa do local de atendimento, comprometendo a análise técnica e o planejamento da conexão à rede elétrica.\nPara dar continuidade ao processo, é necessário reapresentar:\n- Formulário de Orçamento de Conexão/Alteração de Carga, devidamente preenchido, incluindo:\n  - Endereço completo da unidade consumidora;\n  - Demais campos obrigatórios conforme modelo vigente.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Número de fases preenchido incorretamente",
    corpo:
      "Após análise da documentação apresentada, identificou-se que o número de fases informado no Formulário de Orçamento de Conexão/Alteração de Carga está incorreto em relação à carga instalada e ao tipo de fornecimento solicitado.\nA definição do número de fases é essencial para o dimensionamento adequado da infraestrutura elétrica e para garantir a compatibilidade entre os equipamentos de proteção, o padrão de entrada e a rede de distribuição. A inconsistência entre esses dados inviabiliza a continuidade da análise técnica.\nPara dar prosseguimento ao processo, é necessário reapresentar:\n- Formulário de Orçamento de Conexão/Alteração de Carga, devidamente preenchido, com:\n  - Número de fases compatível com a carga instalada;\n  - Demais campos obrigatórios conforme modelo vigente;\n- Projeto elétrico atualizado, se aplicável;\n- Anotação de Responsabilidade Técnica (ART) compatível com o projeto revisado.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Nome do solicitante informado no formulário divergente do documento de posse",
    corpo:
      "Após análise da documentação apresentada, constatou-se divergência entre o nome do solicitante informado no pedido e o nome constante no documento de posse do imóvel.\nPara atendimento, é obrigatória a vinculação direta entre o titular da solicitação e o documento que comprove a posse ou propriedade do imóvel. A ausência dessa correspondência inviabiliza a validação da legitimidade do pedido e o prosseguimento da análise técnica.\nPara dar continuidade ao processo, é necessário apresentar:\n - Documento de posse ou propriedade emitido em nome do solicitante;\n - Procuração com firma reconhecida, acompanhada de documento oficial de identificação do procurador.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Disjuntor descontinuado",
    corpo:
      "Após análise do formulário apresentado identificou-se que o disjuntor especificado está em desacordo com os padrões técnicos exigidos para conexão nova ou alteração de carga.\nO modelo de disjuntor indicado (NEMA) não é aceito para novas conexões ou alterações de carga, conforme os critérios técnicos vigentes. O padrão atual exige o uso de disjuntores IEC conforme especificações compatíveis com os dispositivos de proteção e medição homologados pela distribuidora, garantindo segurança, seletividade e conformidade com os sistemas de proteção da rede.\nFavor verificar as informações e encaminhar um novo formulário de análise de carga, observando os critérios estabelecidos na norma de distribuição ND-5.1/5.2, possibilitando assim a realização dos estudos para apresentação das condições de atendimento da sua solicitação.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Entrou com pedido individual o correto seria pedido coletivo",
    corpo:
      "Após análise da documentação apresentada, identificou-se que o pedido foi formalizado como atendimento individual, embora as características da instalação indiquem a necessidade de padrão coletivo.\nEm situações que envolvem múltiplas unidades consumidoras em uma mesma edificação ou lote, o atendimento deve ser realizado por meio de padrão coletivo, com medição agrupada e infraestrutura compartilhada. Essa modalidade exige cadastro no sistema APRWEB por Responsável Técnico (RT) habilitado, acompanhado da documentação técnica específica.\nPara dar continuidade à análise, é necessário que um RT habilitado realize o cadastro do pedido como padrão coletivo no sistema APRWEB, acompanhado dos seguintes documentos:\n- Termo de Opção de Atendimento em Baixa Tensão, quando aplicável;\n- Formulário de Orçamento de Conexão/Alteração de Carga Urbana ou Rural, devidamente preenchido;\n- Planta de Situação/Locação, contendo: Distância entre o centro de medição e o poste da Cemig; Distância entre a edificação ou o poste da Cemig que irá atender a unidade até a esquina mais próxima; Representação de toda a área comum e de livre acesso entre as unidades consumidoras até o conjunto de medidores;\n- Anotação de Responsabilidade Técnica (ART) paga, com Número de registro no respectivo conselho profissional; Campos de assinatura devidamente preenchidos pelo profissional responsável.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Não informou disjuntor",
    corpo:
      "Após análise da documentação apresentada, identificou-se que o Formulário de Orçamento de Conexão/Alteração de Carga foi preenchido de forma incompleta, sem a indicação do disjuntor previsto para a instalação.\nA especificação do disjuntor é obrigatória para avaliação da proteção da unidade consumidora, sendo essencial para o correto dimensionamento da infraestrutura elétrica e para garantir a segurança da conexão.\nPara dar continuidade ao processo, é necessário reapresentar:\n- Formulário de Orçamento de Conexão/Alteração de Carga, devidamente preenchido, incluindo:\n- Tipo e corrente nominal do disjuntor;\n- Demais campos obrigatórios conforme modelo vigente.",
  },
  {
    grupo: "Carga e afins",
    sub: "Formulário de carga preenchido incorretamente",
    titulo: "Não informou a carga instalada",
    corpo:
      "Após análise da documentação apresentada, identificou-se que o Formulário de Orçamento de Conexão/Alteração de Carga foi preenchido de forma incompleta, sem a indicação da carga instalada na unidade consumidora.\nA informação da carga instalada é essencial para o dimensionamento correto da infraestrutura elétrica, definição do tipo de fornecimento e avaliação da viabilidade técnica do atendimento. A ausência desse dado inviabiliza a continuidade da análise.\nPara dar prosseguimento ao processo, é necessário reapresentar:\n- Formulário de Orçamento de Conexão/Alteração de Carga, devidamente preenchido, incluindo:\n  - Valor total da carga instalada (em kW);\n  - Demais campos obrigatórios conforme modelo vigente.",
  },
  {
    grupo: "Carga e afins",
    sub: "",
    titulo: "Seletividade",
    corpo:
      "Após análise da documentação apresentada, identificou-se que o projeto de padrão coletivo não atende aos critérios de seletividade entre os dispositivos de proteção instalados.\nA seletividade é uma exigência técnica para instalações com múltiplas unidades consumidoras, visando garantir que, em caso de falha ou sobrecarga, apenas o circuito afetado seja desligado, preservando o funcionamento das demais unidades. A ausência dessa característica compromete a segurança e a continuidade do fornecimento.\nPara dar continuidade ao processo, é necessário:\n- Readequar o projeto elétrico, garantindo a seletividade entre os disjuntores gerais e individuais;\n- Atualizar o Formulário de Orçamento de Conexão/Alteração de Carga, refletindo os ajustes realizados;\n- Reapresentar a Anotação de Responsabilidade Técnica (ART) compatível com o projeto revisado.",
  },
  {
    grupo: "Carga e afins",
    sub: "Solicitação incompatível com a rede",
    titulo: "Disjuntor bipolar acima do bipolar de 63 A em rede trifásica",
    corpo:
      "Após análise da documentação apresentada, identificou-se a especificação de disjuntor bipolar com corrente superior a 63 A em instalação atendida por rede trifásica.\nDisjuntores bipolares com corrente nominal superior a 63 A são aplicável exclusivamente a fornecimentos bifásicos. A utilização de disjuntor bipolar acima de 63 A em rede trifásica caracteriza incompatibilidade técnica e não é aceita para novas conexões ou alterações de carga.\nPara dar continuidade ao processo, é necessário:\n- Readequar o projeto elétrico, substituindo o disjuntor por modelo tripolar compatível com a carga instalada e com a rede de distribuição;\n- Atualizar o Formulário de Orçamento de Conexão/Alteração de Carga, refletindo a nova especificação;",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "LN - Extensão de rede",
    corpo:
      "O ponto de ligação está localizado na área de abrangência da Unidade de Conservação: APA Federal Morro da Pedreira. Neste caso a CEMIG necessitará solicitar autorização do órgão responsável pela administração Unidade de Conservação, para a execução de obras/projetos de extensão de rede de distribuição de energia elétrica. Visando subsidiar a análise do órgão ambiental, o requerente deve apresentar os seguintes documentos:\n- Comprovação de regularização fundiária: A exemplo: Escritura do Imóvel e/ou Certidão de Inteiro Teor da matrícula do imóvel, e o CAR - Cadastro Ambiental Rural (quando se tratar de propriedade rural).\nA critério do órgão ambiental responsável pela administração da Unidade de Conservação, outros documentos e informações complementares poderão ser solicitadas posteriormente.",
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
      "O ponto de ligação está localizado na área de abrangência da Zona de amortecimento da Unidade de Conservação: Parque Estadual da Serra do Papagaio.\nNeste caso a CEMIG necessitará solicitar autorização do órgão responsável pela administração Unidade de Conservação, para a execução de obras/projetos de extensão de rede de distribuição de energia elétrica.\nVisando subsidiar a análise do órgão ambiental, o requerente deve apresentar os seguintes documentos:\n- Comprovação de regularização fundiária: A exemplo: Escritura do Imóvel e/ou Certidão de Inteiro Teor da matrícula do imóvel, e o CAR - Cadastro Ambiental Rural (quando se tratar de propriedade rural).\nA critério do órgão ambiental responsável pela administração da Unidade de Conservação, outros documentos e informações complementares poderão ser solicitadas posteriormente.",
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
      "O ponto encontra-se dentro da área de abrangência da APA Federal Morro da Pedreira, para que o cliente seja ligado é necessário apresentação de documento de registro do imóvel ou Certidão de Número (ou autorização emitida pelo órgão ambiental atestando conformidade ambiental. Consultar o município ou o órgão ambiental competente caso necessário.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "APP",
    corpo:
      "Como o imóvel de V.Sa. está localizado dentro de uma APP, para que possamos dar continuidade ao seu atendimento, V.Sa. deverá comprovar à Cemig que sua residência ou benfeitoria na coordenada (*762113:7989433*), encontra-se regular através de um dos documentos a seguir: Termo de Ajustamento de Conduta, Comprovação de Uso Antrópico Consolidado, Declaração de Interesse Social ou Utilidade Pública, no caso de propriedade rural ou Simples Declaração do órgão ambiental.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "Reserva legal Proposta",
    corpo:
      "Em atendimento à sua solicitação de fornecimento de energia elétrica, identificamos tratar-se de áreas de interesse de preservação ambiental, a exemplo de uma reserva legal, definidas pela lei federal 12.651/2012. Informamos que não podemos realizar o fornecimento de energia elétrica a essa unidade consumidora até que a situação seja regularizada pelos órgãos competentes.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "Reserva legal averbada",
    corpo:
      "Em atendimento à sua solicitação, identificamos que o ponto para a ligação de energia elétrica encontra-se em uma área de reserva legal averbada de interesse de preservação ambiental, definidas pela lei federal 12.651/2012. Sendo assim não podemos realizar o fornecimento de energia elétrica a essa unidade consumidora.",
  },
  {
    grupo: "Ambiental",
    sub: "",
    titulo: "Parcelamento com característica de chacreamento",
    corpo:
      "Após a análise das informações disponibilizadas, foi identificado que o imóvel encontra-se localizado em área caracterizada como parcelamento de solo com características de chacreamento. Nessa condição, o atendimento somente pode prosseguir mediante comprovação de regularidade do empreendimento perante os órgãos competentes. Constatou-se ainda que a liberação de carga emitida anteriormente não corresponde às exigências aplicáveis a esse tipo de área, razão pela qual não deve ser considerada.\nA continuidade do processo depende da apresentação de documentação que comprove a aprovação formal do parcelamento, bem como a regularidade ambiental e urbanística, assegurando que a área é apta a receber o fornecimento de energia elétrica. Assim, o atendimento permanece suspenso até a apresentação dos documentos obrigatórios.\nPara dar prosseguimento à análise, deverão ser apresentados:\n- Planta georreferenciada do empreendimento, em escala 1:1000;\n- Lei e/ou Decreto Municipal que comprove a aprovação do parcelamento;\n- Licença ambiental ou declaração de não passível de licenciamento, emitida pelo órgão competente;\n- Manifestação favorável da Prefeitura Municipal.",
  },
];
