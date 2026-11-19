// On récupère les éléments de la page dont on a besoin
const formulaire = document.getElementById("formulaire-favori");
const champUrl = document.getElementById("champ-url");
const champTitre = document.getElementById("champ-titre");
const champCategorie = document.getElementById("champ-categorie");
const listeFavoris = document.getElementById("liste-favoris");

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

// Fonction qui range les favoris par catégorie.
// Elle renvoie un objet du type :
// { "Travail": [favori1, favori2], "Loisirs": [favori3] }
function grouperParCategorie() {
  const groupes = {};

  favoris.forEach(function (favori) {
    const nom = favori.categorie;

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

  const groupes = grouperParCategorie();

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
    titre.textContent = nom; // textContent évite d'injecter du HTML

    // La liste des favoris de cette catégorie
    const liste = document.createElement("ul");

    groupes[nom].forEach(function (favori) {
      const element = document.createElement("li");

      // Le lien cliquable vers le site
      const lien = document.createElement("a");
      lien.href = favori.url;
      lien.textContent = favori.titre;
      lien.target = "_blank"; // ouvre le lien dans un nouvel onglet
      lien.rel = "noopener noreferrer"; // sécurité pour les nouveaux onglets

      element.appendChild(lien);
      liste.appendChild(element);
    });

    // On assemble : titre + liste dans la section, puis la section dans la page
    section.appendChild(titre);
    section.appendChild(liste);
    listeFavoris.appendChild(section);
  });
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

// Au chargement de la page, on affiche les favoris déjà enregistrés
afficherFavoris();
