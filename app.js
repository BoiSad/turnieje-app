const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./database'); // Importuj połączenie z bazą danych

const app = express();
const port = 3001;

app.use(express.static('public'));
app.use(bodyParser.json());

// Konfiguracja sesji
app.use(session({
    secret: 'tajny_klucz', // Zmień na rzeczywisty tajny klucz
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Włącz secure: true tylko, jeśli używasz HTTPS
}));

// Endpointy do obsługi użytkowników
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error('Błąd przy sprawdzaniu e-maila:', err);
            return res.status(500).send('Wystąpił błąd.');
        }
        if (results.length > 0) {
            return res.status(400).send('Adres e-mail jest już zajęty.');
        }
        const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        db.query(query, [username, password, email], (err, results) => {
            if (err) {
                console.error('Błąd przy rejestracji:', err);
                return res.status(500).send('Wystąpił błąd przy rejestracji.');
            }
            res.status(200).send('Rejestracja udana');
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password, email } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ? AND email = ?';
    db.query(query, [username, password, email], (err, results) => {
        if (err) {
            console.error('Błąd przy logowaniu:', err);
            return res.status(500).send('Wystąpił błąd przy logowaniu.');
        }
        if (results.length > 0) {
            req.session.user = { username: results[0].username };
            res.status(200).send('Zalogowano pomyślnie');
        } else {
            res.status(401).send('Niepoprawna nazwa użytkownika, hasło lub e-mail.');
        }
    });
});

// Endpoint do pobierania informacji o użytkowniku
app.get('/user-info', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.json({ username: null });
    }
});

// Endpointy do obsługi turniejów
app.post('/tournaments', (req, res) => {
    const { name, date, lokalizacja, format } = req.body;
    const query = 'INSERT INTO tournaments (name, date, lokalizacja, format) VALUES (?, ?, ?, ?)';
    db.query(query, [name, date, lokalizacja, format], (err, results) => {
        if (err) {
            console.error('Błąd przy tworzeniu turnieju:', err);
            return res.status(500).send('Wystąpił błąd przy tworzeniu turnieju.');
        }
        res.status(200).send('Turniej utworzony');
    });
});

app.get('/tournaments', (req, res) => {
    const query = 'SELECT * FROM tournaments';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd przy pobieraniu turniejów:', err);  
            return res.status(500).send('Wystąpił błąd przy pobieraniu turniejów.');
        }
        res.json(results);
    });
});

// Endpoint do generowania harmonogramu
app.post('/generate_schedule/:tournamentId', (req, res) => {
    const tournamentId = req.params.tournamentId;
    const { schedule } = req.body;

    const query = 'INSERT INTO matches (tournament_id, team1, team2, match_date) VALUES ?';
    const values = schedule.flat().map(match => [tournamentId, match.team1, match.team2, match.match_date]);

    db.query(query, [values], (err) => {
        if (err) {
            console.error('Błąd przy dodawaniu harmonogramu meczów:', err);
            return res.status(500).send('Wystąpił błąd przy generowaniu harmonogramu.');
        }
        res.status(200).send('Harmonogram został wygenerowany.');
    });
});
app.post('/teams', (req, res) => {
    const { teams } = req.body; // Oczekujemy tablicy nazw drużyn
    const query = 'INSERT INTO teams (name) VALUES ?';
    const values = teams.map(name => [name]);

    db.query(query, [values], (err) => {
        if (err) {
            console.error('Błąd przy dodawaniu drużyn:', err);
            return res.status(500).send('Wystąpił błąd przy dodawaniu drużyn.');
        }
        res.status(200).send('Drużyny dodane.');
    });
});
// Endpoint do dodawania drużyn
app.post('/teams', (req, res) => {
    const { team_name } = req.body;

    
    // Debugowanie danych na serwerze
    console.log('Otrzymane dane:', req.body);

    // Sprawdzenie, czy wszystkie wymagane pola są obecne
    if (!team_name) {
        return res.status(400).json({ message: 'Nazwa drużyny jest wymagana.' });
    }

    // Przykład dodawania danych do bazy
    const query = 'INSERT INTO teams (name) VALUES (?)';
    db.query(query, [team_name], (err, results) => {
        if (err) {
            console.error('Błąd przy dodawaniu drużyny:', err);
            return res.status(500).json({ message: 'Wystąpił błąd przy dodawaniu drużyny.' });
        }
        res.status(200).json({ message: 'Drużyna została dodana.' });
    });
});

// Endpoint do pobierania drużyn
app.get('/teams', (req, res) => {
    const query = 'SELECT * FROM teams';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd przy pobieraniu drużyn:', err);
            return res.status(500).json({ message: 'Wystąpił błąd przy pobieraniu drużyn.' });
        }
        res.status(200).json(results);
    });
});

app.post('/matches', (req, res) => {
    const { tournament_id, team1_id, team2_id, match_date } = req.body;

    console.log('Otrzymane dane:', req.body);

    // Sprawdzenie, czy wszystkie wymagane pola są obecne
    if (!tournament_id || !team1_id || !team2_id || !match_date) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
    }

    // Przykład dodawania danych do bazy
    const query = 'INSERT INTO matches (tournament_id, team1, team2, match_date) VALUES (?, ?, ?, ?)';
    db.query(query, [tournament_id, team1_id, team2_id, match_date], (err, results) => {
        if (err) {
            console.error('Błąd przy dodawaniu meczu:', err);
            return res.status(500).json({ message: 'Wystąpił błąd przy dodawaniu meczu.' });
        }
        res.status(200).json({ matchId: results.insertId });
    });
});


app.get('/matches/:tournamentId', (req, res) => {
    const tournamentId = req.params.tournamentId;

    const query = 'SELECT * FROM matches WHERE tournament_id = ?';
    db.query(query, [tournamentId], (err, results) => {
        if (err) {
            console.error('Błąd przy pobieraniu meczów:', err);
            return res.status(500).json({ message: 'Wystąpił błąd przy pobieraniu meczów.' });
        }
        res.status(200).json(results);
    });
});




app.post('/publish-results', (req, res) => {
    const { tournament, match, result } = req.body;

    // Debugowanie danych na serwerze
    console.log('Otrzymane dane:', req.body);

    // Sprawdzenie, czy wszystkie wymagane pola są obecne
    if (!tournament || !match || !result) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
    }

    // Przykład dodawania danych do bazy
    const query = 'INSERT INTO results (tournament_id, match_id, result) VALUES (?, ?, ?)';
    db.query(query, [tournament, match, result], (err, results) => {
        if (err) {
            console.error('Błąd przy publikacji wyników:', err);
            return res.status(500).json({ message: 'Wystąpił błąd przy publikacji wyników.' });
        }
        res.status(200).json({ message: 'Wyniki zostały opublikowane.' });
    });
});

// Start serwera
app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});