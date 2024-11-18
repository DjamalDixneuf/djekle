console.log('Application chargée');
// Fonction pour afficher l'onglet actif et masquer les autres
function showTab(tabId) {
  // Récupérer tous les contenus d'onglets et les boutons d'onglets
  const tabContents = document.querySelectorAll('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-button');

  // Masquer tous les contenus d'onglets et retirer la classe 'active' de tous les boutons
  tabContents.forEach(content => content.classList.remove('active'));
  tabButtons.forEach(button => button.classList.remove('active'));

  // Afficher le contenu de l'onglet actif et ajouter la classe 'active' au bouton correspondant
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Fonction pour gérer la soumission du formulaire de connexion
function handleLogin(event) {
  event.preventDefault(); // Empêcher le rechargement de la page
  const username = document.getElementById('username-login').value;
  const password = document.getElementById('password-login').value;

  // Vérifier les identifiants
  if (username === 'djamalax19' && password === 'Haxer2009?') {
    // Redirection vers la page admin-dashboard.html
    window.location.href = 'admin-dashboard.html';
  } else 
  // Vérifier les identifiants
  if (username === 'jekle19' && password === 'jekle?') {
    // Redirection vers la page admin-dashboard.html
    window.location.href = 'user page.html';
  } else
  {
    // Afficher un message d'erreur si les identifiants sont incorrects
    alert('Identifiants incorrects. Veuillez réessayer.');
  }
}

// Fonction pour gérer la soumission du formulaire d'inscription
async function handleSignup(event) {
  event.preventDefault(); // Empêcher le rechargement de la page
  const username = document.getElementById('username-signup').value;
  const password = document.getElementById('password-signup').value;
  const subscription = document.getElementById('subscription').value;
  const payment = document.getElementById('payment').value;

  // Afficher les informations dans la console pour débogage
  console.log('Inscription avec:', username, password, subscription, payment);

  // Gestion de l'abonnement et redirection vers la page de confirmation
  setLoading(true);

  // Récupère les détails d'abonnement sélectionnés
  let price = subscription === "1 mois" ? "4.000" : "15.000";

  // Redirige vers la page de confirmation de paiement avec les paramètres d'abonnement
  window.location.href = `payment.html?subscription=${encodeURIComponent(subscription)}&price=${encodeURIComponent(price)}`;
  setLoading(false);

  alert('Compte créé avec succès'); // Message de confirmation (à personnaliser selon la logique d'inscription)
}

// Définir la fonction `setLoading` pour gérer l'affichage du chargement
function setLoading(isLoading) {
  const loadingSpinner = document.getElementById("loading-spinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = isLoading ? "block" : "none";
  }
}