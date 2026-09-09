# Relevé d'heures

Application Next.js pour la saisie des heures des intervenants à domicile. Le backend est une base Airtable.

## 1. Créer la base Airtable

Crée une base Airtable avec **4 tables** :

### Table `Intervenants`

| Champ            | Type                         |
| ---------------- | ---------------------------- |
| `Nom`             | Texte sur une ligne          |
| `Email`           | Texte sur une ligne          |
| `MotDePasseHash`  | Texte sur une ligne          |
| `Actif`           | Case à cocher                |

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

### Table `FichesDePaie`

| Champ         | Type                                                |
| -------------- | ---------------------------------------------------- |
| `Intervenant`  | Lien vers un autre enregistrement → `Intervenants`    |
| `Mois`         | Date (ex. premier jour du mois : `2026-08-01`)        |
| `Fichier`      | Pièce jointe (le PDF de la fiche de paie)             |

> Chaque intervenant ne voit que ses propres fiches de paie, listées dans l'onglet Historique.

> Les noms de champs doivent correspondre exactement (accents non inclus, comme indiqué ci-dessus) à ceux utilisés dans `src/lib/airtable.ts`.

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

Génère un hash :

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
- **Saisie** (`/`) : dès la connexion, l'intervenant voit les informations (nom, adresse, numéro client) des clients qui lui sont assignés (`Intervenants assignes` dans `Clients`). Il choisit ensuite un client (parmi les siens), une date (aujourd'hui par défaut), une heure d'arrivée et de départ. Le nombre d'heures est calculé automatiquement et affiché en direct. Une case à cocher lui fait certifier sur l'honneur l'exactitude des informations avant de pouvoir valider.
- **Validation** : le bouton "Valider" envoie les données à `/api/releves`, qui recalcule les heures côté serveur (pour éviter toute manipulation côté client), vérifie que la certification a bien été cochée, et crée un enregistrement dans la table `Releves`, lié à l'intervenant connecté et au client choisi.
- **Historique** (`/historique`) : liste des relevés déjà saisis par l'intervenant, ainsi qu'une section "Mes fiches de paie" listant ses bulletins (table `FichesDePaie`) avec un lien de téléchargement direct.

## Déploiement

L'app est un projet Next.js standard (ex. déploiement sur Vercel). Pense à configurer les mêmes variables d'environnement (`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AUTH_SECRET`, et `AUTH_URL` si nécessaire) sur la plateforme de déploiement.
