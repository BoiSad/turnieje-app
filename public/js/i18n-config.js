i18next.init({
    lng: 'pl', // default language
    resources: {
        pl: {
            translation: {
                "customize": {
                    "title": "Personalizacja",
                    "theme": "Motyw:",
                    "language": "Język:",
                    "save": "Zapisz zmiany"
                }
            }
        },
        en: {
            translation: {
                "customize": {
                    "title": "Customization",
                    "theme": "Theme:",
                    "language": "Language:",
                    "save": "Save changes"
                }
            }
        }
    }
}, function(err, t) {
    updateContent();
});

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(function(element) {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18next.t(key);
    });
}

document.getElementById('customize-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const selectedLang = document.getElementById('language').value;
    i18next.changeLanguage(selectedLang, function(err, t) {
        if (err) return console.error(err);
        updateContent();
    });
});
