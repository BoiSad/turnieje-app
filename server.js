const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const app = express();
const port = 3000;

// Konfiguracja multer do obsługi przesyłania formularzy
const upload = multer();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serwowanie plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

// Połączenie z bazą danych
let db;

// Funkcja do otwierania bazy danych
async function openDb() {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });
}

// Uruchomienie funkcji otwierania bazy danych
openDb().catch(console.error);

app.post('/tournaments', upload.none(), async (req, res) => {
    const { name, format, date, rules } = req.body;

    if (!name || !format || !date || !rules) {
        return res.status(400).json({ success: false, message: 'Wszystkie pola są wymagane.' });
    }

    try {
        await db.run(
            `INSERT INTO tournaments (name, format, date, rules) VALUES (?, ?, ?, ?)`,
            [name, format, date, rules]
        );
        res.json({ success: true, message: 'Turniej został pomyślnie stworzony!' });
    } catch (error) {
        console.error('Błąd podczas dodawania turnieju:', error);
        res.status(500).json({ success: false, message: 'Wystąpił błąd podczas dodawania turnieju.' });
    }
});

// Endpoint do pobierania meczów dla turnieju
app.get('/matches', (req, res) => {
    const tournamentId = req.query.tournamentId;
    db.query('SELECT * FROM matches WHERE tournament_id = ?', [tournamentId], (err, results) => {
        if (err) {
            console.error('Błąd przy pobieraniu meczów:', err);
            return res.status(500).send('Wystąpił błąd przy pobieraniu meczów.');
        }
        res.json(results);
    });
});

app.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
    }

    // Sprawdź, czy użytkownik już istnieje
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], (err, results) => {
        if (err) {
            console.error('Błąd zapytania:', err);
            return res.status(500).json({ message: 'Błąd serwera.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Użytkownik już istnieje.' });
        }

        // Hashowanie hasła przed zapisaniem do bazy
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Błąd hashowania hasła:', err);
                return res.status(500).json({ message: 'Błąd serwera.' });
            }

            // Wstawianie nowego użytkownika do bazy
            const insertUserQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [username, hashedPassword, role], (err, results) => {
                if (err) {
                    console.error('Błąd zapytania:', err);
                    return res.status(500).json({ message: 'Błąd serwera.' });
                }

                res.status(201).json({ message: 'Rejestracja zakończona sukcesem.' });
            });
        });
    });
});

// Endpoint do logowania
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    });
});
// Endpoint do publikacji wyników
app.post('/publish-results', (req, res) => {
    const { tournamentId, matchId, results } = req.body;
    const sql = 'INSERT INTO match_results (tournament_id, match_id, results) VALUES (?, ?, ?)';
    db.query(sql, [tournamentId, matchId, results], (err, result) => {
        if (err) throw err;
        res.sendStatus(200);
    });
});
// Endpoint do dodawania turnieju
app.post('/tournaments', upload.none(), (req, res) => {
    const { name, format, date, rules } = req.body;
    if (!name || !format || !date || !rules) {
        return res.status(400).json({ success: false, message: 'Wszystkie pola są wymagane.' });
    }

    db.query(
        'INSERT INTO tournaments (name, format, date, rules) VALUES (?, ?, ?, ?)',
        [name, format, date, rules],
        (err, results) => {
            if (err) {
                console.error('Błąd podczas dodawania turnieju:', err);
                return res.status(500).json({ success: false, message: 'Wystąpił błąd podczas dodawania turnieju.' });
            }
            res.json({ success: true, message: 'Turniej został pomyślnie stworzony!' });
        }
    );
});
// Endpoint do pobierania turniejów
app.get('/tournaments', (req, res) => {
    const sql = 'SELECT * FROM tournaments';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
// Obsługa nieznanych ścieżek (404)
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
app.get('/user-info', (req, res) => {
    if (req.user) {
        res.json({ username: req.user.username, role: req.user.role });
    } else {
        res.json({ username: null, role: null });
    }
});
// Endpoint do pobierania meczów dla turnieju
app.get('/matches', (req, res) => {
    const tournamentId = req.query.tournamentId;
    db.query('SELECT * FROM matches WHERE tournament_id = ?', [tournamentId], (err, results) => {
        if (err) {
            console.error('Błąd przy pobieraniu meczów:', err);
            return res.status(500).send('Wystąpił błąd przy pobieraniu meczów.');
        }
        res.json(results);
    });
});
// Serwer nasłuchujący na porcie
app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
