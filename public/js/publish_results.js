document.addEventListener('DOMContentLoaded', () => {
    const publishResultsForm = document.getElementById('publish-results-form');
    const responseMessage = document.getElementById('response-message');
    const tournamentSelect = document.getElementById('tournament');
    const matchSelect = document.getElementById('match');

    // Funkcja do ładowania turniejów
    async function loadTournaments() {
        try {
            const response = await fetch('/tournaments');
            if (!response.ok) throw new Error('Błąd przy pobieraniu turniejów');
            const tournaments = await response.json();
            tournamentSelect.innerHTML = tournaments.map(tournament => 
                `<option value="${tournament.id}">${tournament.name}</option>`
            ).join('');
        } catch (error) {
            console.error('Błąd przy pobieraniu turniejów:', error);
            responseMessage.textContent = 'Nie udało się załadować turniejów.';
            responseMessage.style.color = 'red';
            responseMessage.style.display = 'block';
        }
    }

    // Funkcja do ładowania meczów dla wybranego turnieju
async function loadMatchesForTournament(tournamentId) {
    if (!tournamentId) {
        console.error('Brak identyfikatora turnieju');
        return;
    }
    
    try {
        const response = await fetch(`/matches/${tournamentId}`);
        
        if (!response.ok) {
            throw new Error('Błąd podczas ładowania meczów: ' + response.statusText);
        }

        const matches = await response.json();

        // Sprawdzanie, czy meczów jest coś
        if (!matches.length) {
            matchSelect.innerHTML = '<option value="">Brak meczów dla wybranego turnieju</option>';
            return;
        }

        matchSelect.innerHTML = matches.map(match => 
            `<option value="${match.id}">${match.team1} vs ${match.team2}</option>`
        ).join('');

    } catch (error) {
        console.error('Błąd podczas ładowania meczów:', error);
        responseMessage.textContent = 'Nie udało się załadować meczów.';
        responseMessage.style.color = 'red';
        responseMessage.style.display = 'block';
    }


    tournamentSelect.addEventListener('change', (e) => {
        const tournamentId = e.target.value;
        console.log('Wybrany turniej ID:', tournamentId); // Dodaj debugowanie
        if (tournamentId) {
            loadMatchesForTournament(tournamentId);
        }
    });

}

    // Obsługa zmiany wybranego turnieju
    tournamentSelect.addEventListener('change', (e) => {
        const tournamentId = e.target.value;
        if (tournamentId) {
            loadMatchesForTournament(tournamentId);
        } else {
            matchSelect.innerHTML = '<option value="">Wybierz mecz</option>';
        }
    });

    // Obsługa formularza publikacji wyników
    if (publishResultsForm) {
        publishResultsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(publishResultsForm);
            const data = Object.fromEntries(formData);
            console.log('Dane do wysłania:', data); // Dodaj to dla debugowania

            try {
                const response = await fetch('/publish-results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    responseMessage.textContent = 'Wyniki opublikowane.';
                    responseMessage.style.color = 'green';
                } else {
                    const error = await response.json();
                    responseMessage.textContent = `Błąd: ${error.message}`;
                    responseMessage.style.color = 'red';
                }
                responseMessage.style.display = 'block';
                if (response.ok) publishResultsForm.reset();
            } catch (error) {
                responseMessage.textContent = 'Wystąpił błąd sieciowy.';
                responseMessage.style.color = 'red';
                responseMessage.style.display = 'block';
            }
        });
    }

    // Inicjalizacja danych
    loadTournaments();
});
