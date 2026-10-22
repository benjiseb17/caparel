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
  function wire(formId, endpoint, buildPayload, okMessage){
    var form = document.getElementById(formId);
    if(!form) return;
    var statusEl = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    function show(msg, ok){
      statusEl.textContent = msg;
      statusEl.className = 'form-status show ' + (ok ? 'success' : 'error');
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      statusEl.className = 'form-status';
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Envoi en cours…';
      Promise.resolve()
        .then(function(){ return buildPayload(form); })
        .then(function(payload){
          var isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
          return fetch(API + endpoint, {
            method: 'POST',
            headers: isForm ? undefined : {'Content-Type': 'application/json'},
            body: isForm ? payload : JSON.stringify(payload)
          });
        })
        .then(function(res){
          if(res.status === 400){
            return res.json().then(function(d){ throw new Error(d && d.error ? d.error : 'http 400'); });
          }
          if(!res.ok) throw new Error('http ' + res.status);
          return res.json();
        })
        .then(function(data){
          form.reset();
          resetFiles(form);
          if(data && data.piecesJointes === false){
            show("Votre candidature a bien été enregistrée, mais nous n'avons pas pu recevoir vos fichiers. Merci de les envoyer à contact@caparel.fr.", true);
          } else {
            show(okMessage, true);
          }
        })
        .catch(function(err){
          var msg = String(err && err.message || '');
          show(msg && msg.indexOf('http') !== 0
            ? msg
            : "Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous appeler au 06 64 26 93 03.", false);
        })
        .then(function(){
          btn.disabled = false;
          btn.textContent = label;
        });
    });
  }

  /* Fichiers du formulaire de candidature */
  var MAX_PHOTO = 2 * 1024 * 1024;
  var MAX_CV = 3 * 1024 * 1024;

  function resetFiles(form){
    Array.prototype.forEach.call(form.querySelectorAll('.file-name'), function(n){ n.textContent = ''; });
  }

  // Réduit la photo (1200 px max, JPEG) pour rester léger ; si le navigateur
  // ne sait pas la lire, on renvoie le fichier d'origine.
  function compresserPhoto(file){
    return new Promise(function(resolve){
      if(!/^image\/(jpeg|png|webp)$/.test(file.type)){ resolve(file); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function(){
        var max = 1200, ratio = Math.min(1, max / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(function(blob){
          resolve(blob && blob.size < file.size ? new File([blob], 'photo.jpg', {type: 'image/jpeg'}) : file);
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function(){ URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function fichierCandidature(form, name){
    var input = form.querySelector('input[name="' + name + '"]');
    return input && input.files && input.files[0] ? input.files[0] : null;
  }

  document.addEventListener('change', function(e){
    var t = e.target;
    if(!t || t.type !== 'file') return;
    var label = t.closest('.file-field');
    var out = label && label.querySelector('.file-name');
    if(out) out.textContent = t.files && t.files[0] ? t.files[0].name : '';
  });

  function checked(form, name){
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function(i){ return i.value; });
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

  // Candidature : la question sur le titre de séjour n'apparaît que si la
  // nationalité n'est pas française.
  (function(){
    var sel = document.getElementById('nationalite');
    var block = document.getElementById('sejourBlock');
    if(!sel || !block) return;
    var precision = document.getElementById('nationalitePrecision');
    var radios = block.querySelectorAll('input[name="titreSejourValide"]');
    var typeRow = document.getElementById('sejourTypeRow');
    var typeInput = document.getElementById('typeTitreSejour');
    function maj(){
      var autre = sel.value === 'Autre';
      block.hidden = !autre;
      precision.disabled = !autre; precision.required = autre;
      Array.prototype.forEach.call(radios, function(r){ r.disabled = !autre; r.required = autre; });
      var oui = autre && block.querySelector('input[name="titreSejourValide"]:checked') && block.querySelector('input[name="titreSejourValide"]:checked').value === 'Oui';
      typeRow.hidden = !oui;
      typeInput.disabled = !oui; typeInput.required = !!oui;
    }
    sel.addEventListener('change', maj);
    Array.prototype.forEach.call(radios, function(r){ r.addEventListener('change', maj); });
    var form = document.getElementById('candidatureForm');
    if(form) form.addEventListener('reset', function(){ setTimeout(maj, 0); });
  })();

  wire('candidatureForm', 'candidatures', function(f){
    var fd = new FormData();
    fd.append('nom', f.nom.value);
    fd.append('prenom', f.prenom.value);
    fd.append('telephone', f.tel.value);
    fd.append('email', f.email.value);
    fd.append('adresse', f.adresse.value);
    fd.append('ville', f.ville.value);
    fd.append('codePostal', f.codePostal.value);
    var autre = f.nationaliteChoix.value === 'Autre';
    fd.append('nationalite', autre ? f.nationalitePrecision.value.trim() : 'Française');
    if(autre){
      var tsv = f.querySelector('input[name="titreSejourValide"]:checked');
      fd.append('titreSejourValide', tsv ? tsv.value : '');
      fd.append('typeTitreSejour', f.typeTitreSejour.value);
    }
    fd.append('diplome', f.diplome.value);
    fd.append('experience', f.experience.value);
    checked(f, 'disponibilites').forEach(function(d){ fd.append('disponibilites', d); });
    fd.append('message', f.message.value);
    fd.append('hp_check_7f2a', f.hp_check_7f2a.value);

    var photo = fichierCandidature(f, 'photo');
    var cv = fichierCandidature(f, 'cv');
    if(cv){
      if(!/\.(pdf|docx?)$/i.test(cv.name)) throw new Error('Le CV doit être au format PDF ou Word (.doc, .docx).');
      if(cv.size > MAX_CV) throw new Error('Le CV est trop volumineux (3 Mo maximum).');
      fd.append('cv', cv);
    }
    if(!photo) throw new Error('Merci d\'ajouter votre photo.');
    return compresserPhoto(photo).then(function(p){
      if(p.size > MAX_PHOTO) throw new Error('La photo est trop volumineuse (2 Mo maximum).');
      fd.append('photo', p, p.name);
      return fd;
    });
  }, "Merci ! Votre candidature a bien été envoyée. Nous revenons vers vous rapidement pour un premier échange téléphonique.");
})();
