let translations = {};

async function fetchTranslations(lang = 'ru') {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${lang}.json: ${response.statusText}`);
        }
        translations = await response.json();
        console.log('Translations loaded successfully.');
        applyTranslations(); // Call after translations are loaded
    } catch (error) {
        console.error('Error fetching translations:', error);
        translations = {};
    }
}

function getText(key, replacements) {
    let text = translations[key] || `[MISSING_TRANSLATION: ${key}]`;
    if (replacements) {
        for (const placeholder in replacements) {
            text = text.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
        }
    }
    return text;
}

// Make getText globally available
window.getText = getText;

function applyTranslations() {
    // Handle elements with data-translate for textContent
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        // Ensure this is not the dynamic one, or it's handled specifically if needed
        if (element.getAttribute('data-translate-dynamic') !== 'true') {
             // Check if the key for the validation error message, it's handled dynamically in script.js
            if (key === "form.validation.requiredError") {
                // This will be populated by script.js when an error occurs
                // but we can clear it here initially if needed, or ensure it's empty.
                // element.textContent = ''; // Or leave it to be populated
            } else {
                element.textContent = getText(key);
            }
        }
    });

    // Handle elements with data-translate-placeholder for placeholder attribute
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        element.setAttribute('placeholder', getText(key));
    });

    // Handle specific dynamic content like the consent text
    const dynamicConsentElement = document.querySelector('[data-translate="footer.consentText"][data-translate-dynamic="true"]');
    if (dynamicConsentElement) {
        const rawText = getText('footer.consentText'); // "Нажимая на кнопку..., вы соглашаетесь на ... с <a ...>политикой конфиденциальности</a>."
        // The link text itself is not in a separate key in the current ru.json, the <a> tag is part of the string.
        // If the link text needed translation, we'd need a new key e.g., "footer.consentLinkText"
        // For now, the existing string is used directly.
        // If we wanted to make "политикой конфиденциальности" translatable separately:
        // 1. New key in ru.json: "footer.consentLinkText": "политикой конфиденциальности"
        // 2. Modify "footer.consentText" in ru.json: "... <a href='...'>{linkText}</a>."
        // 3. Update here:
        //    const linkText = getText('footer.consentLinkText');
        //    const fullHtml = rawText.replace('{linkText}', linkText);
        //    dynamicConsentElement.innerHTML = fullHtml;
        // For the current structure, the rawText is already HTML.
        dynamicConsentElement.innerHTML = rawText;
    }
    console.log('Translations applied to HTML elements.');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTranslations();
});
