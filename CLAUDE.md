Este es un proyecto de un SaaS multi-tenant para salones de belleza / barberias / tattooshop, etc.

Backend: basado en NodeJS, utilizando Express, MariaDB para la database.

Frontend: basado en React JS utilizando react router.

Shared: Proyecto de schemas donde van las reglas de ciertos campos, para compartir entre frontend (en formularios) y backend para validaciones con Zod, e ste exporta los schemas en el package.json, asi que debes agregarlo en caso de una nueva feature.
