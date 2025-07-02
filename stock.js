// Load products from localStorage
function chargerProduits() {
  try {
    const storedProduits = localStorage.getItem("produits");
    if (storedProduits) {
      const produits = JSON.parse(storedProduits);
      if (Array.isArray(produits)) {
        return produits.map(item => ({
          nom: item.nom,
          prix: parseFloat(item.prix) || 0,
          quantite: parseInt(item.quantite) || 0
        }));
      }
    }
    return [];
  } catch (e) {
    console.error("Error loading products from localStorage:", e);
    return [];
  }
}

// Load cart items from localStorage
function chargerPanier() {
  try {
    const storedPanier = localStorage.getItem("panier");
    return storedPanier ? JSON.parse(storedPanier) : [];
  } catch (e) {
    console.error("Error loading cart from localStorage:", e);
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
    updateCartCount();
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
}

// Update cart count in the UI
function updateCartCount() {
  const panier = chargerPanier();
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.textContent = panier.reduce((acc, item) => acc + (item.quantite || 0), 0);
  }
}

// Add item to cart with specified quantity
function ajouterAuPanier(index) {
  const produits = chargerProduits();
  if (index >= 0 && index < produits.length) {
    const quantiteInput = document.getElementById(`quantite-${index}`);
    if (!quantiteInput) {
      console.error(`Quantity input with id 'quantite-${index}' not found.`);
      alert("Erreur : impossible de récupérer la quantité.");
      return;
    }

    let quantite = parseInt(quantiteInput.value);
    if (isNaN(quantite) || quantite < 1) {
      alert("Veuillez entrer une quantité valide (minimum 1).");
      quantiteInput.value = 1;
      quantite = 1;
    }

    if (quantite > produits[index].quantite) {
      alert(`Quantité insuffisante en stock. Stock disponible : ${produits[index].quantite}`);
      quantiteInput.value = produits[index].quantite;
      quantite = produits[index].quantite;
    }

    const item = {
      nom: produits[index].nom,
      prix: produits[index].prix,
      quantite: quantite
    };

    // Update stock
    produits[index].quantite -= quantite;
    if (produits[index].quantite === 0) {
      if (confirm(`Le stock de ${produits[index].nom} est épuisé. Voulez-vous supprimer ce produit ?`)) {
        produits.splice(index, 1);
      }
    }
    sauvegarderProduits(produits);

    let panier = chargerPanier();
    const existingItem = panier.find(i => i.nom === item.nom);
    if (existingItem) {
      existingItem.quantite += quantite;
    } else {
      panier.push(item);
    }

    sauvegarderPanier(panier);
    alert(`${quantite} ${item.nom}(s) ajouté(s) au panier !`);
    quantiteInput.value = 1; // Reset to 1 after adding
    afficherStock(); // Refresh table to show updated stock
  }
}

// Display stock items
function afficherStock() {
  const table = document.getElementById("tableStock");
  if (!table) {
    console.error("Element tableStock not found in DOM.");
    return;
  }

  const produits = chargerProduits();
  table.innerHTML = "";
  produits.forEach((item, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nom}</td>
        <td>${item.prix.toFixed(2)}</td>
        <td>${item.quantite}</td>
        <td><input type="number" id="quantite-${index}" min="1" value="1" max="${item.quantite}"></td>
        <td><button class="delete-btn" onclick="supprimerProduit(${index})">Supprimer</button></td>
        <td><button onclick="ajouterAuPanier(${index})">Ajouter au Panier</button></td>
      </tr>`;
  });

  if (produits.length === 0) {
    table.innerHTML = `<tr><td colspan="7">Aucun produit en stock.</td></tr>`;
  }
}

// Add new product
document.getElementById("addButton").addEventListener("click", () => {
  const nom = document.getElementById("nomProduit").value.trim();
  const prix = parseFloat(document.getElementById("prixProduit").value);
  const quantite = parseInt(document.getElementById("quantiteProduit").value);

  if (nom && !isNaN(prix) && prix >= 0 && !isNaN(quantite) && quantite >= 1) {
    const produits = chargerProduits();
    produits.push({ nom, prix, quantite });
    sauvegarderProduits(produits);
    document.getElementById("nomProduit").value = "";
    document.getElementById("prixProduit").value = "";
    document.getElementById("quantiteProduit").value = "";
    afficherStock();
    alert("Produit ajouté avec succès !");
  } else {
    alert("Veuillez entrer un nom, un prix valide (>= 0) et une quantité valide (>= 1).");
  }
});

// Delete product
function supprimerProduit(index) {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
    const produits = chargerProduits();
    produits.splice(index, 1);
    sauvegarderProduits(produits);
    afficherStock();
  }
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", () => {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const produits = chargerProduits();
  const table = document.getElementById("tableStock");
  table.innerHTML = "";

  const filteredProduits = produits.filter(product =>
    product.nom.toLowerCase().includes(searchTerm) ||
    (product.nom.match(/\d+/) && product.nom.match(/\d+/)[0].includes(searchTerm))
  );
  filteredProduits.forEach((item, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nom}</td>
        <td>${item.prix.toFixed(2)}</td>
        <td>${item.quantite}</td>
        <td><input type="number" id="quantite-${index}" min="1" value="1" max="${item.quantite}"></td>
        <td><button class="delete-btn" onclick="supprimerProduit(${index})">Supprimer</button></td>
        <td><button onclick="ajouterAuPanier(${index})">Ajouter au Panier</button></td>
      </tr>`;
  });

  if (filteredProduits.length === 0) {
    table.innerHTML = `<tr><td colspan="7">Aucun produit trouvé.</td></tr>`;
  }
});

// Save database to localStorage
function saveDatabase() {
  const produits = chargerProduits();
  sauvegarderProduits(produits);
  alert("Base de données sauvegardée !");
}

// Export database to console
function exportDatabase() {
  const produits = chargerProduits();
  console.log("Exported Database:", JSON.stringify(produits, null, 2));
  alert("Base de données exportée dans la console !");
}

// Initialize display and cart count
document.addEventListener("DOMContentLoaded", () => {
  try {
    afficherStock();
    updateCartCount();
  } catch (e) {
    console.error("Error during initial stock display:", e);
  }
});