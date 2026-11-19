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

// Fonction qui affiche tous les favoris dans la liste
function afficherFavoris() {
  // On vide la liste avant de la remplir à nouveau
  listeFavoris.innerHTML = "";

  // Pour chaque favori, on crée un élément <li>
  favoris.forEach(function (favori) {
    const element = document.createElement("li");

    // Le lien cliquable vers le site
    const lien = document.createElement("a");
    lien.href = favori.url;
    lien.textContent = favori.titre; // textContent évite d'injecter du HTML
    lien.target = "_blank"; // ouvre le lien dans un nouvel onglet
    lien.rel = "noopener noreferrer"; // sécurité pour les nouveaux onglets

    // L'étiquette de catégorie
    const categorie = document.createElement("span");
    categorie.className = "categorie";
    categorie.textContent = favori.categorie;

    // On assemble le tout
    element.appendChild(lien);
    element.appendChild(categorie);
    listeFavoris.appendChild(element);
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
