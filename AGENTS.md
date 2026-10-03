# AGENTS.md · Editorial OS

Para cualquier agente/IA que vaya a modificar este repositorio:

1. Lee primero `docs/AI_START_HERE.md`.
2. Después lee `docs/PRODUCT_SPEC.md`, `docs/FEATURES_AND_USE_CASES.md`, `docs/ARCHITECTURE.md`, `docs/DATA_CONTRACTS.md`, `docs/VISUAL_REFERENCE_SPEC.md`, `docs/REFERENCES.md`, `docs/ROADMAP.md` y `docs/RELEASE_AND_QA.md`.
3. Inspecciona el código real antes de asumir que la documentación está perfectamente sincronizada.
4. Preserva los contratos legacy y `supabase-config.js`.
5. No introduzcas secretos en frontend o repo.
6. Prioriza fluidez, ergonomía iPhone/iPad, estabilidad y claridad sobre añadir features.
7. Si la tarea es crear una nueva versión, usa `AI_MASTER_PROMPT.md` como checklist/protocolo de entrega.

La arquitectura actual está diseñada para seguir siendo una PWA estática compatible con GitHub Pages + Supabase. No introduzcas un framework/build pesado sólo para copiar un componente.
