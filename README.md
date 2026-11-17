# Le Voyage Olfactif

Application web qui guide une marque, étape par étape, de l'idée d'un parfum jusqu'au brief et aux échantillons. Elle a été réalisée dans le cadre du hackathon Givaudan (HETIC).

Le parcours se présente comme une **roadmap animée** en 5 étapes. Nota, un petit flacon d'échantillon animé, accompagne l'utilisateur grâce à une IA locale (Ollama).

## Les 5 étapes

1. Votre projet (idée, type de produit et cible)
2. Les contraintes
3. Famille olfactive
4. Votre brief
5. Vos échantillons

La maison (la marque du client) est renseignée une fois pour toutes dans le profil. Elle le sera plus tard à l'inscription.

## Pages

| Adresse | Contenu |
|---|---|
| `/` | Accueil : présentation et aperçu animé de la roadmap |
| `/voyage` | La roadmap du projet actif (route en relief, épingles, illustrations) |
| `/etape/1` à `/etape/5` | Les étapes. L'étape 1 est codée, les suivantes sont en préparation |
| `/projets` | Mes projets : un voyage par projet, avec son état et sa progression |
| `/profil` | Mon profil et les informations de la maison |

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

## Voix de Nota (introduction)

À la première visite de la roadmap, Nota présente le parcours à voix haute. La voix est enregistrée dans `public/voix/intro-*.wav`. Elle a été générée avec [Piper](https://github.com/rhasspy/piper), une synthèse vocale neuronale gratuite qui fonctionne hors ligne, avec la voix française « Jessica » (`fr_FR-upmc-medium`, locutrice `jessica`).

Après une modification du texte de l'intro (`src/lib/intro.ts`), régénérez les fichiers :

1. Placez Piper (`piper_windows_amd64.zip`, à extraire) et la voix ([`fr/fr_FR/upmc/medium`](https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/upmc/medium) : fichiers `.onnx` et `.onnx.json`) dans `~/.piper`, ou dans le dossier indiqué par `PIPER_DIR`.
2. Lancez :

```bash
npm run voix
```

## Organisation du code

- `src/components/JourneyMap.tsx` : la roadmap (route, épingles, animations)
- `src/components/Illustrations.tsx` : boutique, flacons, fleurs, cloche, vanille, forêt (SVG)
- `src/components/Nota.tsx` et `NotaChat.tsx` : la mascotte et son chat
- `src/components/steps/` : les pages d'étape et leurs éléments communs
- `src/lib/journey.ts` : projets et progression ; `src/lib/profile.ts` : profil
