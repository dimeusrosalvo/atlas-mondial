// Projet Atlas Mondial fini avec succès !
// ===== Sélection des éléments du DOM =====
const form = document.getElementById('search-form');
const input = document.getElementById('country-input');
const errorMessage = document.getElementById('country-error');

const loader = document.getElementById('loader');
const messageBox = document.getElementById('message-box');
const card = document.getElementById('country-card');

const flagEl = document.getElementById('country-flag');
const nameEl = document.getElementById('country-name');
const capitalEl = document.getElementById('country-capital');
const populationEl = document.getElementById('country-population');
const regionEl = document.getElementById('country-region');
const currencyEl = document.getElementById('country-currency');
const languagesEl = document.getElementById('country-languages');

// Cle API v5 — remplacer 'VOTRE_CLE_API_ICI'
const API_KEY = 'rc_live_912e5296051c4f50b97134a628a0cbcb';
const API_URL = 'https://api.restcountries.com/countries/v5';

// ===== Réinitialiser l'état d'erreur du champ =====
function clearInputError() {
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  errorMessage.textContent = '';
}

// ===== Afficher une erreur de validation sur le champ =====
function setInputError(message) {
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', 'country-error');
  errorMessage.textContent = message;
}

// Dès que l'utilisateur corrige sa saisie, on réinitialise l'erreur
input.addEventListener('input', () => {
  if (input.value.trim() !== '') {
    clearInputError();
  }
});

// ===== Utilitaires d'affichage =====
function showLoader() {
  loader.style.display = 'flex';
  messageBox.hidden = true;
  card.hidden = true;
}

function hideLoader() {
  loader.style.display = 'none';
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.hidden = false;
  card.hidden = true;
}

function hideMessage() {
  messageBox.hidden = true;
  messageBox.textContent = '';
}

// ===== Formater la population avec des espaces (ex: 11 402 533) =====
function formatPopulation(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ===== Extraire et formater les devises (format v5 : tableau d'objets) =====
function formatCurrencies(currencies) {
  if (!currencies || currencies.length === 0) return 'Non disponible';
  return currencies
    .map(function (c) {
      return c.symbol ? c.name + ' (' + c.symbol + ')' : c.name;
    })
    .join(', ');
}

// ===== Extraire et formater les langues (format v5 : tableau d'objets) =====
function formatLanguages(languages) {
  if (!languages || languages.length === 0) return 'Non disponible';
  return languages.map((l) => l.name).join(', ');
}

// ===== Afficher les données du pays dans la carte (structure v5) =====
function displayCountry(country) {
  flagEl.src = country.flag && country.flag.url_svg ? country.flag.url_svg : '';
  flagEl.alt = 'Drapeau de ' + country.names.common;

  // Utilisation exclusive de textContent pour éviter toute faille XSS
  nameEl.textContent = country.names.common;
  capitalEl.textContent =
    country.capitals && country.capitals.length > 0
      ? country.capitals[0].name
      : 'Non disponible';
  populationEl.textContent = formatPopulation(country.population);
  regionEl.textContent = country.region;
  currencyEl.textContent = formatCurrencies(country.currencies);
  languagesEl.textContent = formatLanguages(country.languages);

  card.hidden = false;
  hideMessage();
  hideLoader();
}

// ===== Gestion de la soumission du formulaire =====
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const countryName = input.value.trim();

  // Validation d'accessibilité : champ vide
  if (countryName === '') {
    setInputError('Veuillez entrer le nom d\'un pays avant de lancer la recherche.');
    input.focus();
    return;
  }

  clearInputError();
  showLoader();

  try {
    const response = await fetch(
      API_URL + '?q=' + encodeURIComponent(countryName) + '&limit=1',
      {
        headers: {
          Authorization: 'Bearer ' + API_KEY,
        },
      }
    );

    if (!response.ok) {
      hideLoader();
      showMessage('Aucun résultat trouvé pour cette recherche. Veuillez vérifier l\'orthographe.');
      return;
    }

    const data = await response.json();

    // La v5 retourne les résultats dans data.objects (tableau)
    const results = data && data.data && Array.isArray(data.data.objects)
      ? data.data.objects
      : [];

    if (results.length === 0) {
      hideLoader();
      showMessage('Aucun résultat trouvé pour cette recherche. Veuillez vérifier l\'orthographe.');
      return;
    }

    hideLoader();
    displayCountry(results[0]);
  } catch (error) {
    hideLoader();
    showMessage('Connexion impossible. Veuillez vérifier votre accès à internet.');
  }
});