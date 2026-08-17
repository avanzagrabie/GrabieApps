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
      "nav.process": `Proceso`, "nav.blog": `Blog`,

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

      "blog.eyebrow": `Bitácora`, "blog.title": `Notas desde el estudio`,
      "blog.subtitle": `Ideas, arquitecturas y lecciones de proyectos que no siempre podemos nombrar.`,
      "blog.readmore": `Leer artículo`, "blog.viewall": `Ver todo el blog`, "blog.back": `Volver al blog`, "blog.minread": `min de lectura`,
      "blog.post1_tag": `Inteligencia Artificial`, "blog.post1_title": `Orquestación de agentes de IA en producción: lecciones de 2026`,
      "blog.post1_excerpt": `Qué aprendimos llevando sistemas multiagente reales a producción: fallos silenciosos, coste de contexto y por qué la orquestación importa más que el modelo.`, "blog.post1_date": `2 jul 2026`,
      "blog.post2_tag": `Infraestructura`, "blog.post2_title": `Edge computing distribuido: por qué el futuro no vive en una nube central`,
      "blog.post2_excerpt": `La centralización en la nube tiene un techo de latencia. Contamos cómo diseñamos arquitecturas edge para clientes que no pueden esperar ni 100 ms.`, "blog.post2_date": `14 jun 2026`,
      "blog.post3_tag": `Seguridad`, "blog.post3_title": `Criptografía poscuántica: preparar hoy sistemas que deben durar diez años`,
      "blog.post3_excerpt": `Migrar a criptografía resistente a computación cuántica no es pánico, es planificación. Cómo lo abordamos en sistemas que no pueden permitirse una brecha en 2035.`, "blog.post3_date": `3 may 2026`,

      "footer.tagline": `Software de élite. Bajo invitación.`, "footer.rights": `Todos los derechos reservados.`,
      "footer.made": `Sitio construido con precisión de ingeniería.`,

      "notfound.title": `Ruta no encontrada`, "notfound.text": `Este recurso no existe o está clasificado.`, "notfound.cta": `Volver al inicio`,

      "author.role": `Fundador & Arquitecto de software`,

      "post_ia.tag": `Inteligencia Artificial`, "post_ia.date": `2 jul 2026`, "post_ia.readtime": `6`,
      "post_ia.meta_title": `Orquestación de agentes de IA en producción — Blog de Gabriel Díaz Bernal`,
      "post_ia.meta_desc": `Lecciones reales sobre llevar sistemas multiagente de IA a producción: fallos silenciosos, coste de contexto y por qué la orquestación importa más que el modelo.`,
      "post_ia.title": `Orquestación de agentes de IA en producción: lecciones de 2026`,
      "post_ia.p1": `En 2026 ya nadie discute si usar agentes de IA en producción; la pregunta es cómo evitar que un sistema multiagente se convierta en una caja negra imposible de depurar.`,
      "post_ia.p2": `El primer error habitual es tratar cada agente como un microservicio independiente sin memoria compartida. En sistemas críticos, la trazabilidad de las decisiones importa tanto como el resultado final.`,
      "post_ia.p3": `Adoptamos un patrón de orquestador central con agentes especializados de tarea única, cada uno auditado y con presupuesto de contexto explícito. Reduce los fallos silenciosos y facilita el rollback.`,
      "post_ia.quote": `Un sistema de agentes sin observabilidad real es un sistema en el que no se puede confiar en producción, por bueno que parezca en la demo.`,
      "post_ia.p4": `El coste ya no es solo de tokens: es de latencia acumulada entre llamadas. Optimizar el grafo de decisión ahorra más que optimizar el prompt.`,
      "post_ia.p5": `La lección más cara la aprendimos observando en producción, no en el laboratorio. Y esa es, en el fondo, la única forma honesta de aprenderla.`,

      "post_edge.tag": `Infraestructura`, "post_edge.date": `14 jun 2026`, "post_edge.readtime": `5`,
      "post_edge.meta_title": `Edge computing distribuido — Blog de Gabriel Díaz Bernal`,
      "post_edge.meta_desc": `Por qué el futuro no vive en una nube central: cómo diseñamos arquitecturas edge para clientes que no pueden esperar ni 100 ms.`,
      "post_edge.title": `Edge computing distribuido: por qué el futuro no vive en una nube central`,
      "post_edge.p1": `Cuando un cliente necesita decisiones en menos de 20 milisegundos, ninguna región de nube central es suficientemente cercana. La respuesta ya no es «más servidores», es «menos distancia».`,
      "post_edge.p2": `Movimos inferencia, autenticación y parte de la lógica de negocio al borde, cerca del usuario o del dispositivo, con sincronización eventual hacia el núcleo.`,
      "post_edge.p3": `El reto no es técnico, es de consistencia: diseñar para fallos parciales y datos desactualizados a propósito, sin romper la experiencia.`,
      "post_edge.quote": `WebAssembly nos permitió desplegar el mismo binario auditado en el borde, en el navegador y en el servidor, sin reescribir lógica crítica tres veces.`,
      "post_edge.p4": `El resultado: latencias de un dígito en la mayoría de continentes, y una arquitectura que degrada con elegancia en lugar de caer por completo.`,
      "post_edge.p5": `Ninguna de estas decisiones fue gratuita. Cada una se pagó con semanas de pruebas de caos antes de tocar producción.`,

      "post_pqc.tag": `Seguridad`, "post_pqc.date": `3 may 2026`, "post_pqc.readtime": `7`,
      "post_pqc.meta_title": `Criptografía poscuántica — Blog de Gabriel Díaz Bernal`,
      "post_pqc.meta_desc": `Migrar a criptografía resistente a computación cuántica no es pánico, es planificación. Cómo lo abordamos en sistemas que deben durar diez años.`,
      "post_pqc.title": `Criptografía poscuántica: preparar hoy sistemas que deben durar diez años`,
      "post_pqc.p1": `«Harvest now, decrypt later» dejó de ser un escenario teórico: hay actores capturando tráfico cifrado hoy, apostando a poder descifrarlo cuando la computación cuántica lo permita.`,
      "post_pqc.p2": `Para sistemas con datos sensibles a diez años vista, esperar a que «todo el mundo migre» no es una estrategia, es una apuesta que no aceptamos en nombre de un cliente.`,
      "post_pqc.p3": `Adoptamos esquemas híbridos: algoritmos clásicos combinados con primitivas poscuánticas ya estandarizadas, para no depender de una sola familia criptográfica.`,
      "post_pqc.quote": `La parte más difícil no fue la criptografía, fue el inventario: saber dónde vive cada clave, cada certificado y cada dependencia heredada antes de tocar nada.`,
      "post_pqc.p4": `Migrar en caliente, sin downtime y con rollback verificado, es exactamente el tipo de proyecto que aceptamos: alto riesgo, cero margen de error.`,
      "post_pqc.p5": `Diez años parece mucho tiempo hasta que es tu infraestructura la que tiene que seguir en pie cuando llegue.`
    },

    en: {
      "meta.title": `Gabriel Díaz Bernal — Software Architect`,
      "meta.description": `Gabriel Díaz Bernal leads a studio of 25 elite software engineers. Undisclosed location. We work on demand and accept projects only under very selective terms.`,

      "nav.home": `Home`, "nav.about": `About`, "nav.stack": `Stack`, "nav.team": `Team`,
      "nav.process": `Process`, "nav.blog": `Blog`,

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

      "blog.eyebrow": `Field notes`, "blog.title": `Notes from the studio`,
      "blog.subtitle": `Ideas, architectures, and lessons from projects we can't always name.`,
      "blog.readmore": `Read article`, "blog.viewall": `View the full blog`, "blog.back": `Back to blog`, "blog.minread": `min read`,
      "blog.post1_tag": `Artificial Intelligence`, "blog.post1_title": `Orchestrating AI agents in production: lessons from 2026`,
      "blog.post1_excerpt": `What we learned taking real multi-agent systems to production: silent failures, context cost, and why orchestration matters more than the model.`, "blog.post1_date": `Jul 2, 2026`,
      "blog.post2_tag": `Infrastructure`, "blog.post2_title": `Distributed edge computing: why the future doesn't live in a central cloud`,
      "blog.post2_excerpt": `Cloud centralization has a latency ceiling. Here's how we design edge architectures for clients who can't wait even 100ms.`, "blog.post2_date": `Jun 14, 2026`,
      "blog.post3_tag": `Security`, "blog.post3_title": `Post-quantum cryptography: preparing today systems that must last a decade`,
      "blog.post3_excerpt": `Migrating to quantum-resistant cryptography isn't panic, it's planning. How we approach it in systems that can't afford a breach in 2035.`, "blog.post3_date": `May 3, 2026`,

      "footer.tagline": `Elite software. By invitation.`, "footer.rights": `All rights reserved.`,
      "footer.made": `Site built with engineering precision.`,

      "notfound.title": `Route not found`, "notfound.text": `This resource doesn't exist, or it's classified.`, "notfound.cta": `Back to home`,

      "author.role": `Founder & Software Architect`,

      "post_ia.tag": `Artificial Intelligence`, "post_ia.date": `Jul 2, 2026`, "post_ia.readtime": `6`,
      "post_ia.meta_title": `Orchestrating AI agents in production — Gabriel Díaz Bernal's blog`,
      "post_ia.meta_desc": `Real lessons from taking multi-agent AI systems to production: silent failures, context cost, and why orchestration matters more than the model.`,
      "post_ia.title": `Orchestrating AI agents in production: lessons from 2026`,
      "post_ia.p1": `In 2026, nobody debates whether to use AI agents in production anymore; the question is how to stop a multi-agent system from becoming a black box you can't debug.`,
      "post_ia.p2": `The first common mistake is treating each agent like an independent microservice with no shared memory. In critical systems, the traceability of decisions matters as much as the final output.`,
      "post_ia.p3": `We adopted a central-orchestrator pattern with single-task specialized agents, each audited and given an explicit context budget. It cuts silent failures and makes rollback easier.`,
      "post_ia.quote": `An agent system with no real observability is a system you can't trust in production, no matter how good it looks in the demo.`,
      "post_ia.p4": `The cost is no longer just tokens: it's the latency that accumulates across calls. Optimizing the decision graph saves more than optimizing the prompt.`,
      "post_ia.p5": `We learned the most expensive lesson by watching production, not the lab. That's ultimately the only honest way to learn it.`,

      "post_edge.tag": `Infrastructure`, "post_edge.date": `Jun 14, 2026`, "post_edge.readtime": `5`,
      "post_edge.meta_title": `Distributed edge computing — Gabriel Díaz Bernal's blog`,
      "post_edge.meta_desc": `Why the future doesn't live in a central cloud: how we design edge architectures for clients who can't wait even 100ms.`,
      "post_edge.title": `Distributed edge computing: why the future doesn't live in a central cloud`,
      "post_edge.p1": `When a client needs decisions in under 20 milliseconds, no central cloud region is close enough. The answer is no longer "more servers," it's "less distance."`,
      "post_edge.p2": `We moved inference, authentication, and part of the business logic to the edge, close to the user or the device, with eventual sync back to the core.`,
      "post_edge.p3": `The challenge isn't technical, it's about consistency: designing for partial failures and intentionally stale data without breaking the experience.`,
      "post_edge.quote": `WebAssembly let us ship the same audited binary at the edge, in the browser, and on the server, without rewriting critical logic three times.`,
      "post_edge.p4": `The result: single-digit latency on most continents, and an architecture that degrades gracefully instead of falling over completely.`,
      "post_edge.p5": `None of these decisions came free. Each one was paid for with weeks of chaos testing before it ever touched production.`,

      "post_pqc.tag": `Security`, "post_pqc.date": `May 3, 2026`, "post_pqc.readtime": `7`,
      "post_pqc.meta_title": `Post-quantum cryptography — Gabriel Díaz Bernal's blog`,
      "post_pqc.meta_desc": `Migrating to quantum-resistant cryptography isn't panic, it's planning. How we approach it in systems that must last a decade.`,
      "post_pqc.title": `Post-quantum cryptography: preparing today systems that must last a decade`,
      "post_pqc.p1": `"Harvest now, decrypt later" is no longer a theoretical scenario: some actors are capturing encrypted traffic today, betting they'll be able to decrypt it once quantum computing catches up.`,
      "post_pqc.p2": `For systems with data sensitive ten years out, waiting for "everyone else to migrate" isn't a strategy, it's a bet we won't make on a client's behalf.`,
      "post_pqc.p3": `We adopted hybrid schemes: classical algorithms combined with already-standardized post-quantum primitives, so we never depend on a single cryptographic family.`,
      "post_pqc.quote": `The hardest part wasn't the cryptography, it was the inventory: knowing where every key, every certificate, and every legacy dependency actually lives before touching anything.`,
      "post_pqc.p4": `Migrating live, with no downtime and a verified rollback path, is exactly the kind of project we accept: high risk, zero margin for error.`,
      "post_pqc.p5": `Ten years sounds like a long time — until it's your infrastructure that has to still be standing when it arrives.`
    },

    fr: {
      "meta.title": `Gabriel Díaz Bernal — Architecte logiciel`,
      "meta.description": `Gabriel Díaz Bernal dirige un studio de 25 ingénieurs logiciels d'élite. Localisation non divulguée. Nous travaillons à la demande et n'acceptons des projets que selon des conditions très sélectives.`,

      "nav.home": `Accueil`, "nav.about": `À propos`, "nav.stack": `Stack`, "nav.team": `Équipe`,
      "nav.process": `Processus`, "nav.blog": `Blog`,

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

      "blog.eyebrow": `Carnet de bord`, "blog.title": `Notes depuis le studio`,
      "blog.subtitle": `Idées, architectures et leçons de projets que nous ne pouvons pas toujours nommer.`,
      "blog.readmore": `Lire l'article`, "blog.viewall": `Voir tout le blog`, "blog.back": `Retour au blog`, "blog.minread": `min de lecture`,
      "blog.post1_tag": `Intelligence artificielle`, "blog.post1_title": `Orchestrer des agents d'IA en production : leçons de 2026`,
      "blog.post1_excerpt": `Ce que nous avons appris en mettant de vrais systèmes multi-agents en production : échecs silencieux, coût du contexte et pourquoi l'orchestration compte plus que le modèle.`, "blog.post1_date": `2 juil. 2026`,
      "blog.post2_tag": `Infrastructure`, "blog.post2_title": `Edge computing distribué : pourquoi l'avenir ne vit pas dans un cloud central`,
      "blog.post2_excerpt": `La centralisation dans le cloud a un plafond de latence. Voici comment nous concevons des architectures en périphérie pour des clients qui ne peuvent attendre même 100 ms.`, "blog.post2_date": `14 juin 2026`,
      "blog.post3_tag": `Sécurité`, "blog.post3_title": `Cryptographie post-quantique : préparer aujourd'hui des systèmes qui doivent durer dix ans`,
      "blog.post3_excerpt": `Migrer vers une cryptographie résistante au quantique n'est pas de la panique, c'est de la planification. Comment nous l'abordons dans des systèmes qui ne peuvent pas se permettre une brèche en 2035.`, "blog.post3_date": `3 mai 2026`,

      "footer.tagline": `Logiciel d'élite. Sur invitation.`, "footer.rights": `Tous droits réservés.`,
      "footer.made": `Site construit avec précision d'ingénierie.`,

      "notfound.title": `Route introuvable`, "notfound.text": `Cette ressource n'existe pas, ou elle est classifiée.`, "notfound.cta": `Retour à l'accueil`,

      "author.role": `Fondateur & Architecte logiciel`,

      "post_ia.tag": `Intelligence artificielle`, "post_ia.date": `2 juil. 2026`, "post_ia.readtime": `6`,
      "post_ia.meta_title": `Orchestrer des agents d'IA en production — Blog de Gabriel Díaz Bernal`,
      "post_ia.meta_desc": `Leçons concrètes tirées de la mise en production de systèmes d'IA multi-agents : échecs silencieux, coût du contexte et pourquoi l'orchestration compte plus que le modèle.`,
      "post_ia.title": `Orchestrer des agents d'IA en production : leçons de 2026`,
      "post_ia.p1": `En 2026, plus personne ne débat de l'usage d'agents d'IA en production ; la question est d'éviter qu'un système multi-agents ne devienne une boîte noire impossible à déboguer.`,
      "post_ia.p2": `La première erreur courante consiste à traiter chaque agent comme un microservice indépendant sans mémoire partagée. Dans les systèmes critiques, la traçabilité des décisions compte autant que le résultat final.`,
      "post_ia.p3": `Nous avons adopté un schéma d'orchestrateur central avec des agents spécialisés à tâche unique, chacun audité et doté d'un budget de contexte explicite. Cela réduit les échecs silencieux et facilite le rollback.`,
      "post_ia.quote": `Un système d'agents sans véritable observabilité est un système auquel on ne peut pas faire confiance en production, aussi bon soit-il en démonstration.`,
      "post_ia.p4": `Le coût n'est plus seulement en tokens : c'est la latence accumulée entre les appels. Optimiser le graphe de décision économise plus que d'optimiser le prompt.`,
      "post_ia.p5": `La leçon la plus coûteuse, nous l'avons apprise en observant la production, pas le laboratoire. C'est d'ailleurs la seule façon honnête de l'apprendre.`,

      "post_edge.tag": `Infrastructure`, "post_edge.date": `14 juin 2026`, "post_edge.readtime": `5`,
      "post_edge.meta_title": `Edge computing distribué — Blog de Gabriel Díaz Bernal`,
      "post_edge.meta_desc": `Pourquoi l'avenir ne vit pas dans un cloud central : comment nous concevons des architectures en périphérie pour des clients qui ne peuvent attendre même 100 ms.`,
      "post_edge.title": `Edge computing distribué : pourquoi l'avenir ne vit pas dans un cloud central`,
      "post_edge.p1": `Quand un client a besoin de décisions en moins de 20 millisecondes, aucune région de cloud central n'est assez proche. La réponse n'est plus « plus de serveurs », c'est « moins de distance ».`,
      "post_edge.p2": `Nous avons déplacé l'inférence, l'authentification et une partie de la logique métier vers la périphérie, près de l'utilisateur ou de l'appareil, avec une synchronisation éventuelle vers le noyau.`,
      "post_edge.p3": `Le défi n'est pas technique, il est question de cohérence : concevoir pour des pannes partielles et des données volontairement obsolètes sans casser l'expérience.`,
      "post_edge.quote": `WebAssembly nous a permis de déployer le même binaire audité en périphérie, dans le navigateur et sur le serveur, sans réécrire trois fois la logique critique.`,
      "post_edge.p4": `Résultat : des latences à un chiffre sur la plupart des continents, et une architecture qui se dégrade avec élégance plutôt que de s'effondrer complètement.`,
      "post_edge.p5": `Aucune de ces décisions n'a été gratuite. Chacune a coûté des semaines de tests du chaos avant de toucher à la production.`,

      "post_pqc.tag": `Sécurité`, "post_pqc.date": `3 mai 2026`, "post_pqc.readtime": `7`,
      "post_pqc.meta_title": `Cryptographie post-quantique — Blog de Gabriel Díaz Bernal`,
      "post_pqc.meta_desc": `Migrer vers une cryptographie résistante au quantique n'est pas de la panique, c'est de la planification. Comment nous l'abordons pour des systèmes qui doivent durer dix ans.`,
      "post_pqc.title": `Cryptographie post-quantique : préparer aujourd'hui des systèmes qui doivent durer dix ans`,
      "post_pqc.p1": `« Harvest now, decrypt later » n'est plus un scénario théorique : certains acteurs capturent déjà du trafic chiffré aujourd'hui, pariant sur la possibilité de le déchiffrer une fois l'informatique quantique suffisamment mature.`,
      "post_pqc.p2": `Pour des systèmes dont les données restent sensibles dans dix ans, attendre que « tout le monde migre » n'est pas une stratégie, c'est un pari que nous refusons de prendre au nom d'un client.`,
      "post_pqc.p3": `Nous avons adopté des schémas hybrides : algorithmes classiques combinés à des primitives post-quantiques déjà standardisées, afin de ne jamais dépendre d'une seule famille cryptographique.`,
      "post_pqc.quote": `La partie la plus difficile n'était pas la cryptographie, c'était l'inventaire : savoir où vit chaque clé, chaque certificat et chaque dépendance héritée avant de toucher à quoi que ce soit.`,
      "post_pqc.p4": `Migrer à chaud, sans interruption et avec un rollback vérifié, est exactement le type de projet que nous acceptons : risque élevé, marge d'erreur nulle.`,
      "post_pqc.p5": `Dix ans semble long — jusqu'à ce que ce soit votre infrastructure qui doive encore tenir debout le moment venu.`
    },

    pt: {
      "meta.title": `Gabriel Díaz Bernal — Arquiteto de Software`,
      "meta.description": `Gabriel Díaz Bernal lidera um estúdio de 25 engenheiros de software de elite. Localização não divulgada. Trabalhamos sob demanda e aceitamos projetos apenas em condições muito seletas.`,

      "nav.home": `Início`, "nav.about": `Sobre mim`, "nav.stack": `Stack`, "nav.team": `Equipe`,
      "nav.process": `Processo`, "nav.blog": `Blog`,

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

      "blog.eyebrow": `Diário de bordo`, "blog.title": `Notas do estúdio`,
      "blog.subtitle": `Ideias, arquiteturas e lições de projetos que nem sempre podemos nomear.`,
      "blog.readmore": `Ler artigo`, "blog.viewall": `Ver todo o blog`, "blog.back": `Voltar ao blog`, "blog.minread": `min de leitura`,
      "blog.post1_tag": `Inteligência Artificial`, "blog.post1_title": `Orquestração de agentes de IA em produção: lições de 2026`,
      "blog.post1_excerpt": `O que aprendemos ao levar sistemas multiagente reais à produção: falhas silenciosas, custo de contexto e por que a orquestração importa mais que o modelo.`, "blog.post1_date": `2 jul 2026`,
      "blog.post2_tag": `Infraestrutura`, "blog.post2_title": `Edge computing distribuído: por que o futuro não vive em uma nuvem central`,
      "blog.post2_excerpt": `A centralização na nuvem tem um teto de latência. Contamos como projetamos arquiteturas de borda para clientes que não podem esperar nem 100 ms.`, "blog.post2_date": `14 jun 2026`,
      "blog.post3_tag": `Segurança`, "blog.post3_title": `Criptografia pós-quântica: preparar hoje sistemas que precisam durar dez anos`,
      "blog.post3_excerpt": `Migrar para criptografia resistente à computação quântica não é pânico, é planejamento. Como abordamos isso em sistemas que não podem se dar ao luxo de uma brecha em 2035.`, "blog.post3_date": `3 mai 2026`,

      "footer.tagline": `Software de elite. Sob convite.`, "footer.rights": `Todos os direitos reservados.`,
      "footer.made": `Site construído com precisão de engenharia.`,

      "notfound.title": `Rota não encontrada`, "notfound.text": `Este recurso não existe ou está classificado.`, "notfound.cta": `Voltar ao início`,

      "author.role": `Fundador & Arquiteto de Software`,

      "post_ia.tag": `Inteligência Artificial`, "post_ia.date": `2 jul 2026`, "post_ia.readtime": `6`,
      "post_ia.meta_title": `Orquestração de agentes de IA em produção — Blog de Gabriel Díaz Bernal`,
      "post_ia.meta_desc": `Lições reais de levar sistemas multiagente de IA à produção: falhas silenciosas, custo de contexto e por que a orquestração importa mais que o modelo.`,
      "post_ia.title": `Orquestração de agentes de IA em produção: lições de 2026`,
      "post_ia.p1": `Em 2026, ninguém mais discute se deve usar agentes de IA em produção; a pergunta é como evitar que um sistema multiagente se torne uma caixa-preta impossível de depurar.`,
      "post_ia.p2": `O primeiro erro comum é tratar cada agente como um microsserviço independente sem memória compartilhada. Em sistemas críticos, a rastreabilidade das decisões importa tanto quanto o resultado final.`,
      "post_ia.p3": `Adotamos um padrão de orquestrador central com agentes especializados de tarefa única, cada um auditado e com orçamento de contexto explícito. Isso reduz falhas silenciosas e facilita o rollback.`,
      "post_ia.quote": `Um sistema de agentes sem observabilidade real é um sistema no qual não se pode confiar em produção, por melhor que pareça na demo.`,
      "post_ia.p4": `O custo não é mais só de tokens: é a latência acumulada entre chamadas. Otimizar o grafo de decisão economiza mais do que otimizar o prompt.`,
      "post_ia.p5": `Aprendemos a lição mais cara observando a produção, não o laboratório. E essa é, no fundo, a única forma honesta de aprendê-la.`,

      "post_edge.tag": `Infraestrutura`, "post_edge.date": `14 jun 2026`, "post_edge.readtime": `5`,
      "post_edge.meta_title": `Edge computing distribuído — Blog de Gabriel Díaz Bernal`,
      "post_edge.meta_desc": `Por que o futuro não vive em uma nuvem central: como projetamos arquiteturas de borda para clientes que não podem esperar nem 100 ms.`,
      "post_edge.title": `Edge computing distribuído: por que o futuro não vive em uma nuvem central`,
      "post_edge.p1": `Quando um cliente precisa de decisões em menos de 20 milissegundos, nenhuma região de nuvem central está perto o suficiente. A resposta já não é "mais servidores", é "menos distância".`,
      "post_edge.p2": `Movemos inferência, autenticação e parte da lógica de negócio para a borda, perto do usuário ou do dispositivo, com sincronização eventual com o núcleo.`,
      "post_edge.p3": `O desafio não é técnico, é de consistência: projetar para falhas parciais e dados propositalmente desatualizados sem quebrar a experiência.`,
      "post_edge.quote": `O WebAssembly nos permitiu implantar o mesmo binário auditado na borda, no navegador e no servidor, sem reescrever a lógica crítica três vezes.`,
      "post_edge.p4": `O resultado: latências de um dígito na maioria dos continentes, e uma arquitetura que degrada com elegância em vez de cair por completo.`,
      "post_edge.p5": `Nenhuma dessas decisões saiu de graça. Cada uma custou semanas de testes de caos antes de tocar a produção.`,

      "post_pqc.tag": `Segurança`, "post_pqc.date": `3 mai 2026`, "post_pqc.readtime": `7`,
      "post_pqc.meta_title": `Criptografia pós-quântica — Blog de Gabriel Díaz Bernal`,
      "post_pqc.meta_desc": `Migrar para criptografia resistente à computação quântica não é pânico, é planejamento. Como abordamos isso em sistemas que precisam durar dez anos.`,
      "post_pqc.title": `Criptografia pós-quântica: preparar hoje sistemas que precisam durar dez anos`,
      "post_pqc.p1": `"Harvest now, decrypt later" deixou de ser um cenário teórico: existem atores capturando tráfego criptografado hoje, apostando que poderão decifrá-lo quando a computação quântica permitir.`,
      "post_pqc.p2": `Para sistemas com dados sensíveis daqui a dez anos, esperar que "todo mundo migre" não é uma estratégia, é uma aposta que não aceitamos fazer em nome de um cliente.`,
      "post_pqc.p3": `Adotamos esquemas híbridos: algoritmos clássicos combinados com primitivas pós-quânticas já padronizadas, para nunca depender de uma única família criptográfica.`,
      "post_pqc.quote": `A parte mais difícil não foi a criptografia, foi o inventário: saber onde vive cada chave, cada certificado e cada dependência legada antes de tocar em qualquer coisa.`,
      "post_pqc.p4": `Migrar em produção, sem downtime e com rollback verificado, é exatamente o tipo de projeto que aceitamos: alto risco, margem de erro zero.`,
      "post_pqc.p5": `Dez anos parece muito tempo — até que seja a sua infraestrutura que precise continuar de pé quando esse momento chegar.`
    },

    ar: {
      "meta.title": `غابرييل دياز بيرنال — مهندس برمجيات`,
      "meta.description": `يقود غابرييل دياز بيرنال استوديو من 25 مهندس برمجيات من النخبة. الموقع غير معلن. نعمل عند الطلب ونقبل المشاريع وفق شروط انتقائية للغاية فقط.`,

      "nav.home": `الرئيسية`, "nav.about": `نبذة عني`, "nav.stack": `التقنيات`, "nav.team": `الفريق`,
      "nav.process": `منهجية العمل`, "nav.blog": `المدونة`,

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

      "blog.eyebrow": `المدونة`, "blog.title": `ملاحظات من الاستوديو`,
      "blog.subtitle": `أفكار ومعماريات ودروس من مشاريع لا يمكننا دائمًا الإفصاح عن أسمائها.`,
      "blog.readmore": `قراءة المقال`, "blog.viewall": `عرض كل المدونة`, "blog.back": `العودة إلى المدونة`, "blog.minread": `دقائق قراءة`,
      "blog.post1_tag": `الذكاء الاصطناعي`, "blog.post1_title": `تنسيق وكلاء الذكاء الاصطناعي في الإنتاج: دروس عام 2026`,
      "blog.post1_excerpt": `ما تعلمناه من نقل أنظمة متعددة الوكلاء حقيقية إلى الإنتاج: أعطال صامتة، وتكلفة السياق، ولماذا يهم التنسيق أكثر من النموذج نفسه.`, "blog.post1_date": `2 يوليو 2026`,
      "blog.post2_tag": `البنية التحتية`, "blog.post2_title": `الحوسبة الطرفية الموزّعة: لماذا لا يعيش المستقبل في سحابة مركزية`,
      "blog.post2_excerpt": `للمركزية السحابية سقف زمن استجابة. نروي كيف نصمم معماريات طرفية لعملاء لا يمكنهم الانتظار حتى 100 مللي ثانية.`, "blog.post2_date": `14 يونيو 2026`,
      "blog.post3_tag": `الأمن`, "blog.post3_title": `التشفير ما بعد الكمّي: تجهيز أنظمة اليوم لتدوم عقدًا كاملاً`,
      "blog.post3_excerpt": `الانتقال إلى تشفير مقاوم للحوسبة الكمّية ليس ذعرًا، بل تخطيط. كيف نتعامل معه في أنظمة لا تحتمل اختراقًا في 2035.`, "blog.post3_date": `3 مايو 2026`,

      "footer.tagline": `برمجيات النخبة. بالدعوة فقط.`, "footer.rights": `جميع الحقوق محفوظة.`,
      "footer.made": `موقع مبني بدقة هندسية.`,

      "notfound.title": `المسار غير موجود`, "notfound.text": `هذا المورد غير موجود أو أنه سرّي.`, "notfound.cta": `العودة إلى الرئيسية`,

      "author.role": `المؤسس ومهندس البرمجيات`,

      "post_ia.tag": `الذكاء الاصطناعي`, "post_ia.date": `2 يوليو 2026`, "post_ia.readtime": `6`,
      "post_ia.meta_title": `تنسيق وكلاء الذكاء الاصطناعي في الإنتاج — مدونة غابرييل دياز بيرنال`,
      "post_ia.meta_desc": `دروس حقيقية من نقل أنظمة الذكاء الاصطناعي متعددة الوكلاء إلى الإنتاج: أعطال صامتة، وتكلفة السياق، ولماذا يهم التنسيق أكثر من النموذج.`,
      "post_ia.title": `تنسيق وكلاء الذكاء الاصطناعي في الإنتاج: دروس عام 2026`,
      "post_ia.p1": `في عام 2026 لم يعد أحد يناقش استخدام وكلاء الذكاء الاصطناعي في الإنتاج؛ السؤال هو كيف نمنع نظامًا متعدد الوكلاء من التحول إلى صندوق أسود يستحيل تصحيحه.`,
      "post_ia.p2": `الخطأ الأول الشائع هو معاملة كل وكيل كخدمة مصغّرة مستقلة بلا ذاكرة مشتركة. في الأنظمة الحرجة، تُعد إمكانية تتبع القرارات بأهمية النتيجة النهائية نفسها.`,
      "post_ia.p3": `تبنّينا نمط منسّق مركزي مع وكلاء متخصصين بمهمة واحدة، كل منهم مدقَّق وله ميزانية سياق واضحة. هذا يقلل الأعطال الصامتة ويسهّل التراجع.`,
      "post_ia.quote": `نظام وكلاء بلا مراقبة حقيقية هو نظام لا يمكن الوثوق به في الإنتاج، مهما بدا جيدًا في العرض التجريبي.`,
      "post_ia.p4": `التكلفة لم تعد فقط في الرموز: بل في زمن الاستجابة المتراكم بين النداءات. تحسين مخطط القرار يوفر أكثر من تحسين الطلب نفسه.`,
      "post_ia.p5": `تعلمنا الدرس الأغلى من مراقبة الإنتاج، لا المختبر. وهذه في الجوهر الطريقة الصادقة الوحيدة لتعلّمه.`,

      "post_edge.tag": `البنية التحتية`, "post_edge.date": `14 يونيو 2026`, "post_edge.readtime": `5`,
      "post_edge.meta_title": `الحوسبة الطرفية الموزّعة — مدونة غابرييل دياز بيرنال`,
      "post_edge.meta_desc": `لماذا لا يعيش المستقبل في سحابة مركزية: كيف نصمم معماريات طرفية لعملاء لا يمكنهم الانتظار حتى 100 مللي ثانية.`,
      "post_edge.title": `الحوسبة الطرفية الموزّعة: لماذا لا يعيش المستقبل في سحابة مركزية`,
      "post_edge.p1": `حين يحتاج العميل إلى قرارات في أقل من 20 مللي ثانية، لا تكون أي منطقة سحابية مركزية قريبة بما يكفي. الجواب لم يعد "مزيدًا من الخوادم"، بل "مسافة أقل".`,
      "post_edge.p2": `نقلنا الاستدلال والمصادقة وجزءًا من منطق العمل إلى الطرف، بالقرب من المستخدم أو الجهاز، مع مزامنة لاحقة نحو النواة المركزية.`,
      "post_edge.p3": `التحدي ليس تقنيًا، بل يتعلق بالاتساق: التصميم لأعطال جزئية وبيانات قديمة عن قصد دون كسر التجربة.`,
      "post_edge.quote": `مكّننا WebAssembly من نشر نفس الملف الثنائي المدقَّق عند الطرف، وفي المتصفح، وعلى الخادم، دون إعادة كتابة المنطق الحرج ثلاث مرات.`,
      "post_edge.p4": `النتيجة: زمن استجابة أحادي الرقم في معظم القارات، ومعمارية تتدهور بأناقة بدلاً من الانهيار الكامل.`,
      "post_edge.p5": `لم يكن أي من هذه القرارات مجانيًا. كل قرار كلّف أسابيع من اختبارات الفوضى قبل أن يلمس الإنتاج.`,

      "post_pqc.tag": `الأمن`, "post_pqc.date": `3 مايو 2026`, "post_pqc.readtime": `7`,
      "post_pqc.meta_title": `التشفير ما بعد الكمّي — مدونة غابرييل دياز بيرنال`,
      "post_pqc.meta_desc": `الانتقال إلى تشفير مقاوم للحوسبة الكمّية ليس ذعرًا، بل تخطيط. كيف نتعامل معه في أنظمة يجب أن تدوم عقدًا كاملاً.`,
      "post_pqc.title": `التشفير ما بعد الكمّي: تجهيز أنظمة اليوم لتدوم عقدًا كاملاً`,
      "post_pqc.p1": `لم تعد استراتيجية "اجمع الآن، فك التشفير لاحقًا" سيناريو نظريًا: هناك جهات تلتقط حركة بيانات مشفّرة اليوم، رهانًا على إمكانية فك تشفيرها متى سمحت الحوسبة الكمّية بذلك.`,
      "post_pqc.p2": `بالنسبة لأنظمة تحمل بيانات حساسة على مدى عشر سنوات، فإن انتظار أن "يهاجر الجميع" ليس استراتيجية، بل رهان لا نقبل خوضه نيابة عن عميل.`,
      "post_pqc.p3": `تبنّينا مخططات هجينة: خوارزميات كلاسيكية مدمجة مع بدائل ما بعد كمّية موحّدة بالفعل، حتى لا نعتمد على عائلة تشفير واحدة.`,
      "post_pqc.quote": `لم يكن الجزء الأصعب هو التشفير، بل الجرد: معرفة مكان كل مفتاح وكل شهادة وكل تبعية قديمة قبل المساس بأي شيء.`,
      "post_pqc.p4": `الترحيل أثناء التشغيل، دون توقف وبتراجع موثّق، هو بالضبط نوع المشاريع التي نقبلها: مخاطرة عالية، وهامش خطأ صفري.`,
      "post_pqc.p5": `تبدو عشر سنوات مدة طويلة إلى أن تكون بنيتك التحتية هي التي يجب أن تظل صامدة حين تحين تلك اللحظة.`
    },

    zh: {
      "meta.title": `加布里埃尔·迪亚兹·贝尔纳尔 — 软件架构师`,
      "meta.description": `加布里埃尔·迪亚兹·贝尔纳尔领导着一支由25名精英软件工程师组成的团队。地点保密。我们按需工作，仅在非常严格的条件下承接项目。`,

      "nav.home": `首页`, "nav.about": `关于我`, "nav.stack": `技术栈`, "nav.team": `团队`,
      "nav.process": `合作流程`, "nav.blog": `博客`,

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

      "blog.eyebrow": `工作室手记`, "blog.title": `来自工作室的笔记`,
      "blog.subtitle": `来自那些我们未必能公开名字的项目的想法、架构与经验教训。`,
      "blog.readmore": `阅读全文`, "blog.viewall": `查看全部博客`, "blog.back": `返回博客`, "blog.minread": `分钟阅读`,
      "blog.post1_tag": `人工智能`, "blog.post1_title": `生产环境中的AI智能体编排：2026年的经验教训`,
      "blog.post1_excerpt": `将真实的多智能体系统推向生产环境后我们学到了什么：静默故障、上下文成本，以及为何编排比模型本身更重要。`, "blog.post1_date": `2026年7月2日`,
      "blog.post2_tag": `基础设施`, "blog.post2_title": `分布式边缘计算：为何未来不属于中心化云端`,
      "blog.post2_excerpt": `云端集中化存在延迟上限。我们分享如何为无法容忍超过100毫秒延迟的客户设计边缘架构。`, "blog.post2_date": `2026年6月14日`,
      "blog.post3_tag": `安全`, "blog.post3_title": `后量子密码学：让今天的系统为未来十年做好准备`,
      "blog.post3_excerpt": `迁移到抗量子加密并非出于恐慌，而是出于规划。我们如何在承受不起2035年数据泄露的系统中推进这项工作。`, "blog.post3_date": `2026年5月3日`,

      "footer.tagline": `精英软件，仅限受邀。`, "footer.rights": `版权所有，保留所有权利。`,
      "footer.made": `以工程级精度构建的网站。`,

      "notfound.title": `路径未找到`, "notfound.text": `该资源不存在，或已被列为保密内容。`, "notfound.cta": `返回首页`,

      "author.role": `创始人兼软件架构师`,

      "post_ia.tag": `人工智能`, "post_ia.date": `2026年7月2日`, "post_ia.readtime": `6`,
      "post_ia.meta_title": `生产环境中的AI智能体编排 — 加布里埃尔·迪亚兹·贝尔纳尔博客`,
      "post_ia.meta_desc": `将多智能体AI系统真正推向生产环境的经验教训：静默故障、上下文成本，以及为何编排比模型本身更重要。`,
      "post_ia.title": `生产环境中的AI智能体编排：2026年的经验教训`,
      "post_ia.p1": `到了2026年，是否该在生产环境中使用AI智能体已不再是问题；真正的问题是如何避免一个多智能体系统沦为无法调试的黑箱。`,
      "post_ia.p2": `最常见的第一个错误，是把每个智能体当作没有共享记忆的独立微服务对待。在关键系统中，决策的可追溯性和最终结果同样重要。`,
      "post_ia.p3": `我们采用了中央编排器模式，搭配多个专注单一任务的智能体，每个都经过审计并拥有明确的上下文预算。这减少了静默故障，也让回滚更容易。`,
      "post_ia.quote": `一个缺乏真正可观测性的智能体系统，无论演示效果多好，都是一个无法在生产环境中被信任的系统。`,
      "post_ia.p4": `成本已不再只是token的问题：而是调用之间累积的延迟。优化决策图带来的收益，远胜于优化提示词本身。`,
      "post_ia.p5": `我们最昂贵的一课，是通过观察生产环境而非实验室学到的。归根结底，这也是学到它的唯一诚实方式。`,

      "post_edge.tag": `基础设施`, "post_edge.date": `2026年6月14日`, "post_edge.readtime": `5`,
      "post_edge.meta_title": `分布式边缘计算 — 加布里埃尔·迪亚兹·贝尔纳尔博客`,
      "post_edge.meta_desc": `为何未来不属于中心化云端：我们如何为无法容忍超过100毫秒延迟的客户设计边缘架构。`,
      "post_edge.title": `分布式边缘计算：为何未来不属于中心化云端`,
      "post_edge.p1": `当客户需要在20毫秒内做出决策时，没有任何中心化云区域足够靠近。答案不再是"增加服务器"，而是"缩短距离"。`,
      "post_edge.p2": `我们将推理、身份验证以及部分业务逻辑迁移到了边缘，贴近用户或设备端，并与核心系统进行最终同步。`,
      "post_edge.p3": `挑战并非技术层面的，而是一致性层面的：需要为部分故障和刻意存在的过期数据做设计，同时不破坏使用体验。`,
      "post_edge.quote": `WebAssembly让我们能够在边缘、浏览器与服务器上部署同一个经过审计的二进制文件，而无需将关键逻辑重写三遍。`,
      "post_edge.p4": `结果是：在大多数大陆实现了个位数延迟，架构也能优雅降级，而不是彻底崩溃。`,
      "post_edge.p5": `这些决策没有一个是没有代价的。每一项都是在真正接触生产环境之前，用数周的混沌测试换来的。`,

      "post_pqc.tag": `安全`, "post_pqc.date": `2026年5月3日`, "post_pqc.readtime": `7`,
      "post_pqc.meta_title": `后量子密码学 — 加布里埃尔·迪亚兹·贝尔纳尔博客`,
      "post_pqc.meta_desc": `迁移到抗量子加密并非出于恐慌，而是出于规划。我们如何在必须坚持十年的系统中推进这项工作。`,
      "post_pqc.title": `后量子密码学：让今天的系统为未来十年做好准备`,
      "post_pqc.p1": `"现在窃取，日后解密"已不再是纸上谈兵的场景：已有攻击者在今天截获加密流量，赌的是量子计算成熟后能将其破解。`,
      "post_pqc.p2": `对于数据敏感期长达十年的系统而言，等待"所有人都迁移完成"并不是一种策略，而是我们不愿代表客户去下的赌注。`,
      "post_pqc.p3": `我们采用了混合方案：将经典算法与已标准化的后量子加密算法相结合，从而不依赖单一的密码学体系。`,
      "post_pqc.quote": `最难的部分不是密码学本身，而是资产清点：在动手之前，先弄清楚每一把密钥、每一张证书、每一项遗留依赖究竟在哪里。`,
      "post_pqc.p4": `在不停机的情况下完成实时迁移，并具备经过验证的回滚方案——这正是我们愿意承接的项目类型：高风险，零容错空间。`,
      "post_pqc.p5": `十年听起来很长，直到那一刻真正来临，需要屹立不倒的，是你自己的基础设施。`
    },

    ja: {
      "meta.title": `ガブリエル・ディアス・ベルナル — ソフトウェアアーキテクト`,
      "meta.description": `ガブリエル・ディアス・ベルナルは、25名の精鋭ソフトウェアエンジニアからなるスタジオを率いています。所在地非公開。オンデマンドで活動し、極めて厳選された条件下でのみプロジェクトを受託します。`,

      "nav.home": `ホーム`, "nav.about": `プロフィール`, "nav.stack": `技術スタック`, "nav.team": `チーム`,
      "nav.process": `プロセス`, "nav.blog": `ブログ`,

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

      "blog.eyebrow": `ブログ`, "blog.title": `スタジオからのノート`,
      "blog.subtitle": `名前を明かせないプロジェクトから得たアイデア、アーキテクチャ、そして教訓。`,
      "blog.readmore": `記事を読む`, "blog.viewall": `ブログ一覧を見る`, "blog.back": `ブログに戻る`, "blog.minread": `分で読了`,
      "blog.post1_tag": `人工知能`, "blog.post1_title": `本番環境におけるAIエージェントオーケストレーション：2026年の教訓`,
      "blog.post1_excerpt": `実際のマルチエージェントシステムを本番環境へ投入して学んだこと——サイレント障害、コンテキストコスト、そしてなぜモデルよりオーケストレーションが重要なのか。`, "blog.post1_date": `2026年7月2日`,
      "blog.post2_tag": `インフラストラクチャ`, "blog.post2_title": `分散型エッジコンピューティング：なぜ未来は中央集権的なクラウドにはないのか`,
      "blog.post2_excerpt": `クラウドの中央集権化にはレイテンシの限界があります。100ミリ秒すら待てないクライアントのために、私たちがどのようにエッジアーキテクチャを設計しているかをお伝えします。`, "blog.post2_date": `2026年6月14日`,
      "blog.post3_tag": `セキュリティ`, "blog.post3_title": `耐量子暗号：10年先まで持ちこたえるシステムを今日から準備する`,
      "blog.post3_excerpt": `耐量子暗号への移行はパニックではなく、計画です。2035年の情報漏えいを許容できないシステムで、私たちがどう取り組んでいるか。`, "blog.post3_date": `2026年5月3日`,

      "footer.tagline": `エリートソフトウェア。招待制。`, "footer.rights": `全著作権所有。`,
      "footer.made": `エンジニアリングの精度で構築されたサイト。`,

      "notfound.title": `ページが見つかりません`, "notfound.text": `このリソースは存在しないか、機密情報です。`, "notfound.cta": `ホームに戻る`,

      "author.role": `創設者 & ソフトウェアアーキテクト`,

      "post_ia.tag": `人工知能`, "post_ia.date": `2026年7月2日`, "post_ia.readtime": `6`,
      "post_ia.meta_title": `本番環境におけるAIエージェントオーケストレーション — ガブリエル・ディアス・ベルナル ブログ`,
      "post_ia.meta_desc": `マルチエージェントAIシステムを実際に本番環境へ投入して得たリアルな教訓——サイレント障害、コンテキストコスト、そしてなぜモデルよりオーケストレーションが重要なのか。`,
      "post_ia.title": `本番環境におけるAIエージェントオーケストレーション：2026年の教訓`,
      "post_ia.p1": `2026年、本番環境でAIエージェントを使うかどうかはもはや議論の対象ではありません。問題は、マルチエージェントシステムがデバッグ不可能なブラックボックスになるのをどう防ぐかです。`,
      "post_ia.p2": `よくある最初の過ちは、各エージェントを共有メモリを持たない独立したマイクロサービスとして扱うことです。重要なシステムでは、意思決定のトレーサビリティは最終的な結果と同じくらい重要です。`,
      "post_ia.p3": `私たちは、単一タスクに特化したエージェント群を中央オーケストレーターがまとめるパターンを採用しました。各エージェントは監査対象であり、明示的なコンテキスト予算を持ちます。これによりサイレント障害が減り、ロールバックも容易になります。`,
      "post_ia.quote": `本物の可観測性を欠いたエージェントシステムは、デモでどれほど良く見えても、本番環境で信頼できるシステムではありません。`,
      "post_ia.p4": `コストはもはやトークンだけの問題ではなく、呼び出し間で積み重なるレイテンシの問題です。意思決定グラフの最適化は、プロンプトの最適化よりも大きな効果をもたらします。`,
      "post_ia.p5": `最も高くついた教訓は、ラボではなく本番環境を観察することで学びました。そして結局のところ、それこそが唯一誠実な学び方なのです。`,

      "post_edge.tag": `インフラストラクチャ`, "post_edge.date": `2026年6月14日`, "post_edge.readtime": `5`,
      "post_edge.meta_title": `分散型エッジコンピューティング — ガブリエル・ディアス・ベルナル ブログ`,
      "post_edge.meta_desc": `なぜ未来は中央集権的なクラウドにはないのか——100ミリ秒すら待てないクライアントのためのエッジアーキテクチャ設計。`,
      "post_edge.title": `分散型エッジコンピューティング：なぜ未来は中央集権的なクラウドにはないのか`,
      "post_edge.p1": `クライアントが20ミリ秒以内の意思決定を必要とするとき、どの中央クラウドリージョンも十分に近くはありません。答えはもはや「サーバーを増やす」ことではなく、「距離を縮める」ことです。`,
      "post_edge.p2": `私たちは推論、認証、そして一部のビジネスロジックをエッジへ移し、ユーザーやデバイスの近くで処理したうえで、コアへの同期は事後的に行うようにしました。`,
      "post_edge.p3": `課題は技術的なものではなく、一貫性の設計にあります。部分的な障害や意図的に古いデータを前提としながら、体験を損なわない設計が求められます。`,
      "post_edge.quote": `WebAssemblyのおかげで、監査済みの同一バイナリをエッジ、ブラウザ、サーバーに展開でき、重要なロジックを三度書き直す必要がなくなりました。`,
      "post_edge.p4": `結果として、ほとんどの大陸で一桁ミリ秒のレイテンシを実現し、完全にダウンするのではなく優雅に劣化するアーキテクチャが生まれました。`,
      "post_edge.p5": `これらの判断はどれもタダではありません。それぞれが、本番環境に触れる前の数週間にわたるカオステストの上に成り立っています。`,

      "post_pqc.tag": `セキュリティ`, "post_pqc.date": `2026年5月3日`, "post_pqc.readtime": `7`,
      "post_pqc.meta_title": `耐量子暗号 — ガブリエル・ディアス・ベルナル ブログ`,
      "post_pqc.meta_desc": `耐量子暗号への移行はパニックではなく、計画です。10年先まで持ちこたえる必要があるシステムでの取り組み方。`,
      "post_pqc.title": `耐量子暗号：10年先まで持ちこたえるシステムを今日から準備する`,
      "post_pqc.p1": `「今収集し、後で復号する」はもはや理論上のシナリオではありません。量子コンピューティングが実用化された時点で復号できることに賭けて、今日この瞬間も暗号化された通信を収集している主体が存在します。`,
      "post_pqc.p2": `10年先まで機密性を保つべきデータを扱うシステムにとって、「みんなが移行するのを待つ」のは戦略ではなく、クライアントに代わって私たちが受け入れることのできない賭けです。`,
      "post_pqc.p3": `私たちはハイブリッド方式を採用しました。従来型アルゴリズムと、すでに標準化された耐量子暗号プリミティブを組み合わせることで、単一の暗号方式ファミリーに依存しないようにしています。`,
      "post_pqc.quote": `最も難しかったのは暗号技術そのものではなく、棚卸しでした——何かに手を付ける前に、すべての鍵、証明書、レガシーな依存関係がどこにあるかを把握することです。`,
      "post_pqc.p4": `ダウンタイムなしで、検証済みのロールバック手段を備えたライブ移行——それこそが私たちが引き受けるプロジェクトそのものです。高いリスク、ゼロの許容誤差。`,
      "post_pqc.p5": `10年は長く感じられます——それが到来したとき、なお立ち続けていなければならないのが自分のインフラだと気づくまでは。`
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
