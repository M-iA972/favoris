// On récupère les éléments de la page dont on a besoin
const formulaire = document.getElementById("formulaire-favori");
const champUrl = document.getElementById("champ-url");
const champTitre = document.getElementById("champ-titre");
const champCategorie = document.getElementById("champ-categorie");
const listeFavoris = document.getElementById("liste-favoris");
const champRecherche = document.getElementById("champ-recherche");

// Favori en cours de modification (null = aucun)
let favoriEnEdition = null;

// Nom de la "clé" sous laquelle on range les favoris dans localStorage
const CLE_STOCKAGE = "favoris";

// Fonction qui lit les favoris enregistrés dans localStorage
function chargerFavoris() {
  // localStorage ne stocke que du texte : on récupère donc une chaîne
  const texte = localStorage.getItem(CLE_STOCKAGE);

  // Si rien n'a encore été enregistré, on part d'une liste vide
  if (texte === null) {
    return [];
  }

  // On transforme le texte (format JSON) en vrai tableau JavaScript.
  // try/catch : si le texte est abîmé, on évite que la page plante.
  try {
    const donnees = JSON.parse(texte);
    return Array.isArray(donnees) ? donnees : [];
  } catch (erreur) {
    return [];
  }
}

// Fonction qui enregistre le tableau des favoris dans localStorage
function sauvegarderFavoris() {
  // JSON.stringify transforme le tableau en texte pour pouvoir le stocker
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(favoris));
}

// Tableau qui contient tous les favoris, rempli au démarrage depuis localStorage
const favoris = chargerFavoris();

// Fonction qui garde seulement les favoris correspondant à la recherche.
// On compare en minuscules pour que "GitHub" et "github" soient trouvés pareil.
function filtrerFavoris(recherche) {
  const texte = recherche.trim().toLowerCase();

  // Si le champ est vide, on garde tous les favoris
  if (texte === "") {
    return favoris;
  }

  // filter() crée un nouveau tableau avec les favoris qui passent le test
  return favoris.filter(function (favori) {
    return (
      favori.titre.toLowerCase().includes(texte) ||
      favori.url.toLowerCase().includes(texte) ||
      favori.categorie.toLowerCase().includes(texte)
    );
  });
}

// Fonction qui range une liste de favoris par catégorie.
// Les majuscules ne comptent pas : "Tech" et "tech" vont dans le même groupe.
// Elle renvoie un objet du type :
// { "travail": [favori1, favori2], "loisirs": [favori3] }
// (les clés sont en minuscules, mais chaque favori garde son écriture d'origine)
function grouperParCategorie(liste) {
  const groupes = {};

  liste.forEach(function (favori) {
    // On met le nom en minuscules pour qu'il serve de "clé" de regroupement
    const nom = favori.categorie.toLowerCase();

    // Si c'est la première fois qu'on voit cette catégorie,
    // on lui crée une liste vide
    if (groupes[nom] === undefined) {
      groupes[nom] = [];
    }

    // On ajoute le favori dans la liste de sa catégorie
    groupes[nom].push(favori);
  });

  return groupes;
}

// Fonction qui affiche tous les favoris, groupés par catégorie
function afficherFavoris() {
  // On vide la zone avant de la remplir à nouveau
  listeFavoris.innerHTML = "";

  // On filtre d'abord selon la recherche, puis on groupe le résultat
  const favorisFiltres = filtrerFavoris(champRecherche.value);

  // Si rien ne correspond, on affiche un petit message et on s'arrête là
  if (favorisFiltres.length === 0) {
    const message = document.createElement("p");
    message.className = "message-vide";
    message.textContent = favoris.length === 0
      ? "Aucun favori pour le moment."
      : "Aucun favori ne correspond à votre recherche.";
    listeFavoris.appendChild(message);
    return;
  }

  const groupes = grouperParCategorie(favorisFiltres);

  // On récupère les noms des catégories et on les trie par ordre alphabétique
  // (localeCompare gère correctement les accents du français)
  const nomsCategories = Object.keys(groupes).sort(function (a, b) {
    return a.localeCompare(b, "fr");
  });

  // Pour chaque catégorie, on crée un bloc : un titre + une liste
  nomsCategories.forEach(function (nom) {
    const section = document.createElement("section");
    section.className = "groupe-categorie";

    // Le titre de la catégorie
    const titre = document.createElement("h3");
    // La clé est en minuscules : pour le titre, on reprend l'écriture
    // du premier favori du groupe (par exemple "Tech" plutôt que "tech")
    titre.textContent = groupes[nom][0].categorie; // textContent évite d'injecter du HTML

    // La liste des favoris de cette catégorie
    const liste = document.createElement("ul");

    groupes[nom].forEach(function (favori) {
      const element = document.createElement("li");

      // Si ce favori est en cours de modification, on affiche le formulaire ;
      // sinon, on affiche le lien et les boutons
      if (favori === favoriEnEdition) {
        element.appendChild(creerFormulaireEdition(favori));
      } else {
        remplirFavoriNormal(element, favori);
      }

      liste.appendChild(element);
    });

    // On assemble : titre + liste dans la section, puis la section dans la page
    section.appendChild(titre);
    section.appendChild(liste);
    listeFavoris.appendChild(section);
  });
}

// Remplit un <li> avec l'affichage normal d'un favori : lien + boutons
function remplirFavoriNormal(element, favori) {
  // Le lien cliquable vers le site
  const lien = document.createElement("a");
  lien.href = favori.url;
  lien.textContent = favori.titre; // textContent évite d'injecter du HTML
  lien.target = "_blank"; // ouvre le lien dans un nouvel onglet
  lien.rel = "noopener noreferrer"; // sécurité pour les nouveaux onglets

  // Un petit conteneur pour garder les deux boutons côte à côte
  const actions = document.createElement("div");
  actions.className = "actions";

  // Le bouton pour modifier ce favori
  const boutonModifier = document.createElement("button");
  boutonModifier.type = "button";
  boutonModifier.className = "bouton-modifier";
  boutonModifier.textContent = "Modifier";
  boutonModifier.addEventListener("click", function () {
    // On retient quel favori on modifie, puis on redessine la liste
    favoriEnEdition = favori;
    afficherFavoris();
  });

  // Le bouton pour supprimer ce favori
  const boutonSupprimer = document.createElement("button");
  boutonSupprimer.type = "button";
  boutonSupprimer.className = "bouton-supprimer";
  boutonSupprimer.textContent = "Supprimer";
  boutonSupprimer.addEventListener("click", function () {
    supprimerFavori(favori);
  });

  actions.appendChild(boutonModifier);
  actions.appendChild(boutonSupprimer);
  element.appendChild(lien);
  element.appendChild(actions);
}

// Crée un petit champ de saisie avec son label, pré-rempli avec une valeur
function creerChamp(texteLabel, type, valeur) {
  const label = document.createElement("label");
  label.textContent = texteLabel;

  const champ = document.createElement("input");
  champ.type = type;
  champ.value = valeur;
  champ.required = true; // le champ ne peut pas rester vide

  // Mettre le champ DANS le label les relie sans avoir besoin d'un id
  label.appendChild(champ);
  return { label: label, champ: champ };
}

// Crée le formulaire de modification d'un favori, pré-rempli
function creerFormulaireEdition(favori) {
  const form = document.createElement("form");
  form.className = "formulaire-edition";

  const titre = creerChamp("Titre", "text", favori.titre);
  const url = creerChamp("URL", "url", favori.url);
  const categorie = creerChamp("Catégorie", "text", favori.categorie);

  // Bouton pour enregistrer les modifications
  const boutonEnregistrer = document.createElement("button");
  boutonEnregistrer.type = "submit";
  boutonEnregistrer.textContent = "Enregistrer";

  // Bouton pour annuler : on quitte le mode modification sans rien changer
  const boutonAnnuler = document.createElement("button");
  boutonAnnuler.type = "button";
  boutonAnnuler.className = "bouton-annuler";
  boutonAnnuler.textContent = "Annuler";
  boutonAnnuler.addEventListener("click", function () {
    favoriEnEdition = null;
    afficherFavoris();
  });

  const actions = document.createElement("div");
  actions.className = "actions";
  actions.appendChild(boutonEnregistrer);
  actions.appendChild(boutonAnnuler);

  form.appendChild(titre.label);
  form.appendChild(url.label);
  form.appendChild(categorie.label);
  form.appendChild(actions);

  // Quand on clique sur "Enregistrer" (ou qu'on appuie sur Entrée)...
  form.addEventListener("submit", function (evenement) {
    evenement.preventDefault(); // pas de rechargement de la page

    // ...on met à jour l'objet favori directement avec les nouvelles valeurs
    favori.titre = titre.champ.value.trim();
    favori.url = url.champ.value.trim();
    favori.categorie = categorie.champ.value.trim();

    // On sauvegarde, on quitte le mode modification et on redessine
    sauvegarderFavoris();
    favoriEnEdition = null;
    afficherFavoris();
  });

  return form;
}

// Quand on valide le formulaire...
formulaire.addEventListener("submit", function (evenement) {
  // ...on empêche le rechargement de la page (comportement par défaut)
  evenement.preventDefault();

  // On crée un objet favori avec les valeurs saisies (trim enlève les espaces autour)
  const nouveauFavori = {
    url: champUrl.value.trim(),
    titre: champTitre.value.trim(),
    categorie: champCategorie.value.trim(),
  };

  // On l'ajoute au tableau, on sauvegarde, puis on met à jour l'affichage
  favoris.push(nouveauFavori);
  sauvegarderFavoris();
  afficherFavoris();

  // On vide le formulaire et on replace le curseur dans le champ URL
  formulaire.reset();
  champUrl.focus();
});

// Fonction qui supprime un favori, après confirmation
function supprimerFavori(favori) {
  // confirm() ouvre une petite fenêtre "OK / Annuler" : évite les clics par erreur
  const ok = confirm('Supprimer le favori "' + favori.titre + '" ?');
  if (!ok) {
    return;
  }

  // On cherche la position du favori dans le tableau...
  const position = favoris.indexOf(favori);

  // ...et on le retire (splice enlève 1 élément à cette position)
  if (position !== -1) {
    favoris.splice(position, 1);
    sauvegarderFavoris();
    afficherFavoris();
  }
}

// À chaque frappe dans le champ de recherche, on réaffiche la liste filtrée.
// L'événement "input" se déclenche à chaque caractère tapé ou effacé.
champRecherche.addEventListener("input", afficherFavoris);

// Au chargement de la page, on affiche les favoris déjà enregistrés
afficherFavoris();
