# Le Voyage Olfactif

Application web qui guide une marque, étape par étape, de l'idée d'un parfum jusqu'au brief et aux échantillons. Elle a été réalisée dans le cadre du hackathon Givaudan (HETIC).

Le parcours conserve sa route illustrée et comprend **5 étapes**. Les six décors situés au bord de la route sont modélisés en 3D, avec un village animé au départ. Nota, un petit flacon animé, accompagne l'utilisateur grâce à une IA locale (Ollama).

## Les 5 étapes

1. Votre projet (idée et cible)
2. Les contraintes
3. Famille olfactive
4. Votre brief
5. Vos échantillons

La maison et le secteur se renseignent dans le profil ou à l’inscription. Les
anciens projets sont migrés : leurs réponses d’origine restent conservées et la
cible est reprise dans la première étape.

## Pages

| Adresse | Contenu |
|---|---|
| `/` | Accueil : présentation et aperçu animé de la roadmap |
| `/voyage` | La route du projet actif, ses cinq épingles et ses six décors 3D animés |
| `/etape/1` à `/etape/5` | Projet et cible à l’étape 1 ; les étapes suivantes sont en préparation |
| `/projets` | Mes projets : un voyage par projet, avec son état et sa progression |
| `/profil` | Mon profil et les informations de la marque |

## Stack

- **Next.js 16** (App Router) et **TypeScript**
- **Tailwind CSS 4**
- **Three.js** pour le village 3D, les passants, la camionnette et la fumée
- **Motion** pour les animations de l’interface et de Nota
- **Ollama** en local pour l'IA de Nota, via la route serveur `src/app/api/nota/route.ts`
- Polices locales **Futura Now Text et Futura Now Headline**, reprises du premier prototype Horizon ; palette neutre inspirée de Givaudan (presque noir `#0B1215`, blanc cassé `#FAF9F6`, or `#C28921`)

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

- `src/components/JourneyMap.tsx` : route illustrée et accès aux cinq étapes
- `src/components/MapDecor3D.tsx` : décors de la carte et ouverture du village agrandi
- `src/components/VillageAtStart.tsx` : vue agrandie du village
- `src/components/village/map-decor.mjs` : six modèles, cadrage et rendu partagé dans un seul canevas
- `src/components/village/` : scène Three.js et modèles 3D
- `src/components/Illustrations.tsx` : boutique, flacons, fleurs, cloche, vanille, forêt (SVG)
- `src/components/Nota.tsx` et `NotaChat.tsx` : la mascotte et son chat
- `src/components/steps/` : les pages d'étape et leurs éléments communs
- `src/lib/journey.ts` : projets et progression ; `src/lib/profile.ts` : profil

## Village 3D et profil

La navigation place désormais la déconnexion dans le profil. La page Commandes
présente l’historique, le détail du suivi et une préparation de réassort : la
validation du formulaire crée un projet prérempli, jamais une commande réelle.
L’introduction animée et sa voix, ainsi que le laboratoire ajouté par l’équipe,
sont conservés ; le coffre animé se trouve à proximité du laboratoire.

Une nouvelle ouverture du site présente la connexion. La session démo est limitée
à l’onglet (`sessionStorage`) et reste active lors d’une actualisation de cet
onglet. Les anciennes connexions persistantes sont ignorées. Le profil et les
projets restent conservés séparément dans `localStorage`.

À l’ouverture, une page de connexion reprend le visuel Horizon du premier prototype : dégradé bordeaux/rose, parfum avec cerises, formulaire et sélection FR/EN pour cette page. La connexion est simulée, sans serveur d’authentification ni vrai mot de passe. Elle conserve le profil dans le navigateur, puis ouvre la page demandée. Le bouton Déconnexion permet de revenir à cet écran sans effacer les projets. Le lien « Créer un compte » ouvre un formulaire d’inscription en français ou en anglais avec prénom, nom, entreprise, pays et email obligatoires, ainsi qu’un téléphone facultatif. Cette inscription crée uniquement le profil local et ouvre l’espace ; elle ne crée aucun compte serveur et n’enregistre aucun mot de passe. Le lien « Me connecter » permet de revenir au formulaire de connexion. Le reste du parcours conserve sa langue française.

La route, les cinq épingles, les zones olfactives et la nouvelle mascotte Nota sont conservés. Les six décors 3D restent visibles : village animé, produits et bougie, roses et jasmin, vanille et ambre, forêt et flacons sous cloche. Les épingles assurent la navigation. Le bouton « Agrandir le village » ouvre une vue en grand ; Échap ou Fermer permet de revenir au parcours.

La scène se charge côté navigateur et dispose d’une pause ; elle respecte la préférence de mouvement réduit. Les six décors partagent un seul contexte WebGL. Si WebGL ne fonctionne pas, les illustrations SVG d’origine restent visibles et un message le signale. Le cadrage est calculé pour chaque décor afin de remplir son emplacement sans masquer les épingles. Les modèles et textures sont inclus dans le code, sans fichiers 3D externes à télécharger.

Le profil permet de modifier le prénom, le nom, la fonction, les coordonnées, le pays, la marque et le secteur, ainsi qu’une photo facultative (JPG/PNG/WebP, 300 Ko maximum). Le bouton d’enregistrement conserve ces données localement ; le profil seul ne crée pas de projet. La marque accompagne le contexte du projet sans remplacer son nom de code.

Vérification :

```bash
npm test
npm run build
```

Les tests couvrent les six décors, leur séparation des cinq épingles, les animations, le profil, la migration des anciens projets et la connexion simulée. La migration conserve les réponses d’origine, reprend la cible dans le projet et préserve la marque. Les échanges avec un serveur Ollama réel restent à vérifier. Les pages d’étape 2 à 5 sont en préparation.


## Suivi des échantillons et commandes

Les deux pages sont accessibles dans la navigation sur ordinateur comme sur mobile (menu défilant horizontalement). L’onglet actif reprend le rose de la connexion. Chaque page offre une recherche par nom ou référence, des filtres par statut, les compteurs et un historique repliable. Les échantillons reçus peuvent être évalués ; les avis sont sauvegardés localement. Les données de suivi sont des exemples de démonstration et ne sont pas reliées aux projets, à un système de commandes ni à un transporteur réel. Aucun passage de commande n’est exécuté ici.

Les échéances sont enregistrées lors de la première ouverture, puis conservées au rechargement. Le compteur diminue sans modifier automatiquement le statut ; une échéance dépassée demande confirmation du statut. Si le stockage est indisponible, les avis restent accessibles pour la session et un message le précise. Les tests vérifient les échéances, la persistance, les restrictions d’évaluation et ce comportement de secours.

## Tubes à essai de l’étape 1

Trois tubes transparents à fond arrondi, de tailles différentes, remplacent le décor de produits près de l’épingle 2. Les niveaux roses et ambrés montent et descendent indépendamment ; des bulles remontent dans le liquide, des anneaux se diffusent à la surface et une vapeur légère s’échappe des ouvertures. Le portoir en bois est réellement percé et accompagné d’un carnet. Ce sont des modèles Three.js animés, sans image fixe plaquée. Les animations démarrent automatiquement et respectent la préférence de mouvement réduit. Le cadrage inclut l’ensemble des panaches, et les tests vérifient les niveaux, les bulles, la vapeur, le cadrage et l’immobilité à horloge constante.

## Sapins le long du parcours

Seize petits sapins en relief, avec des couronnes coniques vertes, des troncs bruns et des ombres légères, bordent les différentes portions de la route. Ils sont dessinés dans une scène Three.js partagée, sans créer de contexte WebGL supplémentaire. Leurs tailles et nuances varient, et un léger mouvement de vent accompagne les autres décors et respecte la préférence de mouvement réduit. Les épingles restent au-dessus ; la position des sapins laisse la chaussée et les autres scènes dégagées.

## Univers olfactif vivant

La dernière mise à jour place la navigation à droite du titre sur ordinateur et
dans un menu sur mobile. Les sapins sont agrandis de 40 %, les couleurs et les
décors sont renforcés. Le point lumineux déclenche l’ouverture d’un coffre à
cadenas et la vapeur des échantillons. Ces animations ne valident pas les étapes
et ne créent aucune commande. Le parcours à cinq étapes et la connexion à
l’entrée sont conservés.

La carte comprend un jardin avec des roses qui s’ouvrent, un petit agrume, une treille de vanille et des pistaches. Une serre en verre expose trois images d’inspiration (rose, vanille et pistache), dont la carte correspondant à l’univers choisi est mise en avant. Le laboratoire change progressivement ses couleurs selon le projet. Un courant rose et doré suit exactement la route, avec des particules orientées vers l’étape en cours. Le coffret final contient trois fioles et un récapitulatif miniature ; son couvercle s’ouvre pour révéler le contenu.

Le menu « Votre univers » propose rose, vanille, pistache, agrumes et boisé. Le choix est sauvegardé dans le champ `scentFamily` de l’étape 1 du projet actif. « Selon mon idée » reprend une détection simple par mots-clés dans les réponses ; ce mécanisme visuel ne fait pas appel à l’IA. Les informations personnelles de la maison ne sont pas utilisées pour cette détection. Le choix est transmis au contexte de Nota à l’étape 1.

Le bouton « Aperçu du coffret » ouvre ou referme le coffret sans modifier le projet, terminer une étape ou créer une commande. Un brief déjà marqué comme terminé déclenche aussi l’ouverture. Les étapes 2 à 5 restent les écrans de préparation existants : cet ajout concerne les scènes 3D et ne complète pas leur logique métier. La préférence de mouvement réduit arrête les nouvelles animations ; un changement d’univers reste visible dans ce mode. Les modèles se mettent à jour sans recréer le moteur WebGL. Les images de la serre sont locales et les ressources sont libérées à la fermeture de la page.


## Village local dans la zone Votre projet

Le petit jardin montré dans la capture est remplacé uniquement à son emplacement (`projectVillage`, mêmes coordonnées et dimensions). Le village de départ, la route, les autres décors, les formulaires et la navigation sont conservés. La nouvelle scène est construite en volumes Three.js ; elle s’inspire de l’image de référence sans utiliser cette image comme un panneau fixe.

Cinq petits bâtiments entourent une cour. Six personnes pipettent, sentent une touche, trient les pistaches, préparent les échantillons, accueillent les visiteurs et contrôlent la vanille. Un visiteur marche dans la cour ; une camionnette suit une voie périphérique aux virages arrondis. Les orchidées et gousses de vanille, les pistaches ouvertes et leurs amandes vertes, les fioles, les liquides et les vapeurs sont modélisés. Les couleurs des liquides suivent toujours l’univers du projet. La scène compte moins de 550 maillages pour rester compatible avec les autres décors.

Un clic sur ce village ouvre sa vue agrandie animée. Fermer ou Échap revient à la carte. Le bouton d’agrandissement du village de l’étape 1 garde sa fonction initiale. Les tests vérifient les entreprises, les métiers, les mouvements, les trajets hors des bâtiments, le budget géométrique et le cadrage de la scène pendant l’animation. Le rendu WebGL visuel reste à vérifier sur le navigateur de présentation, l’aperçu étant indisponible ici.

## Mise à jour locale : vent et accueil FR/EN
Vent des sapins renforcé, animations adaptées aux faibles fréquences et au retour sur un onglet. Accueil et navigation FR/EN avec la préférence de connexion. Accents roses Horizon. Les formulaires, le profil et le suivi restent conservés ; leur traduction est à compléter.
