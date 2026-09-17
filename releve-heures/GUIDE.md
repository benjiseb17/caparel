# Guide d'utilisation — Relevé d'heures Caparel

Ce guide couvre les deux usages de l'application :

- **[Partie 1 — Pour les intervenantes](#partie-1--pour-les-intervenantes)** : se connecter, saisir ses heures, consulter ses fiches de paie.
- **[Partie 2 — Pour la direction](#partie-2--pour-la-direction)** : gérer les comptes, les clients, les fiches de paie depuis Airtable.

> La documentation technique (installation, variables d'environnement, structure
> de la base Airtable) se trouve dans [README.md](README.md).

---

# Partie 1 — Pour les intervenantes

## Se connecter la première fois

La direction vous transmet trois éléments : **l'adresse du site**, **votre adresse
email**, et un **code d'activation** de la forme `CAPAREL-4TB9KD`.

1. Ouvrez l'adresse du site
2. Sous le formulaire, cliquez sur **« Première connexion ? »**
3. Saisissez votre email et votre code d'activation
4. Choisissez **votre** mot de passe — 8 caractères minimum — et confirmez-le
5. Vous êtes connectée directement

Votre mot de passe vous appartient : Caparel ne le choisit pas et ne peut pas le
consulter. Le code d'activation, lui, ne fonctionne qu'une fois : une fois votre
mot de passe défini, il ne sert plus à rien.

Le code n'est pas sensible à la casse — `caparel-4tb9kd` fonctionne aussi bien.

## Se connecter ensuite

Email et mot de passe, comme sur n'importe quel service.

**Mot de passe oublié ?** Contactez la direction. Elle réinitialise votre accès et
vous repassez par « Première connexion ? » avec votre code pour en choisir un
nouveau. Votre ancien mot de passe n'est récupérable par personne.

## Accueil

L'écran d'accueil rassemble votre situation du mois.

**Votre profil** — photo (ou vos initiales à défaut) et votre nom.

**Vos clients** — les personnes qui vous sont assignées, avec leur adresse et leur
numéro de client. Si cette liste est vide ou incomplète, signalez-le à la
direction : c'est elle qui gère les affectations.

**Récapitulatif du mois** — vos heures réalisées, le chiffre d'affaires
correspondant, et deux graphiques par semaine.

Les flèches **‹ ›** de part et d'autre du mois permettent de remonter dans les mois
précédents. La flèche de droite est grisée sur le mois en cours : on ne peut pas
consulter un mois à venir.

> Le découpage en semaines suit les jours du mois, pas le calendrier :
> Sem. 1 = du 1 au 7, Sem. 2 = du 8 au 14, et ainsi de suite.

**Chiffre d'affaires de l'année** — le cumul mois par mois sur l'année en cours.

## Saisir un relevé d'heures

Onglet **Relevé d'heure**.

| Champ | Détail |
|---|---|
| **Client** | Uniquement vos clients assignés |
| **Date** | Le jour même par défaut, modifiable |
| **Heure d'arrivée** | Heure et minutes, séparément |
| **Heure de départ** | Idem |
| **Heures réalisées** | Calculé automatiquement, affiché en direct |
| **Commentaire** | Facultatif |

**Les minutes se choisissent par quart d'heure** : `00`, `15`, `30`, `45`. C'est
volontaire — les heures se comptent au quart d'heure près.

**Une intervention qui passe minuit est gérée** : une arrivée à `22:00` et un départ
à `02:00` donnent bien 4h00, pas une erreur.

Avant de valider, vous devez cocher la case de **certification sur l'honneur**. Le
bouton refusera l'enregistrement sans elle.

Le calcul des heures est refait côté serveur à l'enregistrement : la valeur affichée
à l'écran ne peut pas être contournée.

## Historique et corrections

Onglet **Historique**. Vous y retrouvez vos **20 derniers relevés**, du plus récent
au plus ancien, avec le client, la date, les horaires, le total et votre commentaire.

**Corriger un relevé :**

1. Cliquez sur le relevé concerné
2. Cliquez sur **Modifier**
3. Ajustez ce qui doit l'être — client, date, horaires, commentaire
4. **Recochez la certification** : elle est remise à zéro à chaque modification
5. Cliquez sur **Revalider**

Vous ne pouvez modifier que vos propres relevés : la vérification est faite côté
serveur, pas seulement dans l'écran.

> Il n'est pas possible de supprimer un relevé depuis l'application. Pour une
> suppression, passez par la direction.

## Fiches de paie

Onglet **Fiches de paie**. Vos bulletins sont listés par mois, du plus récent au
plus ancien. **Télécharger** ouvre le PDF.

Une fiche n'apparaît que lorsque la direction l'a publiée — si un mois manque,
c'est qu'elle n'est pas encore mise à disposition.

## Se déconnecter

Bouton **Se déconnecter**, en haut de chaque écran. Pensez-y sur un appareil
partagé.

---

# Partie 2 — Pour la direction

Toute l'administration se fait dans **Airtable**. L'application ne lit et n'écrit
que dans cette base — il n'y a pas d'interface d'administration séparée.

## Créer un compte intervenante

Dans la table **Intervenants** :

1. Créer la ligne : `Nom et Prenom`, `Email`, `Actif` coché, `TauxHoraire`
2. Laisser **`MotDePasseHash` vide** — il se remplira tout seul
3. Relever le `Code activation`, généré automatiquement
4. Transmettre à l'intervenante : l'adresse du site, son email, son code

Le `TauxHoraire` sert à calculer le chiffre d'affaires affiché sur son accueil
(heures réalisées × taux). Sans lui, ses montants resteront à zéro.

**Décocher `Actif`** bloque la connexion immédiatement — c'est la manière de
suspendre un accès sans supprimer l'historique.

## Réinitialiser un mot de passe

Vider la colonne `MotDePasseHash` de la ligne concernée. Son code d'activation
redevient valable et elle peut redéfinir son mot de passe.

## Assigner des clients

Dans la table **Clients**, la colonne `Intervenants assignes` détermine qui voit
quel client. Une intervenante ne voit que les clients où elle est listée, à la fois
sur son accueil et dans le menu déroulant de saisie.

Un client dont `Actif` n'est pas coché n'apparaît nulle part.

## Publier une fiche de paie

Dans la table **Fiches de Paie** :

1. Créer la ligne, lier l'`Intervenant`, choisir le `Mois`
2. Joindre le PDF dans `Fichier`
3. Cocher **`Publiee`** quand elle doit devenir visible

Tant que `Publiee` n'est pas cochée, la fiche reste invisible côté intervenante.
Cela permet de préparer tous les bulletins tranquillement, puis de les publier d'un
coup. Le libellé de la ligne se remplit automatiquement.

## Tableau de bord Direction

Cocher la case `Admin` sur une ligne de la table **Intervenants** ajoute un bloc
**Direction** en tête de l'accueil de cette personne, qui regroupe :

- les **interventions du jour**, toutes intervenantes confondues, avec le client
  et les horaires ;
- le **nombre d'interventions de la semaine** et le total d'heures ;
- le **chiffre d'affaires du mois**, calculé avec le taux horaire propre à
  chaque intervenante ;
- le **nombre d'intervenantes actives**.

Le bloc apparaît dès le prochain affichage de l'accueil ; décocher `Admin` le
retire tout aussi vite. Le reste de l'accueil (clients, récapitulatif du mois)
reste visible, une même personne pouvant être à la fois dirigeante et
intervenante.

## Consulter les relevés

La table **Releves** contient toutes les saisies, avec l'intervenante, le client,
la date, les horaires, le total et la case `Certification` cochée au moment de la
validation.

## À ne pas faire

**Ne renommez pas les colonnes.** L'application les lit par leur nom exact. Une
colonne renommée fait disparaître la donnée correspondante côté application — un
nom vide, une fiche de paie sans PDF — sans message d'erreur. Les noms sensibles
sont listés dans le [README.md](README.md).

Les **tables**, en revanche, peuvent être renommées librement : l'application les
identifie par un identifiant interne, pas par leur nom.

**Ne remplissez pas `MotDePasseHash` à la main.** Cette colonne attend une empreinte
chiffrée, pas un mot de passe. Y écrire du texte en clair empêche la connexion, en
plus d'exposer le mot de passe dans l'historique des cellules d'Airtable.
