// Load cart items from localStorage with validation
function chargerPanier() {
  try {
    const storedPanier = localStorage.getItem("panier");
    if (storedPanier) {
      const panier = JSON.parse(storedPanier);
      if (Array.isArray(panier)) {
        // Remove duplicates based on product name
        const uniquePanier = [];
        panier.forEach(item => {
          const existingItem = uniquePanier.find(i => i.nom === item.nom);
          if (existingItem) {
            existingItem.quantite += item.quantite; // Merge quantities
          } else {
            uniquePanier.push({ ...item });
          }
        });
        return uniquePanier;
      }
    }
    return [];
  } catch (e) {
    console.error("Error loading cart from localStorage:", e);
    return [];
  }
}

// Load products from localStorage for stock management
function chargerProduits() {
  try {
    const storedProduits = localStorage.getItem("produits");
    if (storedProduits) {
      const produits = JSON.parse(storedProduits);
      if (Array.isArray(produits)) {
        return produits;
      }
    }
    return [];
  } catch (e) {
    console.error("Error loading products from localStorage:", e);
    return [];
  }
}

// Save products to localStorage
function sauvegarderProduits(produits) {
  try {
    localStorage.setItem("produits", JSON.stringify(produits));
  } catch (e) {
    console.error("Error saving products to localStorage:", e);
  }
}

// Save cart to localStorage
function sauvegarderPanier(panier) {
  try {
    localStorage.setItem("panier", JSON.stringify(panier));
    afficherPanier();
    calculerTotalPanier();
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
}

// Display cart items
function afficherPanier() {
  const table = document.getElementById("tableCart");
  if (!table) {
    console.error("Element tableCart not found in DOM.");
    return;
  }

  const panier = chargerPanier();
  table.innerHTML = "";
  panier.forEach((item, index) => {
    const totalItem = (item.prix * item.quantite).toFixed(2);
    table.innerHTML += `
      <tr>
        <td>${item.nom}</td>
        <td>${item.prix.toFixed(2)}</td>
        <td>${item.quantite}</td>
        <td>${totalItem}</td>
        <td>
          <button class="edit-btn" onclick="editItem(${index})">Modifier</button>
          <button class="delete-btn" onclick="supprimerDuPanier(${index})">Supprimer</button>
        </td>
      </tr>`;
  });

  if (panier.length === 0) {
    table.innerHTML = `<tr><td colspan="5">Le panier est vide.</td></tr>`;
  }
}

// Calculate and display total cart value
function calculerTotalPanier() {
  const panier = chargerPanier();
  const total = panier.reduce((acc, item) => acc + (item.prix * item.quantite), 0).toFixed(2);
  document.getElementById("cartTotal").textContent = total;
}

// Edit quantity and price of an item in the cart with prompts
function editItem(index) {
  const panier = chargerPanier();
  const currentQuantity = panier[index].quantite;
  const currentPrice = panier[index].prix;

  // Prompt for new quantity
  let newQuantity = prompt(`Entrez la nouvelle quantité pour ${panier[index].nom} (actuel : ${currentQuantity}) :`, currentQuantity);
  newQuantity = parseInt(newQuantity);

  // Validate quantity
  if (isNaN(newQuantity) || newQuantity < 1) {
    alert("Veuillez entrer une quantité valide (minimum 1).");
    return;
  }

  // Prompt for new price
  let newPrice = prompt(`Entrez le nouveau prix unitaire pour ${panier[index].nom} (actuel : ${currentPrice.toFixed(2)} DH) :`, currentPrice.toFixed(2));
  newPrice = parseFloat(newPrice);

  // Validate price
  if (isNaN(newPrice) || newPrice < 0) {
    alert("Veuillez entrer un prix valide (minimum 0).");
    return;
  }

  // Confirm changes
  const confirmMessage = `Voulez-vous modifier ${panier[index].nom} ? Quantité : ${currentQuantity} → ${newQuantity}, Prix : ${currentPrice.toFixed(2)} → ${newPrice.toFixed(2)} DH`;
  if (confirm(confirmMessage)) {
    panier[index].quantite = newQuantity;
    panier[index].prix = newPrice;
    sauvegarderPanier(panier);
    alert("Modification effectuée avec succès !");
  }
}

// Remove an item from the cart
function supprimerDuPanier(index) {
  const panier = chargerPanier();
  if (index >= 0 && index < panier.length) {
    panier.splice(index, 1);
    sauvegarderPanier(panier);
  }
}

// Clear the entire cart
function viderPanier() {
  if (confirm("Êtes-vous sûr de vouloir vider le panier ?")) {
    localStorage.removeItem("panier");
    afficherPanier();
    calculerTotalPanier();
    alert("Panier vidé ! Redirection vers la page principale...");
    setTimeout(() => {
      window.location.href = "stock.html";
    }, 1000);
  }
}

// Get and increment invoice number
function getNextInvoiceNumber() {
  let invoiceNumber = parseInt(localStorage.getItem("invoiceNumber")) || 0;
  invoiceNumber += 1;
  localStorage.setItem("invoiceNumber", invoiceNumber.toString());
  return invoiceNumber.toString().padStart(9, "0"); // e.g., "000000001", "000000002"
}

// Generate and display invoice
function genererFacture(paymentMethod) {
  const panier = chargerPanier();
  const invoiceItems = document.getElementById("invoiceItems");
  const invoiceTotal = document.getElementById("invoiceTotal");
  const invoiceDate = document.getElementById("invoiceDate");
  const invoiceNumber = document.getElementById("invoiceNumber");
  const paymentMethodDisplay = document.getElementById("paymentMethodDisplay");
  const clientName = document.getElementById("clientName");

  if (panier.length === 0) {
    alert("Le panier est vide. Ajoutez des produits avant de générer une facture.");
    return;
  }

  // Set current date and time
  invoiceDate.textContent = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca"
  });

  // Set invoice number
  invoiceNumber.textContent = getNextInvoiceNumber();

  // Set client name (optional, left blank)
  clientName.textContent = "Client"; // Can be changed to a text input if needed

  // Populate invoice items
  invoiceItems.innerHTML = "";
  panier.forEach(item => {
    const totalItem = (item.prix * item.quantite).toFixed(2);
    invoiceItems.innerHTML += `
      <tr>
        <td>${item.nom}</td>
        <td>${item.quantite} U</td>
        <td>${item.prix.toFixed(2)} DH</td>
        <td>${totalItem} DH</td>
      </tr>`;
  });

  // Calculate total
  const total = panier.reduce((acc, item) => acc + (item.prix * item.quantite), 0).toFixed(2);
  invoiceTotal.textContent = `${total} DH`;

  // Set payment method
  paymentMethodDisplay.textContent = paymentMethod === "cash" ? "Espèces" : "TPE";

  // Show invoice and trigger print
  document.getElementById("invoice").style.display = "block";
  window.print();
  document.getElementById("invoice").style.display = "none"; // Hide after printing
}

// Finalize the sale, update stock, generate invoice, and redirect
function finaliserCommande() {
  const panier = chargerPanier();
  if (panier.length > 0) {
    if (confirm("Voulez-vous finaliser la commande et imprimer la facture ?")) {
      // Get selected payment method
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

      // Load and update stock
      let produits = chargerProduits();
      panier.forEach(cartItem => {
        const stockItem = produits.find(p => p.nom === cartItem.nom);
        if (stockItem) {
          stockItem.quantite = Math.max(0, stockItem.quantite - cartItem.quantite);
          console.log(`Updated stock for ${cartItem.nom}: ${stockItem.quantite} remaining`);
          if (stockItem.quantite === 0) {
            if (confirm(`La quantité de ${cartItem.nom} est à zéro. Voulez-vous supprimer ce produit du stock ?`)) {
              produits = produits.filter(p => p.nom !== cartItem.nom);
            }
          }
        }
      });
      sauvegarderProduits(produits); // Save updated stock

      genererFacture(paymentMethod);
      localStorage.removeItem("panier"); // Clear cart after invoice
      afficherPanier();
      calculerTotalPanier();
      alert("Commande finalisée et facture imprimée ! Redirection vers la page principale...");
      setTimeout(() => {
        window.location.href = "stock.html";
      }, 1000);
    }
  } else {
    alert("Le panier est vide. Ajoutez des produits avant de finaliser.");
    setTimeout(() => {
      window.location.href = "stock.html";
    }, 1000);
  }
}

// Initialize event listeners and display after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const panier = chargerPanier();
  if (panier.length === 0) {
    alert("Le panier est vide. Redirection vers la page principale...");
    setTimeout(() => {
      window.location.href = "stock.html";
    }, 1000);
    return;
  }

  document.getElementById("clearCartButton").addEventListener("click", viderPanier);
  document.getElementById("checkoutButton").addEventListener("click", finaliserCommande);

  try {
    afficherPanier();
    calculerTotalPanier();
  } catch (e) {
    console.error("Error during initial cart display:", e);
    localStorage.removeItem("panier");
    afficherPanier();
    calculerTotalPanier();
  }
});