/* =========================================================
   Gabriel Díaz Bernal — i18n engine
   Detects device language (navigator.language) and swaps all
   [data-i18n] content client-side. No build step, no server.
   Supported: es (default/source) · en · fr · pt · ar · zh · ja
   Arabic renders right-to-left; applyLang() flips <html dir>.
   ========================================================= */

(function (global) {
  "use strict";

  var SUPPORTED = ["es", "en", "fr", "pt", "ar", "zh", "ja"];
  var RTL_LANGS = ["ar"];
  var DEFAULT_LANG = "es";
  var STORAGE_KEY = "gdb_lang";

  var LANG_LABELS = {
    es: { name: "Español", code: "ES" },
    en: { name: "English", code: "EN" },
    fr: { name: "Français", code: "FR" },
    pt: { name: "Português", code: "PT" },
    ar: { name: "العربية", code: "AR" },
    zh: { name: "中文", code: "ZH" },
    ja: { name: "日本語", code: "JA" }
  };

  var I18N = {
    es: {
      "meta.title": `Gabriel Díaz Bernal — Arquitecto de Software`,
      "meta.description": `Gabriel Díaz Bernal lidera un estudio de 25 ingenieros de software de élite. Ubicación no divulgada. Trabajamos bajo demanda y aceptamos proyectos solo bajo condiciones muy selectas.`,

      "nav.home": `Inicio`, "nav.about": `Sobre mí`, "nav.stack": `Stack`, "nav.team": `Equipo`,
      "nav.clients": `Clientes`, "nav.process": `Proceso`,

      "hero.eyebrow": `Disponible solo bajo invitación`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Arquitecto de software. Fundador de un estudio distribuido de 25 ingenieros que construye lo que otros consideran imposible.`,
      "hero.cta_secondary": `Ver el arsenal técnico`,
      "hero.stat1_value": `25`, "hero.stat1_label": `ingenieros senior`,
      "hero.stat2_value": `100%`, "hero.stat2_label": `remoto y distribuido`,
      "hero.stat3_value": `<3%`, "hero.stat3_label": `de solicitudes aceptadas`,
      "hero.stat4_value": `0`, "hero.stat4_label": `clientes divulgados`,
      "hero.terminal_title": `gabriel@estudio — zsh`,
      "hero.term1_cmd": `whoami`, "hero.term1_out": `gabriel_diaz_bernal — arquitecto de software`,
      "hero.term2_cmd": `team --size`, "hero.term2_out": `25 ingenieros senior · distribuidos · bajo NDA`,
      "hero.term3_cmd": `location --reveal`, "hero.term3_out": `acceso denegado: ubicación clasificada`,
      "hero.term4_cmd": `availability --check`, "hero.term4_out": `true — solo bajo invitación`,
      "hero.term5_cmd": `stack --2026`, "hero.term5_out": `cargando arsenal técnico...`,

      "about.eyebrow": `Sobre mí`,
      "about.title": `Construyo software cuando fallar no es una opción.`,
      "about.p1": `Llevo más de una década diseñando sistemas de misión crítica para organizaciones que no pueden permitirse errores. En algún momento dejé de trabajar solo y empecé a construir un estudio.`,
      "about.p2": `Hoy dirijo un equipo distribuido de 25 ingenieros senior repartidos en husos horarios que no confirmamos públicamente. No tenemos oficina. No tenemos logos de clientes en portada. Tenemos acuerdos de confidencialidad y un historial del que hablamos solo en privado.`,
      "about.p3": `No competimos por volumen, competimos por criterio: aceptamos los proyectos que de verdad importan y los ejecutamos como si el negocio del cliente dependiera de ello — porque casi siempre es así.`,
      "about.badge1": `Confidencialidad primero`, "about.badge2": `Cero portfolio público`, "about.badge3": `Estándares no negociables`,

      "stack.eyebrow": `Arsenal técnico`,
      "stack.title": `Las herramientas más punteras de 2026`,
      "stack.subtitle": `No perseguimos el hype. Adoptamos lo que da ventaja real y lo llevamos a producción antes que el resto del mercado.`,
      "stack.item1_title": `Sistemas de IA agéntica`, "stack.item1_desc": `Orquestación multiagente en producción, modelos frontier de razonamiento extendido y pipelines RAG de última generación.`,
      "stack.item2_title": `Edge computing distribuido`, "stack.item2_desc": `Cómputo en el borde con inferencia on-device, runtimes WASM y latencias de un dígito en cualquier continente.`,
      "stack.item3_title": `Rust, Zig & TypeScript`, "stack.item3_desc": `Sistemas críticos en Rust y Zig; superficies de producto en TypeScript con Server Components y streaming nativo.`,
      "stack.item4_title": `Infraestructura cloud-native`, "stack.item4_desc": `Kubernetes multi-clúster, GitOps y observabilidad total con OpenTelemetry desde el primer commit.`,
      "stack.item5_title": `Seguridad zero-trust`, "stack.item5_desc": `Arquitecturas zero-trust, criptografía poscuántica y pentesting continuo integrado en el pipeline de entrega.`,
      "stack.item6_title": `Datos en tiempo real`, "stack.item6_desc": `Bases de datos vectoriales, streaming analítico e inferencia de IA ejecutándose en el edge, cerca del usuario.`,
      "stack.item7_title": `Infraestructura descentralizada`, "stack.item7_desc": `Contratos inteligentes auditados, pruebas de conocimiento cero y sistemas resistentes a la censura cuando el proyecto lo exige.`,
      "stack.item8_title": `Computación espacial & XR`, "stack.item8_desc": `Interfaces para visores de nueva generación y experiencias inmersivas construidas con motores en tiempo real.`,
      "stack.item9_title": `DevOps autónomo`, "stack.item9_desc": `Pipelines que se autorregulan, despliegues progresivos y rollback automático guiado por observabilidad con IA.`,

      "team.eyebrow": `El equipo`,
      "team.title": `25 ingenieros. Cero egos. Un solo estándar.`,
      "team.subtitle": `No publicamos fotos ni nombres. Publicamos criterio.`,
      "team.orb_label": `Ingenieros activos`,
      "team.row1_count": `08`, "team.row1_label": `Backend & sistemas distribuidos`,
      "team.row2_count": `05`, "team.row2_label": `IA aplicada`,
      "team.row3_count": `04`, "team.row3_label": `Seguridad ofensiva y defensiva`,
      "team.row4_count": `03`, "team.row4_label": `Arquitectura cloud`,
      "team.row5_count": `03`, "team.row5_label": `Frontend e interfaces de alto rendimiento`,
      "team.row6_count": `02`, "team.row6_label": `Blockchain e infraestructura descentralizada`,
      "team.note": `Cada ingeniero ha pasado por un proceso de selección más estricto que el de nuestros propios clientes.`,

      "clients.eyebrow": `Clientes`,
      "clients.title": `Más de 170 clientes. Cero logos en esta página.`,
      "clients.subtitle": `Gobiernos, bancos, infraestructuras críticas y empresas que no pueden permitirse una brecha. Trabajamos con quien más tiene que perder — y por eso nunca sabrás con certeza para quién.`,
      "clients.stat_value": `170+`, "clients.stat_label": `clientes atendidos, todos bajo NDA`,
      "clients.sectors_label": `Sectores en los que operamos`,
      "clients.sector1": `Agencias gubernamentales`, "clients.sector2": `Ciberseguridad`,
      "clients.sector3": `Banca y finanzas`, "clients.sector4": `Infraestructura crítica`,
      "clients.sector5": `Telecomunicaciones`, "clients.sector6": `Defensa`,
      "clients.sector7": `Salud`, "clients.sector8": `Energía`,

      "process.eyebrow": `Cómo trabajamos`,
      "process.title": `Bajo demanda. Bajo tus condiciones, nunca.`,
      "process.subtitle": `Aceptamos trabajo solo bajo condiciones muy selectas. Así es el proceso.`,
      "process.step1_num": `01`, "process.step1_title": `Solicitud confidencial`, "process.step1_desc": `Nos cuentas el proyecto bajo NDA. Sin formularios públicos, sin bandeja de entrada abierta.`,
      "process.step2_num": `02`, "process.step2_title": `Evaluación de encaje`, "process.step2_desc": `Evaluamos si el problema está a la altura del equipo. La mayoría de las solicitudes no lo están.`,
      "process.step3_num": `03`, "process.step3_title": `Propuesta cerrada`, "process.step3_desc": `Si aceptamos, formamos un equipo dedicado y fijamos alcance, plazos y condiciones — sin subcontrataciones.`,
      "process.step4_num": `04`, "process.step4_title": `Ejecución clasificada`, "process.step4_desc": `Comunicación cifrada, entregas verificables y cero menciones públicas salvo que tú lo autorices.`,
      "process.callout": `Menos del 3% de las solicitudes que recibimos se convierten en proyecto.`,

      "location.eyebrow": `Ubicación`,
      "location.title": `En ningún sitio fijo. En todos los husos horarios.`,
      "location.text": `No divulgamos oficina ni ciudad base. El equipo opera 100% en remoto, distribuido, con reuniones bajo NDA cuando el proyecto lo requiere. Es una decisión operativa, no un truco de marketing.`,
      "location.badge": `Ubicación: clasificada`,

      "footer.tagline": `Software de élite. Bajo invitación.`, "footer.rights": `Todos los derechos reservados.`,
      "footer.made": `Sitio construido con precisión de ingeniería.`,

      "notfound.title": `Ruta no encontrada`, "notfound.text": `Este recurso no existe o está clasificado.`, "notfound.cta": `Volver al inicio`,

      "author.role": `Fundador & Arquitecto de software`

    },

    en: {
      "meta.title": `Gabriel Díaz Bernal — Software Architect`,
      "meta.description": `Gabriel Díaz Bernal leads a studio of 25 elite software engineers. Undisclosed location. We work on demand and accept projects only under very selective terms.`,

      "nav.home": `Home`, "nav.about": `About`, "nav.stack": `Stack`, "nav.team": `Team`,
      "nav.clients": `Clients`, "nav.process": `Process`,

      "hero.eyebrow": `Available by invitation only`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Software architect. Founder of a distributed studio of 25 engineers that builds what others consider impossible.`,
      "hero.cta_secondary": `View the tech arsenal`,
      "hero.stat1_value": `25`, "hero.stat1_label": `senior engineers`,
      "hero.stat2_value": `100%`, "hero.stat2_label": `remote and distributed`,
      "hero.stat3_value": `<3%`, "hero.stat3_label": `of requests accepted`,
      "hero.stat4_value": `0`, "hero.stat4_label": `clients disclosed`,
      "hero.terminal_title": `gabriel@studio — zsh`,
      "hero.term1_cmd": `whoami`, "hero.term1_out": `gabriel_diaz_bernal — software architect`,
      "hero.term2_cmd": `team --size`, "hero.term2_out": `25 senior engineers · distributed · under NDA`,
      "hero.term3_cmd": `location --reveal`, "hero.term3_out": `access denied: location classified`,
      "hero.term4_cmd": `availability --check`, "hero.term4_out": `true — invitation only`,
      "hero.term5_cmd": `stack --2026`, "hero.term5_out": `loading technical arsenal...`,

      "about.eyebrow": `About me`,
      "about.title": `I build software when failure isn't an option.`,
      "about.p1": `For over a decade I've designed mission-critical systems for organizations that can't afford mistakes. At some point I stopped working alone and started building a studio.`,
      "about.p2": `Today I run a distributed team of 25 senior engineers spread across time zones we don't confirm publicly. No office. No client logos on the homepage. We have non-disclosure agreements and a track record we only discuss in private.`,
      "about.p3": `We don't compete on volume, we compete on judgment: we take on the projects that truly matter and run them as if the client's business depended on it — because it almost always does.`,
      "about.badge1": `Confidentiality first`, "about.badge2": `Zero public portfolio`, "about.badge3": `Non-negotiable standards`,

      "stack.eyebrow": `Technical arsenal`,
      "stack.title": `The most cutting-edge tools of 2026`,
      "stack.subtitle": `We don't chase hype. We adopt what delivers a real edge and ship it to production before the rest of the market.`,
      "stack.item1_title": `Agentic AI systems`, "stack.item1_desc": `Multi-agent orchestration in production, frontier extended-reasoning models, and next-generation RAG pipelines.`,
      "stack.item2_title": `Distributed edge computing`, "stack.item2_desc": `Edge compute with on-device inference, WASM runtimes, and single-digit latency on any continent.`,
      "stack.item3_title": `Rust, Zig & TypeScript`, "stack.item3_desc": `Critical systems in Rust and Zig; product surfaces in TypeScript with Server Components and native streaming.`,
      "stack.item4_title": `Cloud-native infrastructure`, "stack.item4_desc": `Multi-cluster Kubernetes, GitOps, and full observability with OpenTelemetry from the first commit.`,
      "stack.item5_title": `Zero-trust security`, "stack.item5_desc": `Zero-trust architectures, post-quantum cryptography, and continuous pentesting built into the delivery pipeline.`,
      "stack.item6_title": `Real-time data`, "stack.item6_desc": `Vector databases, streaming analytics, and AI inference running at the edge, close to the user.`,
      "stack.item7_title": `Decentralized infrastructure`, "stack.item7_desc": `Audited smart contracts, zero-knowledge proofs, and censorship-resistant systems when the project demands it.`,
      "stack.item8_title": `Spatial computing & XR`, "stack.item8_desc": `Interfaces for next-generation headsets and immersive experiences built with real-time engines.`,
      "stack.item9_title": `Autonomous DevOps`, "stack.item9_desc": `Self-regulating pipelines, progressive rollouts, and automatic rollback guided by AI-driven observability.`,

      "team.eyebrow": `The team`,
      "team.title": `25 engineers. Zero egos. One single standard.`,
      "team.subtitle": `We don't publish photos or names. We publish judgment.`,
      "team.orb_label": `Active engineers`,
      "team.row1_count": `08`, "team.row1_label": `Backend & distributed systems`,
      "team.row2_count": `05`, "team.row2_label": `Applied AI`,
      "team.row3_count": `04`, "team.row3_label": `Offensive & defensive security`,
      "team.row4_count": `03`, "team.row4_label": `Cloud architecture`,
      "team.row5_count": `03`, "team.row5_label": `Frontend & high-performance interfaces`,
      "team.row6_count": `02`, "team.row6_label": `Blockchain & decentralized infrastructure`,
      "team.note": `Every engineer has been through a selection process stricter than the one we run for our own clients.`,

      "clients.eyebrow": `Clients`,
      "clients.title": `170+ clients. Zero logos on this page.`,
      "clients.subtitle": `Governments, banks, critical infrastructure, and companies that can't afford a breach. We work with those who have the most to lose — which is exactly why you'll never know for sure who.`,
      "clients.stat_value": `170+`, "clients.stat_label": `clients served, all under NDA`,
      "clients.sectors_label": `Sectors we operate in`,
      "clients.sector1": `Government agencies`, "clients.sector2": `Cybersecurity`,
      "clients.sector3": `Banking & finance`, "clients.sector4": `Critical infrastructure`,
      "clients.sector5": `Telecommunications`, "clients.sector6": `Defense`,
      "clients.sector7": `Healthcare`, "clients.sector8": `Energy`,

      "process.eyebrow": `How we work`,
      "process.title": `On demand. On your terms, never.`,
      "process.subtitle": `We accept work only under very selective terms. Here's the process.`,
      "process.step1_num": `01`, "process.step1_title": `Confidential request`, "process.step1_desc": `You tell us about the project under NDA. No public forms, no open inbox.`,
      "process.step2_num": `02`, "process.step2_title": `Fit assessment`, "process.step2_desc": `We evaluate whether the problem is worth the team. Most requests aren't.`,
      "process.step3_num": `03`, "process.step3_title": `Closed-scope proposal`, "process.step3_desc": `If we accept, we assemble a dedicated team and lock scope, timeline and terms — no subcontracting.`,
      "process.step4_num": `04`, "process.step4_title": `Classified execution`, "process.step4_desc": `Encrypted communication, verifiable deliverables, and zero public mentions unless you authorize it.`,
      "process.callout": `Fewer than 3% of the requests we receive become a project.`,

      "location.eyebrow": `Location`,
      "location.title": `Nowhere fixed. Every time zone.`,
      "location.text": `We don't disclose an office or a home city. The team operates 100% remote, distributed, with NDA-bound meetings when a project requires them. It's an operational decision, not a marketing trick.`,
      "location.badge": `Location: classified`,

      "footer.tagline": `Elite software. By invitation.`, "footer.rights": `All rights reserved.`,
      "footer.made": `Site built with engineering precision.`,

      "notfound.title": `Route not found`, "notfound.text": `This resource doesn't exist, or it's classified.`, "notfound.cta": `Back to home`,

      "author.role": `Founder & Software Architect`

    },

    fr: {
      "meta.title": `Gabriel Díaz Bernal — Architecte logiciel`,
      "meta.description": `Gabriel Díaz Bernal dirige un studio de 25 ingénieurs logiciels d'élite. Localisation non divulguée. Nous travaillons à la demande et n'acceptons des projets que selon des conditions très sélectives.`,

      "nav.home": `Accueil`, "nav.about": `À propos`, "nav.stack": `Stack`, "nav.team": `Équipe`,
      "nav.clients": `Clients`, "nav.process": `Processus`,

      "hero.eyebrow": `Disponible uniquement sur invitation`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Architecte logiciel. Fondateur d'un studio distribué de 25 ingénieurs qui construit ce que d'autres jugent impossible.`,
      "hero.cta_secondary": `Voir l'arsenal technique`,
      "hero.stat1_value": `25`, "hero.stat1_label": `ingénieurs seniors`,
      "hero.stat2_value": `100%`, "hero.stat2_label": `à distance et distribués`,
      "hero.stat3_value": `<3%`, "hero.stat3_label": `des demandes acceptées`,
      "hero.stat4_value": `0`, "hero.stat4_label": `clients divulgués`,
      "hero.terminal_title": `gabriel@studio — zsh`,
      "hero.term1_cmd": `whoami`, "hero.term1_out": `gabriel_diaz_bernal — architecte logiciel`,
      "hero.term2_cmd": `team --size`, "hero.term2_out": `25 ingénieurs seniors · distribués · sous NDA`,
      "hero.term3_cmd": `location --reveal`, "hero.term3_out": `accès refusé : localisation classifiée`,
      "hero.term4_cmd": `availability --check`, "hero.term4_out": `true — sur invitation uniquement`,
      "hero.term5_cmd": `stack --2026`, "hero.term5_out": `chargement de l'arsenal technique...`,

      "about.eyebrow": `À propos de moi`,
      "about.title": `Je construis des logiciels quand l'échec n'est pas une option.`,
      "about.p1": `Depuis plus de dix ans, je conçois des systèmes critiques pour des organisations qui ne peuvent pas se permettre d'erreurs. À un moment donné, j'ai cessé de travailler seul et j'ai commencé à bâtir un studio.`,
      "about.p2": `Aujourd'hui, je dirige une équipe distribuée de 25 ingénieurs seniors répartis sur des fuseaux horaires que nous ne confirmons pas publiquement. Pas de bureau. Pas de logos clients en page d'accueil. Nous avons des accords de confidentialité et un historique dont nous ne parlons qu'en privé.`,
      "about.p3": `Nous ne rivalisons pas en volume, nous rivalisons en discernement : nous acceptons les projets qui comptent vraiment et les menons comme si l'avenir du client en dépendait — parce que c'est presque toujours le cas.`,
      "about.badge1": `La confidentialité avant tout`, "about.badge2": `Aucun portfolio public`, "about.badge3": `Standards non négociables`,

      "stack.eyebrow": `Arsenal technique`,
      "stack.title": `Les outils les plus avancés de 2026`,
      "stack.subtitle": `Nous ne courons pas après les tendances. Nous adoptons ce qui procure un véritable avantage et le mettons en production avant le reste du marché.`,
      "stack.item1_title": `Systèmes d'IA agentique`, "stack.item1_desc": `Orchestration multi-agents en production, modèles frontier à raisonnement étendu et pipelines RAG de dernière génération.`,
      "stack.item2_title": `Edge computing distribué`, "stack.item2_desc": `Calcul en périphérie avec inférence sur l'appareil, runtimes WASM et latences à un chiffre sur tous les continents.`,
      "stack.item3_title": `Rust, Zig & TypeScript`, "stack.item3_desc": `Systèmes critiques en Rust et Zig ; interfaces produit en TypeScript avec Server Components et streaming natif.`,
      "stack.item4_title": `Infrastructure cloud-native`, "stack.item4_desc": `Kubernetes multi-cluster, GitOps et observabilité totale avec OpenTelemetry dès le premier commit.`,
      "stack.item5_title": `Sécurité zero-trust`, "stack.item5_desc": `Architectures zero-trust, cryptographie post-quantique et pentesting continu intégré au pipeline de livraison.`,
      "stack.item6_title": `Données en temps réel`, "stack.item6_desc": `Bases de données vectorielles, analytique en streaming et inférence d'IA exécutée en périphérie, au plus près de l'utilisateur.`,
      "stack.item7_title": `Infrastructure décentralisée`, "stack.item7_desc": `Contrats intelligents audités, preuves à divulgation nulle de connaissance et systèmes résistants à la censure quand le projet l'exige.`,
      "stack.item8_title": `Informatique spatiale & XR`, "stack.item8_desc": `Interfaces pour casques de nouvelle génération et expériences immersives construites avec des moteurs temps réel.`,
      "stack.item9_title": `DevOps autonome`, "stack.item9_desc": `Pipelines autorégulés, déploiements progressifs et rollback automatique piloté par une observabilité assistée par IA.`,

      "team.eyebrow": `L'équipe`,
      "team.title": `25 ingénieurs. Zéro ego. Un seul standard.`,
      "team.subtitle": `Nous ne publions ni photos ni noms. Nous publions notre exigence.`,
      "team.orb_label": `Ingénieurs actifs`,
      "team.row1_count": `08`, "team.row1_label": `Backend & systèmes distribués`,
      "team.row2_count": `05`, "team.row2_label": `IA appliquée`,
      "team.row3_count": `04`, "team.row3_label": `Sécurité offensive et défensive`,
      "team.row4_count": `03`, "team.row4_label": `Architecture cloud`,
      "team.row5_count": `03`, "team.row5_label": `Frontend & interfaces haute performance`,
      "team.row6_count": `02`, "team.row6_label": `Blockchain & infrastructure décentralisée`,
      "team.note": `Chaque ingénieur a traversé un processus de sélection plus strict que celui que nous imposons à nos propres clients.`,

      "clients.eyebrow": `Clients`,
      "clients.title": `Plus de 170 clients. Zéro logo sur cette page.`,
      "clients.subtitle": `Gouvernements, banques, infrastructures critiques et entreprises qui ne peuvent pas se permettre une brèche. Nous travaillons avec ceux qui ont le plus à perdre — c'est exactement pour cela que vous ne saurez jamais avec certitude qui.`,
      "clients.stat_value": `170+`, "clients.stat_label": `clients servis, tous sous NDA`,
      "clients.sectors_label": `Secteurs dans lesquels nous opérons`,
      "clients.sector1": `Agences gouvernementales`, "clients.sector2": `Cybersécurité`,
      "clients.sector3": `Banque & finance`, "clients.sector4": `Infrastructures critiques`,
      "clients.sector5": `Télécommunications`, "clients.sector6": `Défense`,
      "clients.sector7": `Santé`, "clients.sector8": `Énergie`,

      "process.eyebrow": `Comment nous travaillons`,
      "process.title": `À la demande. Jamais selon vos conditions.`,
      "process.subtitle": `Nous n'acceptons du travail que selon des conditions très sélectives. Voici le processus.`,
      "process.step1_num": `01`, "process.step1_title": `Demande confidentielle`, "process.step1_desc": `Vous nous présentez le projet sous NDA. Pas de formulaire public, pas de boîte de réception ouverte.`,
      "process.step2_num": `02`, "process.step2_title": `Évaluation d'adéquation`, "process.step2_desc": `Nous évaluons si le problème est à la hauteur de l'équipe. La plupart des demandes ne le sont pas.`,
      "process.step3_num": `03`, "process.step3_title": `Proposition à périmètre fermé`, "process.step3_desc": `Si nous acceptons, nous formons une équipe dédiée et fixons périmètre, délais et conditions — sans sous-traitance.`,
      "process.step4_num": `04`, "process.step4_title": `Exécution classifiée`, "process.step4_desc": `Communication chiffrée, livrables vérifiables et aucune mention publique sauf autorisation de votre part.`,
      "process.callout": `Moins de 3 % des demandes reçues se transforment en projet.`,

      "location.eyebrow": `Localisation`,
      "location.title": `Nulle part fixe. Sur tous les fuseaux horaires.`,
      "location.text": `Nous ne divulguons ni bureau ni ville de base. L'équipe opère à 100 % à distance, de façon distribuée, avec des réunions sous NDA lorsque le projet l'exige. C'est une décision opérationnelle, pas un artifice marketing.`,
      "location.badge": `Localisation : classifiée`,

      "footer.tagline": `Logiciel d'élite. Sur invitation.`, "footer.rights": `Tous droits réservés.`,
      "footer.made": `Site construit avec précision d'ingénierie.`,

      "notfound.title": `Route introuvable`, "notfound.text": `Cette ressource n'existe pas, ou elle est classifiée.`, "notfound.cta": `Retour à l'accueil`,

      "author.role": `Fondateur & Architecte logiciel`

    },

    pt: {
      "meta.title": `Gabriel Díaz Bernal — Arquiteto de Software`,
      "meta.description": `Gabriel Díaz Bernal lidera um estúdio de 25 engenheiros de software de elite. Localização não divulgada. Trabalhamos sob demanda e aceitamos projetos apenas em condições muito seletas.`,

      "nav.home": `Início`, "nav.about": `Sobre mim`, "nav.stack": `Stack`, "nav.team": `Equipe`,
      "nav.clients": `Clientes`, "nav.process": `Processo`,

      "hero.eyebrow": `Disponível apenas por convite`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Arquiteto de software. Fundador de um estúdio distribuído de 25 engenheiros que constrói o que outros consideram impossível.`,
      "hero.cta_secondary": `Ver o arsenal técnico`,
      "hero.stat1_value": `25`, "hero.stat1_label": `engenheiros sênior`,
      "hero.stat2_value": `100%`, "hero.stat2_label": `remoto e distribuído`,
      "hero.stat3_value": `<3%`, "hero.stat3_label": `das solicitações aceitas`,
      "hero.stat4_value": `0`, "hero.stat4_label": `clientes divulgados`,
      "hero.terminal_title": `gabriel@estudio — zsh`,
      "hero.term1_cmd": `whoami`, "hero.term1_out": `gabriel_diaz_bernal — arquiteto de software`,
      "hero.term2_cmd": `team --size`, "hero.term2_out": `25 engenheiros sênior · distribuídos · sob NDA`,
      "hero.term3_cmd": `location --reveal`, "hero.term3_out": `acesso negado: localização classificada`,
      "hero.term4_cmd": `availability --check`, "hero.term4_out": `true — apenas por convite`,
      "hero.term5_cmd": `stack --2026`, "hero.term5_out": `carregando arsenal técnico...`,

      "about.eyebrow": `Sobre mim`,
      "about.title": `Eu construo software quando falhar não é uma opção.`,
      "about.p1": `Há mais de uma década projeto sistemas de missão crítica para organizações que não podem se dar ao luxo de errar. Em algum momento, parei de trabalhar sozinho e comecei a construir um estúdio.`,
      "about.p2": `Hoje lidero uma equipe distribuída de 25 engenheiros sênior espalhados por fusos horários que não confirmamos publicamente. Não temos escritório. Não temos logos de clientes na página inicial. Temos acordos de confidencialidade e um histórico do qual só falamos em privado.`,
      "about.p3": `Não competimos por volume, competimos por critério: aceitamos os projetos que realmente importam e os executamos como se o negócio do cliente dependesse disso — porque quase sempre depende.`,
      "about.badge1": `Confidencialidade em primeiro lugar`, "about.badge2": `Zero portfólio público`, "about.badge3": `Padrões não negociáveis`,

      "stack.eyebrow": `Arsenal técnico`,
      "stack.title": `As ferramentas mais avançadas de 2026`,
      "stack.subtitle": `Não perseguimos hype. Adotamos o que traz vantagem real e levamos isso à produção antes do resto do mercado.`,
      "stack.item1_title": `Sistemas de IA agêntica`, "stack.item1_desc": `Orquestração multiagente em produção, modelos frontier de raciocínio estendido e pipelines RAG de última geração.`,
      "stack.item2_title": `Edge computing distribuído`, "stack.item2_desc": `Computação de borda com inferência on-device, runtimes WASM e latências de um dígito em qualquer continente.`,
      "stack.item3_title": `Rust, Zig & TypeScript`, "stack.item3_desc": `Sistemas críticos em Rust e Zig; superfícies de produto em TypeScript com Server Components e streaming nativo.`,
      "stack.item4_title": `Infraestrutura cloud-native`, "stack.item4_desc": `Kubernetes multi-cluster, GitOps e observabilidade total com OpenTelemetry desde o primeiro commit.`,
      "stack.item5_title": `Segurança zero-trust`, "stack.item5_desc": `Arquiteturas zero-trust, criptografia pós-quântica e pentesting contínuo integrado ao pipeline de entrega.`,
      "stack.item6_title": `Dados em tempo real`, "stack.item6_desc": `Bancos de dados vetoriais, streaming analítico e inferência de IA rodando na borda, perto do usuário.`,
      "stack.item7_title": `Infraestrutura descentralizada`, "stack.item7_desc": `Contratos inteligentes auditados, provas de conhecimento zero e sistemas resistentes à censura quando o projeto exige.`,
      "stack.item8_title": `Computação espacial & XR`, "stack.item8_desc": `Interfaces para headsets de nova geração e experiências imersivas construídas com engines em tempo real.`,
      "stack.item9_title": `DevOps autônomo`, "stack.item9_desc": `Pipelines autorregulados, implantações progressivas e rollback automático guiado por observabilidade com IA.`,

      "team.eyebrow": `A equipe`,
      "team.title": `25 engenheiros. Zero egos. Um único padrão.`,
      "team.subtitle": `Não publicamos fotos nem nomes. Publicamos critério.`,
      "team.orb_label": `Engenheiros ativos`,
      "team.row1_count": `08`, "team.row1_label": `Backend & sistemas distribuídos`,
      "team.row2_count": `05`, "team.row2_label": `IA aplicada`,
      "team.row3_count": `04`, "team.row3_label": `Segurança ofensiva e defensiva`,
      "team.row4_count": `03`, "team.row4_label": `Arquitetura cloud`,
      "team.row5_count": `03`, "team.row5_label": `Frontend e interfaces de alta performance`,
      "team.row6_count": `02`, "team.row6_label": `Blockchain e infraestrutura descentralizada`,
      "team.note": `Cada engenheiro passou por um processo de seleção mais rígido do que o que aplicamos aos nossos próprios clientes.`,

      "clients.eyebrow": `Clientes`,
      "clients.title": `Mais de 170 clientes. Zero logos nesta página.`,
      "clients.subtitle": `Governos, bancos, infraestrutura crítica e empresas que não podem se dar ao luxo de uma brecha. Trabalhamos com quem tem mais a perder — e é exatamente por isso que você nunca saberá ao certo quem.`,
      "clients.stat_value": `170+`, "clients.stat_label": `clientes atendidos, todos sob NDA`,
      "clients.sectors_label": `Setores em que atuamos`,
      "clients.sector1": `Agências governamentais`, "clients.sector2": `Cibersegurança`,
      "clients.sector3": `Bancos e finanças`, "clients.sector4": `Infraestrutura crítica`,
      "clients.sector5": `Telecomunicações`, "clients.sector6": `Defesa`,
      "clients.sector7": `Saúde`, "clients.sector8": `Energia`,

      "process.eyebrow": `Como trabalhamos`,
      "process.title": `Sob demanda. Sob suas condições, nunca.`,
      "process.subtitle": `Aceitamos trabalho apenas em condições muito seletas. Este é o processo.`,
      "process.step1_num": `01`, "process.step1_title": `Solicitação confidencial`, "process.step1_desc": `Você nos conta o projeto sob NDA. Sem formulários públicos, sem caixa de entrada aberta.`,
      "process.step2_num": `02`, "process.step2_title": `Avaliação de encaixe`, "process.step2_desc": `Avaliamos se o problema está à altura da equipe. A maioria das solicitações não está.`,
      "process.step3_num": `03`, "process.step3_title": `Proposta de escopo fechado`, "process.step3_desc": `Se aceitarmos, montamos uma equipe dedicada e fixamos escopo, prazos e condições — sem subcontratação.`,
      "process.step4_num": `04`, "process.step4_title": `Execução classificada`, "process.step4_desc": `Comunicação criptografada, entregas verificáveis e zero menções públicas, a menos que você autorize.`,
      "process.callout": `Menos de 3% das solicitações que recebemos se tornam um projeto.`,

      "location.eyebrow": `Localização`,
      "location.title": `Em lugar nenhum fixo. Em todos os fusos horários.`,
      "location.text": `Não divulgamos escritório nem cidade-base. A equipe opera 100% remota, distribuída, com reuniões sob NDA quando o projeto exige. É uma decisão operacional, não um truque de marketing.`,
      "location.badge": `Localização: classificada`,

      "footer.tagline": `Software de elite. Sob convite.`, "footer.rights": `Todos os direitos reservados.`,
      "footer.made": `Site construído com precisão de engenharia.`,

      "notfound.title": `Rota não encontrada`, "notfound.text": `Este recurso não existe ou está classificado.`, "notfound.cta": `Voltar ao início`,

      "author.role": `Fundador & Arquiteto de Software`

    },

    ar: {
      "meta.title": `غابرييل دياز بيرنال — مهندس برمجيات`,
      "meta.description": `يقود غابرييل دياز بيرنال استوديو من 25 مهندس برمجيات من النخبة. الموقع غير معلن. نعمل عند الطلب ونقبل المشاريع وفق شروط انتقائية للغاية فقط.`,

      "nav.home": `الرئيسية`, "nav.about": `نبذة عني`, "nav.stack": `التقنيات`, "nav.team": `الفريق`,
      "nav.clients": `العملاء`, "nav.process": `منهجية العمل`,

      "hero.eyebrow": `متاح فقط بالدعوة`,
      "hero.title": `غابرييل دياز بيرنال`,
      "hero.subtitle": `مهندس برمجيات. مؤسس استوديو موزّع يضم 25 مهندسًا يبنون ما يعتبره الآخرون مستحيلاً.`,
      "hero.cta_secondary": `استعرض الترسانة التقنية`,
      "hero.stat1_value": `25`, "hero.stat1_label": `مهندس أول`,
      "hero.stat2_value": `100%`, "hero.stat2_label": `عمل عن بُعد وموزّع`,
      "hero.stat3_value": `<3%`, "hero.stat3_label": `من الطلبات المقبولة`,
      "hero.stat4_value": `0`, "hero.stat4_label": `عملاء معلنون`,
      "hero.terminal_title": `gabriel@studio — zsh`,
      "hero.term1_cmd": `whoami`, "hero.term1_out": `gabriel_diaz_bernal — مهندس برمجيات`,
      "hero.term2_cmd": `team --size`, "hero.term2_out": `25 مهندسًا أول · موزّعون · بموجب اتفاقية سرية`,
      "hero.term3_cmd": `location --reveal`, "hero.term3_out": `تم رفض الوصول: الموقع سرّي`,
      "hero.term4_cmd": `availability --check`, "hero.term4_out": `true — بالدعوة فقط`,
      "hero.term5_cmd": `stack --2026`, "hero.term5_out": `جارٍ تحميل الترسانة التقنية...`,

      "about.eyebrow": `نبذة عني`,
      "about.title": `أبني برمجيات حين لا يكون الفشل خيارًا.`,
      "about.p1": `منذ أكثر من عقد وأنا أصمم أنظمة بالغة الأهمية لمؤسسات لا تحتمل الأخطاء. في مرحلة ما توقفت عن العمل بمفردي وبدأت ببناء استوديو.`,
      "about.p2": `اليوم أقود فريقًا موزّعًا من 25 مهندسًا أول منتشرين عبر مناطق زمنية لا نُفصح عنها علنًا. لا مكتب لدينا. لا شعارات عملاء على الصفحة الرئيسية. لدينا اتفاقيات سرية وسجل حافل لا نناقشه إلا سرًا.`,
      "about.p3": `لا نتنافس على الحجم، بل على الحكمة في الاختيار: نقبل المشاريع التي تهم حقًا وننفذها كما لو أن مستقبل عمل العميل يعتمد عليها — لأن ذلك صحيح في أغلب الأحيان.`,
      "about.badge1": `السرية أولاً`, "about.badge2": `لا معرض أعمال علني`, "about.badge3": `معايير غير قابلة للتفاوض`,

      "stack.eyebrow": `الترسانة التقنية`,
      "stack.title": `أحدث الأدوات التقنية لعام 2026`,
      "stack.subtitle": `لا نلاحق الضجيج. نتبنى ما يمنح ميزة حقيقية وننقله إلى الإنتاج قبل بقية السوق.`,
      "stack.item1_title": `أنظمة الذكاء الاصطناعي الوكيلي`, "stack.item1_desc": `تنسيق متعدد الوكلاء في الإنتاج، ونماذج متقدمة ذات استدلال موسّع، وخطوط RAG من الجيل التالي.`,
      "stack.item2_title": `الحوسبة الطرفية الموزّعة`, "stack.item2_desc": `حوسبة طرفية باستدلال على الجهاز، وبيئات تشغيل WASM، وزمن استجابة أحادي الرقم في أي قارة.`,
      "stack.item3_title": `Rust وZig وTypeScript`, "stack.item3_desc": `أنظمة حرجة بلغتي Rust وZig؛ واجهات المنتج بلغة TypeScript مع Server Components والبث المباشر الأصلي.`,
      "stack.item4_title": `بنية تحتية سحابية أصيلة`, "stack.item4_desc": `Kubernetes متعدد العناقيد، وGitOps، ومراقبة شاملة عبر OpenTelemetry منذ أول Commit.`,
      "stack.item5_title": `أمن الثقة الصفرية`, "stack.item5_desc": `معماريات الثقة الصفرية، والتشفير المقاوم للحوسبة الكمّية، واختبار الاختراق المستمر المدمج في خط التسليم.`,
      "stack.item6_title": `بيانات في الزمن الحقيقي`, "stack.item6_desc": `قواعد بيانات متجهية، وتحليلات بث لحظية، واستدلال ذكاء اصطناعي يعمل عند الطرف، قريبًا من المستخدم.`,
      "stack.item7_title": `بنية تحتية لامركزية`, "stack.item7_desc": `عقود ذكية مدقَّقة، وبراهين المعرفة الصفرية، وأنظمة مقاومة للرقابة عند الحاجة.`,
      "stack.item8_title": `الحوسبة المكانية وتقنيات XR`, "stack.item8_desc": `واجهات لنظارات الجيل القادم وتجارب غامرة مبنية بمحركات الزمن الحقيقي.`,
      "stack.item9_title": `DevOps مستقل`, "stack.item9_desc": `خطوط تشغيل ذاتية التنظيم، ونشر تدريجي، وتراجع تلقائي موجَّه بمراقبة مدعومة بالذكاء الاصطناعي.`,

      "team.eyebrow": `الفريق`,
      "team.title": `25 مهندسًا. صفر غرور. معيار واحد فقط.`,
      "team.subtitle": `لا ننشر صورًا ولا أسماء. ننشر معاييرنا.`,
      "team.orb_label": `مهندسون نشطون`,
      "team.row1_count": `08`, "team.row1_label": `الخلفية البرمجية والأنظمة الموزّعة`,
      "team.row2_count": `05`, "team.row2_label": `الذكاء الاصطناعي التطبيقي`,
      "team.row3_count": `04`, "team.row3_label": `الأمن الهجومي والدفاعي`,
      "team.row4_count": `03`, "team.row4_label": `هندسة السحابة`,
      "team.row5_count": `03`, "team.row5_label": `الواجهات الأمامية وعالية الأداء`,
      "team.row6_count": `02`, "team.row6_label": `البلوك تشين والبنية التحتية اللامركزية`,
      "team.note": `كل مهندس اجتاز عملية اختيار أشد صرامة من تلك التي نطبّقها على عملائنا أنفسهم.`,

      "clients.eyebrow": `العملاء`,
      "clients.title": `أكثر من 170 عميلًا. صفر شعارات في هذه الصفحة.`,
      "clients.subtitle": `حكومات، بنوك، بنية تحتية حرجة، وشركات لا تحتمل اختراقًا. نعمل مع من لديهم الأكثر ليخسروه — ولهذا بالضبط لن تعرف أبدًا من هم على وجه اليقين.`,
      "clients.stat_value": `170+`, "clients.stat_label": `عميلًا تمت خدمتهم، جميعهم بموجب اتفاقية سرية`,
      "clients.sectors_label": `القطاعات التي نعمل بها`,
      "clients.sector1": `جهات حكومية`, "clients.sector2": `الأمن السيبراني`,
      "clients.sector3": `البنوك والتمويل`, "clients.sector4": `البنية التحتية الحرجة`,
      "clients.sector5": `الاتصالات`, "clients.sector6": `الدفاع`,
      "clients.sector7": `الرعاية الصحية`, "clients.sector8": `الطاقة`,

      "process.eyebrow": `كيف نعمل`,
      "process.title": `عند الطلب. وفق شروطك أبدًا.`,
      "process.subtitle": `نقبل العمل وفق شروط انتقائية للغاية فقط. هذه هي المنهجية.`,
      "process.step1_num": `01`, "process.step1_title": `طلب سرّي`, "process.step1_desc": `تشاركنا مشروعك بموجب اتفاقية سرية. لا نماذج علنية، ولا بريد وارد مفتوح.`,
      "process.step2_num": `02`, "process.step2_title": `تقييم الملاءمة`, "process.step2_desc": `نقيّم ما إذا كانت المشكلة تستحق الفريق. معظم الطلبات لا ترقى لذلك.`,
      "process.step3_num": `03`, "process.step3_title": `عرض محدد النطاق`, "process.step3_desc": `إذا قبلنا، نُشكّل فريقًا مخصصًا ونحدد النطاق والجدول الزمني والشروط — دون تعاقد من الباطن.`,
      "process.step4_num": `04`, "process.step4_title": `تنفيذ سرّي`, "process.step4_desc": `تواصل مشفّر، ومخرجات قابلة للتحقق، وصفر إشارات علنية ما لم تأذن بذلك.`,
      "process.callout": `أقل من 3% من الطلبات التي نتلقاها تتحول إلى مشروع.`,

      "location.eyebrow": `الموقع`,
      "location.title": `لا مكان ثابت. كل المناطق الزمنية.`,
      "location.text": `لا نُفصح عن مكتب أو مدينة رئيسية. يعمل الفريق عن بُعد بنسبة 100%، وبشكل موزّع، مع اجتماعات بموجب اتفاقية سرية عند الحاجة. إنه قرار تشغيلي، لا خدعة تسويقية.`,
      "location.badge": `الموقع: سرّي`,

      "footer.tagline": `برمجيات النخبة. بالدعوة فقط.`, "footer.rights": `جميع الحقوق محفوظة.`,
      "footer.made": `موقع مبني بدقة هندسية.`,

      "notfound.title": `المسار غير موجود`, "notfound.text": `هذا المورد غير موجود أو أنه سرّي.`, "notfound.cta": `العودة إلى الرئيسية`,

      "author.role": `المؤسس ومهندس البرمجيات`

    },

    zh: {
      "meta.title": `加布里埃尔·迪亚兹·贝尔纳尔 — 软件架构师`,
      "meta.description": `加布里埃尔·迪亚兹·贝尔纳尔领导着一支由25名精英软件工程师组成的团队。地点保密。我们按需工作，仅在非常严格的条件下承接项目。`,

      "nav.home": `首页`, "nav.about": `关于我`, "nav.stack": `技术栈`, "nav.team": `团队`,
      "nav.clients": `客户`, "nav.process": `合作流程`,

      "hero.eyebrow": `仅凭邀请开放`,
      "hero.title": `加布里埃尔·迪亚兹·贝尔纳尔`,
      "hero.subtitle": `软件架构师。分布式工作室创始人，率领25名工程师打造他人眼中不可能的产品。`,
      "hero.cta_secondary": `查看技术武器库`,
      "hero.stat1_value": `25`, "hero.stat1_label": `资深工程师`,
      "hero.stat2_value": `100%`, "hero.stat2_label": `远程分布式办公`,
      "hero.stat3_value": `<3%`, "hero.stat3_label": `请求接受率`,
      "hero.stat4_value": `0`, "hero.stat4_label": `公开客户数`,
      "hero.terminal_title": `gabriel@studio — zsh`,
      "hero.term1_cmd": `whoami`, "hero.term1_out": `gabriel_diaz_bernal — 软件架构师`,
      "hero.term2_cmd": `team --size`, "hero.term2_out": `25名资深工程师 · 分布式团队 · 保密协议约束`,
      "hero.term3_cmd": `location --reveal`, "hero.term3_out": `访问被拒：地点已保密`,
      "hero.term4_cmd": `availability --check`, "hero.term4_out": `true — 仅限受邀`,
      "hero.term5_cmd": `stack --2026`, "hero.term5_out": `正在加载技术武器库...`,

      "about.eyebrow": `关于我`,
      "about.title": `我打造的软件，容不得失败。`,
      "about.p1": `十多年来，我一直在为承受不起失误的组织设计关键任务系统。某个时刻，我不再单打独斗，开始组建自己的工作室。`,
      "about.p2": `如今，我带领一支由25名资深工程师组成的分布式团队，分布在我们从不公开确认的时区里。没有办公室，主页上也没有客户标志。我们签有保密协议，过往战绩只在私下谈起。`,
      "about.p3": `我们不比数量，比的是判断力：只接手真正重要的项目，并全力以赴——因为客户的事业几乎总是系于此。`,
      "about.badge1": `保密至上`, "about.badge2": `零公开作品集`, "about.badge3": `不可妥协的标准`,

      "stack.eyebrow": `技术武器库`,
      "stack.title": `2026年最前沿的技术`,
      "stack.subtitle": `我们不追逐炒作，只采用真正带来优势的技术，并比市场其他人更早将其投入生产。`,
      "stack.item1_title": `智能体AI系统`, "stack.item1_desc": `生产环境中的多智能体编排、具备扩展推理能力的前沿模型，以及新一代RAG管道。`,
      "stack.item2_title": `分布式边缘计算`, "stack.item2_desc": `具备设备端推理能力的边缘计算、WASM运行时，以及任意大陆均可实现的个位数延迟。`,
      "stack.item3_title": `Rust、Zig 与 TypeScript`, "stack.item3_desc": `关键系统采用 Rust 与 Zig 构建；产品界面使用 TypeScript，搭配 Server Components 与原生流式渲染。`,
      "stack.item4_title": `云原生基础设施`, "stack.item4_desc": `多集群 Kubernetes、GitOps，以及从第一次提交起就贯穿始终的 OpenTelemetry 全面可观测性。`,
      "stack.item5_title": `零信任安全`, "stack.item5_desc": `零信任架构、后量子密码学，以及集成于交付流水线中的持续渗透测试。`,
      "stack.item6_title": `实时数据`, "stack.item6_desc": `向量数据库、流式实时分析，以及在边缘就近用户运行的AI推理。`,
      "stack.item7_title": `去中心化基础设施`, "stack.item7_desc": `经过审计的智能合约、零知识证明，以及在项目需要时提供抗审查能力的系统。`,
      "stack.item8_title": `空间计算与XR`, "stack.item8_desc": `面向新一代头显设备的界面，以及基于实时引擎打造的沉浸式体验。`,
      "stack.item9_title": `自主化DevOps`, "stack.item9_desc": `自我调节的流水线、渐进式发布，以及由AI驱动可观测性引导的自动回滚。`,

      "team.eyebrow": `团队`,
      "team.title": `25名工程师。零自负。同一套标准。`,
      "team.subtitle": `我们不公开照片，也不公开姓名。我们公开的是标准。`,
      "team.orb_label": `在职工程师`,
      "team.row1_count": `08`, "team.row1_label": `后端与分布式系统`,
      "team.row2_count": `05`, "team.row2_label": `应用型AI`,
      "team.row3_count": `04`, "team.row3_label": `攻防安全`,
      "team.row4_count": `03`, "team.row4_label": `云架构`,
      "team.row5_count": `03`, "team.row5_label": `前端与高性能界面`,
      "team.row6_count": `02`, "team.row6_label": `区块链与去中心化基础设施`,
      "team.note": `每一位工程师所经历的选拔流程，都比我们对客户本身的审核更为严苛。`,

      "clients.eyebrow": `客户`,
      "clients.title": `超过170家客户，页面上零标志。`,
      "clients.subtitle": `政府、银行、关键基础设施，以及承受不起数据泄露的企业。我们服务那些损失风险最高的客户——这正是你永远无法确定具体是谁的原因。`,
      "clients.stat_value": `170+`, "clients.stat_label": `服务客户数，全部签署保密协议`,
      "clients.sectors_label": `我们所服务的行业`,
      "clients.sector1": `政府机构`, "clients.sector2": `网络安全`,
      "clients.sector3": `银行与金融`, "clients.sector4": `关键基础设施`,
      "clients.sector5": `电信`, "clients.sector6": `国防`,
      "clients.sector7": `医疗健康`, "clients.sector8": `能源`,

      "process.eyebrow": `合作方式`,
      "process.title": `按需服务，但绝不迁就条件。`,
      "process.subtitle": `我们仅在非常严格的条件下承接工作，以下是具体流程。`,
      "process.step1_num": `01`, "process.step1_title": `保密请求`, "process.step1_desc": `你在保密协议下向我们说明项目。没有公开表单，没有敞开的收件箱。`,
      "process.step2_num": `02`, "process.step2_title": `适配度评估`, "process.step2_desc": `我们评估这个问题是否值得动用整个团队——大多数请求并不值得。`,
      "process.step3_num": `03`, "process.step3_title": `封闭范围提案`, "process.step3_desc": `一旦接受，我们组建专属团队，锁定范围、时间表与条款——绝不外包分包。`,
      "process.step4_num": `04`, "process.step4_title": `保密执行`, "process.step4_desc": `加密通信、可验证的交付成果，未经你授权绝不对外提及。`,
      "process.callout": `我们收到的请求中，成为正式项目的不足3%。`,

      "location.eyebrow": `地点`,
      "location.title": `没有固定地点，遍布每个时区。`,
      "location.text": `我们不公开办公室或所在城市。团队100%远程分布式运作，在项目需要时通过保密协议约束下的会议沟通。这是运营层面的决定，不是营销噱头。`,
      "location.badge": `地点：保密`,

      "footer.tagline": `精英软件，仅限受邀。`, "footer.rights": `版权所有，保留所有权利。`,
      "footer.made": `以工程级精度构建的网站。`,

      "notfound.title": `路径未找到`, "notfound.text": `该资源不存在，或已被列为保密内容。`, "notfound.cta": `返回首页`,

      "author.role": `创始人兼软件架构师`

    },

    ja: {
      "meta.title": `ガブリエル・ディアス・ベルナル — ソフトウェアアーキテクト`,
      "meta.description": `ガブリエル・ディアス・ベルナルは、25名の精鋭ソフトウェアエンジニアからなるスタジオを率いています。所在地非公開。オンデマンドで活動し、極めて厳選された条件下でのみプロジェクトを受託します。`,

      "nav.home": `ホーム`, "nav.about": `プロフィール`, "nav.stack": `技術スタック`, "nav.team": `チーム`,
      "nav.clients": `クライアント`, "nav.process": `プロセス`,

      "hero.eyebrow": `招待制のみ`,
      "hero.title": `ガブリエル・ディアス・ベルナル`,
      "hero.subtitle": `ソフトウェアアーキテクト。他者が不可能と考えるものを構築する、25名からなる分散型スタジオの創設者。`,
      "hero.cta_secondary": `技術アーセナルを見る`,
      "hero.stat1_value": `25`, "hero.stat1_label": `シニアエンジニア`,
      "hero.stat2_value": `100%`, "hero.stat2_label": `リモート・分散型`,
      "hero.stat3_value": `<3%`, "hero.stat3_label": `依頼の承諾率`,
      "hero.stat4_value": `0`, "hero.stat4_label": `公開クライアント数`,
      "hero.terminal_title": `gabriel@studio — zsh`,
      "hero.term1_cmd": `whoami`, "hero.term1_out": `gabriel_diaz_bernal — ソフトウェアアーキテクト`,
      "hero.term2_cmd": `team --size`, "hero.term2_out": `シニアエンジニア25名 · 分散型 · NDA締結済み`,
      "hero.term3_cmd": `location --reveal`, "hero.term3_out": `アクセス拒否：所在地は機密情報です`,
      "hero.term4_cmd": `availability --check`, "hero.term4_out": `true — 招待制のみ`,
      "hero.term5_cmd": `stack --2026`, "hero.term5_out": `技術アーセナルを読み込み中...`,

      "about.eyebrow": `プロフィール`,
      "about.title": `失敗が許されない場面でこそ、ソフトウェアをつくる。`,
      "about.p1": `10年以上にわたり、ミスの許されない組織のためにミッションクリティカルなシステムを設計してきました。あるとき、一人で働くことをやめ、スタジオを築き始めました。`,
      "about.p2": `現在は、公にはしないタイムゾーンに散らばる25名のシニアエンジニアからなる分散型チームを率いています。オフィスはありません。トップページにクライアントのロゴもありません。あるのは秘密保持契約と、非公開の場でしか語らない実績です。`,
      "about.p3": `私たちは量ではなく、見極めで勝負します。本当に重要なプロジェクトだけを引き受け、クライアントの事業がそれにかかっているかのように取り組みます——実際、ほとんどの場合そうだからです。`,
      "about.badge1": `機密保持を最優先`, "about.badge2": `公開実績ゼロ`, "about.badge3": `妥協なき基準`,

      "stack.eyebrow": `技術アーセナル`,
      "stack.title": `2026年、最先端の技術`,
      "stack.subtitle": `私たちは流行を追いません。真の優位性をもたらす技術を採用し、市場の誰よりも早く本番環境へ投入します。`,
      "stack.item1_title": `エージェント型AIシステム`, "stack.item1_desc": `本番環境でのマルチエージェントオーケストレーション、拡張推論を備えたフロンティアモデル、次世代RAGパイプライン。`,
      "stack.item2_title": `分散型エッジコンピューティング`, "stack.item2_desc": `デバイス上推論を伴うエッジコンピューティング、WASMランタイム、どの大陸でも実現する一桁ミリ秒のレイテンシ。`,
      "stack.item3_title": `Rust、Zig、TypeScript`, "stack.item3_desc": `重要システムはRustとZigで構築。プロダクト表層はServer Componentsとネイティブストリーミングを備えたTypeScriptで実装。`,
      "stack.item4_title": `クラウドネイティブ基盤`, "stack.item4_desc": `マルチクラスタKubernetes、GitOps、そして最初のコミットから始まるOpenTelemetryによる完全な可観測性。`,
      "stack.item5_title": `ゼロトラストセキュリティ`, "stack.item5_desc": `ゼロトラストアーキテクチャ、耐量子暗号、そして配信パイプラインに組み込まれた継続的なペネトレーションテスト。`,
      "stack.item6_title": `リアルタイムデータ`, "stack.item6_desc": `ベクトルデータベース、ストリーミング分析、そしてユーザーの近くエッジで動作するAI推論。`,
      "stack.item7_title": `分散型インフラストラクチャ`, "stack.item7_desc": `監査済みスマートコントラクト、ゼロ知識証明、そして必要に応じた検閲耐性のあるシステム。`,
      "stack.item8_title": `空間コンピューティング & XR`, "stack.item8_desc": `次世代ヘッドセット向けインターフェースと、リアルタイムエンジンで構築された没入型体験。`,
      "stack.item9_title": `自律型DevOps`, "stack.item9_desc": `自己調整するパイプライン、段階的リリース、そしてAI主導の可観測性による自動ロールバック。`,

      "team.eyebrow": `チーム`,
      "team.title": `エンジニア25名。エゴはゼロ。基準はただひとつ。`,
      "team.subtitle": `写真も名前も公開しません。公開するのは基準です。`,
      "team.orb_label": `稼働中のエンジニア`,
      "team.row1_count": `08`, "team.row1_label": `バックエンド & 分散システム`,
      "team.row2_count": `05`, "team.row2_label": `応用AI`,
      "team.row3_count": `04`, "team.row3_label": `攻撃的・防御的セキュリティ`,
      "team.row4_count": `03`, "team.row4_label": `クラウドアーキテクチャ`,
      "team.row5_count": `03`, "team.row5_label": `フロントエンド & 高性能インターフェース`,
      "team.row6_count": `02`, "team.row6_label": `ブロックチェーン & 分散型インフラ`,
      "team.note": `すべてのエンジニアは、私たちがクライアントに課す基準よりも厳しい選考プロセスを経ています。`,

      "clients.eyebrow": `クライアント`,
      "clients.title": `170社以上のクライアント。このページにロゴはゼロ。`,
      "clients.subtitle": `政府機関、銀行、重要インフラ、そして情報漏えいを許容できない企業。最も失うものが大きい相手とだけ仕事をします——だからこそ、あなたが誰なのか確実に知ることは決してありません。`,
      "clients.stat_value": `170+`, "clients.stat_label": `契約実績数、すべてNDAのもとで`,
      "clients.sectors_label": `私たちが手がける業界`,
      "clients.sector1": `政府機関`, "clients.sector2": `サイバーセキュリティ`,
      "clients.sector3": `銀行・金融`, "clients.sector4": `重要インフラ`,
      "clients.sector5": `通信`, "clients.sector6": `防衛`,
      "clients.sector7": `ヘルスケア`, "clients.sector8": `エネルギー`,

      "process.eyebrow": `私たちの働き方`,
      "process.title": `オンデマンドで。あなたの条件には決して従いません。`,
      "process.subtitle": `極めて厳選された条件下でのみ、仕事をお受けしています。以下がそのプロセスです。`,
      "process.step1_num": `01`, "process.step1_title": `機密の依頼`, "process.step1_desc": `NDAのもとでプロジェクトをお話しいただきます。公開フォームも、開かれた受信箱もありません。`,
      "process.step2_num": `02`, "process.step2_title": `適合性の評価`, "process.step2_desc": `その課題がチームを動かすに値するかを見極めます。ほとんどの依頼はそれに届きません。`,
      "process.step3_num": `03`, "process.step3_title": `クローズドスコープの提案`, "process.step3_desc": `お受けする場合は専任チームを編成し、範囲・スケジュール・条件を確定します——再委託は一切行いません。`,
      "process.step4_num": `04`, "process.step4_title": `機密裏の実行`, "process.step4_desc": `暗号化された連絡手段、検証可能な成果物、そして許可なき公開言及は一切ありません。`,
      "process.callout": `寄せられる依頼のうち、プロジェクト化するのは3%未満です。`,

      "location.eyebrow": `所在地`,
      "location.title": `固定の拠点はなし。すべてのタイムゾーンに。`,
      "location.text": `オフィスも拠点都市も公開していません。チームは100%リモートかつ分散型で運営され、プロジェクトが必要とする場合にはNDAのもとで会議を行います。これはマーケティング上の演出ではなく、運用上の判断です。`,
      "location.badge": `所在地：機密`,

      "footer.tagline": `エリートソフトウェア。招待制。`, "footer.rights": `全著作権所有。`,
      "footer.made": `エンジニアリングの精度で構築されたサイト。`,

      "notfound.title": `ページが見つかりません`, "notfound.text": `このリソースは存在しないか、機密情報です。`, "notfound.cta": `ホームに戻る`,

      "author.role": `創設者 & ソフトウェアアーキテクト`,

    }
  };

  function detectLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) { /* localStorage unavailable */ }

    var raw = (global.navigator && (global.navigator.language || (global.navigator.languages && global.navigator.languages[0]))) || DEFAULT_LANG;
    var short = String(raw).slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(short) !== -1 ? short : "en";
  }

  function t(lang, key) {
    var dict = I18N[lang] || I18N[DEFAULT_LANG];
    if (dict[key] !== undefined) return dict[key];
    return I18N[DEFAULT_LANG][key] !== undefined ? I18N[DEFAULT_LANG][key] : key;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", RTL_LANGS.indexOf(lang) !== -1 ? "rtl" : "ltr");
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      nodes[i].textContent = t(lang, key);
    }

    var attrNodes = document.querySelectorAll("[data-i18n-attr]");
    for (var j = 0; j < attrNodes.length; j++) {
      var spec = attrNodes[j].getAttribute("data-i18n-attr");
      var parts = spec.split(":");
      if (parts.length === 2) attrNodes[j].setAttribute(parts[0], t(lang, parts[1]));
    }

    var menu = document.querySelectorAll(".lang-menu button");
    for (var k = 0; k < menu.length; k++) {
      menu[k].setAttribute("aria-current", menu[k].getAttribute("data-lang") === lang ? "true" : "false");
    }
    var btn = document.querySelector(".lang-btn .code");
    if (btn) btn.textContent = LANG_LABELS[lang].code;

    document.dispatchEvent(new CustomEvent("gdb:langchange", { detail: { lang: lang } }));
  }

  global.GDB_I18N = {
    SUPPORTED: SUPPORTED,
    RTL_LANGS: RTL_LANGS,
    LANG_LABELS: LANG_LABELS,
    detectLang: detectLang,
    applyLang: applyLang,
    t: t
  };

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(detectLang());
  });
})(window);
