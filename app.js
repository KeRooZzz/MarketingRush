let questions = [];
let score = 0;
let answeredQuestions = new Set(); 
const MAX_SCORE = 20;

fetch("questions.json")
   .then(res => res.json())
   .then(data => {
      questions = data;
   });

// Score initial
updateScoreDisplay();

document.getElementById("searchButton").addEventListener("click", () => {
   // Si gagné → plus possible de jouer
   if (score >= MAX_SCORE) return;

   const id = parseInt(document.getElementById("inputNumber").value);
   const question = questions.find(q => q.id === id);

   const questionText = document.getElementById("questionText");
   const answersContainer = document.getElementById("answersContainer");
   const feedback = document.getElementById("feedback");

   answersContainer.innerHTML = "";
   feedback.textContent = "";
   document.getElementById("winMessage").textContent = "";

   if (!question) {
      questionText.textContent = "Aucune question trouvée.";
      return;
   }

   questionText.textContent = question.question;

   question.answers.forEach((answer, index) => {
      const btn = document.createElement("button");
      btn.textContent = answer;
      btn.classList.add("answer-btn");

      btn.addEventListener("click", () => {
         if (answeredQuestions.has(question.id)) return;

         resetButtonsStyles();
         feedback.textContent = "";

         if (index === question.correct) {
            btn.classList.add("correct");
            feedback.textContent = "✔️ Bonne réponse !";
            feedback.style.color = "#50b886";

            answeredQuestions.add(question.id);
            incrementScore();

            // Reset pour nouvelle question
            setTimeout(() => {
               questionText.textContent = "";
               answersContainer.innerHTML = "";
               feedback.textContent = "";
               document.getElementById("inputNumber").value = "";
            }, 2400);

         } else {
            btn.classList.add("wrong");
            feedback.textContent = "❌ Mauvaise réponse.";
            feedback.style.color = "red";
         }
      });

      answersContainer.appendChild(btn);
   });

   function resetButtonsStyles() {
      document.querySelectorAll(".answer-btn").forEach(btn => {
         btn.classList.remove("correct", "wrong");
      });
   }
});

function incrementScore() {
   if (score < MAX_SCORE) {
      score += 4;
      if (score > MAX_SCORE) score = MAX_SCORE;
   }
   updateScoreDisplay();

   if (score >= MAX_SCORE) {
      document.getElementById("winMessage").textContent = "🎉 Bravo ! Tu as gagné ! 🎉";
      triggerConfetti(); // 🔥 Confettis seulement quand score = 20
   }
}

function updateScoreDisplay() {
   document.getElementById("scoreDisplay").textContent = `Score : ${score} / ${MAX_SCORE}`;
}

/* === Confetti simple === */
function triggerConfetti() {
   const canvas = document.getElementById("confettiCanvas");
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