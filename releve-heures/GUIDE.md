# Guide d'utilisation — Relevé d'heures Caparel

Ce guide couvre les trois usages de l'application :

- **[Partie 1 — Pour les intervenantes](#partie-1--pour-les-intervenantes)** : se connecter, saisir ses heures, consulter ses fiches de paie.
- **[Partie 2 — Pour les référents](#partie-2--pour-les-référents)** : suivre les familles dont on a la charge.
- **[Partie 3 — Pour la direction](#partie-3--pour-la-direction)** : gérer les comptes, les clients, les fiches de paie depuis Airtable.

> Une version imprimable de ce guide est disponible en PDF :
> [docs/guide-utilisation.pdf](docs/guide-utilisation.pdf).

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

**Vos clients** — les personnes qui vous sont assignées, avec leur adresse. Si
cette liste est vide ou incomplète, signalez-le à la direction : c'est elle qui
gère les affectations.

**Récapitulatif du mois** — vos heures réalisées et le chiffre d'affaires
correspondant.

Les flèches **‹ ›** de part et d'autre du mois permettent de remonter dans les mois
précédents. La flèche de droite est grisée sur le mois en cours : on ne peut pas
consulter un mois à venir.

## Saisir un relevé d'heures

Onglet **Relevé d'heure**.

| Champ | Détail |
|---|---|
| **Client** | Uniquement vos clients assignés |
| **Date** | Le jour même par défaut, modifiable — mais **pas de date future** : un relevé se saisit après l'intervention |
| **Heure d'arrivée** | Heure et minutes, séparément |
| **Heure de départ** | Idem |
| **Heures réalisées** | Calculé automatiquement, affiché en direct |
| **Commentaire** | Facultatif |

**Les minutes se choisissent par quart d'heure** : `00`, `15`, `30`, `45`. C'est
volontaire — les heures se comptent au quart d'heure près.

**Une intervention qui passe minuit est gérée** : une arrivée à `22:00` et un départ
à `02:00` donnent bien 4h00, pas une erreur.

**Pas de date à venir.** Un relevé se saisit une fois l'intervention terminée. Si
vous choisissez une date qui n'est pas encore arrivée, un message rouge apparaît
sous le champ et l'enregistrement est refusé.

Avant de valider, vous devez cocher la case de **certification sur l'honneur**. Le
bouton refusera l'enregistrement sans elle.

Le calcul des heures est refait côté serveur à l'enregistrement : la valeur affichée
à l'écran ne peut pas être contournée.

## Historique

Onglet **Historique**. Vous y retrouvez vos **20 derniers relevés**, du plus récent
au plus ancien, avec le client, la date, les horaires, le total et votre commentaire.

**Un relevé validé ne peut plus être modifié.** C'est volontaire : vous certifiez
sur l'honneur vos horaires au moment de la saisie, et ils sont ensuite figés pour
servir de base à votre paie.

> En cas d'erreur, contactez la direction : elle seule peut corriger un relevé.
> Raison de plus pour vérifier vos horaires avant de valider.

## Fiches de paie

Onglet **Fiches de paie**. Vos bulletins sont listés par mois, du plus récent au
plus ancien. **Télécharger** ouvre le PDF.

Une fiche n'apparaît que lorsque la direction l'a publiée — si un mois manque,
c'est qu'elle n'est pas encore mise à disposition.

## Se déconnecter

Bouton **Se déconnecter**, en haut de chaque écran. Pensez-y sur un appareil
partagé.

---

# Partie 2 — Pour les référents

Les référents encadrent des familles sans effectuer d'intervention. Leur
application n'est pas la même que celle des intervenantes.

## Ce qu'est un référent

Un référent suit un portefeuille de familles : il sait qui intervient chez elles, à
quel rythme et pour combien d'heures. Il ne saisit pas de relevé et ne reçoit pas de
fiche de paie.

Les deux rôles vivent dans des tables Airtable séparées, et l'application n'affiche
pas les mêmes onglets à l'un et à l'autre :

| Rôle | Onglets disponibles |
|---|---|
| **Intervenante** | Accueil, Relevé d'heure, Historique, Fiches de paie |
| **Référent** | Accueil (avec le bloc Direction), Mes familles |

> Les pages de saisie, d'historique et de fiches de paie sont inaccessibles à un
> référent, y compris en tapant leur adresse directement : il est renvoyé sur
> l'accueil.

## Se connecter

Exactement comme une intervenante : « Première connexion ? », email, code
d'activation de la forme `CAPAREL-4TB9KD`, puis le mot de passe de votre choix. Les
connexions suivantes se font avec email et mot de passe.

## Le bloc Direction

Il s'affiche en tête de l'accueil et donne la photographie de l'activité, toutes
intervenantes et toutes familles confondues :

| Indicateur | Ce qu'il compte |
|---|---|
| **Interventions aujourd'hui** | Les relevés saisis pour la date du jour |
| **Cette semaine** | Le nombre d'interventions et le total d'heures depuis lundi |
| **Chiffre d'affaires du mois** | Heures réalisées × taux horaire de chaque intervenante |
| **Intervenantes actives** | Les comptes cochés `Actif` dans la table **Intervenants** |

En dessous, la liste des **interventions du jour** : intervenante, famille, horaires
et durée.

> Ces chiffres ne portent que sur ce qui a **déjà été saisi**. L'application ne
> contient aucun planning prévisionnel : une intervention n'apparaît qu'une fois son
> relevé validé par l'intervenante.

## L'onglet Mes familles

Une fiche par famille dont vous êtes référent, avec :

- le **nom** et l'**adresse** de la famille ;
- le total d'**heures du mois en cours** ;
- la ou les **intervenantes** qui y travaillent ;
- les **cinq dernières interventions**, avec date, horaires et durée.

Une famille peut avoir plusieurs référents, et un référent plusieurs familles. C'est
la direction qui décide des affectations.

## Le compte de direction

Un référent peut recevoir un **accès complet** : son onglet s'intitule alors
« Toutes les familles » et liste l'ensemble des clients de Caparel, qu'il en soit
référent ou non. C'est le réglage du compte de direction.

> Les droits sont relus à chaque affichage. Retirer un accès prend effet
> immédiatement, sans attendre que la personne se reconnecte.

---

# Partie 3 — Pour la direction

Toute l'administration se fait dans **Airtable**. L'application ne lit et n'écrit
que dans cette base — il n'y a pas d'interface d'administration séparée.

## Les deux tables de comptes

| Table | Qui s'y trouve |
|---|---|
| **Intervenants** | Les personnes qui effectuent les interventions et saisissent leurs heures |
| **Referents** | Les personnes qui encadrent des familles, direction comprise |

> **Une personne ne figure que dans une seule table.** Si le même email apparaît
> dans les deux, c'est la ligne de **Referents** qui l'emporte à la connexion, et
> la personne perd l'accès à la saisie.

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

## Créer un compte référent

Même procédure, dans la table **Referents** : nom, email, `Actif` coché,
`MotDePasseHash` vide, puis transmettre le `Code activation`. Ni taux horaire ni
photo — un référent n'intervient pas.

Cocher `Acces complet` sur sa ligne lui donne la vue sur l'ensemble des familles
plutôt que sur son seul portefeuille.

## Réinitialiser un mot de passe

Vider la colonne `MotDePasseHash` de la ligne concernée, dans l'une ou l'autre
table. Son code d'activation redevient valable et la personne peut redéfinir son
mot de passe.

## Assigner des clients

Dans la table **Clients**, la colonne `Intervenants assignes` détermine qui voit
quel client. Une intervenante ne voit que les clients où elle est listée, à la fois
sur son accueil et dans le menu déroulant de saisie.

Un client dont `Actif` n'est pas coché n'apparaît nulle part.

## Désigner un référent de famille

Toujours dans **Clients**, la colonne `Referent famille` désigne la ou les
personnes de la table **Referents** responsables de cette famille. Elles la
retrouvent aussitôt dans leur onglet **Mes familles**.

## Corriger un relevé

La table **Releves** contient toutes les saisies, avec l'intervenante, le client,
la date, les horaires, le total et la case `Certification` cochée au moment de la
validation.

**Les intervenantes ne peuvent pas modifier un relevé une fois validé.** Toute
correction passe donc par vous, directement dans cette table. C'est ce qui garantit
que les heures servant de base à la paie ne bougent plus après coup.

Chaque ligne porte un libellé lisible de la forme
`Intervenante — Client — 07/10/2026`, écrit à la création du relevé.

> Ce libellé ne se recalcule pas : si vous changez la date ou le client d'un
> relevé, pensez à le corriger aussi.

## Publier une fiche de paie

Dans la table **Fiches de Paie** :

1. Créer la ligne, lier l'`Intervenant`, choisir le `Mois`
2. Joindre le PDF dans `Fichier`
3. Cocher **`Publiee`** quand elle doit devenir visible

Tant que `Publiee` n'est pas cochée, la fiche reste invisible côté intervenante.
Cela permet de préparer tous les bulletins tranquillement, puis de les publier d'un
coup. Le libellé de la ligne se remplit automatiquement.

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

**L'application contient les adresses des familles.** Elle est accessible
publiquement sur internet : les mots de passe des comptes de direction méritent le
même soin que ceux d'une messagerie professionnelle.
