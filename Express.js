    
    const express = require('express');
    const app = express();
    
    app.use(express.json()); // Obsługuje JSON w ciele żądania
    // Endpoint do pobierania informacji o użytkowniku
    app.get('/user-info', (req, res) => {
        if (req.user) {
            res.json({ username: req.user.username, role: req.user.role });
        } else {
            res.json({ username: null, role: null });
        }
    });


    // Endpoint do pobierania nadchodzących turniejów
    app.get('/upcoming-tournaments', (req, res) => {
        const query = 'SELECT * FROM tournaments WHERE date >= CURDATE() ORDER BY date ASC';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Błąd przy pobieraniu turniejów:', err);
                return res.status(500).send('Wystąpił błąd przy pobieraniu turniejów.');
            }
            res.json(results);
        });
    });


    // Endpoint do pobierania informacji o użytkowniku
    app.get('/user-info', (req, res) => {
        // Użyj odpowiednich metod autoryzacji
        res.json({ username: 'exampleUser', role: 'player' });
    });
    const session = require('express-session');

    app.use(session({
        secret: 'tajny_klucz', // Zmień na rzeczywisty tajny klucz
        resave: false,
        saveUninitialized: true
    }));
 
    
   // Endpoint do tworzenia meczu
app.post('/create-tournament', (req, res) => {
    // Logika tworzenia meczu
    // Możesz użyć req.body, aby uzyskać dane z formularza

    // Przykład odpowiedzi
    res.status(200).send('Mecz został utworzony.');
});

// Obsługuje inne endpointy
// ...
app.post('/create-tournament', (req, res) => {
    console.log('Dane otrzymane:', req.body);
    // Kontynuuj logikę tworzenia meczu
});
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    
});