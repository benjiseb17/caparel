#!/usr/bin/env python3
"""Génère les pages HTML statiques de site/ (accueil, services, tarifs, FAQ,
recrutement, pages villes). Le CSS et le JS sont partagés (site/style.css,
site/app.js). Usage : python3 tools/build_site.py
"""
import json
import os
from html import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
BASE = "https://caparel.fr"
TEL = "06 64 26 93 03"
TEL_HREF = "tel:0664269303"
MAIL = "contact@caparel.fr"
LASTMOD = "2026-10-14"

CP_SECTION = open(os.path.join(ROOT, "tools", "cp_section.html"), encoding="utf-8").read()
SPRITE = open(os.path.join(ROOT, "tools", "sprite.svg"), encoding="utf-8").read()


def ic(name, style=""):
    st = f' style="{style}"' if style else ""
    return f'<svg class="icon"{st} aria-hidden="true"><use href="#ic-{name}"/></svg>'


# --------------------------------------------------------------------------
# Données
# --------------------------------------------------------------------------
CITIES = [
    # slug, nom, code postal, département, voisines (slugs), limitrophe de Neuilly
    ("neuilly-sur-seine", "Neuilly-sur-Seine", "92200", "92", ["paris", "levallois-perret", "courbevoie", "puteaux"], True),
    ("paris", "Paris", "75", "75", ["neuilly-sur-seine", "levallois-perret", "boulogne-billancourt", "issy-les-moulineaux"], True),
    ("levallois-perret", "Levallois-Perret", "92300", "92", ["neuilly-sur-seine", "clichy", "courbevoie", "paris"], True),
    ("boulogne-billancourt", "Boulogne-Billancourt", "92100", "92", ["paris", "issy-les-moulineaux", "saint-cloud", "suresnes"], False),
    ("courbevoie", "Courbevoie", "92400", "92", ["neuilly-sur-seine", "puteaux", "levallois-perret"], True),
    ("puteaux", "Puteaux", "92800", "92", ["neuilly-sur-seine", "courbevoie", "suresnes"], True),
    ("suresnes", "Suresnes", "92150", "92", ["puteaux", "saint-cloud", "boulogne-billancourt"], False),
    ("clichy", "Clichy", "92110", "92", ["levallois-perret", "paris", "courbevoie"], False),
    ("issy-les-moulineaux", "Issy-les-Moulineaux", "92130", "92", ["boulogne-billancourt", "paris", "saint-cloud"], False),
    ("saint-cloud", "Saint-Cloud", "92210", "92", ["boulogne-billancourt", "suresnes", "issy-les-moulineaux"], False),
]
CITY = {c[0]: c for c in CITIES}

INTROS = [
    "Caparel accompagne les personnes âgées de {v} qui souhaitent continuer à vivre chez elles : aide à la personne, entretien du logement, accompagnement au quotidien et démarches administratives, en mode mandataire.",
    "Vous cherchez une aide à domicile pour vous ou pour un proche à {v} ? Caparel vous met en relation avec une auxiliaire de vie adaptée et gère pour vous toute l'administration liée à son emploi.",
    "À {v}, Caparel organise l'intervention d'une auxiliaire de vie à votre domicile, de quelques heures par semaine jusqu'à une présence continue 24h/24 et 7j/7.",
]

SERVICES = [
    ("bed", "Aide à la personne", ["Aide au lever et au coucher", "Toilette et habillage", "Assistance aux repas", "Prévention des chutes", "Présence de nuit si besoin"]),
    ("home", "Aide au quotidien", ["Entretien courant du logement", "Linge et repassage", "Préparation des repas", "Courses et approvisionnement", "Sécurisation du domicile"]),
    ("doc", "Assistance administrative", ["Tri et traitement du courrier", "Classement des documents", "Formalités courantes", "Démarches en ligne"]),
    ("walk", "Accompagnement et vie sociale", ["Rendez-vous médicaux", "Promenades et sorties", "Activités de stimulation", "Lutte contre l'isolement", "Soutien aux proches aidants"]),
]

# FAQ : (catégorie, question, réponse HTML, réponse texte pour JSON-LD)
FAQ = [
    ("Le mode mandataire", "Qu'est-ce que le mode mandataire ?",
     "<p>Le mode mandataire repose sur un contrat de mandat administratif : vous confiez à Caparel, en votre nom, les démarches administratives liées à l'emploi de votre auxiliaire de vie. Vous restez l'employeur, Caparel agit en tant que mandataire pour vous accompagner et vous assister, et assure le suivi de l'accompagnement.</p>",
     "Le mode mandataire repose sur un contrat de mandat administratif : vous confiez à Caparel, en votre nom, les démarches administratives liées à l'emploi de votre auxiliaire de vie. Vous restez l'employeur, Caparel agit en tant que mandataire pour vous accompagner et assurer le suivi."),
    ("Le mode mandataire", "Suis-je l'employeur de l'auxiliaire de vie ?",
     "<p>Oui. Vous signez un contrat de travail (CDI ou CDD) avec votre salarié, et les conditions de travail sont régies par la convention collective nationale des particuliers employeurs et de l'emploi à domicile (IDCC 3239). Une période d'essai est prévue, conformément à la réglementation. Caparel s'occupe des formalités : contrat, bulletins de salaire, déclarations CESU.</p>",
     "Oui. Vous signez un contrat de travail (CDI ou CDD) avec votre salarié, régi par la convention collective des particuliers employeurs (IDCC 3239). Caparel s'occupe des formalités : contrat, bulletins de salaire, déclarations CESU."),
    ("Le mode mandataire", "Que fait Caparel concrètement ?",
     "<ul><li>Recherche, présélection et présentation d'auxiliaires de vie qualifiées</li><li>Aide aux formalités d'embauche et établissement du contrat de travail</li><li>Assistance au compte CESU / CESU+ et déclaration des heures auprès de l'URSSAF</li><li>Bulletins de salaire et documents administratifs associés</li><li>Proposition d'un remplaçant en cas d'absence, si vous le souhaitez</li><li>Suivi de l'accompagnement et remise annuelle des documents pour le crédit d'impôt</li></ul>",
     "Recherche et présentation d'auxiliaires de vie qualifiées, aide aux formalités d'embauche, contrat de travail, assistance CESU, bulletins de salaire, déclaration des heures, remplaçant en cas d'absence, suivi de l'accompagnement et documents annuels pour le crédit d'impôt."),
    ("Tarifs et aides fiscales", "Combien coûte une aide à domicile avec Caparel ?",
     "<p>Le tarif horaire TTC est de 32,70 € jusqu'à 25 h par semaine (tranche A), 31,70 € de 26 h à 40 h (tranche B) et 28,70 € au-delà de 40 h (tranche C). Des forfaits existent aussi (nuit de 12 h, journée de 12 h, 24h/24, garde malade de nuit). Aucun frais d'inscription ni de résiliation n'est facturé. Détail sur la page <a href=\"/tarifs\">Nos tarifs</a>.</p>",
     "Le tarif horaire TTC est de 32,70 € jusqu'à 25 h par semaine, 31,70 € de 26 h à 40 h et 28,70 € au-delà de 40 h, soit 16,35 €, 15,85 € et 14,35 € après crédit d'impôt de 50 %. Aucun frais d'inscription ni de résiliation."),
    ("Tarifs et aides fiscales", "Comment fonctionne le crédit d'impôt de 50 % ?",
     "<p>Les dépenses engagées pour l'emploi d'un salarié à domicile ouvrent droit à un crédit d'impôt égal à 50 % des sommes versées (article 199 sexdecies du CGI). Le plafond est de 12 000 € de dépenses par an et par foyer, majoré dans certains cas (jusqu'à 15 000 €). Le crédit est remboursable : même si vous n'êtes pas imposable, vous recevez la différence en remboursement.</p>",
     "Les dépenses d'emploi d'un salarié à domicile ouvrent droit à un crédit d'impôt de 50 % des sommes versées, dans la limite de 12 000 € de dépenses par an et par foyer (jusqu'à 15 000 € selon la situation). Le crédit est remboursable même si vous n'êtes pas imposable."),
    ("Tarifs et aides fiscales", "Qu'est-ce que l'avance immédiate de crédit d'impôt ?",
     "<p>Avec le service Avance immédiate de l'Urssaf, votre crédit d'impôt est déduit directement de chaque facture : vous ne payez que la moitié du montant facturé au moment du prélèvement (pour 200 € de dépenses, vous payez 100 €). Le service est facultatif et sans frais additionnels. Caparel vous accompagne dans l'inscription sur simple demande.</p>",
     "Le service Avance immédiate de l'Urssaf déduit votre crédit d'impôt de chaque facture : vous ne payez que la moitié du montant. Le service est facultatif et sans frais, et Caparel vous accompagne dans l'inscription."),
    ("Tarifs et aides fiscales", "Puis-je cumuler l'APA ou la PCH avec le crédit d'impôt ?",
     "<p>Oui, mais seules les sommes restant effectivement à votre charge ouvrent droit au crédit d'impôt : les montants pris en charge par l'APA (Allocation personnalisée d'autonomie) ou la PCH (Prestation de compensation du handicap) sont à déduire. L'attestation fiscale remise par Caparel précise le montant net qui vous incombe.</p>",
     "Seules les sommes restant à votre charge ouvrent droit au crédit d'impôt : les montants pris en charge par l'APA ou la PCH sont déduits. L'attestation fiscale remise par Caparel précise le montant net."),
    ("Mise en place", "Sous quel délai l'accompagnement peut-il démarrer ?",
     "<p>Après votre prise de contact, une visite d'évaluation à domicile est proposée sous 2 jours ouvrés. La mise en place de l'accompagnement intervient généralement sous 5 jours après validation du plan d'aide, sous réserve de la disponibilité d'un intervenant adapté à vos besoins.</p>",
     "Une visite d'évaluation à domicile est proposée sous 2 jours ouvrés. L'accompagnement démarre généralement sous 5 jours après validation du plan d'aide, sous réserve de la disponibilité d'un intervenant adapté."),
    ("Mise en place", "À partir de combien d'heures peut-on intervenir ?",
     "<p>Nos interventions débutent dès 4 heures par semaine et peuvent être assurées en continu, 24h/24 et 7j/7, y compris la nuit. Le planning est ajustable à tout moment selon l'évolution de vos besoins.</p>",
     "Nos interventions débutent dès 4 heures par semaine et peuvent être assurées en continu, 24h/24 et 7j/7. Le planning est ajustable à tout moment."),
    ("Mise en place", "Dois-je payer un devis ou des frais de dossier ?",
     "<p>Non : vous disposez d'un droit à un devis écrit et gratuit avant toute mise en place d'une prestation supérieure à 100 € TTC par mois, ou sur simple demande. Aucun frais d'inscription ni de résiliation n'est facturé.</p>",
     "Le devis écrit est gratuit. Aucun frais d'inscription ni de résiliation n'est facturé."),
    ("Nos auxiliaires de vie", "Comment sont choisies les auxiliaires de vie ?",
     "<p>Une auxiliaire de vie doit être titulaire d'une certification professionnelle de niveau 3 minimum du secteur sanitaire, médico-social ou social, ou justifier de trois ans d'expérience auprès de personnes accompagnées, ou bénéficier d'une formation qualifiante dans ces domaines. Chaque candidate passe un entretien et nous vérifions ses références. Nous croisons ensuite vos besoins avec son expérience, ses habitudes de travail et sa disponibilité.</p>",
     "Diplôme de niveau 3 minimum dans le secteur sanitaire, médico-social ou social, ou trois ans d'expérience, ou formation qualifiante. Entretien et vérification des références, puis mise en correspondance avec vos besoins."),
    ("Nos auxiliaires de vie", "Que se passe-t-il si mon auxiliaire de vie est absente ?",
     "<p>Caparel peut vous proposer un remplaçant en cas d'absence de votre salarié (congés, maladie…), si vous le souhaitez, afin d'assurer la continuité de l'accompagnement.</p>",
     "Caparel peut vous proposer un remplaçant en cas d'absence de votre salarié, si vous le souhaitez."),
    ("Contact, urgences et réclamations", "Comment et quand puis-je joindre Caparel ?",
     f"<p>Notre accueil téléphonique est ouvert 7 jours sur 7, de 9h à 18h, au <a href=\"{TEL_HREF}\">{TEL}</a>. Vous pouvez aussi nous écrire à <a href=\"mailto:{MAIL}\">{MAIL}</a> (réponse sous 24 heures) ou utiliser le <a href=\"/#contact\">formulaire de contact</a>. En dehors des horaires d'accueil, votre message est relevé et un rappel est assuré sous 24 heures. Aucun accueil physique n'est assuré au siège.</p>",
     f"Accueil téléphonique 7j/7 de 9h à 18h au {TEL}. Email : {MAIL} (réponse sous 24 heures). En dehors des horaires, un rappel est assuré sous 24 heures."),
    ("Contact, urgences et réclamations", "Que faire en cas d'urgence ?",
     "<p>En cas de doute, appelez d'abord les secours : SAMU <b>15</b>, pompiers <b>18</b>, numéro d'urgence européen <b>112</b>, urgence pour les personnes sourdes ou malentendantes <b>114</b>. En cas de chute, ne déplacez pas la personne si vous suspectez une fracture, sauf danger immédiat. Vous pourrez ensuite prévenir Caparel.</p>",
     "Appelez d'abord les secours : SAMU 15, pompiers 18, urgence européenne 112, urgence sourds et malentendants 114. En cas de chute, ne déplacez pas la personne sauf danger immédiat. Prévenez ensuite Caparel."),
    ("Contact, urgences et réclamations", "Comment faire une réclamation ?",
     f"<p>Toute réclamation, orale ou écrite, peut nous être adressée par téléphone au {TEL}, par email à {MAIL} ou par courrier au siège (6 rue Beffroy, 92200 Neuilly-sur-Seine). Chaque réclamation fait l'objet d'un accusé de réception sous 3 jours ouvrés et d'une réponse motivée sous 30 jours.</p>",
     f"Par téléphone ({TEL}), par email ({MAIL}) ou par courrier au siège. Accusé de réception sous 3 jours ouvrés et réponse motivée sous 30 jours."),
    ("Contact, urgences et réclamations", "Dans quelles villes intervenez-vous ?",
     "<p>Depuis notre siège de Neuilly-sur-Seine, nous intervenons à Neuilly-sur-Seine, Paris, Levallois-Perret, Boulogne-Billancourt, Courbevoie, Puteaux, Suresnes, Clichy, Issy-les-Moulineaux et Saint-Cloud. Retrouvez le détail sur la page <a href=\"/aide-a-domicile/\">Aide à domicile près de chez vous</a>. Votre commune n'est pas listée ? Contactez-nous, nous étudierons votre demande.</p>",
     "Neuilly-sur-Seine, Paris, Levallois-Perret, Boulogne-Billancourt, Courbevoie, Puteaux, Suresnes, Clichy, Issy-les-Moulineaux et Saint-Cloud. Contactez-nous si votre commune n'est pas listée."),
]


# --------------------------------------------------------------------------
# Gabarits communs
# --------------------------------------------------------------------------
def head(title, desc, path, jsonld=None, preload_hero=False, cp=False, noindex=False):
    ld = ""
    for block in jsonld or []:
        ld += '<script type="application/ld+json">' + json.dumps(block, ensure_ascii=False) + "</script>\n"
    robots = '<meta name="robots" content="noindex, nofollow">\n' if noindex else ""
    fonts = "Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700"
    cp_css = ""
    if cp:
        fonts += "&family=Atkinson+Hyperlegible:wght@400;700&family=Kalam:wght@700"
        cp_css = '<link rel="stylesheet" href="/caparel-section.css">\n'
    pre = '<link rel="preload" as="image" href="/images/hero.jpg" fetchpriority="high">\n' if preload_hero else ""
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc, quote=True)}">
{robots}<link rel="canonical" href="{BASE}{path}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Caparel">
<meta property="og:title" content="{escape(title, quote=True)}">
<meta property="og:description" content="{escape(desc, quote=True)}">
<meta property="og:url" content="{BASE}{path}">
<meta property="og:image" content="{BASE}/images/hero.jpg">
<link rel="icon" href="/icon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png">
<link rel="icon" href="/icon-512.png" sizes="512x512" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family={fonts}&display=swap" rel="stylesheet">
{pre}<link rel="stylesheet" href="/style.css">
{cp_css}
{ld}</head>
<body>
{SPRITE}<a class="skip" href="#main">Aller au contenu</a>
"""


NAV = [
    ("/", "Accueil", "home"),
    ("/services", "Nos services", "services"),
    ("/tarifs", "Nos tarifs", "tarifs"),
    ("/aide-a-domicile/", "Nos villes", "villes"),
    ("/faq", "FAQ", "faq"),
    ("/recrutement", "Recrutement", "recrutement"),
]


def header(active):
    def link(h, t, k):
        cur = ' class="active" aria-current="page"' if k == active else ""
        return f'      <a href="{h}"{cur}>{t}</a>'

    links = "\n".join(link(h, t, k) for h, t, k in NAV)
    return f"""<header>
  <div class="nav">
    <a href="/" class="logo" aria-label="Caparel — accueil">
      <img src="/images/logo.png" alt="Caparel - Aide à domicile aux personnes âgées" class="logo-img" width="1872" height="562" decoding="async">
    </a>
    <nav class="nav-links" id="navLinks" aria-label="Navigation principale">
{links}
    </nav>
    <div class="nav-cta">
      <a href="{TEL_HREF}" class="nav-phone">{ic("phone", "width:16px;height:16px")}{TEL}</a>
      <a href="/#contact" class="btn btn-navy">Devis gratuit</a>
    </div>
    <button class="nav-toggle" id="navToggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navLinks">{ic("menu")}</button>
  </div>
</header>
<div class="topbar"><div class="topbar-in">
  <img src="/images/sap.png" alt="Services à la personne" class="topbar-sap" width="199" height="148">
  <span>Avec l'avance immédiate du crédit d'impôt, <b>vous ne payez que la moitié.</b></span>
  <a href="/tarifs#aides">En savoir plus sur nos tarifs</a>
  <a href="{TEL_HREF}" class="topbar-tel">{ic("phone")}{TEL}</a>
</div></div>
<main id="main">
"""


def footer():
    villes = "\n".join(
        f'          <li><a href="/aide-a-domicile/{c[0]}/">Aide à domicile à {c[1]}</a></li>' for c in CITIES
    )
    return f"""</main>
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-logo"><img src="/images/logo.png" alt="Caparel" class="logo-img" width="1872" height="562" loading="lazy" decoding="async"></div>
        <p>Service mandataire d'aide à domicile aux personnes âgées. Nous mettons l'humain au centre, avec professionnalisme et bienveillance.</p>
        <div class="footer-sap"><img src="/images/sap.png" alt="Services à la personne" width="199" height="148" loading="lazy" decoding="async"><span>Service à la personne<br>Mode mandataire</span></div>
      </div>
      <div>
        <h4>Navigation</h4>
        <ul>
          <li><a href="/">Accueil</a></li>
          <li><a href="/services">Nos services</a></li>
          <li><a href="/tarifs">Nos tarifs</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/recrutement">Recrutement</a></li>
          <li><a href="/demande">Demande de devis</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Nos villes</h4>
        <ul>
{villes}
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="{TEL_HREF}">{TEL}</a></li>
          <li><a href="mailto:{MAIL}">{MAIL}</a></li>
          <li>6 rue Beffroy, 92200 Neuilly-sur-Seine</li>
          <li>Accueil téléphonique 7j/7, 9h-18h</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Caparel SAS — SIREN 992 659 839 — RCS Nanterre</span>
      <span>Aide à domicile aux personnes âgées · Mode mandataire</span>
    </div>
  </div>
</footer>
<nav class="float-nav" aria-label="Accès rapides">
  <a class="fn fn-1" href="/demande" data-label="Répondre au formulaire" aria-label="Répondre au formulaire">{ic("formcheck")}<span>Formulaire</span></a>
  <a class="fn fn-2" href="/aide-a-domicile/" data-label="Nos villes" aria-label="Nos villes">{ic("pin")}<span>Nos villes</span></a>
  <a class="fn fn-3" href="/faq" data-label="Besoin d'aide et FAQ" aria-label="Besoin d'aide et FAQ">{ic("help")}<span>Aide &amp; FAQ</span></a>
  <a class="fn fn-4" href="{TEL_HREF}" data-label="{TEL}" aria-label="Appeler le {TEL}">{ic("phone")}<span>Appeler</span></a>
  <a class="fn fn-5" href="/recrutement" data-label="Recrutement" aria-label="Recrutement">{ic("user")}<span>Recrutement</span></a>
</nav>
<script src="/app.js" defer></script>
</body>
</html>
"""


def besoins_boxes():
    items = [
        "Lever, coucher, toilette et habillage", "Aide aux repas", "Présence de nuit / garde malade",
        "Ménage et linge", "Courses et préparation des repas", "Courrier et démarches administratives",
        "Accompagnement aux rendez-vous médicaux", "Sorties, promenades et activités",
    ]
    out = "".join(
        f'\n            <label class="checkbox-item"><input type="checkbox" name="besoins" value="{escape(i, quote=True)}">{escape(i)}</label>'
        for i in items
    )
    out += '\n            <label class="checkbox-item other-item"><input type="checkbox" name="besoins" value="Autre besoin">Autre besoin (précisez dans le message)</label>'
    return out


def contact_section(ville="", cp=""):
    v = escape(ville, quote=True)
    c = escape(cp if cp.isdigit() and len(cp) == 5 else "", quote=True)
    return f"""<section id="contact">
  <div class="container contact-grid">
    <div class="contact-form">
      <h3>Demande de renseignements</h3>
      <p class="hint">Réponse sous 24 à 48h ouvrées.</p>
      <form id="contactForm">
        <div style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true"><input type="text" name="hp_check_7f2a" id="hp_check_7f2a" tabindex="-1" autocomplete="off"></div>
        <div class="form-row">
          <div><label for="nom">Nom</label><input id="nom" name="nom" type="text" placeholder="Votre nom" required></div>
          <div><label for="prenom">Prénom</label><input id="prenom" name="prenom" type="text" placeholder="Votre prénom" required></div>
        </div>
        <div class="form-row">
          <div><label for="tel">Téléphone</label><input id="tel" name="tel" type="tel" placeholder="06 00 00 00 00" required></div>
          <div><label for="email">Email</label><input id="email" name="email" type="email" placeholder="vous@email.fr" required></div>
        </div>
        <div class="form-row full">
          <div><label for="adresse">Adresse</label><input id="adresse" name="adresse" type="text" placeholder="Numéro et nom de rue"></div>
        </div>
        <div class="form-row">
          <div><label for="ville">Ville</label><input id="ville" name="ville" type="text" placeholder="Votre ville" value="{v}"></div>
          <div><label for="codePostal">Code postal</label><input id="codePostal" name="codePostal" type="text" inputmode="numeric" placeholder="92200" value="{c}"></div>
        </div>
        <div class="form-row full">
          <label>Besoins d'aide à domicile</label>
          <div class="checkbox-grid">{besoins_boxes()}
          </div>
        </div>
        <div class="form-row full">
          <label>Créneaux sur lesquels vous souhaitez être rappelé(e) en priorité</label>
          <div class="checkbox-grid">
            <label class="checkbox-item"><input type="checkbox" name="creneaux" value="Matin (9h-12h)">Matin (9h-12h)</label>
            <label class="checkbox-item"><input type="checkbox" name="creneaux" value="Après-midi (12h-17h)">Après-midi (12h-17h)</label>
            <label class="checkbox-item"><input type="checkbox" name="creneaux" value="Soir (17h-19h)">Soir (17h-19h)</label>
          </div>
        </div>
        <div class="form-row full">
          <div><label for="message">Message</label><textarea id="message" name="message" placeholder="Décrivez votre situation ou vos besoins..."></textarea></div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Envoyer ma demande</button>
        <div class="form-status" role="status" aria-live="polite"></div>
        <p class="form-legal">Les informations saisies sont utilisées par Caparel pour répondre à votre demande. Vous disposez d'un droit d'accès, de rectification et d'effacement : {MAIL}.</p>
      </form>
    </div>
    <div class="contact-info">
      <span class="eyebrow">Contact</span>
      <h2>Échangeons sur vos besoins</h2>
      <p>Notre équipe vous répond rapidement pour évaluer votre situation et construire un accompagnement sur mesure.</p>
      <div class="contact-item">
        <span class="ic">{ic("phone")}</span>
        <div><b>Téléphone</b><span><a href="{TEL_HREF}">{TEL}</a> — 7j/7, 9h-18h</span></div>
      </div>
      <div class="contact-item">
        <span class="ic">{ic("mail")}</span>
        <div><b>Email</b><span><a href="mailto:{MAIL}">{MAIL}</a> — réponse sous 24h</span></div>
      </div>
      <div class="contact-item">
        <span class="ic">{ic("pin")}</span>
        <div><b>Adresse</b><span>6 rue Beffroy, 92200 Neuilly-sur-Seine</span></div>
      </div>
    </div>
  </div>
</section>
"""


def faq_items(entries, open_first=False):
    out = []
    for i, (_cat, q, a, _t) in enumerate(entries):
        op = " open" if (open_first and i == 0) else ""
        out.append(f'<details class="faq-item"{op}><summary>{escape(q)}</summary><div class="faq-body">{a}</div></details>')
    return "\n      ".join(out)


def faq_jsonld(entries):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": t}}
            for (_c, q, _a, t) in entries
        ],
    }


def business_ld():
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Caparel",
        "description": "Service mandataire d'aide à domicile aux personnes âgées à Neuilly-sur-Seine et dans les Hauts-de-Seine.",
        "url": BASE + "/",
        "logo": BASE + "/images/logo.png",
        "image": BASE + "/images/hero.jpg",
        "telephone": "+33664269303",
        "email": MAIL,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "6 rue Beffroy",
            "postalCode": "92200",
            "addressLocality": "Neuilly-sur-Seine",
            "addressCountry": "FR",
        },
        "areaServed": [{"@type": "City", "name": c[1]} for c in CITIES],
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "09:00",
            "closes": "18:00",
        },
    }


def breadcrumb_ld(items):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + p}
            for i, (n, p) in enumerate(items)
        ],
    }


def city_cards(exclude=None):
    out = []
    for slug, nom, cp, dep, _v, _l in CITIES:
        if slug == exclude:
            continue
        cplabel = cp if cp != "75" else "75 · Ouest parisien"
        out.append(
            f'<a class="city-card" href="/aide-a-domicile/{slug}/"><span class="pin">{ic("pin")}</span><small>Aide à domicile à</small><b>{nom}</b><span>{cplabel} · Voir →</span></a>'
        )
    return "\n      ".join(out)


def cta_band(title, text, btn_label="Demander un devis gratuit", href="/#contact"):
    return f"""<section class="page-cta">
  <div class="container">
    <h2>{title}</h2>
    <p>{text}</p>
    <a href="{href}" class="btn btn-primary">{btn_label}</a>
  </div>
</section>
"""


# --------------------------------------------------------------------------
# Pages
# --------------------------------------------------------------------------
def hero_block(c=None):
    if c:
        titre = f'<span class="mint">Aide à domicile</span><br>à {c["nom"]}'
        lead = c["intro"]
        eyebrow = "Aide à domicile aux personnes âgées"
    else:
        titre = 'Vivre chez soi, entouré des <span class="mint">bonnes personnes.</span>'
        lead = "Caparel est un service mandataire d'aide à domicile pour les personnes âgées, à Paris et en Île-de-France : aide à la personne, entretien, accompagnement et démarches administratives."
        eyebrow = "Aide à domicile · Paris &amp; Île-de-France"
    return f"""<section class="hero2" id="top">
  <div class="container hero2-in">
    <div class="hero2-text">
      <span class="hero2-eyebrow">{eyebrow}</span>
      <h1>{titre}</h1>
      <p class="lead">{lead}</p>
    </div>
    <div class="hero2-badge"><span class="big">50<small>%</small></span><span>d'avance immédiate<br>de crédit d'impôt</span></div>
  </div>
</section>
<div class="hero-cards">
  <div class="container hero-cards-grid">
    <div class="hero-card-box">
      <h2>Besoin d'une<br>aide à domicile ?</h2>
      <a href="#contact" class="btn btn-primary">C'est parti</a>
      <p>Sans frais d'inscription ni de résiliation</p>
      <a class="hero-card-tel" href="{TEL_HREF}">{ic("phone", "width:15px;height:15px")}ou appelez le {TEL}</a>
    </div>
    <div class="hero-card-box">
      <h2>Vous cherchez un emploi<br>d'auxiliaire de vie ?</h2>
      <a href="/recrutement" class="btn btn-navy">Je postule</a>
      <p>Rejoignez notre réseau d'intervenant(e)s</p>
    </div>
  </div>
</div>"""


def local_block(c):
    return f"""<section class="local">
  <div class="container local-grid">
    <div>
      <h2>Votre aide à domicile à {c["nom"]}</h2>
      <p>{c["local"]}</p>
      <p>Nous fonctionnons en <b>mode mandataire</b> : vous restez l'employeur de votre auxiliaire de vie et choisissez qui intervient chez vous, tandis que Caparel s'occupe des démarches administratives (contrat, bulletins de salaire, déclarations CESU).</p>
      <p class="near-label">Aide à domicile dans les communes voisines :</p>
      <div class="near">{c["near"]}</div>
    </div>
    <div class="local-card">
      <h3>Caparel à {c["nom"]}</h3>
      <dl>
        <dt>Commune</dt><dd>{c["nom"]}</dd>
        <dt>Code postal</dt><dd>{c["cp_label"]}</dd>
        <dt>Département</dt><dd>{c["dept_label"]}</dd>
        <dt>Siège Caparel</dt><dd>6 rue Beffroy, Neuilly-sur-Seine</dd>
        <dt>Visite d'évaluation</dt><dd>Sous 2 jours ouvrés</dd>
        <dt>Accueil</dt><dd>7j/7, 9h-18h</dd>
      </dl>
    </div>
  </div>
</section>

"""


def bottom_sections(cities_exclude, faq_title, faq_entries):
    return f"""<section class="cities" id="villes" style="margin-top:88px">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Où intervenons-nous ?</span>
      <h2>Aide à domicile près de chez vous</h2>
      <p>Depuis notre siège de Neuilly-sur-Seine, nous accompagnons les personnes âgées dans ces communes.</p>
    </div>
    <div class="city-grid">
      {city_cards(cities_exclude)}
    </div>
    <p class="cities-foot">Votre commune n'est pas dans la liste ? <a href="#contact" class="highlight"><b>Contactez-nous</b></a>, nous étudierons votre demande.</p>
  </div>
</section>

<section id="faq">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">FAQ</span>
      <h2>{faq_title}</h2>
      <p>Mode mandataire, tarifs, crédit d'impôt, délais : les réponses à l'essentiel.</p>
    </div>
    <div class="faq-list">
      {faq_items(faq_entries, open_first=True)}
    </div>
    <div class="faq-more"><a href="/faq" class="btn btn-outline">Voir toutes les questions</a></div>
  </div>
</section>

<section style="padding-top:0">
  <div class="container">
    <div class="join-box">
      <div>
        <span class="eyebrow">Recrutement</span>
        <h2>Vous êtes auxiliaire de vie ? Rejoignez Caparel</h2>
        <p>Vous accompagnez des personnes âgées avec bienveillance et vous cherchez une structure qui vous encadre ? Postulez en quelques minutes.</p>
        <a href="/recrutement" class="btn btn-primary">Découvrir nos offres</a>
      </div>
      <div class="join-list">
        <div>{ic("heart")}Un métier utile, au plus près des familles</div>
        <div>{ic("users")}Un interlocuteur dédié et un suivi régulier</div>
        <div>{ic("calendar")}Des missions adaptées à vos disponibilités</div>
      </div>
    </div>
  </div>
</section>

"""


def home_page(c=None):
    """Page d'accueil ; avec c (dict ville) = même page personnalisée pour une ville."""
    if c:
        h = head(c["title"], c["desc"], c["path"], c["ld"], preload_hero=True, cp=True)
        h += header("villes")
        nom = c["nom"]
        faq_entries = c["local_faq"]
        local_section = local_block(c)
        faq_title = f"Questions fréquentes à {nom}"
        cities_exclude = c["slug"]
        form_ville, form_cp = c["form_ville"], c["form_cp"]
        bottom = bottom_sections(cities_exclude, faq_title, faq_entries)
        contact_top, contact_bottom = "", contact_section(form_ville, form_cp)
    else:
        desc = "Caparel, service mandataire d'aide à domicile pour personnes âgées à Neuilly-sur-Seine et dans les Hauts-de-Seine. Aide à la personne, entretien, accompagnement, 24h/24 et 7j/7. Crédit d'impôt 50 %."
        h = head("Caparel — Aide à domicile aux personnes âgées à Neuilly-sur-Seine", desc, "/",
                 [business_ld(), faq_jsonld(FAQ[:6])], preload_hero=True, cp=True)
        h += header("home")
        faq_entries = FAQ[:6]
        local_section = ""
        faq_title = "Vos questions fréquentes"
        cities_exclude = None
        form_ville, form_cp = "", ""
        # Accueil épuré : la demande de renseignements reste tout en bas de page
        bottom = ""
        contact_top, contact_bottom = "", contact_section()
    h += f"""
{hero_block(c)}

<section class="avis avis--loading" id="avis" aria-label="Avis Google">
  <div class="container">
    <div class="avis-head">
      <div class="avis-score"><b id="avisNote"></b><span class="avis-stars" id="avisEtoiles" aria-hidden="true"></span></div>
      <div class="avis-meta"><span id="avisCompte"></span> · <a id="avisLien" href="#" target="_blank" rel="noopener">Voir tous nos avis Google</a></div>
    </div>
    <div class="avis-track" id="avisTrack"></div>
  </div>
</section>

<div class="trust">
  <div class="container trust-row">
    <div class="trust-item"><b>50 %</b><span>de crédit d'impôt, même non imposable</span></div>
    <div class="trust-item"><b>dès 4 h</b><span>d'intervention par semaine</span></div>
    <div class="trust-item"><b>24h/24 · 7j/7</b><span>selon vos besoins</span></div>
    <div class="trust-item"><b>2 jours</b><span>ouvrés pour la visite d'évaluation</span></div>
  </div>
</div>

{local_section}{contact_top}{CP_SECTION}

{bottom}{contact_bottom}"""
    h += footer()
    return h


def page_services():
    desc = "Services d'aide à domicile Caparel : aide à la personne, aide au quotidien, assistance administrative, accompagnement et vie sociale, en mode mandataire. Dès 4 h par semaine, 24h/24 et 7j/7."
    h = head("Nos services d'aide à domicile — Caparel", desc, "/services",
             [breadcrumb_ld([("Accueil", "/"), ("Nos services", "/services")])])
    h += header("services")
    cards = ""
    for icon, titre, items in SERVICES:
        lis = "".join(f"<li>{escape(x)}</li>" for x in items)
        cards += f'<div class="service-card"><div class="service-ic">{ic(icon)}</div><h3>{escape(titre)}</h3><ul>{lis}</ul></div>\n      '
    h += f"""
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <span>Nos services</span></nav>
    <h1>Un accompagnement complet, à la carte</h1>
    <p>Nous construisons avec vous un accompagnement personnalisé, ajustable à tout moment selon vos besoins.</p>
  </div>
</section>

<section style="padding-top:40px">
  <div class="container">
    <div class="services-grid">
      {cards}
    </div>
    <div class="services-note">Nos interventions débutent dès <b>4 heures par semaine</b> et peuvent être assurées en continu, <b>24h/24 et 7j/7</b>.</div>
  </div>
</section>

<section id="mandataire" class="mand">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Mode mandataire</span>
      <h2>Vous restez employeur, nous gérons l'administratif</h2>
      <p>Le mode mandataire repose sur un contrat de mandat administratif : vous confiez à Caparel la réalisation, en votre nom, des démarches liées à l'emploi de votre auxiliaire de vie.</p>
    </div>
    <div class="mand-grid">
      <div class="mand-card">
        <h3><span class="tag">C</span> Notre rôle en tant que mandataire</h3>
        <ul>
          <li>Recherche et présentation d'auxiliaires de vie qualifiées</li>
          <li>Aide aux formalités d'embauche</li>
          <li>Établissement du contrat de travail</li>
          <li>Assistance au compte CESU / CESU+ (URSSAF)</li>
          <li>Bulletins de salaire et documents associés</li>
          <li>Déclaration des heures auprès de l'URSSAF CESU</li>
          <li>Proposition d'un remplaçant en cas d'absence</li>
          <li>Documents annuels pour le crédit d'impôt</li>
        </ul>
      </div>
      <div class="mand-card">
        <h3><span class="tag">V</span> Votre rôle en tant qu'employeur</h3>
        <ul>
          <li>Signature du contrat de travail (CDI ou CDD)</li>
          <li>Application de la convention collective du particulier employeur</li>
          <li>Un même intervenant au quotidien</li>
          <li>Versement du salaire et des cotisations via CESU</li>
          <li>Respect du droit du travail</li>
          <li>Décisions relevant de l'employeur (sanctions, rupture, etc.)</li>
        </ul>
      </div>
    </div>
    <div class="advantages">
      <h3>Les avantages du mode mandataire pour vous</h3>
      <div class="advantages-grid">
        <div class="adv-item">{ic("target")}Maîtrise du choix de votre intervenant</div>
        <div class="adv-item">{ic("repeat")}Relation de confiance et de continuité</div>
        <div class="adv-item">{ic("doc")}Allègement des démarches administratives</div>
        <div class="adv-item">{ic("clock")}Intervention 24h/24 et 7j/7</div>
        <div class="adv-item">{ic("euro")}Crédit d'impôt de 50 %</div>
        <div class="adv-item">{ic("shield")}Aides mobilisables : APA, PCH</div>
      </div>
    </div>
  </div>
</section>

{cta_band("Une question sur nos services ?", "Consultez nos tarifs ou parlez directement à notre équipe.")}"""
    h += footer()
    return h


def page_tarifs():
    desc = "Tarifs Caparel (mode mandataire) : de 28,70 € à 32,70 € TTC de l'heure, forfaits nuit, journée et 24h/24. Crédit d'impôt de 50 %, avance immédiate, aucun frais d'inscription."
    h = head("Nos tarifs d'aide à domicile — Caparel", desc, "/tarifs",
             [breadcrumb_ld([("Accueil", "/"), ("Nos tarifs", "/tarifs")])])
    h += header("tarifs")

    def row(label, vals, heads):
        tds = "".join(f'<td data-label="{escape(hd, quote=True)}">{v}</td>' for v, hd in zip(vals, heads))
        return f"<tr><td>{label}</td>{tds}</tr>"

    heads_h = ["Tarif horaire TTC", "Dont frais de mandat HT", "Dont TVA", "Coût réel après crédit d'impôt"]
    heads_f = ["Tarif TTC", "Dont frais de mandat HT", "Dont TVA", "Coût réel après crédit d'impôt"]
    rows_h = "\n          ".join([
        row("Tranche A — jusqu'à 25h/semaine", ["32,70 €", "13,36 €", "2,67 €", "16,35 €"], heads_h),
        row("Tranche B — de 26h à 40h/semaine", ["31,70 €", "12,53 €", "2,51 €", "15,85 €"], heads_h),
        row("Tranche C — plus de 40h/semaine", ["28,70 €", "10,03 €", "2,01 €", "14,35 €"], heads_h),
    ])
    rows_f = "\n          ".join([
        row("Forfait nuit de 12h", ["180,00 €", "58,42 €", "11,69 €", "90,00 €"], heads_f),
        row("Forfait journée de 12h", ["250,00 €", "71,13 €", "14,23 €", "125,00 €"], heads_f),
        row("Forfait 24h/24", ["380,00 €", "79,88 €", "15,98 €", "190,00 €"], heads_f),
        row("Garde malade de nuit de 12h", ["286,00 €", "73,76 €", "14,75 €", "143,00 €"], heads_f),
    ])
    h += f"""
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <span>Nos tarifs</span></nav>
    <h1>Des tarifs clairs, sans frais cachés</h1>
    <p>Tarifs applicables au 1er septembre 2026 — mode mandataire. Aucun frais d'inscription, ni de résiliation n'est facturé.</p>
  </div>
</section>

<section style="padding-top:40px">
  <div class="container">
    <div class="tarif-block">
      <h3>Tarif à l'heure</h3>
      <table>
        <thead>
          <tr><th>Heures</th><th>Tarif horaire TTC</th><th>Dont frais de mandat HT</th><th>Dont TVA</th><th>Coût réel après crédit d'impôt</th></tr>
        </thead>
        <tbody>
          {rows_h}
        </tbody>
      </table>
    </div>

    <div class="tarif-block">
      <h3>Prix des forfaits</h3>
      <table>
        <thead>
          <tr><th>Forfait</th><th>Tarif TTC</th><th>Dont frais de mandat HT</th><th>Dont TVA</th><th>Coût réel après crédit d'impôt</th></tr>
        </thead>
        <tbody>
          {rows_f}
        </tbody>
      </table>
    </div>

    <div class="tarifs-foot">
      <span>Le « coût réel après crédit d'impôt » suppose un crédit d'impôt de 50 % sur les sommes engagées, dans la limite du plafond annuel.</span>
      <a href="/#contact" class="btn btn-navy">Obtenir un devis personnalisé</a>
    </div>
  </div>
</section>

<section id="aides" class="aides">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Les aides fiscales</span>
      <h2>Des dispositifs pour alléger votre budget</h2>
      <p>Pour toute question fiscale relative à vos services à la personne, notre équipe vous accompagne.</p>
    </div>
    <div class="aides-grid">
      <div class="aide-highlight">
        <div><b>Crédit d'impôt de 50 %</b><span>Sur les sommes versées pour l'emploi d'un salarié à domicile (art. 199 sexdecies du CGI).</span></div>
        <div><span>Plafond : 12 000 € de dépenses par foyer et par an (majoré jusqu'à 15 000 €). Remboursable même sans imposition.</span></div>
      </div>
      <div class="aide-card"><span class="num">1</span><h4>Avance Immédiate (AICI)</h4><p>Depuis 2022, déduisez directement votre crédit d'impôt de chaque facture via Urssaf.fr : vous ne payez que la moitié du montant facturé. Caparel vous accompagne dans l'inscription.</p></div>
      <div class="aide-card"><span class="num">2</span><h4>Obligations déclaratives</h4><p>Reportez chaque année sur votre déclaration de revenus (formulaire 2042, case 7DB) le montant figurant sur votre attestation fiscale annuelle, remise par Caparel avant le 31 mars.</p></div>
      <div class="aide-card"><span class="num">3</span><h4>APA et PCH</h4><p>Les sommes prises en charge par l'APA ou la PCH ne sont pas éligibles au crédit d'impôt. Seul le montant net restant à votre charge ouvre droit au crédit d'impôt.</p></div>
      <div class="aide-card"><span class="num">4</span><h4>CESU préfinancé</h4><p>Si vous réglez en CESU préfinancé (employeur ou CSE), leur valeur doit être déduite des dépenses éligibles. Seule la part personnellement financée ouvre droit au crédit d'impôt.</p></div>
    </div>
  </div>
</section>

{cta_band("Une simulation personnalisée ?", "Parlez-nous de votre situation, nous établissons un devis sur mesure.")}"""
    h += footer()
    return h


def page_faq():
    desc = "FAQ Caparel : mode mandataire, tarifs, crédit d'impôt de 50 %, avance immédiate, délais de mise en place, auxiliaires de vie, urgences. Toutes les réponses à vos questions."
    h = head("FAQ — Questions fréquentes sur l'aide à domicile | Caparel", desc, "/faq",
             [faq_jsonld(FAQ), breadcrumb_ld([("Accueil", "/"), ("FAQ", "/faq")])])
    h += header("faq")
    body = ""
    cats = []
    for c, *_ in FAQ:
        if c not in cats:
            cats.append(c)
    for c in cats:
        body += f'<h2 class="faq-cat">{escape(c)}</h2>\n    <div class="faq-list">\n      {faq_items([e for e in FAQ if e[0] == c])}\n    </div>\n    '
    h += f"""
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <span>FAQ</span></nav>
    <h1>Questions fréquentes</h1>
    <p>Mode mandataire, tarifs, crédit d'impôt, délais de mise en place… Retrouvez les réponses à l'essentiel. Une autre question ? Appelez-nous au {TEL}.</p>
  </div>
</section>

<section style="padding-top:40px">
  <div class="container">
    {body}
  </div>
</section>

{cta_band("Vous n'avez pas trouvé votre réponse ?", "Notre équipe vous répond 7j/7, de 9h à 18h.", "Nous contacter")}"""
    h += footer()
    return h


def candidature_form():
    dispo = "".join(
        f'\n            <label class="checkbox-item"><input type="checkbox" name="disponibilites" value="{v}">{v}</label>'
        for v in ["Temps partiel (journée)", "Temps plein", "Nuits", "Week-ends", "Remplacements ponctuels"]
    )
    return f"""<form id="candidatureForm">
        <div style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true"><input type="text" name="hp_check_7f2a" id="hp_check_7f2a" tabindex="-1" autocomplete="off"></div>
        <div class="form-row">
          <div><label for="nom">Nom</label><input id="nom" name="nom" type="text" placeholder="Votre nom" required></div>
          <div><label for="prenom">Prénom</label><input id="prenom" name="prenom" type="text" placeholder="Votre prénom" required></div>
        </div>
        <div class="form-row">
          <div><label for="tel">Téléphone</label><input id="tel" name="tel" type="tel" placeholder="06 00 00 00 00" required></div>
          <div><label for="email">Email</label><input id="email" name="email" type="email" placeholder="vous@email.fr" required></div>
        </div>
        <div class="form-row full">
          <div><label for="adresse">Adresse</label><input id="adresse" name="adresse" type="text" placeholder="Numéro et nom de rue" autocomplete="street-address" required></div>
        </div>
        <div class="form-row">
          <div><label for="codePostal">Code postal</label><input id="codePostal" name="codePostal" type="text" inputmode="numeric" pattern="[0-9]{{5}}" maxlength="5" placeholder="92200" autocomplete="postal-code" required></div>
          <div><label for="ville">Ville</label><input id="ville" name="ville" type="text" placeholder="Votre ville" autocomplete="address-level2" required></div>
        </div>
        <div class="form-row full">
          <div><label for="nationalite">Nationalité</label>
            <select id="nationalite" name="nationaliteChoix" required>
              <option value="">Sélectionnez…</option>
              <option value="France">France</option>
              <optgroup label="Autre pays">
              <option value="Afghanistan">Afghanistan</option>
              <option value="Afrique du Sud">Afrique du Sud</option>
              <option value="Albanie">Albanie</option>
              <option value="Algérie">Algérie</option>
              <option value="Allemagne">Allemagne</option>
              <option value="Andorre">Andorre</option>
              <option value="Angola">Angola</option>
              <option value="Antigua-et-Barbuda">Antigua-et-Barbuda</option>
              <option value="Arabie saoudite">Arabie saoudite</option>
              <option value="Argentine">Argentine</option>
              <option value="Arménie">Arménie</option>
              <option value="Australie">Australie</option>
              <option value="Autriche">Autriche</option>
              <option value="Azerbaïdjan">Azerbaïdjan</option>
              <option value="Bahamas">Bahamas</option>
              <option value="Bahreïn">Bahreïn</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Barbade">Barbade</option>
              <option value="Belgique">Belgique</option>
              <option value="Belize">Belize</option>
              <option value="Bénin">Bénin</option>
              <option value="Bhoutan">Bhoutan</option>
              <option value="Biélorussie">Biélorussie</option>
              <option value="Birmanie">Birmanie</option>
              <option value="Bolivie">Bolivie</option>
              <option value="Bosnie-Herzégovine">Bosnie-Herzégovine</option>
              <option value="Botswana">Botswana</option>
              <option value="Brésil">Brésil</option>
              <option value="Brunéi">Brunéi</option>
              <option value="Bulgarie">Bulgarie</option>
              <option value="Burkina Faso">Burkina Faso</option>
              <option value="Burundi">Burundi</option>
              <option value="Cambodge">Cambodge</option>
              <option value="Cameroun">Cameroun</option>
              <option value="Canada">Canada</option>
              <option value="Cap-Vert">Cap-Vert</option>
              <option value="Chili">Chili</option>
              <option value="Chine">Chine</option>
              <option value="Chypre">Chypre</option>
              <option value="Colombie">Colombie</option>
              <option value="Comores">Comores</option>
              <option value="Congo">Congo</option>
              <option value="Congo (République démocratique)">Congo (République démocratique)</option>
              <option value="Corée du Nord">Corée du Nord</option>
              <option value="Corée du Sud">Corée du Sud</option>
              <option value="Costa Rica">Costa Rica</option>
              <option value="Côte d'Ivoire">Côte d'Ivoire</option>
              <option value="Croatie">Croatie</option>
              <option value="Cuba">Cuba</option>
              <option value="Danemark">Danemark</option>
              <option value="Djibouti">Djibouti</option>
              <option value="Dominique">Dominique</option>
              <option value="Égypte">Égypte</option>
              <option value="Émirats arabes unis">Émirats arabes unis</option>
              <option value="Équateur">Équateur</option>
              <option value="Érythrée">Érythrée</option>
              <option value="Espagne">Espagne</option>
              <option value="Estonie">Estonie</option>
              <option value="Eswatini">Eswatini</option>
              <option value="États-Unis">États-Unis</option>
              <option value="Éthiopie">Éthiopie</option>
              <option value="Fidji">Fidji</option>
              <option value="Finlande">Finlande</option>
              <option value="Gabon">Gabon</option>
              <option value="Gambie">Gambie</option>
              <option value="Géorgie">Géorgie</option>
              <option value="Ghana">Ghana</option>
              <option value="Grèce">Grèce</option>
              <option value="Grenade">Grenade</option>
              <option value="Guatemala">Guatemala</option>
              <option value="Guinée">Guinée</option>
              <option value="Guinée équatoriale">Guinée équatoriale</option>
              <option value="Guinée-Bissau">Guinée-Bissau</option>
              <option value="Guyana">Guyana</option>
              <option value="Haïti">Haïti</option>
              <option value="Honduras">Honduras</option>
              <option value="Hongrie">Hongrie</option>
              <option value="Îles Marshall">Îles Marshall</option>
              <option value="Inde">Inde</option>
              <option value="Indonésie">Indonésie</option>
              <option value="Irak">Irak</option>
              <option value="Iran">Iran</option>
              <option value="Irlande">Irlande</option>
              <option value="Islande">Islande</option>
              <option value="Israël">Israël</option>
              <option value="Italie">Italie</option>
              <option value="Jamaïque">Jamaïque</option>
              <option value="Japon">Japon</option>
              <option value="Jordanie">Jordanie</option>
              <option value="Kazakhstan">Kazakhstan</option>
              <option value="Kenya">Kenya</option>
              <option value="Kirghizistan">Kirghizistan</option>
              <option value="Kiribati">Kiribati</option>
              <option value="Kosovo">Kosovo</option>
              <option value="Koweït">Koweït</option>
              <option value="Laos">Laos</option>
              <option value="Lesotho">Lesotho</option>
              <option value="Lettonie">Lettonie</option>
              <option value="Liban">Liban</option>
              <option value="Libéria">Libéria</option>
              <option value="Libye">Libye</option>
              <option value="Liechtenstein">Liechtenstein</option>
              <option value="Lituanie">Lituanie</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Macédoine du Nord">Macédoine du Nord</option>
              <option value="Madagascar">Madagascar</option>
              <option value="Malaisie">Malaisie</option>
              <option value="Malawi">Malawi</option>
              <option value="Maldives">Maldives</option>
              <option value="Mali">Mali</option>
              <option value="Malte">Malte</option>
              <option value="Maroc">Maroc</option>
              <option value="Maurice">Maurice</option>
              <option value="Mauritanie">Mauritanie</option>
              <option value="Mexique">Mexique</option>
              <option value="Micronésie">Micronésie</option>
              <option value="Moldavie">Moldavie</option>
              <option value="Monaco">Monaco</option>
              <option value="Mongolie">Mongolie</option>
              <option value="Monténégro">Monténégro</option>
              <option value="Mozambique">Mozambique</option>
              <option value="Namibie">Namibie</option>
              <option value="Nauru">Nauru</option>
              <option value="Népal">Népal</option>
              <option value="Nicaragua">Nicaragua</option>
              <option value="Niger">Niger</option>
              <option value="Nigéria">Nigéria</option>
              <option value="Norvège">Norvège</option>
              <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
              <option value="Oman">Oman</option>
              <option value="Ouganda">Ouganda</option>
              <option value="Ouzbékistan">Ouzbékistan</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Palaos">Palaos</option>
              <option value="Palestine">Palestine</option>
              <option value="Panama">Panama</option>
              <option value="Papouasie-Nouvelle-Guinée">Papouasie-Nouvelle-Guinée</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Pays-Bas">Pays-Bas</option>
              <option value="Pérou">Pérou</option>
              <option value="Philippines">Philippines</option>
              <option value="Pologne">Pologne</option>
              <option value="Portugal">Portugal</option>
              <option value="Qatar">Qatar</option>
              <option value="République centrafricaine">République centrafricaine</option>
              <option value="République dominicaine">République dominicaine</option>
              <option value="République tchèque">République tchèque</option>
              <option value="Roumanie">Roumanie</option>
              <option value="Royaume-Uni">Royaume-Uni</option>
              <option value="Russie">Russie</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Saint-Christophe-et-Niévès">Saint-Christophe-et-Niévès</option>
              <option value="Saint-Marin">Saint-Marin</option>
              <option value="Saint-Vincent-et-les-Grenadines">Saint-Vincent-et-les-Grenadines</option>
              <option value="Sainte-Lucie">Sainte-Lucie</option>
              <option value="Salomon">Salomon</option>
              <option value="Salvador">Salvador</option>
              <option value="Samoa">Samoa</option>
              <option value="Sao Tomé-et-Principe">Sao Tomé-et-Principe</option>
              <option value="Sénégal">Sénégal</option>
              <option value="Serbie">Serbie</option>
              <option value="Seychelles">Seychelles</option>
              <option value="Sierra Leone">Sierra Leone</option>
              <option value="Singapour">Singapour</option>
              <option value="Slovaquie">Slovaquie</option>
              <option value="Slovénie">Slovénie</option>
              <option value="Somalie">Somalie</option>
              <option value="Soudan">Soudan</option>
              <option value="Soudan du Sud">Soudan du Sud</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Suède">Suède</option>
              <option value="Suisse">Suisse</option>
              <option value="Suriname">Suriname</option>
              <option value="Syrie">Syrie</option>
              <option value="Tadjikistan">Tadjikistan</option>
              <option value="Tanzanie">Tanzanie</option>
              <option value="Tchad">Tchad</option>
              <option value="Thaïlande">Thaïlande</option>
              <option value="Timor oriental">Timor oriental</option>
              <option value="Togo">Togo</option>
              <option value="Tonga">Tonga</option>
              <option value="Trinité-et-Tobago">Trinité-et-Tobago</option>
              <option value="Tunisie">Tunisie</option>
              <option value="Turkménistan">Turkménistan</option>
              <option value="Turquie">Turquie</option>
              <option value="Tuvalu">Tuvalu</option>
              <option value="Ukraine">Ukraine</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Vanuatu">Vanuatu</option>
              <option value="Vatican">Vatican</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Viêt Nam">Viêt Nam</option>
              <option value="Yémen">Yémen</option>
              <option value="Zambie">Zambie</option>
              <option value="Zimbabwe">Zimbabwe</option>
              <option value="Autre pays">Autre pays (non listé)</option>
              </optgroup>
            </select></div>
        </div>
        <div class="sejour-block" id="sejourBlock">
          <div class="form-row full">
            <label id="sejourLabel">Disposez-vous d'un titre de séjour valide vous permettant de travailler en France ?</label>
            <div class="checkbox-grid" role="radiogroup" aria-labelledby="sejourLabel">
              <label class="checkbox-item"><input type="radio" name="titreSejourValide" value="Oui" required>Oui</label>
              <label class="checkbox-item"><input type="radio" name="titreSejourValide" value="Non" required>Non</label>
            </div>
          </div>
          <div class="form-row full" id="sejourTypeRow" hidden>
            <div><label for="typeTitreSejour">Veuillez préciser le titre de séjour</label><input id="typeTitreSejour" name="typeTitreSejour" type="text" placeholder="Ex. carte de résident, carte de séjour…" disabled></div>
          </div>
        </div>
        <div class="form-row">
          <div><label for="diplome">Diplôme</label>
            <select id="diplome" name="diplome">
              <option value="">Sélectionnez…</option>
              <option>DEAES</option>
              <option>Titre professionnel ADVF</option>
              <option>BEP CSS</option>
              <option>DEAVS</option>
              <option>Diplôme d'aide-soignant</option>
              <option>Autre diplôme du secteur sanitaire ou social</option>
              <option>Pas de diplôme, mais de l'expérience</option>
            </select></div>
          <div><label for="experience">Expérience auprès de personnes âgées</label>
            <select id="experience" name="experience">
              <option value="">Sélectionnez…</option>
              <option>Aucune</option>
              <option>Moins d'un an</option>
              <option>1 à 3 ans</option>
              <option>Plus de 3 ans</option>
            </select></div>
        </div>
        <div class="form-row full">
          <label>Vos disponibilités</label>
          <div class="checkbox-grid">{dispo}
          </div>
        </div>
        <div class="form-row full">
          <div class="file-field">
            <label for="cv">CV <em>(PDF ou Word, 3 Mo max)</em></label>
            <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            <span class="file-name" aria-live="polite"></span>
          </div>
        </div>
        <div class="form-row full">
          <div class="file-field">
            <label for="photo">Photo <em>(obligatoire, JPG ou PNG)</em></label>
            <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required>
            <span class="file-name" aria-live="polite"></span>
          </div>
        </div>
        <div class="form-row full">
          <div><label for="message">Message</label><textarea id="message" name="message" placeholder="Présentez-vous en quelques mots : parcours, secteur géographique, disponibilités…"></textarea></div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Envoyer ma candidature</button>
        <div class="form-status" role="status" aria-live="polite"></div>
        <p class="form-legal">Les informations, votre CV et votre photo sont utilisés uniquement pour traiter votre candidature et ne sont pas transmis à des tiers en dehors de votre mise en relation avec un particulier-employeur. Vous disposez d'un droit d'accès, de rectification et d'effacement : {MAIL}.</p>
      </form>"""


def page_recrutement():
    desc = "Recrutement Caparel : devenez auxiliaire de vie / intervenant(e) à domicile auprès de personnes âgées à Neuilly-sur-Seine et dans les Hauts-de-Seine. Postulez en ligne."
    h = head("Recrutement auxiliaire de vie à domicile — Caparel", desc, "/recrutement",
             [breadcrumb_ld([("Accueil", "/"), ("Recrutement", "/recrutement")])])
    h += header("recrutement")
    h += f"""
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <span>Recrutement</span></nav>
    <h1>Devenez auxiliaire de vie chez Caparel</h1>
    <p>Caparel démarre son activité à Neuilly-sur-Seine et constitue son réseau d'intervenant(e)s à domicile. Vous accompagnez des personnes âgées avec bienveillance ? Rejoignez-nous.</p>
  </div>
</section>

<section style="padding-top:40px">
  <div class="container">
    <div class="job-grid">
      <div class="job-card">
        <h3>{ic("heart")}Votre mission</h3>
        <ul>
          <li>Accompagner la personne âgée dans les actes essentiels et ordinaires du quotidien, pour lui permettre de rester chez elle en sécurité, dans le confort et la dignité</li>
          <li>Stimuler l'autonomie de la personne plutôt que de se substituer à elle</li>
          <li><b>Aide aux actes de la vie :</b> toilette, habillage, lever, coucher, transferts, repas, mobilité et prévention des chutes</li>
          <li><b>Entretien du cadre de vie :</b> logement, linge, courses, préparation des repas</li>
          <li><b>Lien social :</b> sorties, rendez-vous médicaux, conversation, activités adaptées, lutte contre l'isolement</li>
          <li><b>Vigilance :</b> repérer l'évolution de l'état de la personne, alerter, renseigner le cahier de liaison</li>
        </ul>
      </div>
      <div class="job-card">
        <h3>{ic("briefcase")}Votre profil</h3>
        <ul>
          <li><b>Diplôme :</b> DEAES, titre professionnel ADVF, BEP CSS, DEAVS ou diplôme d'aide-soignant — à défaut, expérience significative auprès d'un public dépendant</li>
          <li><b>Expérience</b> auprès de personnes âgées en perte d'autonomie appréciée</li>
          <li><b>Secourisme :</b> formation PSC1 souhaitée</li>
          <li><b>Permis B</b> apprécié selon la zone d'intervention</li>
          <li><b>Casier judiciaire :</b> bulletin n°3 vierge exigé (intervention auprès d'un public fragile)</li>
          <li><b>Qualités :</b> patience, douceur, bienveillance, discrétion, ponctualité, fiabilité et autonomie</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="job-top">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Notre fonctionnement</span>
      <h2>Comment se passe le recrutement ?</h2>
      <p>Caparel intervient en mode mandataire : nous vous présentons à la personne accompagnée (le particulier-employeur), qui décide de l'embauche et signe le contrat.</p>
    </div>
    <div class="steps">
      <div class="step"><h3>Votre candidature</h3><p>Vous remplissez le formulaire ci-dessous. Nous étudions votre profil et vous contactons pour un premier échange téléphonique.</p></div>
      <div class="step"><h3>L'entretien</h3><p>Un entretien individuel avec notre équipe : parcours, compétences, mises en situation et façon d'aborder le métier.</p></div>
      <div class="step"><h3>Les vérifications</h3><p>Pièces d'identité, autorisation de travail, diplômes, bulletin n°3 du casier judiciaire et références professionnelles.</p></div>
      <div class="step"><h3>La mise en relation</h3><p>Nous vous présentons à la personne dont les besoins correspondent à votre profil. Elle décide de l'embauche et signe le contrat de travail.</p></div>
    </div>
    <p class="steps-note"><span>Contrat de travail avec le particulier-employeur (CDI ou CDD), convention collective nationale des particuliers employeurs (IDCC 3239).</span></p>
  </div>
</section>

<section id="postuler">
  <div class="container apply-grid">
    <div class="apply-info">
      <span class="eyebrow">Après votre embauche</span>
      <h2>Un accompagnement tout au long de votre mission</h2>
      <p>Vous n'êtes jamais seul(e) : notre équipe reste votre interlocutrice.</p>
      <div class="apply-steps">
        <div><span class="n">1</span><p><b>Intégration</b><span>Remise du livret d'accueil et présentation du projet d'accompagnement de la personne.</span></p></div>
        <div><span class="n">2</span><p><b>Première intervention</b><span>Vous êtes accompagné(e) par notre équipe lors de la première intervention.</span></p></div>
        <div><span class="n">3</span><p><b>Suivi régulier</b><span>Visite de suivi au domicile dans les premières semaines, puis suivi régulier.</span></p></div>
        <div><span class="n">4</span><p><b>Formation continue</b><span>Gestes techniques, troubles cognitifs, prévention des risques, gestes de premiers secours.</span></p></div>
      </div>
      <p>Une question ? Écrivez-nous à <a href="mailto:{MAIL}" class="highlight"><b>{MAIL}</b></a> ou appelez le <a href="{TEL_HREF}" class="highlight"><b>{TEL}</b></a>.</p>
    </div>
    <div class="contact-form">
      <h3>Postuler en ligne</h3>
      <p class="hint">Nous vous recontactons rapidement pour un premier échange téléphonique.</p>
{candidature_form()}
    </div>
  </div>
</section>
"""
    h += footer()
    return h


def city_pages():
    pages = {}
    for idx, (slug, nom, cp, dep, voisines, limitrophe) in enumerate(CITIES):
        path = f"/aide-a-domicile/{slug}/"
        paris = slug == "paris"
        cp_label = "75 (16e, 17e, 8e…)" if paris else cp
        title = f"Aide à domicile à {nom} ({'75' if paris else cp}) | Caparel"
        desc = (f"Aide à domicile pour personnes âgées à {nom} : aide à la personne, entretien, accompagnement. "
                f"Mode mandataire, crédit d'impôt 50 %, devis gratuit. Caparel, {TEL}.")
        intro = INTROS[idx % len(INTROS)].format(v=nom + ("" if paris else f" ({cp})"))
        if slug == "neuilly-sur-seine":
            local = "Caparel est installée à Neuilly-sur-Seine : notre siège se trouve au 6 rue Beffroy. Nous connaissons le secteur et organisons la visite d'évaluation à votre domicile sous 2 jours ouvrés."
        elif paris:
            local = "Depuis notre siège de Neuilly-sur-Seine, nous accompagnons les Parisiens, notamment dans les 16e et 17e arrondissements, limitrophes de Neuilly-sur-Seine. Contactez-nous pour vérifier que votre arrondissement fait partie de notre secteur."
        elif limitrophe:
            local = f"Depuis notre siège de Neuilly-sur-Seine, nous intervenons à {nom}, commune limitrophe qui fait partie de notre secteur d'intervention le plus proche."
        else:
            local = f"Depuis notre siège de Neuilly-sur-Seine, nous intervenons à {nom}, dans l'ouest parisien. Contactez-nous pour organiser la visite d'évaluation à votre domicile."
        near = "".join(
            f'<a href="/aide-a-domicile/{s}/">Aide à domicile à {CITY[s][1]}</a>' for s in voisines
        )
        dept_label = "Paris (75)" if paris else "Hauts-de-Seine (92)"
        local_faq = [
            ("", f"Intervenez-vous à {nom} ?",
             f"<p>Oui. Caparel intervient à {nom} et dans les communes voisines, depuis son siège de Neuilly-sur-Seine. Une visite d'évaluation à domicile est proposée sous 2 jours ouvrés.</p>",
             f"Oui. Caparel intervient à {nom} et dans les communes voisines, depuis son siège de Neuilly-sur-Seine. Visite d'évaluation sous 2 jours ouvrés."),
            ("", f"Combien coûte une aide à domicile à {nom} ?",
             "<p>Le tarif horaire est de 32,70 € TTC jusqu'à 25 h par semaine, soit 16,35 € après crédit d'impôt de 50 % ; 31,70 € de 26 h à 40 h et 28,70 € au-delà. Aucun frais d'inscription ni de résiliation. <a href=\"/tarifs\">Voir tous les tarifs</a>.</p>",
             "32,70 € TTC de l'heure jusqu'à 25 h par semaine, soit 16,35 € après crédit d'impôt de 50 %. Aucun frais d'inscription ni de résiliation."),
            ("", f"Sous quel délai l'accompagnement peut-il démarrer à {nom} ?",
             "<p>Après votre prise de contact, la visite d'évaluation est proposée sous 2 jours ouvrés. La mise en place intervient généralement sous 5 jours après validation du plan d'aide, sous réserve de la disponibilité d'un intervenant adapté.</p>",
             "Visite d'évaluation sous 2 jours ouvrés, puis mise en place généralement sous 5 jours après validation du plan d'aide."),
        ]
        ld = [
            {
                "@context": "https://schema.org",
                "@type": "Service",
                "name": f"Aide à domicile à {nom}",
                "serviceType": "Aide à domicile pour personnes âgées",
                "areaServed": {"@type": "City", "name": nom},
                "provider": {"@type": "LocalBusiness", "name": "Caparel", "url": BASE + "/", "telephone": "+33664269303",
                             "address": {"@type": "PostalAddress", "streetAddress": "6 rue Beffroy", "postalCode": "92200", "addressLocality": "Neuilly-sur-Seine", "addressCountry": "FR"}},
            },
            faq_jsonld(local_faq),
            breadcrumb_ld([("Accueil", "/"), ("Aide à domicile", "/aide-a-domicile/"), (nom, path)]),
        ]
        pages[path] = home_page({
            "slug": slug, "nom": nom, "path": path, "title": title, "desc": desc, "ld": ld,
            "intro": intro, "local": local, "near": near, "cp_label": cp_label,
            "dept_label": dept_label, "local_faq": local_faq,
            "form_ville": nom, "form_cp": "" if paris else cp,
        })
    return pages


def page_demande():
    desc = "Demande de renseignements ou de devis gratuit Caparel : décrivez vos besoins d'aide à domicile, nous vous répondons sous 24 à 48h ouvrées."
    h = head("Demande de renseignements et devis gratuit | Caparel", desc, "/demande",
             [breadcrumb_ld([("Accueil", "/"), ("Demande de renseignements", "/demande")])])
    h += header("")
    h += f"""
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <span>Demande de renseignements</span></nav>
    <h1>Une demande de renseignements ?</h1>
    <p>Répondez au formulaire ci-dessous : nous vous recontactons sous 24 à 48h ouvrées pour évaluer votre situation. Le devis est gratuit. Vous préférez parler à quelqu'un ? Appelez le <a href="{TEL_HREF}" class="highlight"><b>{TEL}</b></a>.</p>
  </div>
</section>

{contact_section()}"""
    h += footer()
    return h


def page_candidature():
    """Page de candidature non listée : pas dans le menu, ni le sitemap, ni indexée.
    On la partage uniquement par lien."""
    desc = "Formulaire de candidature Caparel."
    h = head("Candidature auxiliaire de vie — Caparel", desc, "/candidature", noindex=True)
    h += header("")
    h += f"""
<section class="page-hero">
  <div class="container">
    <h1>Candidature auxiliaire de vie</h1>
  </div>
</section>

<section style="padding-top:40px">
  <div class="container" style="max-width:760px">
    <div class="contact-form">
      <h3>Postuler en ligne</h3>
      <p class="hint">Merci de remplir les informations demandées : seuls le CV, le diplôme, l'expérience, les disponibilités et le message sont facultatifs.</p>
      {candidature_form()}
    </div>
  </div>
</section>
"""
    h += footer()
    return h


def page_villes_hub():
    desc = "Caparel intervient à Neuilly-sur-Seine, Paris, Levallois-Perret, Boulogne-Billancourt, Courbevoie, Puteaux, Suresnes, Clichy, Issy-les-Moulineaux et Saint-Cloud. Trouvez votre aide à domicile."
    h = head("Aide à domicile en Hauts-de-Seine et à Paris — nos villes | Caparel", desc, "/aide-a-domicile/",
             [breadcrumb_ld([("Accueil", "/"), ("Aide à domicile", "/aide-a-domicile/")])])
    h += header("villes")
    h += f"""
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › <span>Aide à domicile</span></nav>
    <h1>Aide à domicile près de chez vous</h1>
    <p>Depuis notre siège de Neuilly-sur-Seine, Caparel accompagne les personnes âgées à Paris et dans les Hauts-de-Seine. Choisissez votre commune.</p>
  </div>
</section>

<section style="padding-top:40px" class="cities">
  <div class="container">
    <div class="city-grid">
      {city_cards()}
    </div>
    <p class="cities-foot">Votre commune n'est pas dans la liste ? <a href="/#contact" class="highlight"><b>Contactez-nous</b></a>, nous étudierons votre demande.</p>
  </div>
</section>

{cta_band("Un devis gratuit près de chez vous", "Parlez-nous de votre situation, nous vous répondons sous 24 à 48h ouvrées.")}"""
    h += footer()
    return h


def write(path, content):
    full = os.path.join(SITE, path.lstrip("/"))
    if full.endswith("/"):
        full = os.path.join(full, "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    pages = {
        "/index.html": home_page(),
        "/services.html": page_services(),
        "/tarifs.html": page_tarifs(),
        "/faq.html": page_faq(),
        "/recrutement.html": page_recrutement(),
        "/demande.html": page_demande(),
        "/candidature.html": page_candidature(),
        "/aide-a-domicile/": page_villes_hub(),
    }
    pages.update(city_pages())
    for p, c in pages.items():
        write(p, c)

    urls = ["/", "/services", "/tarifs", "/faq", "/recrutement", "/demande", "/aide-a-domicile/"]
    urls += [f"/aide-a-domicile/{c[0]}/" for c in CITIES]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u in urls:
        xml += f"  <url>\n    <loc>{BASE}{u}</loc>\n    <lastmod>{LASTMOD}</lastmod>\n  </url>\n"
    xml += "</urlset>\n"
    with open(os.path.join(SITE, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"{len(pages)} pages générées, {len(urls)} URLs dans le sitemap")


if __name__ == "__main__":
    main()
