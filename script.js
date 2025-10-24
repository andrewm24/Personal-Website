// Simple enhancements: navigation toggle and language list rendering.
(function () {
  const languageData = [
    { name: 'Russian', description: 'Native fluency across technical and conversational contexts.', level: 'native', progress: 100 },
    { name: 'Spanish', description: 'Comfortable collaborating and presenting on engineering topics.', level: 'intermediate', progress: 70 },
    { name: 'French', description: 'Confident holding technical discussions and documenting findings.', level: 'intermediate', progress: 70 },
    { name: 'Mandarin Chinese', description: 'Developing proficiency (HSK 2) with focus on engineering vocabulary.', level: 'beginner', progress: 35 }
  ];

  const levelLabels = {
    native: 'Native',
    intermediate: 'Intermediate',
    beginner: 'Beginner'
  };

  const listRoot = document.querySelector('[data-language-list]');
  if (listRoot) {
    listRoot.innerHTML = languageData
      .map((language) => {
        const badgeClass = `badge badge--${language.level}`;
        const progressValue = Math.max(0, Math.min(100, language.progress));
        return `
          <article class="language-card" tabindex="0">
            <h3>${language.name}</h3>
            <p>${language.description}</p>
            <span class="${badgeClass}">${levelLabels[language.level] || language.level}</span>
            <progress value="${progressValue}" max="100">${progressValue}%</progress>
          </article>
        `;
      })
      .join('');
  }

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (navToggle && nav) {
    const toggleNav = () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.setAttribute('aria-expanded', String(!expanded));
    };

    navToggle.addEventListener('click', toggleNav);
  }
})();
