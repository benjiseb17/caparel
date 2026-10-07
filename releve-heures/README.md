# Relevé d'heures

Application Next.js pour la saisie des heures des intervenants à domicile. Le backend est une base Airtable.

> Pour l'utilisation au quotidien — côté intervenante comme côté direction —
> voir le [guide d'utilisation](GUIDE.md). Ce README couvre l'installation et la
> configuration technique.

## 1. Créer la base Airtable

Crée une base Airtable avec **5 tables** :

### Table `Intervenants`

| Champ            | Type                         |
| ---------------- | ---------------------------- |
| `Nom et Prenom`   | Texte sur une ligne — nom complet, ex. `Benjamin Sebahoun` (champ principal) |
| `Email`           | Texte sur une ligne          |
| `MotDePasseHash`  | Texte sur une ligne          |
| `Actif`           | Case à cocher                |
| `Photo`           | Pièce jointe (optionnel — sans photo, des initiales sont affichées) |
| `TauxHoraire`     | Nombre (décimal, en €/h — sert à calculer le chiffre d'affaires) |

### Table `Referents`

Les référents encadrent des familles sans effectuer d'intervention. Ils ont donc
leur propre table, avec les seuls champs nécessaires à la connexion :

| Champ            | Type                         |
| ---------------- | ---------------------------- |
| `Nom et Prenom`   | Texte sur une ligne (champ principal) |
| `Email`           | Texte sur une ligne          |
| `MotDePasseHash`  | Texte sur une ligne          |
| `Actif`           | Case à cocher                |
| `Acces complet`   | Case à cocher — donne accès à **toutes** les familles dans l'onglet Mes familles, et pas seulement à celles dont la personne est référente (compte de direction) |

> Une personne ne doit figurer que dans **une seule** des deux tables. En cas de
> doublon d'email, c'est la ligne de `Referents` qui l'emporte à la connexion.

### Table `Clients`

| Champ                  | Type                                              |
| ----------------------- | -------------------------------------------------- |
| `Nom`                   | Texte sur une ligne                                 |
| `Adresse`               | Texte sur une ligne                                 |
| `Numero client`         | Texte sur une ligne                                 |
| `Actif`                 | Case à cocher                                       |
| `Intervenants assignes` | Lien vers un autre enregistrement → `Intervenants` (plusieurs possibles) |
| `Referent famille`      | Lien vers `Referents` — le ou les référents de cette famille |

> `Intervenants assignes` détermine quels intervenants voient ce client (sur la page d'accueil et dans le menu déroulant de saisie).

### Table `Releves`

| Champ                | Type                                  |
| --------------------- | -------------------------------------- |
| `Recapitulatif`        | Texte sur une ligne (champ principal) — libellé `Intervenante — Client — JJ/MM/AAAA`, écrit par l'app à la création |
| `Intervenant`          | Lien vers un autre enregistrement → `Intervenants` |
| `Client`               | Lien vers un autre enregistrement → `Clients`      |
| `Date`                 | Date                                   |
| `Heure d'arrivee`      | Texte sur une ligne (format `HH:mm`)   |
| `Heure de depart`      | Texte sur une ligne (format `HH:mm`)   |
| `Heures realisees`     | Nombre (décimal)                       |
| `Commentaire`          | Texte long (optionnel)                 |
| `Certification`        | Case à cocher (l'intervenant certifie sur l'honneur l'exactitude des informations) |

### Table `Fiches de Paie`

| Champ               | Type                                                |
| -------------------- | ---------------------------------------------------- |
| `Intervenant`        | Lien vers un autre enregistrement → `Intervenants` |
| `Mois`               | Date (ex. premier jour du mois : `2026-08-01`)        |
| `Fichier`            | Pièce jointe (le PDF de la fiche de paie)             |
| `Publiee`            | Case à cocher — la fiche n'apparaît dans l'app **que si elle est cochée** |
| `Email intervenant`  | Lookup de `Email` via `Intervenant`                   |
| `Name`               | Formule — libellé auto (`Benjamin Sebahoun — Septembre 2026`) |

> Chaque intervenant ne voit que ses propres fiches de paie, listées dans l'onglet Fiches de paie.

### Table `Reinitialisations`

Le journal des réinitialisations de mot de passe. L'app y écrit une ligne à chaque
fois que quelqu'un redéfinit son mot de passe depuis la page de connexion.

| Champ            | Type                                               |
| ---------------- | -------------------------------------------------- |
| `Recapitulatif`  | Texte sur une ligne (champ principal) — `Nom — 07/10/2026 19:46`, écrit par l'app |
| `Nom`            | Texte sur une ligne                                 |
| `Email`          | Texte sur une ligne                                 |
| `Demande le`     | Date et heure                                       |
| `Traite`         | Inutilisée depuis que la réinitialisation se fait sans intervention — supprimable |

**Déposer une fiche de paie** : créer un enregistrement, lier l'`Intervenant`, choisir le `Mois`, joindre le PDF dans `Fichier`, puis cocher `Publiee` quand elle doit devenir visible. Le libellé de la ligne (`Fiche`) se remplit tout seul.

> Le champ `Email intervenant` est là pour permettre une **Automation Airtable** (déclencheur : "Quand un enregistrement correspond à des critères" → `Publiee` est cochée → envoyer un email à `Email intervenant`), afin de prévenir l'intervenante que sa fiche est disponible. Cette partie se configure dans Airtable, sans code.

> **Renommer une colonne casse l'app.** Les noms de champs doivent correspondre exactement (accents non inclus, comme indiqué ci-dessus) à ceux utilisés dans `src/lib/airtable.ts`. En revanche, les **tables** sont ciblées par leur identifiant Airtable (`tbl…`, voir la constante `TABLES`), donc les renommer est sans effet.

## 2. Récupérer les identifiants Airtable

1. Va sur [airtable.com/create/tokens](https://airtable.com/create/tokens) et crée un **Personal Access Token** avec les scopes `data.records:read` et `data.records:write`, restreint à ta base.
2. Récupère l'ID de la base (commence par `app...`) dans l'URL Airtable ou via l'API doc de la base.

## 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Renseigne dans `.env.local` :

- `AIRTABLE_API_KEY` : le Personal Access Token
- `AIRTABLE_BASE_ID` : l'ID de la base
- `AUTH_SECRET` : génère-le avec `npx auth secret`

## 4. Créer un intervenant (compte de connexion)

Les mots de passe sont stockés **hashés** (bcrypt) dans Airtable, jamais en clair.

### Méthode recommandée : première connexion

Personne n'a besoin de connaître le mot de passe de l'intervenante, ni de lancer
de commande :

1. Créer la ligne dans `Intervenants` (ou `Referents`) avec `Nom et Prenom`,
   `Email` et `Actif` coché. Laisser `MotDePasseHash` vide.
2. Transmettre l'adresse du site à l'intervenante.
3. Elle se rend sur `/activation` (bouton « Première connexion » depuis la page
   de connexion), saisit son email et choisit son mot de passe.

L'app hashe le mot de passe côté serveur et l'écrit dans `MotDePasseHash`.

**L'email fait office de clé** : seule une adresse déjà enregistrée dans l'une des
deux tables, sur un compte `Actif` et sans mot de passe, permet d'en définir un. Il
faut donc saisir dans Airtable exactement l'adresse communiquée par l'intervenante.

**Usage unique** : l'absence de mot de passe est la condition. Dès qu'un mot de
passe existe, la route refuse toute nouvelle définition.

**Réinitialiser un accès** : vider `MotDePasseHash` dans Airtable. L'intervenante
peut alors repasser par « Première connexion ».

**Mot de passe oublié** : depuis la page de connexion, le lien « Mot de passe
oublié ? » mène à `/mot-de-passe-oublie`, où l'adresse email et un nouveau mot de
passe suffisent à réinitialiser l'accès, sans intervention de la direction.

> **Conséquence assumée** : l'adresse email est la seule preuve d'identité. Quiconque
> connaît celle d'une personne peut redéfinir son mot de passe, à tout moment et sur
> n'importe quel compte actif. Les réinitialisations sont journalisées dans
> `Reinitialisations` — y brancher une Automation Airtable est le seul garde-fou en
> place. Décocher `Actif` reste le moyen de couper un accès.

> Ce choix assume un compromis : entre la création de la ligne et la première
> connexion, quiconque connaît l'adresse email pourrait définir le mot de passe à la
> place de l'intervenante. Créer la ligne au moment où la personne est prête à se
> connecter referme cette fenêtre.

### Méthode manuelle (dépannage)

```bash
node scripts/hash-password.mjs "mon-mot-de-passe"
```

Copie le résultat dans le champ `MotDePasseHash` de la ligne correspondante (table `Intervenants` ou `Referents`), avec `Actif` coché.

## 5. Lancer l'application

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) — tu seras redirigé vers `/login`.

## Fonctionnement

- **Connexion** (`/login`) : email + mot de passe, vérifiés contre `Referents` puis `Intervenants`. La table d'origine détermine le parcours : une intervenante saisit ses heures et consulte sa paie, un référent suit ses familles et ne voit ni saisie, ni historique, ni fiches de paie.
- **Mot de passe oublié** (`/mot-de-passe-oublie`) : email + nouveau mot de passe. La route `/api/mot-de-passe-oublie` écrase `MotDePasseHash` sur tout compte actif, qu'il en ait déjà un ou non, journalise l'opération dans `Reinitialisations`, puis la page connecte la personne. Une adresse inconnue et un compte inactif renvoient le même message, pour ne pas révéler quels comptes existent.
- **Première connexion** (`/activation`) : email + nouveau mot de passe. La route `/api/activation` n'accepte que les comptes existants, `Actif` et dépourvus de mot de passe — l'absence de mot de passe fait office d'usage unique. Un email inconnu, un compte inactif et un compte déjà pourvu renvoient le même message, pour ne pas révéler quels comptes existent.
- **Accueil** (`/`) : pour un compte de la table `Referents`, un bloc **Direction** s'affiche — interventions du jour toutes intervenantes confondues, volume de la semaine, chiffre d'affaires du mois et nombre d'intervenantes actives ; le reste de l'accueil, propre aux intervenantes, lui est masqué. L'autorisation est relue depuis Airtable à chaque affichage, de sorte que retirer la ligne coupe l'accès immédiatement. Pour une intervenante : profil de l'intervenant (photo ou initiales, prénom, nom), la liste des clients qui lui sont assignés (`Intervenants assignes` dans `Clients`), et un récapitulatif chiffré — heures et chiffre d'affaires du mois, avec des flèches pour remonter dans les mois précédents. Le chiffre d'affaires est calculé comme `heures réalisées × TauxHoraire` de l'intervenant. Sur grand écran, clients et récapitulatif s'affichent côte à côte ; en mobile, tout est empilé.
- **Relevé d'heure** (`/saisie`) : l'intervenant choisit un client (parmi les siens), une date (aujourd'hui par défaut, et pas au-delà : un relevé se saisit après l'intervention), une heure d'arrivée et de départ. Le nombre d'heures est calculé automatiquement et affiché en direct. Une case à cocher lui fait certifier sur l'honneur l'exactitude des informations avant de pouvoir valider.
- **Validation** : le bouton "Valider" envoie les données à `/api/releves`, qui recalcule les heures côté serveur (pour éviter toute manipulation côté client), refuse toute date postérieure au jour même — évaluée sur le fuseau `Europe/Paris`, le serveur tournant en UTC —, vérifie que la certification a bien été cochée, et crée un enregistrement dans la table `Releves`, lié à l'intervenant connecté et au client choisi.
- **Historique** (`/historique`) : liste des relevés déjà saisis par l'intervenant, en lecture seule. Un relevé validé n'est plus modifiable depuis l'app — les corrections passent par la direction dans Airtable, afin que les heures servant de base à la paie ne changent plus après coup.
- **Mes familles** (`/familles`) : réservé aux comptes de la table `Referents`. Chaque référent y voit les familles dont il est `Referent famille` dans la table `Clients` — ou **toutes** les familles si `Acces complet` est coché sur sa ligne : heures du mois, intervenantes concernées et cinq dernières interventions. L'autorisation est relue depuis Airtable à chaque affichage.
- **Fiches de paie** (`/fiches-de-paie`) : ses bulletins (table `Fiches de Paie`), du plus récent au plus ancien, avec un lien de téléchargement direct. Seules les fiches cochées `Publiee` apparaissent.

## Déploiement

L'app est un projet Next.js standard (ex. déploiement sur Vercel). Pense à configurer les mêmes variables d'environnement (`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AUTH_SECRET`, et `AUTH_URL` si nécessaire) sur la plateforme de déploiement.
