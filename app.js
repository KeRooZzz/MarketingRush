let questionsData = [];

// Charger le JSON au démarrage
fetch("questions.json")
   .then(response => response.json())
   .then(data => {
      questionsData = data;
   });

document.getElementById("searchButton").addEventListener("click", () => {
   const num = parseInt(document.getElementById("inputNumber").value);
   const output = document.getElementById("outputQuestion");

   const found = questionsData.find(q => q.id === num);

   if (found) {
      output.textContent = found.question;
   } else {
      output.textContent = "Aucune question ne correspond à ce numéro.";
   }
});