let questions = [];
let score = 0;                     // nombre de clients actuels
let answeredQuestions = new Set(); // IDs déjà joués (empêche double-score / double-penalty)
const MAX_CLIENTS = 20;            // atteindre 20 = victoire

// Charger les questions depuis questions.json (à la racine)
fetch("questions.json")
   .then(res => res.json())
   .then(data => {
      questions = data;
   })
   .catch(err => {
      console.error("Impossible de charger questions.json :", err);
   });

// Met à jour l'affichage du score au chargement
updateScoreDisplay();

document.getElementById("searchButton").addEventListener("click", () => {
   // Si déjà gagné, plus possible de jouer
   if (score >= MAX_CLIENTS) return;

   const id = parseInt(document.getElementById("inputNumber").value);
   const question = questions.find(q => q.id === id);

   const questionText = document.getElementById("questionText");
   const answersContainer = document.getElementById("answersContainer");
   const feedback = document.getElementById("feedback");

   // Reset affichage
   answersContainer.innerHTML = "";
   feedback.textContent = "";
   document.getElementById("winMessage").textContent = "";

   if (!question) {
      questionText.textContent = "Aucune question trouvée.";
      return;
   }

   // Affiche la question
   questionText.textContent = question.question;

   // Si la question a déjà été jouée, on prévient et on bloque les clics
   if (answeredQuestions.has(question.id)) {
      feedback.textContent = "Cette carte a déjà été jouée.";
      feedback.style.color = "#f0ad4e";
      return;
   }

  // Génère les réponses
   question.answers.forEach((answer, index) => {
      const btn = document.createElement("button");
      btn.textContent = answer;
      btn.classList.add("answer-btn");

      btn.addEventListener("click", () => {
      // Si déjà répondu sur cette carte, bloquer (sécurité double clic)
      if (answeredQuestions.has(question.id)) return;

      resetButtonsStyles();
      feedback.textContent = "";

      // ---------- CAS : bonne réponse ----------
      if (index === question.correct) {
         btn.classList.add("correct");
         feedback.textContent = "✔️ Bonne réponse !";
         feedback.style.color = "#8EF757";

         // Marquer la question comme jouée pour éviter double gain/penalité
         answeredQuestions.add(question.id);

         // Si c'est une carte marketing (19-36) => gain aléatoire 3-5 clients
         if (question.id >= 19 && question.id <= 36) {
            const gain = randInt(3, 5);
            addClients(gain);
         } else {
          // Carte problème (1-18) : bonne réponse du premier coup => aucune perte (rien à faire)
         }

         // Reset pour nouvelle question après animation affichage
         etTimeout(() => {
            questionText.textContent = "";
            answersContainer.innerHTML = "";
            feedback.textContent = "";
            document.getElementById("inputNumber").value = "";
         }, 2400);

         return;
      }

      // ---------- CAS : mauvaise réponse ----------
      btn.classList.add("wrong");
      feedback.textContent = "❌ Mauvaise réponse.";
      feedback.style.color = "red";

      // Comportement différent selon le type de carte
      if (question.id >= 1 && question.id <= 18) {
         // Carte PROBLÈME : si mauvaise réponse -> perte aléatoire 1-2 clients (une seule fois)
         const penalty = randInt(1, 2);
         // Appliquer pénalité (mais ne pas descendre en dessous de 0)
         removeClients(penalty);
         // marquer comme jouée pour éviter de perdre plusieurs fois sur la même carte
         answeredQuestions.add(question.id);

         // Après pénalité, on reset la page (l'utilisateur devra entrer un nouveau numéro)
         setTimeout(() => {
            questionText.textContent = "";
            answersContainer.innerHTML = "";
            feedback.textContent = "";
            document.getElementById("inputNumber").value = "";
         }, 2400);
      } else {
        // Carte MARKETING (19-36) : mauvaise réponse -> pas de pénalité, l'utilisateur peut réessayer
        // (on ne marque pas answeredQuestions afin qu'il puisse retenter)
      }
      });

      answersContainer.appendChild(btn);
   });

   // fonction utilitaire locale
   function resetButtonsStyles() {
      document.querySelectorAll(".answer-btn").forEach(b => {
         b.classList.remove("correct", "wrong");
      });
   }
});

// ---------- Gestion des clients (score) ----------
function addClients(n) {
   if (score >= MAX_CLIENTS) return;
   score += n;
   if (score > MAX_CLIENTS) score = MAX_CLIENTS;
   updateScoreDisplay();

   if (score >= MAX_CLIENTS) {
      // victoire
      document.getElementById("winMessage").textContent = "🎉 Bravo ! Tu as gagné ! 🎉";
      triggerConfetti(); // confettis uniquement à 20/20
   }
}

function removeClients(n) {
   score -= n;
   if (score < 0) score = 0;
   updateScoreDisplay();
   // pas de confetti quand on perd
}

// Met à jour l'affichage du score
function updateScoreDisplay() {
   document.getElementById("scoreDisplay").textContent = `Clients : ${score} / ${MAX_CLIENTS}`;
}

// petit utilitaire : entier aléatoire inclusif [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* === Confetti simple (identique à ta version) === */
function triggerConfetti() {
   const canvas = document.getElementById("confettiCanvas");
   if (!canvas) return;
   const ctx = canvas.getContext("2d");
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   const confettis = [];
   const colors = ["#f94144","#f3722c","#f8961e","#f9c74f","#90be6d","#43aa8b","#577590"];

   for (let i = 0; i < 150; i++) {
      confettis.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 20 + 10,
      color: colors[Math.floor(Math.random()*colors.length)],
      tilt: Math.random() * 10 - 10
      });
   }

   let angle = 0;
   function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      confettis.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(c.x + c.tilt, c.y);
      ctx.lineTo(c.x + c.tilt + c.r/2, c.y + c.r);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = c.r/2;
      ctx.stroke();

      c.y += 2 + c.d/10;
      c.tilt += Math.sin(angle) * 0.5;

      if (c.y > canvas.height) {
         c.y = -10;
         c.x = Math.random() * canvas.width;
      }
      });
      angle += 0.05;
      requestAnimationFrame(draw);
   }

   draw();
   setTimeout(() => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
   }, 4000);
}