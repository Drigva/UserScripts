// ==UserScript==
// @name         Redirecionador Reddit para Redveal
// @namespace    local
// @version      1.3
// @description  Abre o perfil do Reddit no Redveal
// @author       Drigva
// @icon         https://redveal.com/favicon.ico
// @match        *://*.reddit.com/user/*
// @match        *://*.reddit.com/u/*
// @grant        none
// @run-at       document-idle
// @license      MIT
//
// @homepageURL  https://github.com/Drigva/UserScripts/Redveal-Redirect
// @downloadURL  https://raw.githubusercontent.com/Drigva/UserScripts/main/Redveal-Redirect/Reddit-to-Redveal-Redirect.user.js
// @updateURL    https://raw.githubusercontent.com/Drigva/UserScripts/main/Redveal-Redirect/Reddit-to-Redveal-Redirect.user.js
// ==/UserScript==

(() => {
    'use strict';

    const ID = 'redveal-icon-link';
    const FAVICON = 'https://redveal.com/favicon.ico';

    function atualizar() {
        const match = location.pathname.match(/^\/(?:user|u)\/([^/]+)/i);
        const titulo = document.querySelector('h1');

        if (!match || !titulo) {
            document.getElementById(ID)?.remove();
            return;
        }

        let usuario;
        try {
            usuario = decodeURIComponent(match[1]);
        } catch {
            usuario = match[1];
        }

        let link = document.getElementById(ID);

        if (!link) {
            link = document.createElement('a');
            link.id = ID;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = 'Abrir perfil no Redveal';
            link.setAttribute('aria-label', 'Abrir perfil no Redveal');

            const icone = document.createElement('img');
            icone.src = FAVICON;
            icone.alt = '';
            icone.width = 18;
            icone.height = 18;

            link.appendChild(icone);

            const estilo = document.createElement('style');
            estilo.textContent = `
                #${ID} {
                    display: inline-flex;
                    vertical-align: middle;
                    margin-left: 8px;
                    opacity: .75;
                }
                #${ID}:hover { opacity: 1; }
                #${ID} img { display: block; }
            `;
            document.head.appendChild(estilo);
        }

        link.href = `https://redveal.com/user/${encodeURIComponent(usuario)}`;

        if (link.previousElementSibling !== titulo) {
            titulo.insertAdjacentElement('afterend', link);
        }
    }

    new MutationObserver(atualizar).observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    window.addEventListener('popstate', atualizar);
    atualizar();
})();
