// HTML for the CV download pages. Text is rendered in English, then switched in the browser
// to the visitor's language: the one picked on davidcarvalho.work (same localStorage key as
// js/i18n.js), else the phone's language, else English.

const STRINGS = {
  en: {
    pageTitle: 'Download my CV · David Carvalho',
    heading: 'Download my CV',
    intro: 'Thanks for stopping by! Leave your name and the download starts right away.',
    name: 'Name',
    company: 'Company',
    email: 'Email',
    optional: 'optional',
    emailHint: "Only if you'd like me to get in touch.",
    button: 'Download CV',
    checking: "Checking you're not a robot…",
    privacy: 'Your details are sent only to me, so I know who downloaded my CV and can follow up.',
    thanksTitle: 'Thank you!',
    thanksBody: "Your download should start automatically. If it doesn't, tap the button below.",
    thanksNote: 'This link works for 10 minutes.',
    backToForm: 'Back to the form',
    website: 'Visit my website',
    err_name_required: 'Please enter your name.',
    err_email_invalid: "That email address doesn't look right.",
    err_verify: "We couldn't confirm you're not a robot. Please try again.",
    err_expired: 'This download link has expired. Please fill in the form again.',
    err_server: 'Something went wrong on my side. Please try again in a moment.',
    err_not_found: "This page doesn't exist.",
  },
  fr: {
    pageTitle: 'Télécharger mon CV · David Carvalho',
    heading: 'Télécharger mon CV',
    intro: 'Merci de votre visite ! Indiquez votre nom et le téléchargement démarre tout de suite.',
    name: 'Nom',
    company: 'Entreprise',
    email: 'E-mail',
    optional: 'facultatif',
    emailHint: 'Seulement si vous souhaitez que je vous recontacte.',
    button: 'Télécharger le CV',
    checking: 'Vérification anti-robot…',
    privacy: "Vos informations ne sont transmises qu'à moi, pour savoir qui a téléchargé mon CV et pouvoir vous recontacter.",
    thanksTitle: 'Merci !',
    thanksBody: 'Le téléchargement devrait démarrer automatiquement. Sinon, appuyez sur le bouton ci-dessous.',
    thanksNote: 'Ce lien est valable 10 minutes.',
    backToForm: 'Retour au formulaire',
    website: 'Visiter mon site',
    err_name_required: 'Veuillez indiquer votre nom.',
    err_email_invalid: 'Cette adresse e-mail semble incorrecte.',
    err_verify: 'La vérification anti-robot a échoué. Veuillez réessayer.',
    err_expired: 'Ce lien de téléchargement a expiré. Veuillez remplir à nouveau le formulaire.',
    err_server: 'Un problème est survenu de mon côté. Veuillez réessayer dans un instant.',
    err_not_found: "Cette page n'existe pas.",
  },
  pt: {
    pageTitle: 'Descarregar o meu CV · David Carvalho',
    heading: 'Descarregar o meu CV',
    intro: 'Obrigado pela visita! Deixe o seu nome e a transferência começa de imediato.',
    name: 'Nome',
    company: 'Empresa',
    email: 'E-mail',
    optional: 'opcional',
    emailHint: 'Apenas se quiser que eu entre em contacto.',
    button: 'Descarregar CV',
    checking: 'A verificar que não é um robô…',
    privacy: 'Os seus dados são enviados apenas para mim, para eu saber quem descarregou o meu CV e poder entrar em contacto.',
    thanksTitle: 'Obrigado!',
    thanksBody: 'A transferência deve começar automaticamente. Se não começar, toque no botão abaixo.',
    thanksNote: 'Este link é válido durante 10 minutos.',
    backToForm: 'Voltar ao formulário',
    website: 'Visitar o meu site',
    err_name_required: 'Por favor, indique o seu nome.',
    err_email_invalid: 'Este endereço de e-mail não parece correto.',
    err_verify: 'Não foi possível confirmar que não é um robô. Tente novamente.',
    err_expired: 'Este link de transferência expirou. Preencha o formulário novamente.',
    err_server: 'Algo correu mal do meu lado. Tente novamente dentro de momentos.',
    err_not_found: 'Esta página não existe.',
  },
};

const SITE = 'https://davidcarvalho.work';
const en = STRINGS.en;

export function formPage({ siteKey, source, values = {}, error }) {
  return layout(
    `<h1 data-t="heading">${en.heading}</h1>
      <p data-t="intro">${en.intro}</p>
      ${error ? errorBox(error) : ''}
      <noscript><p class="error">This page needs JavaScript to work.</p></noscript>
      <form method="post" action="/cv" id="cv-form">
        <input type="hidden" name="s" value="${esc(source)}">
        <label for="name" data-t="name">${en.name}</label>
        <input id="name" name="name" required maxlength="100" autocomplete="name" value="${esc(values.name)}">
        <label for="company"><span data-t="company">${en.company}</span> <small data-t="optional">${en.optional}</small></label>
        <input id="company" name="company" maxlength="100" autocomplete="organization" value="${esc(values.company)}">
        <label for="email"><span data-t="email">${en.email}</span> <small data-t="optional">${en.optional}</small></label>
        <input id="email" name="email" type="email" inputmode="email" maxlength="254" autocomplete="email" value="${esc(values.email)}">
        <p class="hint" data-t="emailHint">${en.emailHint}</p>
        <div class="cf-turnstile" data-sitekey="${esc(siteKey)}" data-callback="turnstileOk"
          data-expired-callback="turnstileReset" data-error-callback="turnstileReset"
          data-appearance="interaction-only" data-size="flexible"></div>
        <button type="submit" id="submit" disabled data-t="button">${en.button}</button>
        <p class="hint center" id="checking" data-t="checking">${en.checking}</p>
        <p class="privacy" data-t="privacy">${en.privacy}</p>
      </form>`,
    `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <script>
      const submitButton = document.getElementById('submit');
      const checking = document.getElementById('checking');
      function turnstileOk() { submitButton.disabled = false; checking.hidden = true; }
      function turnstileReset() { submitButton.disabled = true; checking.hidden = false; }
      // Stop double taps from logging the same visitor twice.
      document.getElementById('cv-form').addEventListener('submit', () => {
        setTimeout(() => { submitButton.disabled = true; }, 0);
      });
    </script>`,
  );
}

export function thanksPage(downloadUrl) {
  return layout(
    `<h1 data-t="thanksTitle">${en.thanksTitle}</h1>
      <p data-t="thanksBody">${en.thanksBody}</p>
      <a class="button" id="download" href="${esc(downloadUrl)}" data-t="button">${en.button}</a>
      <p class="hint center" data-t="thanksNote">${en.thanksNote}</p>`,
    `<script>
      setTimeout(() => { window.location.href = document.getElementById('download').href; }, 700);
    </script>`,
  );
}

export function messagePage(key, linkToForm = false) {
  return layout(
    `${errorBox(key)}
      ${linkToForm ? `<a class="button" href="/cv" data-t="backToForm">${en.backToForm}</a>` : ''}`,
  );
}

function errorBox(key) {
  return `<p class="error" role="alert" data-t="${key}">${en[key]}</p>`;
}

function layout(content, scripts = '') {
  // Escape "<" so no string can close the <script> tag.
  const strings = JSON.stringify(STRINGS).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${en.pageTitle}</title>
  <link rel="icon" href="${SITE}/assets/img/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css?family=Saira+Extra+Condensed:500,700|Muli:400,800&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>
  <main class="card">
    <header>
      <nav class="langs" aria-label="Language">
        <button type="button" data-lang="en">EN</button><button type="button" data-lang="fr">FR</button><button type="button" data-lang="pt">PT</button>
      </nav>
      <img class="photo" src="${SITE}/assets/img/profile.jpg" alt="David Carvalho" width="96" height="96">
      <p class="name">David <strong>Carvalho</strong></p>
    </header>
    <div class="content">
      ${content}
    </div>
    <footer><a href="${SITE}" data-t="website">${en.website}</a></footer>
  </main>
  <script>
    (() => {
      const T = ${strings};
      const KEY = 'portfolio.language';
      function pick() {
        try { const saved = localStorage.getItem(KEY); if (T[saved]) return saved; } catch (e) {}
        for (const tag of navigator.languages || [navigator.language]) {
          const lang = String(tag || '').slice(0, 2).toLowerCase();
          if (T[lang]) return lang;
        }
        return 'en';
      }
      function apply(lang) {
        document.documentElement.lang = lang;
        document.title = T[lang].pageTitle;
        document.querySelectorAll('[data-t]').forEach((el) => {
          const text = T[lang][el.dataset.t];
          if (text) el.textContent = text;
        });
        document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
      }
      document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
        try { localStorage.setItem(KEY, b.dataset.lang); } catch (e) {}
        apply(b.dataset.lang);
      }));
      apply(pick());
    })();
  </script>
  ${scripts}
</body>
</html>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Colours and fonts from the main site (Start Bootstrap Resume, primary #bd5d38).
const CSS = `
  :root { --primary: #bd5d38; --primary-dark: #9f4d2e; --text: #343a40; --muted: #6c757d; --border: #ced4da; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  body {
    margin: 0; min-height: 100vh; padding: 16px; display: flex; justify-content: center; align-items: flex-start;
    background: #f3eeeb; color: var(--text);
    font: 16px/1.5 Muli, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .card { width: 100%; max-width: 28rem; margin-top: 3vh; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 14px rgba(0,0,0,.08); }
  header { position: relative; padding: 28px 16px 18px; background: var(--primary); color: #fff; text-align: center; }
  .photo { display: block; width: 96px; height: 96px; margin: 0 auto 10px; border-radius: 50%; border: 4px solid rgba(255,255,255,.35); object-fit: cover; }
  .name, h1 { font-family: "Saira Extra Condensed", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; text-transform: uppercase; line-height: 1.1; }
  .name { margin: 0; font-size: 2rem; font-weight: 500; }
  .name strong { font-weight: 700; }
  .langs { position: absolute; top: 10px; right: 10px; display: flex; gap: 4px; }
  .langs button { min-width: 36px; min-height: 32px; padding: 4px 6px; border: 1px solid rgba(255,255,255,.55); border-radius: 6px; background: transparent; color: #fff; font: inherit; font-size: .75rem; cursor: pointer; }
  .langs button[aria-pressed="true"] { background: #fff; color: var(--primary); font-weight: 800; }
  .content { padding: 24px 20px 8px; }
  h1 { margin: 0 0 8px; font-size: 1.9rem; font-weight: 700; color: var(--text); }
  p { margin: 0 0 8px; }
  label { display: block; margin: 16px 0 6px; font-weight: 800; }
  label small { font-weight: 400; color: var(--muted); }
  input { width: 100%; min-height: 48px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: #fff; color: var(--text); font: inherit; font-size: 16px; }
  input:focus { outline: 2px solid var(--primary); outline-offset: 1px; border-color: var(--primary); }
  .hint { margin: 6px 0 0; font-size: .875rem; color: var(--muted); }
  .center { text-align: center; }
  .cf-turnstile { margin-top: 16px; }
  button[type="submit"], .button {
    display: block; width: 100%; min-height: 52px; margin-top: 20px; padding: 12px; border: 0; border-radius: 8px;
    background: var(--primary); color: #fff; font: inherit; font-size: 1.1rem; font-weight: 800; text-align: center; text-decoration: none; cursor: pointer;
  }
  button[type="submit"]:hover, .button:hover { background: var(--primary-dark); }
  button[disabled] { opacity: .55; cursor: wait; }
  .privacy { margin: 16px 0 0; font-size: .8rem; color: var(--muted); }
  .error { margin: 12px 0 0; padding: 10px 12px; border-radius: 8px; background: #fdecea; color: #8a1c12; }
  footer { padding: 16px 20px 22px; text-align: center; font-size: .9rem; }
  footer a { color: var(--primary); }
`;
