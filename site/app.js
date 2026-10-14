/* Caparel — scripts partagés (menu mobile, avis Google, formulaires) */
(function(){
  var API = "https://releve-heures-chi.vercel.app/api/";

  /* Menu mobile */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if(toggle && links){
    toggle.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Bandeau d'avis Google (masqué tant que les avis ne sont pas chargés) */
  var section = document.getElementById('avis');
  if(section){
    var stars = function(n){
      var full = Math.round(n);
      return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
    };
    fetch(API + 'avis')
      .then(function(res){ if(!res.ok) throw new Error('avis ' + res.status); return res.json(); })
      .then(function(data){
        if(data.note == null){ section.hidden = true; return; }
        document.getElementById('avisNote').textContent = data.note.toFixed(1).replace('.', ',');
        document.getElementById('avisEtoiles').textContent = stars(data.note);
        document.getElementById('avisCompte').textContent = data.nombreAvis + ' avis Google';
        var lien = document.getElementById('avisLien');
        if(data.lien) lien.href = data.lien; else lien.hidden = true;

        var track = document.getElementById('avisTrack');
        var liste = data.avis || [];
        if(!liste.length) track.remove();
        liste.forEach(function(a){
          var card = document.createElement('article');
          card.className = 'avis-card';
          var top = document.createElement('div');
          top.className = 'avis-card-top';
          var avatar = document.createElement('div');
          avatar.className = 'avis-avatar';
          avatar.textContent = (a.auteur || '?').charAt(0).toUpperCase();
          var who = document.createElement('div');
          var name = document.createElement('div');
          name.className = 'avis-author';
          name.textContent = a.auteur;
          var date = document.createElement('div');
          date.className = 'avis-date';
          date.textContent = a.date;
          who.appendChild(name);
          who.appendChild(date);
          top.appendChild(avatar);
          top.appendChild(who);
          var rating = document.createElement('div');
          rating.className = 'avis-stars';
          rating.setAttribute('aria-label', a.note + ' sur 5');
          rating.textContent = stars(a.note);
          var text = document.createElement('p');
          text.className = 'avis-text';
          text.textContent = a.texte;
          card.appendChild(top);
          card.appendChild(rating);
          card.appendChild(text);
          track.appendChild(card);
        });
        section.classList.remove('avis--loading');
      })
      .catch(function(){ section.hidden = true; });
  }

  /* Formulaires : demande de renseignements (leads) et candidatures */
  function checked(form, name){
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function(i){ return i.value; });
  }

  function wire(formId, endpoint, buildPayload, okMessage){
    var form = document.getElementById(formId);
    if(!form) return;
    var statusEl = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      statusEl.className = 'form-status';
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Envoi en cours…';
      fetch(API + endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(buildPayload(form))
      })
        .then(function(res){ if(!res.ok) throw new Error('http ' + res.status); return res.json(); })
        .then(function(){
          statusEl.textContent = okMessage;
          statusEl.className = 'form-status show success';
          form.reset();
        })
        .catch(function(){
          statusEl.textContent = "Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous appeler au 06 64 26 93 03.";
          statusEl.className = 'form-status show error';
        })
        .then(function(){
          btn.disabled = false;
          btn.textContent = label;
        });
    });
  }

  wire('contactForm', 'leads', function(f){
    return {
      nom: f.nom.value,
      prenom: f.prenom.value,
      telephone: f.tel.value,
      email: f.email.value,
      adresse: f.adresse.value,
      ville: f.ville.value,
      codePostal: f.codePostal.value,
      besoins: checked(f, 'besoins'),
      creneaux: checked(f, 'creneaux'),
      message: f.message.value,
      hp_check_7f2a: f.hp_check_7f2a.value
    };
  }, "Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 24 à 48h ouvrées.");

  wire('candidatureForm', 'candidatures', function(f){
    return {
      nom: f.nom.value,
      prenom: f.prenom.value,
      telephone: f.tel.value,
      email: f.email.value,
      ville: f.ville.value,
      diplome: f.diplome.value,
      experience: f.experience.value,
      disponibilites: checked(f, 'disponibilites'),
      message: f.message.value,
      hp_check_7f2a: f.hp_check_7f2a.value
    };
  }, "Merci ! Votre candidature a bien été envoyée. Nous revenons vers vous rapidement pour un premier échange téléphonique.");
})();
