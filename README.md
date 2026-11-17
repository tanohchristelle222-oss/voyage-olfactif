# Le Voyage Olfactif

Application web qui guide une marque, étape par étape, de l'idée d'un parfum jusqu'au brief et aux échantillons. Elle a été réalisée dans le cadre du hackathon Givaudan (HETIC).

Le parcours se présente comme une **roadmap animée** en 7 étapes. Nota, une petite goutte de parfum animée, accompagne l'utilisateur grâce à une IA locale (Ollama).

## Les 7 étapes

1. Votre maison
2. Votre projet
3. Votre cible
4. Famille olfactive
5. Les contraintes
6. Votre brief
7. Vos échantillons

## Pages

| Adresse | Contenu |
|---|---|
| `/` | Accueil : présentation et aperçu animé de la roadmap |
| `/voyage` | La roadmap du projet actif (route en relief, épingles, illustrations) |
| `/etape/1` à `/etape/7` | Les étapes. Les étapes 1 et 2 sont codées, les suivantes sont en préparation |
| `/projets` | Mes projets : un voyage par projet, avec son état et sa progression |
| `/profil` | Mon profil et les informations de la marque |

## Stack

- **Next.js 16** (App Router) et **TypeScript**
- **Tailwind CSS 4**
- **Motion** pour les animations : tracé de la route, chute des épingles, Nota…
- **Ollama** en local pour l'IA de Nota, via la route serveur `src/app/api/nota/route.ts`
- Police **Jost**, palette neutre inspirée de Givaudan (presque noir `#0B1215`, blanc cassé `#FAF9F6`, or `#C28921`)

Les projets et le profil sont sauvegardés dans le navigateur (`localStorage`).

## Lancer le projet

Prérequis : Node.js et [Ollama](https://ollama.com) avec un modèle de chat.

```bash
ollama pull qwen2.5:3b
npm install
npm run dev
```

Ouvrir ensuite http://localhost:3000.

> Sous Windows PowerShell, si `npm` est bloqué par la politique d'exécution, utilisez `npm.cmd run dev`.

Pour changer de modèle ou d'adresse Ollama, créez un fichier `.env.local` :

```
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_URL=http://localhost:11434
```

## Organisation du code

- `src/components/JourneyMap.tsx` : la roadmap (route, épingles, animations)
- `src/components/Illustrations.tsx` : boutique, flacons, fleurs, cloche, vanille, forêt (SVG)
- `src/components/Nota.tsx` et `NotaChat.tsx` : la mascotte et son chat
- `src/components/steps/` : les pages d'étape et leurs éléments communs
- `src/lib/journey.ts` : projets et progression ; `src/lib/profile.ts` : profil
