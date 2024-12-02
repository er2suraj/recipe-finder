const API_URL = "https://www.themealdb.com/api/json/v1/1/";
let currentPage = 1;
const recipesPerPage = 6;

document.addEventListener("DOMContentLoaded", () => {
  loadFavoriteRecipes();
  loadUserRecipes();
  filterByCategory(); // Initialize with all categories
});

async function searchRecipes() {
  const query = document.getElementById("searchInput").value;
  if (query) {
    showSpinner();
    const data = await fetchRecipesByName(query);
    hideSpinner();
    if (data && data.meals) {
      displayRecipes(data.meals);
    } else {
      displayRecipes([]); // No results found
    }
  }
}

async function fetchRecipesByName(name) {
  try {
    const response = await fetch(`${API_URL}search.php?s=${name}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

async function fetchRecipesByCategory(category) {
  try {
    const response = await fetch(`${API_URL}filter.php?c=${category}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching recipes by category:", error);
  }
}

// Display fetched recipes
function displayRecipes(recipes) {
  const recipeDisplay = document.getElementById("recipeDisplay");
  recipeDisplay.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    recipeDisplay.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  const start = (currentPage - 1) * recipesPerPage;
  const paginatedRecipes = recipes.slice(start, start + recipesPerPage);

  paginatedRecipes.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <h3>${recipe.strMeal}</h3>
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
      <button onclick="viewRecipeDetails('${recipe.idMeal}')">View Details</button>
      <button onclick="saveFavoriteRecipe('${recipe.idMeal}', '${recipe.strMeal}', '${recipe.strMealThumb}')">Add to Favorites</button>
    `;

    recipeDisplay.appendChild(recipeCard);
  });

  updatePageNumber();
}

async function viewRecipeDetails(id) {
  try {
    const response = await fetch(`${API_URL}lookup.php?i=${id}`);
    const data = await response.json();
    const recipe = data.meals[0];
    showRecipeModal(recipe);
  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}

function showRecipeModal(recipe) {
  const modal = document.getElementById("recipeModal");
  const modalContent = document.getElementById("modalContent");

  // Clear previous content
  modalContent.innerHTML = "";

  // Add recipe details
  modalContent.innerHTML = `
    <h2>${recipe.strMeal}</h2>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    <h3>Ingredients</h3>
    <ul>
      ${getIngredients(recipe)
        .split("\n")
        .map(ingredient => `<li>${ingredient}</li>`)
        .join("")}
    </ul>
    <h3>Instructions</h3>
    <p>${recipe.strInstructions}</p>
    <button onclick="closeRecipeModal()">Close</button>
  `;

  // Show modal
  modal.style.display = "block";
}

function closeRecipeModal() {
  const modal = document.getElementById("recipeModal");
  modal.style.display = "none";
}


function getIngredients(recipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient) ingredients.push(`${measure} ${ingredient}`);
  }
  return ingredients.join("\n");
}

// Filter by category
async function filterByCategory() {
  const category = document.getElementById("categorySelect").value;

  if (category) {
    showSpinner();
    const data = await fetchRecipesByCategory(category);
    hideSpinner();
    if (data && data.meals) {
      displayRecipes(data.meals);
    } else {
      displayRecipes([]); // No results found for the selected category
    }
  } else {
    searchRecipes(); // Show all recipes if no category is selected
  }
}

function saveFavoriteRecipe(id, name, image) {
  const favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
  if (!favoriteRecipes.some(recipe => recipe.id === id)) {
    favoriteRecipes.push({ id, name, image });
    localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
    loadFavoriteRecipes();
  } else {
    alert("Recipe already in favorites.");
  }
}

function removeFavoriteRecipe(id) {
  const favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
  const updatedFavorites = favoriteRecipes.filter(recipe => recipe.id !== id);
  localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
  loadFavoriteRecipes();
}

function loadFavoriteRecipes() {
  const favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
  const favoriteDisplay = document.getElementById("favoriteRecipes");
  favoriteDisplay.innerHTML = "";

  favoriteRecipes.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <h3>${recipe.name}</h3>
      <img src="${recipe.image}" alt="${recipe.name}">
      <button onclick="viewRecipeDetails('${recipe.id}')">View Details</button>
      <button onclick="removeFavoriteRecipe('${recipe.id}')">Remove from Favorites</button>
    `;

    favoriteDisplay.appendChild(recipeCard);
  });
}

function showSpinner() {
  document.getElementById("spinner").style.display = "block";
}

function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
}

function nextPage() {
  currentPage++;
  filterByCategory(); // Ensure pagination respects the selected category
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    filterByCategory(); // Ensure pagination respects the selected category
  }
}

function updatePageNumber() {
  document.getElementById("pageNumber").innerText = `Page ${currentPage}`;
}
