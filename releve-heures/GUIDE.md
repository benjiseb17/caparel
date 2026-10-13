# Guide d'utilisation — Relevé d'heures Caparel

Ce guide couvre les quatre usages de l'application :

- **[Partie 1 — Pour les intervenantes](#partie-1--pour-les-intervenantes)** : se connecter, saisir ses heures, consulter ses fiches de paie.
- **[Partie 2 — Pour les référents](#partie-2--pour-les-référents)** : suivre les familles dont on a la charge.
- **[Partie 3 — Pour les familles](#partie-3--pour-les-familles)** : consulter les interventions et écrire à l'équipe.
- **[Partie 4 — Pour la direction](#partie-4--pour-la-direction)** : gérer les comptes, les clients, les fiches de paie depuis Airtable.

> Une version imprimable de ce guide est disponible en PDF :
> [docs/guide-utilisation.pdf](docs/guide-utilisation.pdf).

> La documentation technique (installation, variables d'environnement, structure
> de la base Airtable) se trouve dans [README.md](README.md).

---

# Partie 1 — Pour les intervenantes

## Se connecter la première fois

La direction vous transmet **l'adresse du site**. Votre compte y est déjà créé,
avec l'adresse email que vous avez communiquée à Caparel.

1. Ouvrez l'adresse du site
2. En bas de la page, cliquez sur **« Première connexion »**
3. Saisissez cette adresse email
4. Choisissez **votre** mot de passe — 8 caractères minimum — et confirmez-le
5. Vous êtes connectée directement

Votre mot de passe vous appartient : Caparel ne le choisit pas et ne peut pas le
consulter. Cette page ne fonctionne qu'une fois : une fois votre
mot de passe défini, il ne sert plus à rien.

Seule une adresse déjà enregistrée par Caparel fonctionne. Si la page refuse la
vôtre, c'est qu'elle n'est pas celle que la direction a saisie — contactez-la.

## Se connecter ensuite

Email et mot de passe, comme sur n'importe quel service.

**Mot de passe oublié ?** Sur la page de connexion, cliquez sur « Mot de passe
oublié ? », sous le bouton Se connecter. Saisissez l'adresse email que vous avez
communiquée à Caparel et choisissez un nouveau mot de passe : vous êtes connectée
dans la foulée. Personne n'a besoin d'intervenir.

Votre ancien mot de passe n'est récupérable par personne, pas même par Caparel : il
n'est pas stocké, seule une empreinte à sens unique l'est. La seule issue est donc
d'en choisir un nouveau.

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

Chaque rôle vit dans sa propre table Airtable, et l'application n'affiche pas les
mêmes onglets à l'un et à l'autre :

| Rôle | Onglets disponibles |
|---|---|
| **Intervenante** | Accueil, Relevé d'heure, Historique, Fiches de paie |
| **Référent** | Accueil (avec le bloc Direction), Mes familles |
| **Famille** | Accueil (ses interventions), Suivi |

> Les onglets d'un autre rôle sont inaccessibles, y compris en tapant leur adresse
> directement : la personne est renvoyée sur son accueil.

## Se connecter

Exactement comme une intervenante : « Première connexion », l'adresse email
communiquée à Caparel, puis le mot de passe de votre choix. Les connexions
suivantes se font avec email et mot de passe, et le lien « Mot de passe oublié ? »
sert aussi bien aux référents.

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

---

# Partie 3 — Pour les familles

Chaque famille suivie par Caparel dispose d'un espace où elle retrouve les
interventions réalisées chez elle et peut écrire à l'équipe.

## Se connecter

Comme tout le monde : « Première connexion », l'adresse email communiquée à
Caparel, puis le mot de passe de votre choix. Les connexions suivantes se font
avec email et mot de passe, et le lien « Mot de passe oublié ? » fonctionne de la
même façon.

## Accueil

| Ce qui s'affiche | Détail |
|---|---|
| **Heures du mois** | Le total réalisé chez vous depuis le 1er |
| **Montant du mois** | Le total correspondant |
| **Mois affiché** | Les flèches **‹ ›** du bandeau remontent dans les mois précédents |
| **Interventions** | Leur nombre et la date de la plus récente |
| **Vos remarques** | Les 3 dernières, avec leur état. « Tout voir » mène à l'onglet Suivi |
| **Dernières interventions** | Celles du mois affiché, avec le total du mois |
| **Mot de l'intervenante** | Quand elle en a laissé un, il apparaît sous l'intervention |
| **Une question ?** | Le numéro de l'agence, cliquable depuis un téléphone |

## Toutes les interventions

Le lien **« Tout voir »**, à côté des dernières interventions, ouvre l'historique
complet : toutes les interventions réalisées chez vous depuis le début, regroupées
par mois, avec le total de chacun.

> L'accueil ne montre que le mois affiché — c'est ce qui donne son sens au total et
> aux flèches. Cette page-ci ne s'arrête à aucune date.

> L'intervenante dispose de deux champs distincts : un commentaire interne à
> Caparel, et un « mot pour la famille ». Seul le second vous est montré.

## Suivi

Onglet **Suivi**. Vous y écrivez ce que vous souhaitez signaler : un besoin, une
remarque sur une intervention, un changement d'habitude.

1. Choisissez l'**intervention concernée** si votre message en vise une — sinon
   laissez « Remarque générale »
2. Écrivez votre message
3. Envoyez

Vos messages précédents sont listés en dessous, avec leur état :

- **Transmis** — reçu par l'équipe Caparel
- **Pris en compte** — l'équipe a traité votre demande

> **Vos messages ne sont lus que par l'équipe Caparel**, jamais par
> l'intervenante qui vient chez vous. Vous pouvez donc écrire librement.

# Partie 4 — Pour la direction

Toute l'administration se fait dans **Airtable**. L'application ne lit et n'écrit
que dans cette base — il n'y a pas d'interface d'administration séparée.

## Les trois tables de comptes

| Table | Qui s'y trouve | Ce que le compte voit |
|---|---|---|
| **Intervenants** | Les personnes qui effectuent les interventions | Accueil, Relevé d'heure, Historique, Fiches de paie |
| **Referents** | Les personnes qui encadrent des familles, direction comprise | Accueil (bloc Direction), Mes familles |
| **Clients** | Les familles suivies | Accueil (leurs interventions), Suivi |

C'est la table d'origine qui détermine le rôle : il n'y a aucune case à cocher à
gérer.

> **Un email ne figure que dans une seule de ces trois tables.** En cas de
> doublon, c'est la première trouvée dans l'ordre du tableau ci-dessus qui
> l'emporte à la connexion — et la personne se retrouve avec le mauvais rôle.

## Créer un compte intervenante

Dans la table **Intervenants** :

1. Créer la ligne : `Nom et Prenom`, `Email`, `Actif` coché, `TauxHoraire`
2. Laisser **`MotDePasseHash` vide** — il se remplira tout seul
3. Transmettre à l'intervenante l'adresse du site

Elle s'y rend, clique sur **« Première connexion »**, saisit son adresse email
et choisit son mot de passe. Rien à lui communiquer d'autre.

> **Ne cochez `Actif` qu'au moment où la personne va se connecter.** Tant que la
> case est décochée, personne ne peut définir de mot de passe sur ce compte. C'est
> la façon la plus simple de réduire la fenêtre pendant laquelle quelqu'un d'autre
> pourrait s'en emparer.

> L'adresse saisie dans Airtable doit être **exactement** celle que l'intervenante
> a communiquée : c'est elle qui lui sert de clé d'entrée.

Le `TauxHoraire` sert à calculer le chiffre d'affaires affiché sur son accueil
(heures réalisées × taux). Sans lui, ses montants resteront à zéro.

**Décocher `Actif`** bloque la connexion immédiatement — c'est la manière de
suspendre un accès sans supprimer l'historique.

## Créer un compte référent

Même procédure, dans la table **Referents** : nom, email, `Actif` coché,
`MotDePasseHash` vide. Ni taux horaire ni photo — un référent n'intervient pas.

Cocher `Acces complet` sur sa ligne lui donne la vue sur l'ensemble des familles
plutôt que sur son seul portefeuille.

## Réinitialiser un mot de passe

Vous n'avez rien à faire : l'intervenante réinitialise elle-même son mot de passe
depuis la page de connexion, avec son adresse email.

La table **Reinitialisations** en tient le **journal** : une ligne à chaque
réinitialisation, avec le nom, l'email et l'horodatage. C'est votre seul moyen de
repérer un changement que vous n'attendiez pas.

> **Mettez une Automation Airtable dessus** (« quand un enregistrement est créé →
> envoyer un email »). Comme l'adresse email suffit à réinitialiser un accès,
> quiconque connaît celle d'une intervenante peut prendre son compte. Cette alerte
> est ce qui vous permet de le savoir au lieu de l'ignorer.

Vous gardez par ailleurs la possibilité de couper un accès à tout moment en
décochant `Actif` : un compte inactif ne peut ni se connecter, ni réinitialiser son
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

## Ouvrir un espace à une famille

Renseigner la colonne `Email` de sa ligne dans **Clients**, laisser
`MotDePasseHash` vide, et transmettre l'adresse du site. La famille clique sur
« Première connexion » et choisit son mot de passe.

Sans email, la famille n'a simplement pas d'espace : rien d'autre à faire pour
celles qui n'en veulent pas.

> Comme pour les autres comptes, ne renseignez l'email qu'au moment où la famille
> va s'en servir, et vérifiez `Actif` : un client inactif ne peut ni se connecter
> ni réinitialiser son mot de passe.

## Ajouter une photo

Les trois tables de comptes ont une colonne `Photo`. Elle s'affiche dans le bandeau
d'accueil de la personne, à la place de ses initiales : sur son accueil pour une
intervenante et un référent, sur celui de la famille pour un client.

Rien n'est obligatoire — sans photo, les initiales sont affichées dans une pastille
turquoise. Une image carrée donne le meilleur résultat, la photo étant découpée en
rond.

## Les deux commentaires d'un relevé

Le formulaire de saisie comporte deux champs distincts, et la différence compte :

| Champ | Qui le lit |
|---|---|
| `Commentaire` | **Interne.** Direction seulement — la famille ne le voit jamais |
| `Mot pour la famille` | **Visible par la famille** dans son espace |

## Lire les retours des familles

Les messages écrits depuis l'onglet Suivi arrivent dans la table **Suivis**, et
s'affichent dans l'onglet **Mes familles** des référents, au-dessus des
interventions, avec une pastille « À traiter ».

Cocher `Traite` sur la ligne fait passer le message en « Pris en compte » côté
famille — c'est ce qui lui confirme que sa demande a été vue.

> Les intervenantes ne voient jamais ces retours. C'est ce qui permet à une
> famille de signaler une difficulté sans gêne.

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
