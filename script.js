// pour test : const BACKEND_URL = "http://127.0.0.1:5000"; 
const BACKEND_URL = "https://spectacle-mag-back.onrender.com";

// Simuler 90 places (numérotées de 1 à 90)
const seatingArea = document.getElementById("seating-area");
const selectedSeats = new Set();

// Créer les 90 places
for (let i = 1; i <= 90; i++) {
  const seat = document.createElement("div");
  seat.innerHTML = i;
  seat.classList.add("seat");
  seat.dataset.seatId = i;

  seat.addEventListener("click", () => {
    if (seat.classList.contains("reserved")) return;

    seat.classList.toggle("selected");

    if (selectedSeats.has(i)) {
      selectedSeats.delete(i);
    } else {
      selectedSeats.add(i);
    }
  });

  seatingArea.appendChild(seat);
}

// Une fois les sièges créés, charger ceux réservés
document.addEventListener("DOMContentLoaded", () => {
  fetchReservedSeats();
});


async function fetchReservedSeats() {
  try {
    const response = await fetch(`${BACKEND_URL}/reserved`);
    const data = await response.json();
    const reservedSeats = data.reserved;

    reservedSeats.forEach(seatId => {
      const seatElement = document.querySelector(`[data-seat-id='${seatId}']`);
      if (seatElement) {
        seatElement.classList.add("reserved");
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des places réservées :", error);
  }
}


document.getElementById("booking-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const seats = Array.from(selectedSeats); // conversion du Set en tableau

  const data = { name, email, seats };

  if (seats.length === 0) {
    alert("Veuillez sélectionner au moins une place.");
    return;
  }

    // confirmer la sélection des places et les envoyer au back-end
  if (confirm(`Confirmer la réservation des places : ${seats.sort((a, b) => a - b).join(", ")} ?`)){

    // envoyer au backend via fetch
    try {
      const response = await fetch(`${BACKEND_URL}/reserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Affiche le message reçu du backend
        let message = result.message || "Réservation réussie !";
        
        if (result.email_sent === true) {
          message += " – Un email de confirmation a été envoyé.";
        } else if (result.email_sent === false) {
          message += " – Attention : l'email de confirmation n’a pas pu être envoyé.";
        }

        document.getElementById("message").innerText = message;
        document.getElementById("booking-form").reset();
        selectedSeats.clear(); // optionnel : vide la sélection
        document.querySelectorAll(".seat.selected").forEach(seat => seat.classList.remove("selected"));

      } else {
        document.getElementById("message").innerText = "Erreur : " + (result.error || "Réservation échouée");
      }
    
    } catch (error) {
      document.getElementById("message").innerText = "Erreur de connexion au serveur.";
      console.error(error);
    }
  }

  await fetchReservedSeats(); // met à jour les réservées visuellement
});
