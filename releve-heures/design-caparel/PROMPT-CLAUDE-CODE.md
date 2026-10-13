# Refonte de la page d'accueil du relevé d'heures Caparel

## Contexte

L'application `releve-heures.caparel.fr` est l'espace client de Caparel, un service d'aide à domicile pour personnes âgées. Le bénéficiaire, ou un proche, s'y connecte pour consulter les heures d'intervention du mois.

La page d'accueil actuelle affiche :
- une salutation avec le prénom ;
- le total d'heures et le montant du mois ;
- les dernières remarques ;
- les dernières interventions.

On garde exactement ce contenu, mais avec un nouveau design. Il doit être soigné sur ordinateur **et sur téléphone**.

## Ce que contient ce dossier `design-caparel/`

| Fichier | Rôle |
|---|---|
| `maquette-accueil.html` | La maquette à reproduire. HTML statique avec des données d'exemple (octobre 2026). Ouvre-la dans un navigateur. |
| `css/tokens.css` | La charte Caparel en variables CSS : couleurs, polices, tailles, rayons, espacements. |
| `css/composants.css` | Les éléments communs : logo, cartes, boutons, avatars, sélecteur de mois, badge, icônes. |
| `css/accueil.css` | La mise en page de l'accueil, avec les règles tablette (≤ 900 px) et téléphone (≤ 640 px). |
| `captures/*.png` | Le rendu attendu en desktop (1280 px), tablette (820 px), téléphone (390 px) et menu mobile ouvert. |

## Ta mission

1. **Explore d'abord le projet**, sans rien modifier. Identifie :
   - le framework et le moteur de templates ;
   - le fichier ou le composant de la page d'accueil ;
   - la façon dont les styles sont gérés (CSS, Sass, Tailwind, modules…) ;
   - d'où viennent les données (prénom, heures, montants, remarques, interventions).

   Résume-moi ce que tu as trouvé et ton plan en quelques lignes avant de coder.
2. **Reproduis fidèlement `maquette-accueil.html`** dans le code existant :
   - Ne change que la présentation. Garde la logique, les routes, l'authentification et les requêtes de données.
   - Remplace les valeurs d'exemple par les vraies données (voir le tableau plus bas).
   - Intègre `tokens.css` tel quel, ou traduis-le dans la config du projet (par exemple le thème Tailwind). N'ajoute aucune autre couleur.
   - Les classes `cp-*` (communes) et `a-*` (accueil) peuvent être renommées ou converties en composants si le projet a ses propres conventions. Le rendu doit rester identique aux captures.
   - **Logo** : utilise le logo officiel déjà présent dans le projet. Le pictogramme dessiné dans la maquette n'est qu'un substitut.
   - **Polices** : Lexend pour les titres et les chiffres, Nunito Sans pour le texte. Elles sont chargées via Google Fonts dans `tokens.css`. Si le projet héberge ses polices lui-même, fais pareil pour celles-ci.
   - **Icônes** : un sprite SVG est en tête de la maquette. Si le projet utilise déjà une bibliothèque d'icônes (Lucide par exemple), voici les équivalents :

     | Maquette | Lucide |
     |---|---|
     | `i-home` | `house` |
     | `i-suivi` | `chart-line` |
     | `i-logout` | `log-out` |
     | `i-chevron-left`, `i-chevron-right` | `chevron-left`, `chevron-right` |
     | `i-clock` | `clock` |
     | `i-euro` | `euro` |
     | `i-calendar` | `calendar` |
     | `i-check` | `check` |
     | `i-plus` | `plus` |
     | `i-phone` | `phone` |
     | `i-menu` | `menu` |

     Trait de 1,8 px dans tous les cas.
3. **Téléphone** : sous 640 px, il faut :
   - un menu repliable (le bouton ☰ ouvre la liste des liens ; un petit script est en bas de la maquette) ;
   - les heures et le montant côte à côte ;
   - le nombre d'interventions en bandeau compact ;
   - des listes compactes.

   Vérifie à 390 px et à 360 px : aucun défilement horizontal, et des zones cliquables d'au moins 44 px.
4. **Accessibilité** : garde les bonnes balises (`button`, `a`, `nav`, `aria-current`, `aria-label`, `aria-expanded`, `time`). Les contrastes de couleurs ont déjà été vérifiés, ne remplace pas les teintes.
5. **Montre-moi le résultat** avant tout commit, avec une capture desktop et une capture téléphone. Ne pousse rien sans mon accord.

## Données à brancher

| Zone de la maquette | Donnée réelle | Exemple dans la maquette |
|---|---|---|
| Bandeau : initiale + prénom | prénom de l'utilisateur connecté | `H` / `Hayat` |
| Sélecteur de mois | mois affiché ; flèches = mois précédent / suivant | `Octobre 2026` |
| Carte « Heures d'intervention » | total des heures du mois | `11h00` |
| … sous-titre | nombre d'interventions du mois | `Sur 2 interventions` |
| Carte « Montant du mois » | total du mois | `165 €` |
| … sous-titre | tarif horaire | `Tarif horaire : 15 €` |
| Carte « Interventions » | nombre d'interventions + date de la dernière | `2` / `Dernière le 07/10/2026` |
| Liste « Dernières interventions » (la plus récente en premier) | pour chaque intervention : jour abrégé, jour, mois abrégé, intervenant (initiale + nom), heure de début – fin, durée, montant | `mer. 07 oct.` · `Sylvie Intervenante` · `09:00 – 16:00` · `7h00` · `105 €` |
| Ligne « Total » | total heures · total montant du mois | `11h00 · 165 €` |
| Carte « Vos remarques » | dernière remarque : date de l'intervention concernée, statut, texte, date et heure d'envoi | `05/10/2026` · `Transmis` · `Tout s'est bien passé merci` · `13/10/2026 à 10:55` |
| Liens « Tout voir » | page Suivi ou historique existant | — |

**Formats** : les dates en `JJ/MM/AAAA`, les heures en `HH:MM`, les durées en `11h00`, les montants en `165 €` (espace avant €), les jours et mois en français (`lun.`, `oct.`).

## Points à me confirmer (ne les invente pas)

Ces éléments sont **nouveaux** dans la maquette. Pour chacun, vérifie ce que le projet permet déjà.

- **Sélecteur de mois** : si la navigation par mois existe, branche les flèches dessus. Sinon, affiche seulement le libellé du mois et signale-le-moi.
- **Tarif horaire** : affiche-le seulement si la donnée existe. Ne le calcule pas sans me demander.
- **Bouton « Ajouter une remarque »** : branche-le sur la fonction d'ajout de remarque si elle existe. Sinon, masque-le et dis-le-moi.
- **Encart « Une question ? »** : le numéro de l'agence est un espace réservé `[TÉLÉPHONE AGENCE]`. Demande-moi le numéro, ou masque l'encart.
- **Aucune remarque ou aucune intervention ce mois-ci** : prévois un message vide sobre dans le même style, par exemple « Aucune intervention ce mois-ci. »
