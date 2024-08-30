document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const createTournamentForm = document.getElementById('tournament-form');
    const publishResultsForm = document.getElementById('publish-results-form');
    const responseMessage = document.getElementById('response-message');
    const tournamentSelect = document.getElementById('tournament');
    const matchSelect = document.getElementById('match');
    const userInfo = document.getElementById('user-info');
    const languageSelector = document.getElementById('language-selector');
    const generateScheduleButton = document.getElementById('generate-schedule');
    const generateTeamNamesButton = document.getElementById('generate-team-names');
    const teamCountSelect = document.getElementById('team-count');
    const teamNamesContainer = document.getElementById('team-names-container');
    const teamNamesForm = document.getElementById('team-names-form');
    const scheduleDisplay = document.getElementById('schedule-display');
    const tournamentSelectPublish = document.getElementById('tournament-select');
    const tournamentSelectSchedule = document.getElementById('tournament-select-schedule');
    const scheduleForm = document.getElementById('schedule-form');
    const message = document.getElementById('message');
    const matchForm = document.getElementById('match-form');
    const matchResponseMessage = document.getElementById('match-response-message');
    const team1Select = document.getElementById('match-team1');
    const team2Select = document.getElementById('match-team2');
    // Funkcja do wyświetlania informacji o użytkowniku
    const displayUserInfo = async () => {
        try {
            const response = await fetch('/user-info');
            const data = await response.json();
            userInfo.textContent = data.username ? `Zalogowany jako: ${data.username}` : 'Nie jesteś zalogowany';
        } catch (error) {
            console.error('Błąd przy pobieraniu informacji o użytkowniku:', error);
            userInfo.textContent = 'Błąd przy ładowaniu informacji o użytkowniku';
        }
    };

    displayUserInfo();

    // Funkcja do ładowania turniejów
    const loadTournaments = async () => {
        try {
            const response = await fetch('/tournaments');
            const tournaments = await response.json();
            const options = tournaments.map(tournament => 
                `<option value="${tournament.id}">${tournament.name}</option>`
            ).join('');

            if (tournamentSelect) {
                tournamentSelect.innerHTML = options;
            }
            if (tournamentSelectPublish) {
                tournamentSelectPublish.innerHTML = options;
            }
            if (tournamentSelectSchedule) {
                tournamentSelectSchedule.innerHTML = options;
            }
        } catch (error) {
            console.error('Błąd przy pobieraniu turniejów:', error);
        }
    };

    loadTournaments();
 // Funkcja do ładowania drużyn
 const loadTeams = async () => {
    try {
        const response = await fetch('/teams');
        const teams = await response.json();
        const options = teams.map(team => 
            `<option value="${team.id}">${team.name}</option>`
        ).join('');
        team1Select.innerHTML = options;
        team2Select.innerHTML = options;
    } catch (error) {
        console.error('Błąd przy ładowaniu drużyn:', error);
    }

};    loadTeams();
     // Funkcja do generowania harmonogramu meczów
    const generateSchedule = (numTeams) => {
        if (numTeams < 2) return [];

        const schedule = [];
        const teams = Array.from({ length: numTeams }, (_, i) => i + 1);

        for (let i = 0; i < numTeams - 1; i++) {
            const roundMatches = [];
            for (let j = 0; j < numTeams / 2; j++) {
                const team1 = teams[j];
                const team2 = teams[numTeams - j - 1];
                roundMatches.push({ team1, team2, match_date: `2024-09-01` }); // Dodaj przykładową datę meczu
            }
            schedule.push(roundMatches);
            teams.splice(1, 0, teams.pop()); // Rotate teams
        }

        return schedule;
    };

    const displaySchedule = (schedule) => {
        scheduleDisplay.innerHTML = '';

        if (schedule.length === 0) {
            scheduleDisplay.textContent = 'Brak harmonogramu meczów.';
            return;
        }

        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Runda</th><th>Mecz</th>';
        table.appendChild(headerRow);

        schedule.forEach((round, index) => {
            round.forEach(match => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>Runda ${index + 1}</td><td>Drużyna ${match.team1} vs Drużyna ${match.team2}</td>`;
                table.appendChild(row);
            });
        });

        scheduleDisplay.appendChild(table);
    };
    // Obsługa formularza generowania harmonogramu
    if (generateScheduleButton) {
        generateScheduleButton.addEventListener('click', async () => {
            // Pobranie nazw drużyn
            const teamNames = Array.from(teamNamesForm.querySelectorAll('input'))
                .map(input => input.value.trim())
                .filter(name => name !== '');

            if (teamNames.length === 0) {
                alert('Proszę wprowadzić nazwy drużyn.');
                return;
            }

            try {
                // Dodawanie drużyn do bazy danych
                const responseTeams = await fetch('/teams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teams: teamNames })
                });

                if (!responseTeams.ok) {
                    throw new Error('Wystąpił błąd przy dodawaniu drużyn.');
                }

                // Generowanie harmonogramu
                const numTeams = teamNames.length;
                const schedule = generateSchedule(numTeams);

                // Wyświetlenie harmonogramu
                if (message) {
                    message.textContent = 'Harmonogram został wygenerowany i drużyny dodane.';
                    message.style.color = 'green';
                    displaySchedule(schedule); // Wyświetl harmonogram
                }

                teamNamesForm.reset();
                teamNamesContainer.innerHTML = ''; // Resetowanie formularza nazw drużyn

            } catch (error) {
                console.error('Błąd:', error);
                if (message) {
                    message.textContent = 'Wystąpił błąd przy dodawaniu drużyn lub generowaniu harmonogramu.';
                    message.style.color = 'red';
                    message.style.display = 'block';
                }
            }
        });
    }


    // Obsługa formularza dodawania meczu
if (matchForm) {
    matchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(matchForm);
        const data = {
            tournament_id: formData.get('tournament'),
            team1_id: formData.get('team1_id'),
            team2_id: formData.get('team2_id'),
            match_date: formData.get('match_date')
        };

        try {
            const response = await fetch('/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                matchResponseMessage.textContent = `Mecz został dodany. ID meczu: ${result.matchId}`;
                matchResponseMessage.style.color = 'green';
            } else {
                const error = await response.json();
                matchResponseMessage.textContent = `Błąd: ${error.message}`;
                matchResponseMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Błąd:', error);
            matchResponseMessage.textContent = 'Wystąpił błąd przy dodawaniu meczu.';
            matchResponseMessage.style.color = 'red';
        }
    });
}


    // Obsługa formularzy rejestracji i logowania
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                alert(response.ok ? 'Rejestracja zakończona sukcesem.' : await response.text());
                if (response.ok) registerForm.reset();
            } catch (error) {
                alert('Wystąpił błąd sieciowy.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    localStorage.setItem('username', data.username);
                    window.location.href = 'index.html';
                } else {
                    alert(await response.text());
                }
            } catch (error) {
                alert('Wystąpił błąd sieciowy.');
            }
        });
    }

    if (createTournamentForm) {
        createTournamentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(createTournamentForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('/tournaments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                responseMessage.textContent = response.ok ? 'Turniej utworzony.' : 'Wystąpił błąd podczas tworzenia turnieju.';
                responseMessage.style.color = response.ok ? 'green' : 'red';
                responseMessage.style.display = 'block';
                if (response.ok) createTournamentForm.reset();
            } catch (error) {
                responseMessage.textContent = 'Wystąpił błąd sieciowy.';
                responseMessage.style.color = 'red';
                responseMessage.style.display = 'block';
            }
        });
    }

    // Obsługa generowania nazw drużyn
    if (generateTeamNamesButton) {
        generateTeamNamesButton.addEventListener('click', () => {
            const teamCount = parseInt(teamCountSelect.value);
            console.log('Wybrano liczbę drużyn:', teamCount);

            teamNamesContainer.innerHTML = ''; // Resetowanie formularza nazw drużyn

            for (let i = 1; i <= teamCount; i++) {
                const label = document.createElement('label');
                label.textContent = `Nazwa drużyny ${i}:`;
                const input = document.createElement('input');
                input.type = 'text';
                input.name = `team${i}`;
                input.required = true;

                teamNamesContainer.appendChild(label);
                teamNamesContainer.appendChild(input);
                teamNamesContainer.appendChild(document.createElement('br'));
            }

            teamNamesForm.style.display = 'block'; // Pokaż formularz nazw drużyn
        });
    }

     // Obsługa przycisku generowania harmonogramu
     if (generateScheduleButton) {
        generateScheduleButton.addEventListener('click', async () => {
            // Pobranie nazw drużyn
            const teamNames = Array.from(teamNamesForm.querySelectorAll('input'))
                .map(input => input.value.trim())
                .filter(name => name !== '');

            if (teamNames.length === 0) {
                alert('Proszę wprowadzić nazwy drużyn.');
                return;
            }

            try {
                // Dodawanie drużyn do bazy danych
                const responseTeams = await fetch('/teams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teams: teamNames })
                });

                if (!responseTeams.ok) {
                    throw new Error('Wystąpił błąd przy dodawaniu drużyn.');
                }

                // Generowanie harmonogramu
                const numTeams = teamNames.length;
                const schedule = generateSchedule(numTeams);

                // Wyświetlenie harmonogramu
                if (message) {
                    message.textContent = 'Harmonogram został wygenerowany i drużyny dodane.';
                    message.style.color = 'green';
                    message.style.display = 'block';
                }

                displaySchedule(schedule); // Wyświetl harmonogram

                // Resetowanie formularza i kontenera
                teamNamesForm.reset();
                teamNamesContainer.innerHTML = '';

            } catch (error) {
                console.error('Błąd:', error);

                if (message) {
                    message.textContent = 'Wystąpił błąd przy dodawaniu drużyn lub generowaniu harmonogramu.';
                    message.style.color = 'red';
                    message.style.display = 'block';
                }
            }
        });
    }
});