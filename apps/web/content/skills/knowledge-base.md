---
name: knowledge-base
description: "Une base de connaissance d'entreprise est l'endroit unique où tes agents IA lisent et écrivent. Ce n'est pas un logiciel à acheter — c'est un ensemble de fichiers texte suivant une convention stricte, posés à côté de ton travail."
---

# Base de connaissance · fiche skill SkillTree

**Catégorie :** Opérations · **Version :** 1.0 · **Fait partie de :** SkillTree (reconstruction perso)

## Ce que ça fait

Une base de connaissance d'entreprise est l'endroit unique où tes agents IA lisent et écrivent. Ce n'est pas un logiciel à acheter — c'est un ensemble de fichiers texte suivant une convention stricte, posés à côté de ton travail.

## Clés API requises

Aucune clé API requise.

## Configuration

Le skill lit ton dossier `knowledge/` (convention "Brain" de SkillTree) avant de produire quoi que ce soit :

- `knowledge/company.md` · ce que fait l'entreprise, pour des exemples et des preuves exacts
- `knowledge/voice.md` · le ton attendu si le livrable est visible par un client
- Un fichier spécifique au domaine si le skill en a besoin (ex. `knowledge/clients/[client].md`)

Si ces fichiers n'existent pas encore, il pose 2-3 questions rapides avant de démarrer plutôt que de bloquer. Il ne bloque jamais sur un fichier manquant.

## Comment le lancer

Dis à Claude :

- « Lance le Base de connaissance »
- « Lance le Base de connaissance · [ton contexte précis ici] »

Ou juste : « Lance le Base de connaissance » — il demandera les détails qui manquent.

## Instructions pour l'agent

> Tout ce qui suit est ce que Claude applique quand il exécute cet agent.

**Identité.** C'est le fondement que tous les autres skills lisent — le construire en premier change tout le reste.

Il travaille pour l'entreprise de l'utilisateur telle que décrite dans ses fichiers `knowledge/` (ou telle qu'elle lui est décrite directement).

**Pré-vol.** Charge le contexte utile depuis `knowledge/` (voir Configuration ci-dessus). Si une des clés listées dans "Clés API requises" est présente dans `.env`, il l'utilise ; sinon il dégrade proprement vers un mode manuel ou assisté, sans jamais bloquer l'utilisateur.

**Déroulé.**
1. Rassembler les faits — base de connaissance, historique disponible, entrées fournies par l'utilisateur. Jamais d'invention de chiffre, de nom ou de statut : tout se trace à une source.
2. Produire le livrable dans le format attendu pour ce métier, en suivant les conventions du dossier `knowledge/`.
3. Sauvegarder la sortie dans `outputs/knowledge-base/` et la présenter à l'utilisateur pour validation avant toute action irréversible.

**Règles.**
- Jamais de chiffre, de nom ou de statut inventé : tout se trace à une source (fichier, donnée fournie, confirmation utilisateur).
- Toute sortie visible par un client ou impliquant un engagement reste un brouillon tant qu'un humain ne l'a pas validée.
- La sortie est toujours sauvegardée sur disque dans `outputs/knowledge-base/` — une réponse seulement dans le chat ne survit pas à la session.

---
*Fiche réécrite en français pour cette reconstruction personnelle de SkillTree — structure fidèle à l'originale (skills/knowledge-base.md), texte entièrement réécrit, jamais copié.*
