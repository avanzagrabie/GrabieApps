/* =========================================================
   Gabriel Díaz Bernal — i18n engine
   Detects device language (navigator.language) and swaps all
   [data-i18n] content client-side. No build step, no server.
   Supported: es (default/source) · en · fr · pt
   ========================================================= */

(function (global) {
  "use strict";

  var SUPPORTED = ["es", "en", "fr", "pt"];
  var DEFAULT_LANG = "es";
  var STORAGE_KEY = "gdb_lang";

  var LANG_LABELS = {
    es: { name: "Español", code: "ES" },
    en: { name: "English", code: "EN" },
    fr: { name: "Français", code: "FR" },
    pt: { name: "Português", code: "PT" }
  };

  var I18N = {
    es: {
      "meta.title": `Gabriel Díaz Bernal — Arquitecto de Software`,
      "meta.description": `Gabriel Díaz Bernal lidera un estudio de 25 ingenieros de software de élite. Ubicación no divulgada. Trabajamos bajo demanda y aceptamos proyectos solo bajo condiciones muy selectas.`,

      "nav.home": `Inicio`, "nav.about": `Sobre mí`, "nav.stack": `Stack`, "nav.team": `Equipo`,
      "nav.process": `Proceso`, "nav.blog": `Blog`, "nav.contact": `Contacto`, "nav.cta": `Solicitar acceso`,

      "hero.eyebrow": `Disponible solo bajo invitación`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Arquitecto de software. Fundador de un estudio distribuido de 25 ingenieros que construye lo que otros consideran imposible.`,
      "hero.cta_primary": `Solicitar acceso`,
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

      "contact.eyebrow": `Contacto`, "contact.title": `¿Tu proyecto merece nuestro equipo?`,
      "contact.subtitle": `Cuéntanos lo esencial. Respondemos solo a las solicitudes que encajan.`,
      "contact.form_name": `Nombre`, "contact.form_email": `Email`, "contact.form_type": `Tipo de proyecto`,
      "contact.form_budget": `Presupuesto estimado`, "contact.form_message": `Cuéntanos en pocas líneas`,
      "contact.form_submit": `Enviar solicitud confidencial`,
      "contact.form_note": `Toda solicitud se trata bajo confidencialidad. No compartimos ni vendemos tus datos.`,
      "contact.type_opt1": `Producto nuevo desde cero`, "contact.type_opt2": `Rescate de proyecto crítico`,
      "contact.type_opt3": `Auditoría de seguridad`, "contact.type_opt4": `Otro`,
      "contact.budget_opt1": `50.000 € – 150.000 €`, "contact.budget_opt2": `150.000 € – 500.000 €`,
      "contact.budget_opt3": `500.000 € +`, "contact.budget_opt4": `Prefiero indicarlo en la solicitud`,
      "contact.direct": `¿Prefieres ir directo? Escríbenos a`,

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
      "nav.process": `Process`, "nav.blog": `Blog`, "nav.contact": `Contact`, "nav.cta": `Request access`,

      "hero.eyebrow": `Available by invitation only`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Software architect. Founder of a distributed studio of 25 engineers that builds what others consider impossible.`,
      "hero.cta_primary": `Request access`,
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

      "contact.eyebrow": `Contact`, "contact.title": `Does your project deserve our team?`,
      "contact.subtitle": `Tell us the essentials. We only reply to requests that fit.`,
      "contact.form_name": `Name`, "contact.form_email": `Email`, "contact.form_type": `Project type`,
      "contact.form_budget": `Estimated budget`, "contact.form_message": `Tell us in a few lines`,
      "contact.form_submit": `Send confidential request`,
      "contact.form_note": `Every request is handled confidentially. We don't share or sell your data.`,
      "contact.type_opt1": `New product from scratch`, "contact.type_opt2": `Critical project rescue`,
      "contact.type_opt3": `Security audit`, "contact.type_opt4": `Other`,
      "contact.budget_opt1": `$50,000 – $150,000`, "contact.budget_opt2": `$150,000 – $500,000`,
      "contact.budget_opt3": `$500,000+`, "contact.budget_opt4": `I'd rather specify it in the request`,
      "contact.direct": `Prefer to go straight to the point? Write to us at`,

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
      "nav.process": `Processus`, "nav.blog": `Blog`, "nav.contact": `Contact`, "nav.cta": `Demander l'accès`,

      "hero.eyebrow": `Disponible uniquement sur invitation`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Architecte logiciel. Fondateur d'un studio distribué de 25 ingénieurs qui construit ce que d'autres jugent impossible.`,
      "hero.cta_primary": `Demander l'accès`,
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

      "contact.eyebrow": `Contact`, "contact.title": `Votre projet mérite-t-il notre équipe ?`,
      "contact.subtitle": `Dites-nous l'essentiel. Nous ne répondons qu'aux demandes qui correspondent.`,
      "contact.form_name": `Nom`, "contact.form_email": `Email`, "contact.form_type": `Type de projet`,
      "contact.form_budget": `Budget estimé`, "contact.form_message": `Expliquez-nous en quelques lignes`,
      "contact.form_submit": `Envoyer la demande confidentielle`,
      "contact.form_note": `Chaque demande est traitée confidentiellement. Nous ne partageons ni ne vendons vos données.`,
      "contact.type_opt1": `Nouveau produit à partir de zéro`, "contact.type_opt2": `Sauvetage de projet critique`,
      "contact.type_opt3": `Audit de sécurité`, "contact.type_opt4": `Autre`,
      "contact.budget_opt1": `50 000 € – 150 000 €`, "contact.budget_opt2": `150 000 € – 500 000 €`,
      "contact.budget_opt3": `500 000 € +`, "contact.budget_opt4": `Je préfère le préciser dans la demande`,
      "contact.direct": `Vous préférez aller droit au but ? Écrivez-nous à`,

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
      "nav.process": `Processo`, "nav.blog": `Blog`, "nav.contact": `Contato`, "nav.cta": `Solicitar acesso`,

      "hero.eyebrow": `Disponível apenas por convite`,
      "hero.title": `Gabriel Díaz Bernal`,
      "hero.subtitle": `Arquiteto de software. Fundador de um estúdio distribuído de 25 engenheiros que constrói o que outros consideram impossível.`,
      "hero.cta_primary": `Solicitar acesso`,
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

      "contact.eyebrow": `Contato`, "contact.title": `Seu projeto merece a nossa equipe?`,
      "contact.subtitle": `Conte-nos o essencial. Respondemos apenas às solicitações que se encaixam.`,
      "contact.form_name": `Nome`, "contact.form_email": `Email`, "contact.form_type": `Tipo de projeto`,
      "contact.form_budget": `Orçamento estimado`, "contact.form_message": `Conte-nos em poucas linhas`,
      "contact.form_submit": `Enviar solicitação confidencial`,
      "contact.form_note": `Toda solicitação é tratada com confidencialidade. Não compartilhamos nem vendemos seus dados.`,
      "contact.type_opt1": `Novo produto do zero`, "contact.type_opt2": `Resgate de projeto crítico`,
      "contact.type_opt3": `Auditoria de segurança`, "contact.type_opt4": `Outro`,
      "contact.budget_opt1": `US$ 50.000 – 150.000`, "contact.budget_opt2": `US$ 150.000 – 500.000`,
      "contact.budget_opt3": `US$ 500.000+`, "contact.budget_opt4": `Prefiro indicar na solicitação`,
      "contact.direct": `Prefere ir direto ao ponto? Escreva para`,

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
    LANG_LABELS: LANG_LABELS,
    detectLang: detectLang,
    applyLang: applyLang,
    t: t
  };

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(detectLang());
  });
})(window);
