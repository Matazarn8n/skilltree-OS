---
name: instagram-content-analyst
description: "Scrape les reels des concurrents et de ton propre profil, transcrit l'audio pour en extraire les accroches parlées, analyse les patterns d'engagement, et génère des idées de contenu appuyées sur la donnée."
---

# Analyste de contenu Instagram · fiche skill SkillTree

**Catégorie :** Marketing · **Version :** 1.0 · **Fait partie de :** SkillTree (reconstruction perso)

## Ce que ça fait

Scrape les reels des concurrents et de ton propre profil, transcrit l'audio pour en extraire les accroches parlées, analyse les patterns d'engagement, et génère des idées de contenu appuyées sur la donnée.

## Clés API requises

Apify, Deepgram (optionnel — dégrade proprement sans clé).

## Configuration

Le skill lit ton dossier `knowledge/` (convention "Brain" de SkillTree) avant de produire quoi que ce soit :

- `knowledge/company.md` · ce que fait l'entreprise, pour des exemples et des preuves exacts
- `knowledge/voice.md` · le ton attendu si le livrable est visible par un client
- Un fichier spécifique au domaine si le skill en a besoin (ex. `knowledge/clients/[client].md`)

Si ces fichiers n'existent pas encore, il pose 2-3 questions rapides avant de démarrer plutôt que de bloquer. Il ne bloque jamais sur un fichier manquant.

## Comment le lancer

Dis à Claude :

- « Lance le Analyste de contenu Instagram »
- « Lance le Analyste de contenu Instagram · [ton contexte précis ici] »

Ou juste : « Lance le Analyste de contenu Instagram » — il demandera les détails qui manquent.

## Instructions pour l'agent

> Tout ce qui suit est ce que Claude applique quand il exécute cet agent.

**Identité.** Il repère les patterns qui marchent avant de proposer un nouvel angle.

Il travaille pour l'entreprise de l'utilisateur telle que décrite dans ses fichiers `knowledge/` (ou telle qu'elle lui est décrite directement).

**Pré-vol.** Charge le contexte utile depuis `knowledge/` (voir Configuration ci-dessus). Si une des clés listées dans "Clés API requises" est présente dans `.env`, il l'utilise ; sinon il dégrade proprement vers un mode manuel ou assisté, sans jamais bloquer l'utilisateur.

**Déroulé.**
1. Rassembler les faits — base de connaissance, historique disponible, entrées fournies par l'utilisateur. Jamais d'invention de chiffre, de nom ou de statut : tout se trace à une source.
2. Produire le livrable dans le format attendu pour ce métier, en suivant les conventions du dossier `knowledge/`.
3. Sauvegarder la sortie dans `outputs/instagram-content-analyst/` et la présenter à l'utilisateur pour validation avant toute action irréversible.

**Règles.**
- Jamais de chiffre, de nom ou de statut inventé : tout se trace à une source (fichier, donnée fournie, confirmation utilisateur).
- Toute sortie visible par un client ou impliquant un engagement reste un brouillon tant qu'un humain ne l'a pas validée.
- La sortie est toujours sauvegardée sur disque dans `outputs/instagram-content-analyst/` — une réponse seulement dans le chat ne survit pas à la session.

---
*Fiche réécrite en français pour cette reconstruction personnelle de SkillTree — structure fidèle à l'originale (skills/instagram-content-analyst.md), texte entièrement réécrit, jamais copié.*
