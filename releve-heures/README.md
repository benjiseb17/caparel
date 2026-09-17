# Relevé d'heures

Application Next.js pour la saisie des heures des intervenants à domicile. Le backend est une base Airtable.

> Pour l'utilisation au quotidien — côté intervenante comme côté direction —
> voir le [guide d'utilisation](GUIDE.md). Ce README couvre l'installation et la
> configuration technique.

## 1. Créer la base Airtable

Crée une base Airtable avec **4 tables** :

### Table `Intervenants`

| Champ            | Type                         |
| ---------------- | ---------------------------- |
| `Nom et Prenom`   | Texte sur une ligne — nom complet, ex. `Benjamin Sebahoun` (champ principal) |
| `Email`           | Texte sur une ligne          |
| `Code activation` | Formule — `"CAPAREL-" & UPPER(RIGHT(RECORD_ID(), 6))`. Code de première connexion, généré automatiquement et unique par intervenant |
| `MotDePasseHash`  | Texte sur une ligne          |
| `Actif`           | Case à cocher                |
| `Photo`           | Pièce jointe (optionnel — sans photo, des initiales sont affichées) |
| `TauxHoraire`     | Nombre (décimal, en €/h — sert à calculer le chiffre d'affaires) |

### Table `Clients`

| Champ                  | Type                                              |
| ----------------------- | -------------------------------------------------- |
| `Nom`                   | Texte sur une ligne                                 |
| `Adresse`               | Texte sur une ligne                                 |
| `Numero client`         | Texte sur une ligne                                 |
| `Actif`                 | Case à cocher                                       |
| `Intervenants assignes` | Lien vers un autre enregistrement → `Intervenants` (plusieurs possibles) |

> `Intervenants assignes` détermine quels intervenants voient ce client (sur la page d'accueil et dans le menu déroulant de saisie).

### Table `Releves`

| Champ                | Type                                  |
| --------------------- | -------------------------------------- |
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
| `Intervenant`        | Lien vers un autre enregistrement → `Intervenants`    |
| `Mois`               | Date (ex. premier jour du mois : `2026-08-01`)        |
| `Fichier`            | Pièce jointe (le PDF de la fiche de paie)             |
| `Publiee`            | Case à cocher — la fiche n'apparaît dans l'app **que si elle est cochée** |
| `Email intervenant`  | Lookup de `Email` via `Intervenant`                   |
| `Name`               | Formule — libellé auto (`Benjamin Sebahoun — Septembre 2026`) |

> Chaque intervenant ne voit que ses propres fiches de paie, listées dans l'onglet Historique.

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

### Méthode recommandée : code d'activation

Personne n'a besoin de connaître le mot de passe de l'intervenante, ni de lancer
de commande :

1. Créer la ligne dans `Intervenants` avec `Nom et Prenom`, `Email` et `Actif` coché.
   Laisser `MotDePasseHash` vide.
2. Lire le `Code activation` de la ligne (généré automatiquement, rien à saisir) et
   le transmettre à l'intervenante.
3. Elle se rend sur `/activation` (lien « Première connexion ? » depuis la page de
   connexion), saisit son email, le code, et choisit son mot de passe.

L'app hashe le mot de passe côté serveur et l'écrit dans `MotDePasseHash`.

**Usage unique** : le code étant une formule, l'app ne peut pas l'effacer. Il devient
donc inerte dès qu'un mot de passe existe — la route refuse l'activation d'un compte
déjà pourvu, même avec le bon code.

**Réinitialiser un accès** : vider `MotDePasseHash` dans Airtable. Le code de
l'intervenante redevient valable et elle peut redéfinir son mot de passe.

### Méthode manuelle (dépannage)

```bash
node scripts/hash-password.mjs "mon-mot-de-passe"
```

Copie le résultat dans le champ `MotDePasseHash` de la ligne correspondante dans la table `Intervenants`, avec `Actif` coché.

## 5. Lancer l'application

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) — tu seras redirigé vers `/login`.

## Fonctionnement

- **Connexion** (`/login`) : email + mot de passe, vérifiés contre la table `Intervenants`.
- **Première connexion** (`/activation`) : email + code d'activation + nouveau mot de passe. La route `/api/activation` vérifie le code (insensible à la casse), hashe le mot de passe (bcrypt) et l'enregistre. Elle refuse tout compte disposant déjà d'un mot de passe, ce qui rend le code inutilisable une fois consommé. Un mauvais code et un email inconnu renvoient le même message, pour ne pas révéler quels comptes existent.
- **Accueil** (`/`) : profil de l'intervenant (photo ou initiales, prénom, nom), la liste des clients qui lui sont assignés (`Intervenants assignes` dans `Clients`), et un récapitulatif chiffré — heures et chiffre d'affaires du mois (avec graphiques par semaine) et chiffre d'affaires de l'année en cours (graphique par mois). Le chiffre d'affaires est calculé comme `heures réalisées × TauxHoraire` de l'intervenant. Sur grand écran, clients et récapitulatif s'affichent côte à côte ; en mobile, tout est empilé.
- **Relevé d'heure** (`/saisie`) : l'intervenant choisit un client (parmi les siens), une date (aujourd'hui par défaut), une heure d'arrivée et de départ. Le nombre d'heures est calculé automatiquement et affiché en direct. Une case à cocher lui fait certifier sur l'honneur l'exactitude des informations avant de pouvoir valider.
- **Validation** : le bouton "Valider" envoie les données à `/api/releves`, qui recalcule les heures côté serveur (pour éviter toute manipulation côté client), vérifie que la certification a bien été cochée, et crée un enregistrement dans la table `Releves`, lié à l'intervenant connecté et au client choisi.
- **Historique** (`/historique`) : liste des relevés déjà saisis par l'intervenant, ainsi qu'une section "Mes fiches de paie" listant ses bulletins (table `FichesDePaie`) avec un lien de téléchargement direct.
- **Modification d'un relevé** : cliquer sur un relevé dans l'historique révèle un bouton "Modifier", qui ouvre le même formulaire pré-rempli (client, date, heures, commentaire). La certification doit être recochée avant de "Revalider". Envoie une requête `PATCH /api/releves/[id]`, qui vérifie que l'intervenant connecté est bien le propriétaire du relevé avant de le modifier dans Airtable.

## Déploiement

L'app est un projet Next.js standard (ex. déploiement sur Vercel). Pense à configurer les mêmes variables d'environnement (`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AUTH_SECRET`, et `AUTH_URL` si nécessaire) sur la plateforme de déploiement.
