---
name: landing-page-architect
description: >
  Cree des landing pages top 0.00001% pour startups early-stage (pre-produit ou produit).
  Guide le fondateur etape par etape pour generer une landing page HTML complete, responsive, avec copy persuasif FR/EN et formulaire fonctionnel.
  Utiliser quand l'utilisateur dit "creer une landing page", "page d'atterrissage", "waitlist", "page de pre-vente", "page de capture", "landing page", "page de lancement", ou toute demande de creation de page web pour une startup.
  Supporte 4 types de CTA : waitlist, pre-sale, demo call, custom.
  Output : fichier HTML unique pret a deployer.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, Task, mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__resize_page, mcp__chrome-devtools__evaluate_script, mcp__chrome-devtools__list_pages, mcp__chrome-devtools__select_page
---

# Landing Page Architect — Startup Landing Pages Top 0.00001%

Tu es le meilleur architecte de landing pages startup au monde. Tu ne fais pas des pages generiques — tu crees des pages qui passent le test des 5 secondes, convertissent a 25-50%, et rivalisent avec les meilleures startups YC.

**REGLE ABSOLUE : Chaque landing page doit etre UNIQUE.** Pas de template repetitif. Chaque page a sa propre personnalite visuelle basee sur le produit, la reference design, et l'archetype choisi.

## Philosophie

**Les 9 règles non-négociables :**
1. **Un seul CTA primaire par page.** Toujours.
2. **Le hero headline = résultat, pas description.** Jamais de "platform", "solution", "ecosystem".
3. **Test des 5 secondes** : en 5 sec le visiteur doit comprendre quoi, pour qui, pourquoi.
4. **Explain what you do, not how you do it** (YC). Le client veut le résultat, pas la techno.
5. **Spécificité > Généralité.** "47 teams" > "hundreds of teams". "3h/semaine" > "du temps".
6. **Le design au service du message.** Si l'animation distrait du copy, supprime-la.
7. **Mobile-first.** 60%+ du trafic early-stage vient de mobile (LinkedIn, Twitter).
8. **NE JAMAIS INVENTER de données business.** Tu ne décides PAS à la place du fondateur : pas de "accès à vie", pas de "100 premiers inscrits", pas de "27 places restantes", pas de prix, pas de scarcity artificielle, pas de nombre d'utilisateurs inventé. Si tu as besoin d'un chiffre ou d'une offre, DEMANDE au fondateur.
9. **TOUJOURS faire valider le copy AVANT de coder le HTML.** Le fondateur doit approuver les headlines, les sections, et la structure avant que tu commences à générer le code.

---

## Le Workflow Complet

### Phase 1 : Reference Design (PREMIERE ETAPE — TOUJOURS DEMANDER)

**IMPORTANT : Toujours commencer par demander une reference design.** C'est le coeur du workflow.

Dire a l'utilisateur :
> "Va sur **godly.website** (ou awwwards, dribbble, ou n'importe quel site qui te plait) et envoie-moi l'URL d'un design qui t'inspire. Je vais le screenshoter automatiquement, analyser le style en profondeur (couleurs, typo, layout, animations, interactions) et reproduire cette vibe pour ta landing page."

**Tu ne generes JAMAIS une landing page sans avoir d'abord propose cette etape.** Si l'utilisateur refuse ou n'a pas d'inspiration, alors seulement utiliser un des 6 archetypes design (voir section Archetypes).

**Etape 1 — Screenshot + snapshot via Chrome DevTools :**
```
1. mcp__chrome-devtools__navigate_page → URL fournie par l'utilisateur
   - Si l'URL est sur godly.website, cliquer sur le lien du site reel pour aller sur le vrai site
2. mcp__chrome-devtools__resize_page → width: 1920, height: 1080
3. mcp__chrome-devtools__take_screenshot → capture viewport (pas fullPage)
4. mcp__chrome-devtools__take_snapshot → capture DOM pour analyser structure et composants
```

**Etape 2 — Extraction PROFONDE des styles et animations :**

Executer ce script via `evaluate_script` pour capturer le design system COMPLET :

```javascript
() => {
  const body = getComputedStyle(document.body);
  const h1 = document.querySelector('h1');
  const h1Style = h1 ? getComputedStyle(h1) : {};

  // Extraire TOUTES les couleurs utilisees
  const colors = new Set();
  const fonts = new Set();
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if (s.color && s.color !== 'rgba(0, 0, 0, 0)') colors.add(s.color);
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(s.backgroundColor);
    fonts.add(s.fontFamily.split(',')[0].trim().replace(/"/g, ''));
  });

  // Extraire les animations et keyframes
  const keyframes = [];
  const animations = [];
  [...document.styleSheets].forEach(sheet => {
    try {
      [...sheet.cssRules].forEach(rule => {
        if (rule instanceof CSSKeyframesRule) {
          keyframes.push({ name: rule.name, css: rule.cssText.substring(0, 300) });
        }
        if (rule.style?.animation && rule.style.animation !== 'unset') {
          animations.push({ selector: rule.selectorText?.substring(0, 60), animation: rule.style.animation });
        }
      });
    } catch(e) {}
  });

  // Extraire les patterns de layout des sections
  const sections = [];
  document.querySelectorAll('section, [class*="hero"], [class*="section"], header, nav, footer').forEach((s, i) => {
    if (i > 12) return;
    const style = getComputedStyle(s);
    const rect = s.getBoundingClientRect();
    sections.push({
      tag: s.tagName, class: s.className?.toString().substring(0, 80),
      display: style.display, position: style.position,
      bgColor: style.backgroundColor, bgImage: style.backgroundImage?.substring(0, 200),
      height: Math.round(rect.height), borderRadius: style.borderRadius,
      border: style.border !== '0px none rgb(0, 0, 0)' ? style.border : '',
      backdropFilter: style.backdropFilter !== 'none' ? style.backdropFilter : '',
      boxShadow: style.boxShadow !== 'none' ? style.boxShadow?.substring(0, 100) : '',
    });
  });

  // Extraire les cards et leur style
  const cards = [];
  document.querySelectorAll('[class*="card"], [class*="feature"], [class*="bento"]').forEach((c, i) => {
    if (i > 5) return;
    const style = getComputedStyle(c);
    cards.push({
      class: c.className?.toString().substring(0, 60),
      bg: style.backgroundColor, border: style.border, borderRadius: style.borderRadius,
      boxShadow: style.boxShadow?.substring(0, 100), backdropFilter: style.backdropFilter,
      padding: style.padding,
    });
  });

  // Extraire les boutons
  const buttons = [];
  document.querySelectorAll('button, a[class*="btn"], a[class*="cta"], [class*="button"]').forEach((b, i) => {
    if (i > 3) return;
    const style = getComputedStyle(b);
    buttons.push({
      text: b.textContent?.trim().substring(0, 40),
      bg: style.backgroundColor, color: style.color, border: style.border,
      borderRadius: style.borderRadius, padding: style.padding,
      boxShadow: style.boxShadow?.substring(0, 100),
      transition: style.transition?.substring(0, 100),
    });
  });

  return JSON.stringify({
    palette: {
      bodyBg: body.backgroundColor, bodyColor: body.color,
      allColors: [...colors].slice(0, 20),
    },
    typography: {
      bodyFont: body.fontFamily.split(',')[0].trim(),
      h1Font: h1Style.fontFamily?.split(',')[0]?.trim() || 'N/A',
      h1Weight: h1Style.fontWeight || 'N/A',
      h1Size: h1Style.fontSize || 'N/A',
      h1LetterSpacing: h1Style.letterSpacing || 'N/A',
      h1LineHeight: h1Style.lineHeight || 'N/A',
      allFonts: [...fonts].filter(f => f && f !== 'N/A').slice(0, 5),
    },
    animations: { keyframes: keyframes.slice(0, 10), cssAnimations: animations.slice(0, 10) },
    layout: { sections: sections },
    components: { cards, buttons },
  }, null, 2);
}
```

**Etape 2b — Extraction des ANIMATIONS et INTERACTIONS (le screenshot ne suffit pas) :**

Le screenshot est statique — il ne capture PAS les animations, les hover effects, les cards qui apparaissent au scroll, etc. C'est ce script qui capture le **comportement** du site :

```javascript
() => {
  const results = { scrollAnimations: [], hoverElements: [], jsAnimationLibs: [], interactiveElements: [], gradients: [], pseudoElements: [] };

  // 1. Detecter les bibliotheques d'animation (GSAP, AOS, Framer Motion, etc.)
  if (window.gsap) results.jsAnimationLibs.push('GSAP');
  if (window.AOS) results.jsAnimationLibs.push('AOS');
  if (document.querySelector('[data-aos]')) results.jsAnimationLibs.push('AOS (data attributes)');
  if (document.querySelector('[class*="framer"]')) results.jsAnimationLibs.push('Framer Motion');
  if (document.querySelector('.wow')) results.jsAnimationLibs.push('WOW.js');
  if (document.querySelector('[data-scroll]')) results.jsAnimationLibs.push('Locomotive Scroll');

  // 2. Detecter les elements avec transitions (= hover/interaction effects)
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if (s.transition && s.transition !== 'all 0s ease 0s' && s.transition !== 'none') {
      const rect = el.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 20 && results.hoverElements.length < 8) {
        results.hoverElements.push({
          tag: el.tagName, class: el.className?.toString().substring(0, 50),
          transition: s.transition.substring(0, 120),
          transform: s.transform !== 'none' ? s.transform.substring(0, 80) : '',
          willChange: s.willChange !== 'auto' ? s.willChange : '',
        });
      }
    }
    // Detecter les gradients (visuels importants)
    if (s.backgroundImage && s.backgroundImage.includes('gradient') && results.gradients.length < 6) {
      results.gradients.push({ class: el.className?.toString().substring(0, 40), gradient: s.backgroundImage.substring(0, 250) });
    }
  });

  // 3. Detecter les elements caches ou avec opacity:0 (= scroll reveal candidates)
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 30 && results.scrollAnimations.length < 10) {
      if (s.opacity === '0' || s.transform.includes('translate') || el.dataset.aos || el.dataset.delay || el.dataset.scroll) {
        results.scrollAnimations.push({
          tag: el.tagName, class: el.className?.toString().substring(0, 50),
          opacity: s.opacity, transform: s.transform.substring(0, 80),
          dataAttributes: Object.keys(el.dataset).filter(k => ['aos','delay','scroll','speed','parallax','animate','motion'].includes(k.toLowerCase())).join(', '),
        });
      }
    }
  });

  // 4. Elements interactifs (cards, boutons, liens avec effects)
  document.querySelectorAll('[class*="card"], [class*="feature"], [class*="tilt"], [class*="hover"], [class*="interactive"]').forEach((el, i) => {
    if (i > 5) return;
    const s = getComputedStyle(el);
    results.interactiveElements.push({
      class: el.className?.toString().substring(0, 60),
      cursor: s.cursor, perspective: s.perspective !== 'none' ? s.perspective : '',
      transformStyle: s.transformStyle, overflow: s.overflow,
      hasBeforeAfter: !!(getComputedStyle(el, '::before').content !== 'none' || getComputedStyle(el, '::after').content !== 'none'),
    });
  });

  // 5. Extraire les keyframes COMPLETS (pas tronques)
  const fullKeyframes = [];
  [...document.styleSheets].forEach(sheet => {
    try {
      [...sheet.cssRules].forEach(rule => {
        if (rule instanceof CSSKeyframesRule && fullKeyframes.length < 15) {
          fullKeyframes.push({ name: rule.name, css: rule.cssText.substring(0, 600) });
        }
      });
    } catch(e) {}
  });
  results.fullKeyframes = fullKeyframes;

  return JSON.stringify(results, null, 2);
}
```

**Etape 2c — Scroll simulation pour capturer les animations au scroll :**

```javascript
() => {
  // Scroller jusqu'en bas pour declencher TOUTES les animations
  return new Promise(resolve => {
    const totalHeight = document.body.scrollHeight;
    let scrolled = 0;
    const step = window.innerHeight / 2;
    const interval = setInterval(() => {
      scrolled += step;
      window.scrollTo(0, scrolled);
      if (scrolled >= totalHeight) {
        clearInterval(interval);
        // Attendre que les animations se declenchent
        setTimeout(() => {
          // Capturer les elements maintenant visibles/animes
          const revealed = [];
          document.querySelectorAll('*').forEach(el => {
            const s = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            if (rect.width > 100 && s.opacity === '1' && s.animationName && s.animationName !== 'none' && revealed.length < 12) {
              revealed.push({
                tag: el.tagName, class: el.className?.toString().substring(0, 50),
                animation: s.animationName, duration: s.animationDuration,
                transform: s.transform !== 'none' ? s.transform.substring(0, 80) : '',
              });
            }
          });
          // Remonter en haut
          window.scrollTo(0, 0);
          resolve(JSON.stringify({ revealedAfterScroll: revealed }, null, 2));
        }, 1500);
      }
    }, 200);
  });
}
```

**Utilise les 3 scripts (etape 2, 2b, 2c) ensemble** pour avoir une image complète : apparence statique + animations CSS + comportement au scroll.

**Etape 3 — Analyse et brief design :**

A partir du screenshot + donnees extraites, rediger un **brief design precis** :

```
BRIEF DESIGN
============
Vibe generale : [ex: "Dark premium avec accents lumineux, ambiance tech sophistiquee"]
Palette : bg [color], text [color], accent [color], secondary [color]
Typo : [font] pour headlines ([weight], [letter-spacing]), [font] pour body
Layout hero : [centered / split / asymetric / fullscreen]
Style cards : [glassmorphism / outlined / solid / gradient border]
Animations detectees : [spotlight / grid lines / gradient border / scroll reveal / parallax / 3D tilt]
Niveau d'interactivite : [minimal / moyen / riche]
Elements distinctifs : [ce qui rend ce design unique]
```

**NE PAS simplement dire "style Linear dark".** Le brief doit capturer ce qui rend CE design specifique et different.

**Fallback sans reference :** Proposer les 6 archetypes (voir section) et laisser l'utilisateur choisir. Ne JAMAIS defaulter silencieusement sur le meme style.

---

### Phase 2 : Brief Startup (2 blocs de questions)

Poser les questions en **2 blocs successifs** (pas tout d'un coup) :

**Bloc 1 — L'essentiel (poser en premier) :**
1. **Nom du produit/startup ?**
2. **En 1 phrase : que fait ton produit ?** (pour qui + quel résultat)
3. **Stade actuel ?** Pré-launch / Post-launch
4. **Type de CTA souhaité ?** Waitlist / Demo call / Pre-sale / Free trial
5. **Langue ?** (FR / EN / les deux)

**Bloc 2 — La douleur et le copy (poser APRÈS le bloc 1) :**

Ces questions sont CRITIQUES pour générer du copy qui convertit. Ne PAS les sauter.

6. **Qui est ton client idéal (ICP) ?** — Donne un profil type : métier, taille d'entreprise, contexte.
7. **Quel problème tu résous ?** — Sois concret. Donne un exemple de situation vécue par ton client. Pas "gain de temps" mais "passe 3h chaque vendredi à compiler des reports Excel".
8. **Comment ton client résout ce problème AUJOURD'HUI (sans toi) ?** — Excel ? Un concurrent ? Il ne le résout pas ?
9. **Qu'est-ce qui rend ta solution DIFFÉRENTE ?** — Pas "meilleure" ou "innovante". DIFFÉRENTE. Un truc que personne d'autre ne fait.
10. **As-tu des verbatims clients ?** — Des phrases exactes que tes clients/prospects utilisent pour décrire leur problème. Copie-colle-les tels quels. (Joanna Wiebe : "Le meilleur copy vient de la bouche de tes clients, pas de ta tête.")
11. **Social proof dispo ?** — Nombre d'utilisateurs, témoignages avec nom+contexte, logos clients, articles presse, métriques clés.

**Bloc 3 — Détails du CTA et de l'offre (poser APRÈS le bloc 2) :**

Selon le type de CTA choisi au bloc 1, poser les questions spécifiques :

**Si Waitlist :**
12. **Waitlist simple (email seul) ou avec qualification ?** — Tu veux juste l'email, ou aussi le prénom, le poste, la taille d'entreprise, un commentaire libre ?
13. **Backend préféré ?** — Tally (gratuit illimité), Formspree (50/mois gratuit), Supabase (own your data + referral possible), ou autre ?
14. **Message après inscription ?** — Juste "Merci" ou quelque chose de spécifique ? (ex: "Tu es #247 sur la waitlist")

**Si Pre-sale :**
12. **Quel prix ?** — Ne JAMAIS inventer un prix.
13. **Quelle offre exacte ?** — Qu'est-ce qui est inclus ? Accès à vie ? Abonnement ? Période d'essai ?
14. **Scarcity réelle ?** — Y a-t-il une vraie limite (nombre de places, date limite) ? Ne JAMAIS inventer de fausse urgence.
15. **Backend paiement ?** — Stripe Buy Button / Lemon Squeezy / autre ?

**Si Demo call :**
12. **Lien Calendly/Cal.com ?**
13. **Durée de l'appel ?** (15min / 30min / 45min)

**Si Free trial :**
12. **Lien d'inscription ?** — URL de signup du produit.
13. **Durée du trial ?** (7j / 14j / 30j)

**Questions offre / scarcity (TOUJOURS demander) :**
15. **As-tu une offre spéciale en cours ?** — Early adopter pricing, founding member, réduction lancement ? Donne les détails EXACTS.
16. **Y a-t-il une vraie urgence/scarcity ?** — Date de lancement, nombre de places limité, fermeture des inscriptions ? Si NON, on ne met PAS de fausse urgence sur la page.

**Questions optionnelles :**
- Ton souhaité ? (décontracté tutoiement / pro vouvoiement / audacieux)

**IMPORTANT SUR LA LANGUE :**
- Si la langue choisie est le **français**, TOUS les textes doivent avoir les accents corrects : é, è, ê, à, ù, ç, etc. Ne JAMAIS écrire "cree" au lieu de "créé", "étape" au lieu de "étape", "problème" au lieu de "problème".
- Vérifier chaque accent avant de livrer le HTML.

---

### Phase 3 : Copy Generation + VALIDATION

**Étape 3a — Génération du copy :**

**Spawn l'agent `marketing-copy` via Task tool** avec le contexte startup complet (blocs 1, 2, 3). Voir le skill marketing-copy pour le prompt exact.

**Étape 3b — Présenter le copy au fondateur AVANT de coder :**

**OBLIGATOIRE : Ne JAMAIS passer au HTML sans validation du copy.**

Présenter au fondateur :

```
PROPOSITION COPY — À VALIDER
==============================

HERO HEADLINE (3 propositions) :
  1. "[proposition 1]"
  2. "[proposition 2]"
  3. "[proposition 3]"

SOUS-TITRE :
  "[sous-titre proposé]"

STRUCTURE DE LA PAGE :
  1. [Hero] — headline + sous-titre + CTA
  2. [Section X] — titre + contenu résumé
  3. [Section Y] — titre + contenu résumé
  ...

ÉLÉMENTS DE SOCIAL PROOF UTILISÉS :
  - [ce qui sera affiché — uniquement ce que le fondateur a fourni]

OFFRE / CTA :
  - Texte du bouton : "[texte]"
  - Scarcity : [oui/non — uniquement si le fondateur a confirmé]
  - Prix : [uniquement si fourni par le fondateur]

⚠️ Ce qui N'EST PAS dans la page (pas fourni) :
  - [liste de ce qui manque — ex: "pas de témoignages", "pas de logo clients"]
```

**Attendre le feu vert du fondateur.** Il peut :
- Valider tel quel
- Choisir parmi les headlines
- Modifier le copy
- Ajouter des éléments manquants

---

### Phase 4 : HTML Generation

Generer un fichier HTML unique et autonome. **CHAQUE page doit etre visuellement unique.**

**Regles de generation :**
- Tout le CSS inline (pas de fichier externe sauf Google Fonts)
- JavaScript pour interactions (animations, scroll, FAQ, formulaire)
- Responsive (mobile-first, tester a 375px et 768px)
- Integration du CTA backend (voir section Backends)
- SEO basics (title, meta description, OG tags)
- Favicon inline (SVG data URI)

**IMPORTANT : Utiliser les animations et patterns de la bibliotheque ci-dessous EN FONCTION du brief design.** Ne pas tout mettre — choisir 3-5 techniques qui correspondent a la vibe.

**Output** : `.tmp/landing-page-[slug].html`

---

### Phase 5 : Review

```bash
open .tmp/landing-page-[slug].html
```

Screenshot via Chrome DevTools pour verifier le rendu et ajuster.

---

## Les 6 Archetypes Design

Quand l'utilisateur n'a pas de reference, proposer ces 6 archetypes. **Chaque archetype a sa propre personnalite — ne JAMAIS mixer des elements qui ne vont pas ensemble.**

### Auto-selection par type de produit

```
Developer tool / devtools / API / B2B SaaS    → Cosmos Dark
Finance / enterprise / HR / marketplace        → Arctic Light
Infra / platform / hardware / AI model         → Vercel Minimal (voir ci-dessous)
Creative tool / collaboration / consumer app   → Midnight Gradient
Content / publishing / media / education       → Ivory Editorial
Indie hacker / solo maker / side project       → Neon Brutalist
Productivite / PM tool / "Linear-like"         → Nebula Glow
```

### Archetype 0 : "Vercel Minimal" (style Vercel/Apple/OpenAI)

**Vibe :** Noir absolu ou blanc absolu. Zéro décoration. La typographie EST le design. Headlines énormes (80-120px). Negative space extrême.

**Quand :** Infrastructure, plateforme, hardware, AI, tout produit qui veut dire "nous sommes sérieux".

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@300;400;500&display=swap');

:root {
  --bg: #000000;
  --bg-surface: #0A0A0A;
  --border: rgba(255,255,255,0.10);
  --border-hover: rgba(255,255,255,0.20);
  --divider: #222222;
  --text: #FFFFFF;
  --text-muted: #888888;
  --text-dim: #444444;
  --accent: #0070F3; /* un seul accent — bleu Vercel */
}
body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); }
```

**Style cards :**
```css
.card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; padding: 32px; }
.card:hover { border-color: var(--border-hover); /* Pas de lift, pas de glow */ }
```

**Style boutons :**
```css
.btn-primary { background: #FFFFFF; color: #000000; border: none; border-radius: 6px; padding: 10px 18px; font-weight: 500; }
.btn-primary:hover { background: #E0E0E0; }
.btn-secondary { background: transparent; color: #FFFFFF; border: 1px solid var(--border); border-radius: 6px; padding: 10px 18px; }
.btn-secondary:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.05); }
```

**Animations :** Extrêmement sobre. Opacity-only fade-in (400ms linear). Text reveal avec clip-path. Hover = changement de couleur seulement. Pas de bounce, pas de scale, pas de glow.

**Hero layout :** 100vh, fond noir, headline 80-120px weight 800 letter-spacing -0.04em centrée. Zéro décoration.

**Règle critique :** Ne JAMAIS ajouter de décoration. Un seul accent color max. La typo fait TOUT le travail.

---

### Archetype 1 : "Cosmos Dark" (style AuthKit/WorkOS)

**Vibe :** Noir profond avec lumieres cinematiques. Spotlights animes, grid lines subtiles, boutons glowing. Impressionnant et premium.

**Quand :** Produits tech, devtools, API, SaaS B2B high-end.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --bg: #05060f;
  --bg-card: #0d0e1a;
  --bg-card-hover: #141527;
  --border: rgba(186,215,247,0.08);
  --border-hover: rgba(186,215,247,0.15);
  --text: #ffffff;
  --text-muted: rgba(199,211,234,0.64);
  --text-dim: rgba(199,211,234,0.4);
  --accent: #663af3;
  --accent-secondary: #027dea;
  --glow: rgba(102,58,243,0.15);
  --line-color: rgba(186,215,247,0.12);
}
body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); }
```

**Style cards :**
```css
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; position: relative; overflow: hidden; }
.card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102,58,243,0.4) 30%, rgba(102,58,243,0.6) 50%, rgba(102,58,243,0.4) 70%, transparent); }
.card:hover { border-color: var(--border-hover); box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--glow); }
```

**Style boutons :**
```css
.btn-primary { background: var(--accent); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 20px; font-weight: 500; }
.btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%); pointer-events: none; }
.btn-primary:hover { box-shadow: 0 0 20px rgba(102,58,243,0.3), 0 0 60px rgba(102,58,243,0.1); transform: translateY(-1px); }
```

**Animations obligatoires :** Spotlight beams + Grid lines + Bouton glow animee + Scroll reveal avec stagger.

**Hero layout :** Centered, couches superposees (spotlights + grid + contenu).

**Règle critique :** Ne JAMAIS utiliser du noir pur (#000). Toujours near-black avec tinte bleue. Les borders sont l'élément structurel principal.

---

### Archetype 2 : "Nebula Glow" (style Linear/Raycast)

**Vibe :** Dark mode elegant avec glow radial subtil, glassmorphism, bento grid. Clean et sophistique.

**Quand :** SaaS productivite, outils dev, apps "premium feel".

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --bg: #09090b;
  --bg-card: rgba(255,255,255,0.03);
  --bg-card-hover: rgba(255,255,255,0.06);
  --border: rgba(255,255,255,0.06);
  --border-hover: rgba(255,255,255,0.12);
  --text: #fafafa;
  --text-muted: #a1a1aa;
  --accent: #8b5cf6;
  --accent-glow: rgba(139,92,246,0.15);
}
```

**Style cards :**
```css
.card { background: var(--bg-card); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
.card:hover { border-color: var(--border-hover); box-shadow: 0 0 0 1px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.4); }
```

**Style boutons :**
```css
.btn-primary { background: var(--accent); color: #fff; border: none; border-radius: 12px; padding: 12px 24px; font-weight: 600; }
.btn-primary:hover { box-shadow: 0 0 20px var(--accent-glow), 0 4px 12px var(--accent-glow); transform: translateY(-1px); }
.btn-secondary { background: transparent; color: var(--text-muted); border: 1px solid var(--border); border-radius: 12px; padding: 12px 24px; }
```

**Animations obligatoires :** Radial glow hero (anime lentement) + Cards glassmorphism hover glow + Gradient text headline + Scroll reveal smooth.

**Hero layout :** Centered, max-width 800px, gradient text.

**Règle critique :** Toujours utiliser `backdrop-filter: blur()` sur les cards. Ne jamais omettre le système de borders — c'est l'élément structurel clé.

---

### Archetype 3 : "Arctic Light" (style Stripe/Notion)

**Vibe :** Light, airy, beaucoup d'espace blanc. Gradients pastels subtils, illustrations, ombres douces. Professionnel et accueillant.

**Quand :** Fintech, marketplace, SaaS grand public, B2B accessible.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --bg: #ffffff;
  --bg-card: #f8fafc;
  --bg-card-hover: #f1f5f9;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-muted: #64748b;
  --accent: #6366f1;
  --accent-light: #818cf8;
  --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05);
}
body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); }
```

**Style cards :**
```css
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; box-shadow: var(--shadow-md); }
.card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }
.card .icon-wrap { width: 48px; height: 48px; border-radius: 14px; background: var(--gradient-1); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }
```

**Style boutons :**
```css
.btn-primary { background: linear-gradient(180deg, var(--accent-light) 0%, var(--accent) 100%); color: #fff; border: none; border-radius: 9999px; padding: 12px 24px; font-weight: 600; box-shadow: 0 2px 8px rgba(99,102,241,0.30); }
.btn-primary:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.40); transform: translateY(-1px); filter: brightness(1.05); }
.btn-secondary { background: white; color: var(--text); border: 1px solid var(--border); border-radius: 9999px; padding: 12px 24px; box-shadow: var(--shadow-sm); }
```

**Animations :** Ombres qui s'intensifient au hover, gradients subtils en arriere-plan, transitions douces. Pas de glow ni glassmorphism.

**Hero layout :** Split (texte gauche, illustration/produit droite) ou centered avec gradient bg section.

**Règle critique :** Toujours utiliser des boutons pill (border-radius: 9999px). Ne jamais avoir de fond plat sans breathing room. Les ombres (drop shadow) font tout le travail, pas les borders.

---

### Archetype 4 : "Midnight Gradient" (style Figma/Discord)

**Vibe :** Fond sombre avec gradients vibrants et colores. Energique, dynamique, bold. Mesh gradients, couleurs saturees.

**Quand :** Outils creatifs, communautes, produits consumer, apps sociales.

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --bg: #0a0a0f;
  --bg-card: rgba(255,255,255,0.05);
  --border: rgba(255,255,255,0.08);
  --text: #ffffff;
  --text-muted: #94a3b8;
  --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  --gradient-accent: linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4);
  --gradient-warm: linear-gradient(135deg, #f97316, #ef4444, #ec4899);
}
body { font-family: 'Space Grotesk', system-ui, sans-serif; }
```

**Style cards :**
```css
.card { border-radius: 24px; padding: 32px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
.card-purple { background: linear-gradient(135deg, #1E1040 0%, #2D1472 100%); }
.card-blue { background: linear-gradient(135deg, #0D2040 0%, #1040A0 100%); }
.card-green { background: linear-gradient(135deg, #1A2C10 0%, #2A5C1C 100%); }
/* Noise texture overlay */
.card::after { content: ''; position: absolute; inset: 0; opacity: 0.06; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); }
```

**Style boutons :**
```css
.btn-primary { background: var(--gradient-hero); color: white; border: none; border-radius: 9999px; padding: 12px 28px; font-weight: 700; box-shadow: 0 0 20px rgba(123,97,255,0.5), 0 4px 12px rgba(123,97,255,0.3); position: relative; overflow: hidden; }
.btn-primary:hover { transform: scale(1.03) translateY(-1px); box-shadow: 0 0 30px rgba(123,97,255,0.6), 0 8px 24px rgba(123,97,255,0.3); }
/* Shimmer on hover */
.btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%); transform: translateX(-100%); transition: transform 0.4s; }
.btn-primary:hover::after { transform: translateX(100%); }
```

**Animations :** Mesh gradient anime en arriere-plan + text reveal avec gradient + hover effects colores + spring physics `cubic-bezier(0.34,1.56,0.64,1)`. Bold et expressif.

**Hero layout :** Centered avec gradient mesh anime derriere le texte.

**Règle critique :** Ne JAMAIS utiliser de fond plat solid pour les cards. Mesh gradients obligatoires. Chaque card a sa propre couleur de gradient.

---

### Archetype 5 : "Ivory Editorial" (style Substack/Medium premium)

**Vibe :** Magazine numerique. Serif pour les titres, grille classique, photographie editoriale. Sophistique et lettré.

**Quand :** Media, content platforms, produits culture/education, luxe tech.

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;500;600&display=swap');

:root {
  --bg: #faf8f5;
  --bg-card: #ffffff;
  --border: #e8e4df;
  --text: #1a1a1a;
  --text-muted: #6b6b6b;
  --accent: #c9553d;
  --accent-dark: #a03d28;
}
body { font-family: 'Source Sans 3', Georgia, serif; }
h1, h2, h3 { font-family: 'Playfair Display', Georgia, serif; }
```

**Style cards :**
```css
.card { background: transparent; border-top: 2px solid var(--text); padding: 32px 0; /* Pas de border-radius, pas de shadow */ }
.card-category { font-family: 'Source Sans 3', sans-serif; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
.card-headline { font-family: 'Playfair Display', Georgia, serif; font-size: 1.625rem; font-weight: 700; line-height: 1.3; color: var(--text); }
.pull-quote { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 1.875rem; line-height: 1.3; border-left: 4px solid var(--accent); padding-left: 32px; margin: 48px 0; }
```

**Style boutons :**
```css
.btn-primary { background: var(--text); color: var(--bg); border: 2px solid var(--text); border-radius: 0; padding: 12px 24px; font-family: 'Source Sans 3', sans-serif; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.btn-primary:hover { background: var(--accent); border-color: var(--accent); color: white; }
.btn-secondary { background: transparent; color: var(--text); border: 2px solid var(--text); border-radius: 0; padding: 12px 24px; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.btn-secondary:hover { background: var(--text); color: var(--bg); }
```

**Animations :** Minimales et elegantes. Fade-in au scroll (opacity seul, 600ms). Transitions lentes (0.5s+). Hover sur liens : underline slide de gauche. Pas de glow, pas de gradient, pas de scale.

**Hero layout :** Editorial asymetrique ou pleine largeur avec grande typo serif.

**Règle critique :** Ne JAMAIS utiliser de sans-serif pour les headlines. Border-radius carré uniquement. Pas d'ombres décoratives. La typo fait TOUT le travail.

---

### Archetype 6 : "Neon Brutalist" (style indie/Gumroad)

**Vibe :** Anti-corporate. Bordures visibles, typo bold/raw, couleurs fluo, pas d'arrondi. Honnete et direct.

**Quand :** Indie hackers, side projects, tools no-bullshit, creators.

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;700&display=swap');

:root {
  --bg: #fffdf7;
  --bg-card: #ffffff;
  --border: #1a1a1a;
  --text: #1a1a1a;
  --text-muted: #555555;
  --accent: #ff6b35;
  --accent-alt: #ffd700;
  --neon: #00ff88;
}
body { font-family: 'Space Grotesk', monospace; }
code, .mono { font-family: 'Space Mono', monospace; }
* { border-radius: 0 !important; } /* NO border-radius */
```

**Style cards :**
```css
.card { background: #fff; border: 3px solid #1a1a1a; border-radius: 0; padding: 24px; box-shadow: 5px 5px 0px #1a1a1a; transition: transform 80ms linear, box-shadow 80ms linear; }
.card:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0px #1a1a1a; }
.card-yellow { background: #ffd700; border: 3px solid #1a1a1a; box-shadow: 5px 5px 0px #1a1a1a; }
.card-red { background: #ff6b35; color: white; border: 3px solid #1a1a1a; box-shadow: 5px 5px 0px #1a1a1a; }
```

**Style boutons :**
```css
.btn-primary { background: var(--accent); color: white; border: 3px solid #1a1a1a; border-radius: 0; padding: 12px 24px; font-weight: 700; text-transform: uppercase; box-shadow: 3px 3px 0px #1a1a1a; }
.btn-primary:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0px #1a1a1a; }
.btn-primary:active { transform: translate(2px, 2px); box-shadow: none; }
.btn-yellow { background: #ffd700; color: #1a1a1a; border: 3px solid #1a1a1a; border-radius: 0; padding: 14px 28px; font-weight: 700; font-size: 1.125rem; box-shadow: 5px 5px 0px #1a1a1a; }
```

**Animations :** Hover brut — `translate(-2px,-2px)` + shadow plus grand. Active = `translate(2px,2px)` + shadow disparait (press-down). Pas de transition lente, pas de glow, pas de fade. Immédiat. Si animation : overshoot `cubic-bezier(0.34,1.56,0.64,1)`.

**Hero layout :** Asymetrique, gros texte, pas de glow, beaucoup de contraste. Prix affiché directement.

**Règle critique :** Ne JAMAIS utiliser `box-shadow: 0 4px 12px rgba(...)`. Uniquement des hard offset shadows (`5px 5px 0px #1a1a1a`). Border-radius: 0 partout. Borders épaisses (3px) et visibles.

---

## Bibliotheque d'Animations et Interactions

**Choisir 3-5 techniques par landing page** en fonction de l'archetype et de la reference. Ne JAMAIS tout utiliser en meme temps.

### 1. Spotlight Beams (Cosmos Dark)

Faisceaux de lumiere animés comme sur AuthKit :

```css
.spotlight-container {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
}
.spotlight {
  position: absolute; width: 200px; height: 700px;
  background: conic-gradient(at 50% -5%, transparent 45%, rgba(124,145,182,0.3) 49%, rgba(124,145,182,0.5) 50%, rgba(124,145,182,0.3) 51%, transparent 55%);
  filter: blur(15px); opacity: 0;
  animation: spotlight-opacity 6s ease-in-out infinite, spotlight-scale 8.5s ease-in-out infinite;
}
.spotlight:nth-child(2) { animation-duration: 9.6s, 13.6s; animation-delay: 2s; left: 30%; }
.spotlight:nth-child(3) { animation-duration: 4.8s, 6.8s; animation-delay: 4s; left: 60%; }

@keyframes spotlight-opacity {
  0%, 100% { opacity: 0; }
  30%, 70% { opacity: 0.6; }
}
@keyframes spotlight-scale {
  0%, 100% { transform: scaleX(1) rotate(-15deg); }
  50% { transform: scaleX(1.5) rotate(15deg); }
}
```

```html
<div class="spotlight-container">
  <div class="spotlight" style="left:10%"></div>
  <div class="spotlight" style="left:40%"></div>
  <div class="spotlight" style="left:70%"></div>
</div>
```

### 2. Grid Lines (Cosmos Dark)

Grille structurelle subtile comme AuthKit :

```css
.grid-lines {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
}
.grid-h-line {
  width: 100%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--line-color, rgba(186,215,247,0.12)), transparent);
}
.grid-v-lines {
  position: absolute; inset: 0;
  display: grid; grid-template-columns: repeat(5, 1fr);
}
.grid-v-line {
  width: 1px; height: 100%;
  background: linear-gradient(to bottom, var(--line-color, rgba(186,215,247,0.12)) 80%, transparent);
  justify-self: center;
}
```

### 3. Glowing Button Border

Bouton avec border animee qui tourne :

```css
@property --btn-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.btn-glow {
  position: relative; padding: 14px 32px;
  background: var(--bg-card); color: var(--text); border: none; border-radius: 12px;
  font-weight: 600; cursor: pointer; z-index: 1;
}
.btn-glow::before {
  content: ''; position: absolute; inset: -1px; border-radius: 13px; z-index: -1;
  background: conic-gradient(from var(--btn-angle), transparent 30%, var(--accent) 50%, transparent 70%);
  animation: btn-rotate 4s linear infinite;
}
.btn-glow::after {
  content: ''; position: absolute; inset: 1px; border-radius: 11px;
  background: var(--bg-card); z-index: -1;
}
@keyframes btn-rotate { 100% { --btn-angle: 360deg; } }
```

### 4. 3D Card Tilt on Hover

Cards qui s'inclinent avec la souris (perspective 3D) :

```css
.tilt-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px;
  padding: 32px; transition: transform 0.15s ease, box-shadow 0.15s ease;
  transform-style: preserve-3d; will-change: transform;
}
.tilt-card:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
```

```javascript
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8;
    const rotateY = (x - centerX) / centerX * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  });
});
```

### 5. Card Cursor Spotlight

Effet spotlight qui suit le curseur sur les cards :

```css
.spotlight-card {
  position: relative; overflow: hidden;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 32px;
}
.spotlight-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139,92,246,0.1), transparent 60%);
  opacity: 0; transition: opacity 0.3s;
  pointer-events: none;
}
.spotlight-card:hover::before { opacity: 1; }
```

```javascript
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
});
```

### 6. Animated Gradient Border

Border avec gradient conic qui tourne :

```css
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.gradient-border-card {
  position: relative; padding: 32px; border-radius: 16px;
  background: var(--bg-card);
}
.gradient-border-card::before {
  content: ''; position: absolute; inset: 0; border-radius: 16px; padding: 1px;
  background: conic-gradient(from var(--border-angle), transparent 40%, var(--accent) 50%, transparent 60%);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude; -webkit-mask-composite: xor;
  animation: border-spin 6s linear infinite;
}
@keyframes border-spin { 100% { --border-angle: 360deg; } }
```

### 7. Text Reveal (Word by Word)

```css
.text-reveal span {
  display: inline-block; opacity: 0; transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.text-reveal.visible span { opacity: 1; transform: translateY(0); }
```

```javascript
// Split text into words and wrap each in a span
document.querySelectorAll('.text-reveal').forEach(el => {
  const words = el.textContent.split(' ');
  el.innerHTML = words.map((w, i) =>
    `<span style="transition-delay:${i * 0.06}s">${w} </span>`
  ).join('');
});
```

### 8. Gradient Text Anime

Headline avec gradient qui se deplace :

```css
.gradient-text-anim {
  background: linear-gradient(90deg, var(--text), var(--accent), var(--text));
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: gradient-shift 4s ease-in-out infinite;
}
@keyframes gradient-shift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}
```

### 9. Text Shimmer / Shine

Effet brillance qui passe sur le texte :

```css
.text-shimmer {
  background: linear-gradient(110deg, var(--text) 35%, rgba(255,255,255,0.8) 50%, var(--text) 65%);
  background-size: 250% 100%;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 3s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
```

### 10. Mesh Gradient Anime (Midnight Gradient)

```css
.mesh-gradient {
  position: absolute; inset: 0; z-index: 0; overflow: hidden;
}
.mesh-gradient::before {
  content: ''; position: absolute; width: 150%; height: 150%; top: -25%; left: -25%;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(37,99,235,0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.2) 0%, transparent 50%);
  animation: mesh-move 12s ease-in-out infinite;
}
@keyframes mesh-move {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(5%, -5%) rotate(3deg); }
  66% { transform: translate(-3%, 3%) rotate(-2deg); }
}
```

### 11. Aurora Background

```css
.aurora {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
}
.aurora::before, .aurora::after {
  content: ''; position: absolute; width: 60%; height: 60%;
  border-radius: 50%; filter: blur(80px); opacity: 0.3;
}
.aurora::before {
  background: var(--accent); top: -20%; left: -10%;
  animation: aurora-1 8s ease-in-out infinite;
}
.aurora::after {
  background: var(--accent-secondary, #06b6d4); bottom: -20%; right: -10%;
  animation: aurora-2 10s ease-in-out infinite;
}
@keyframes aurora-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30%, 20%) scale(1.2); }
}
@keyframes aurora-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20%, -30%) scale(1.3); }
}
```

### 12. Scroll Reveal avec Stagger

```css
.reveal {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
```

```javascript
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // Stagger children if they have data-delay
      const children = e.target.querySelectorAll('[data-delay]');
      if (children.length) {
        children.forEach(child => {
          setTimeout(() => child.classList.add('visible'), parseInt(child.dataset.delay));
        });
      }
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
```

### 13. Parallax Layers

```javascript
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
}, { passive: true });
```

```html
<div data-parallax="-0.1" class="hero-glow">...</div>
<div data-parallax="-0.05" class="hero-grid">...</div>
<div data-parallax="0" class="hero-content">...</div>
```

### 14. Floating Nav (slide up/down on scroll)

```css
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 12px 0;
  background: rgba(var(--bg-rgb, 5,6,15), 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid transparent;
  transition: transform 0.3s, border-color 0.3s, background 0.3s;
}
.nav.hidden { transform: translateY(-100%); }
.nav.scrolled { border-bottom-color: var(--border); background: rgba(var(--bg-rgb, 5,6,15), 0.85); }
```

```javascript
let lastScroll = 0;
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('hidden', y > lastScroll && y > 80);
  nav.classList.toggle('scrolled', y > 40);
  lastScroll = y;
}, { passive: true });
```

### 15. Counter Animation (nombre qui monte)

```javascript
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Trigger on scroll
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.count);
      animateCounter(e.target, target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
```

```html
<span data-count="2400">0</span>
```

### 16. Magnetic Button Effect

```javascript
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
    btn.style.transition = 'transform 0.3s ease';
    setTimeout(() => btn.style.transition = '', 300);
  });
});
```

### 17. FAQ Accordion Smooth

```javascript
document.querySelectorAll('.faq-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const content = item.querySelector('.faq-content');
    const isOpen = item.classList.contains('open');

    // Close all others
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-content').style.maxHeight = '0';
      }
    });

    if (!isOpen) {
      item.classList.add('open');
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      item.classList.remove('open');
      content.style.maxHeight = '0';
    }
  });
});
```

```css
.faq-content {
  max-height: 0; overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-item.open .faq-icon { transform: rotate(45deg); }
.faq-icon { transition: transform 0.3s; }
```

---

## Layout Patterns

**Ne PAS toujours faire du centered.** Varier les layouts selon l'archetype et le contenu.

### Layout A : Centered Hero (default)
```
[NAV] full-width
[HERO] centered, max-width 800px, big headline
[...sections] contained max-width 1100px
```

### Layout B : Split Hero (Arctic Light, produits avec screenshot)
```
[NAV] full-width
[HERO] grid 2 colonnes — texte a gauche, produit/screenshot a droite
[...sections] alternent full-bleed et contained
```

```css
.hero-split {
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
  align-items: center; min-height: 90vh; padding: 0 40px;
}
@media (max-width: 768px) {
  .hero-split { grid-template-columns: 1fr; gap: 40px; text-align: center; }
}
```

### Layout C : Full-bleed Cinematic (Cosmos Dark, impact fort)
```
[NAV] floating over content
[HERO] full viewport height, centered content, animated background
[...sections] full-bleed backgrounds alternants
```

### Layout D : Asymmetric Editorial (Ivory Editorial)
```
[NAV] minimal, texte only
[HERO] grande typo, pas centree, offset a gauche
[...sections] grille 2/3 - 1/3, avec images et texte
```

### Layout E : Bento Dashboard (Nebula Glow, features-heavy)
```
[NAV] compact
[HERO] compact (pas full-viewport)
[BENTO GRID] 12 colonnes avec cards de tailles variees
[...sections]
```

---

## Les 4 Types de CTA

### Type 1 : Waitlist (pre-launch)
**Structure page :**
```
[NAV] Logo + "Join Waitlist"
[HERO] Vision headline + CTA waitlist + trust signal
[PROBLEM] 3 douleurs
[VISION/TEASER] Mockup ou description de ce qui vient
[FOUNDER] Photo/bio + pourquoi tu build ca
[EARLY ADOPTER HOOK] "Les 100 premiers recoivent..."
[FAQ] 5 objections
[FINAL CTA] Repeat waitlist
```

**Backend Tally (gratuit illimite) :**
```html
<iframe data-tally-src="https://tally.so/embed/FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1"
  loading="lazy" width="100%" height="200" frameborder="0"></iframe>
<script>var d=document,w="https://tally.so/widgets/embed.js";
if(typeof Tally!=="undefined"){Tally.loadEmbeds();}else{var s=d.createElement("script");
s.src=w;s.onload=function(){Tally.loadEmbeds()};d.body.appendChild(s)}</script>
```

**Backend Formspree (50/mois gratuit) :**
```html
<form id="waitlist-form">
  <input type="email" name="email" placeholder="ton@email.com" required />
  <button type="submit">Rejoindre la waitlist</button>
</form>
<script>
document.getElementById('waitlist-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent; btn.textContent = 'Envoi...'; btn.disabled = true;
  try {
    const res = await fetch('https://formspree.io/f/FORM_ID', {
      method:'POST', body: new FormData(e.target), headers:{'Accept':'application/json'}
    });
    if(res.ok) { btn.textContent = 'Inscrit ✓'; e.target.querySelector('input').style.display='none'; }
    else throw 0;
  } catch { btn.textContent = orig; btn.disabled = false; }
});
</script>
```

**Backend Supabase (own your data + referral) :**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const sb = supabase.createClient('https://PROJECT.supabase.co','ANON_KEY');
const refCode = new URLSearchParams(window.location.search).get('ref');
async function joinWaitlist(email) {
  const myCode = Math.random().toString(36).substr(2,8).toUpperCase();
  const {error} = await sb.from('waitlist').insert({
    email, referral_code: myCode, referred_by: refCode||null
  });
  if(error?.code==='23505') return showMsg('Deja inscrit !');
  if(error) return showMsg('Erreur, reessaie.');
  showSuccess(myCode);
}
</script>
```

### Type 2 : Demo Call (B2B, high-ticket)
**Structure :** Hero + Logo bar + Problem + Demo video + Testimonials + Calendly embed + FAQ

**Calendly :**
```html
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
<div class="calendly-inline-widget" data-url="https://calendly.com/USERNAME/30min?hide_gdpr_banner=1" style="min-width:320px;height:630px;"></div>
```

**Cal.com :**
```html
<script>
(function(C,A,L){let p=function(a,ar){a.q.push(ar)};let d=C.document;
C.Cal=C.Cal||function(){let cal=C.Cal;let ar=arguments;
if(!cal.loaded){cal.ns={};cal.q=cal.q||[];
d.head.appendChild(d.createElement("script")).src=A;cal.loaded=true}
if(ar[0]===L){const api=function(){p(api,arguments)};const namespace=ar[1];
api.q=api.q||[];typeof namespace==="string"?(cal.ns[namespace]=api)&&p(api,ar):p(cal,ar);return}
p(cal,ar)};
})(window,"https://app.cal.com/embed/embed.js","init");
Cal("init",{origin:"https://app.cal.com"});
Cal("inline",{elementOrSelector:"#cal-embed",calLink:"USERNAME/demo",layout:"month_view"});
</script>
<div id="cal-embed"></div>
```

### Type 3 : Pre-Sale / Founding Member
**Structure :** Hero avec scarcity + Problem quantifie + Founding member offer + Pricing comparison + Countdown + FAQ

**Stripe Buy Button :**
```html
<script async src="https://js.stripe.com/v3/buy-button.js"></script>
<stripe-buy-button buy-button-id="buy_btn_XXXXXXXX" publishable-key="pk_live_XXXXXXXX"></stripe-buy-button>
```

**Lemon Squeezy :**
```html
<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
<a class="lemonsqueezy-button" href="https://STORE.lemonsqueezy.com/checkout/buy/PRODUCT_ID">
  Devenir Founding Member — 49eur
</a>
```

### Type 4 : Free Trial / Signup (post-launch, PLG)
**Structure :** Hero + Logo bar + Before/After + Features bento + Social proof + Pricing tiers + FAQ

---

## Copy : Les Formules qui Convertissent

### Headline Hero (formule YC)
```
[Resultat specifique] pour [ICP] sans [frustration principale]
```

**Anti-patterns BANNIS :**
- "The future of X" ❌
- "Next-generation AI-powered platform" ❌
- "Unlock growth" ❌
- "We power the world's teams" ❌

### CTA Button Text
| Type | Bon | Mauvais |
|------|-----|---------|
| Waitlist | "Rejoindre la waitlist" | "Submit" |
| Demo | "Voir la demo en 15 min" | "Book a demo" |
| Pre-sale | "Devenir Founding Member — 49€" | "Buy now" |
| Trial | "Essayer gratuitement" | "Sign up" |

### Social Proof quand tu n'as RIEN
| Situation | Strategie |
|-----------|-----------|
| 0 client | Founder bio + "Building in public" |
| Beta users | Quotes avec metriques |
| Waitlist only | "2,400 founders sur la waitlist" |
| Accelerateur | Badge YC / Techstars / Station F |
| Rien | Quantifie le PROBLEME ("$47B perdus/an") |

---

## SEO & Performance

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[Startup] — [Headline courte]</title>
<meta name="description" content="[Copy hero, max 155 chars]">
<meta property="og:title" content="[Titre]">
<meta property="og:description" content="[Description]">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>[EMOJI]</text></svg>">
```

---

## Checklist Pre-Deploy

- [ ] Test des 5 secondes : headline claire, CTA visible, pour qui = evident
- [ ] 1 seul CTA primaire (repete 2-3 fois max)
- [ ] Mobile responsive (375px et 768px)
- [ ] Formulaire fonctionnel (tester la soumission)
- [ ] Page de confirmation apres soumission
- [ ] Meta tags SEO + OG
- [ ] Favicon
- [ ] Load time < 3 secondes
- [ ] Copy : focus "tu/you", pas "we/nous"
- [ ] CTA button : verbe + resultat
- [ ] Animations fluides (pas de saccade sur mobile)
- [ ] Design UNIQUE — ne ressemble PAS aux 5 dernieres pages generees
