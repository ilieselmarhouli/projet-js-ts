# MyBourse

Application web en TypeScript qui permet de visualiser et comparer l'evolution de deux actions boursieres a partir d'une API REST, avec un graphique interactif et une interface manipulee via le DOM.

## Prerequis

- Node.js
- npm

## Installation

Ouvrir un terminal dans le dossier du projet puis lancer : `npm install`

## Lancement

1. Compiler le projet avec `npm run build`
2. Lancer le serveur local avec `npm run serve`
3. Ouvrir dans le navigateur l'URL affichee dans le terminal

## Scripts disponibles

- `npm run build` : compile le TypeScript dans le dossier `dist`
- `npm run watch` : recompile automatiquement a chaque modification
- `npm run serve` : lance un serveur local pour ouvrir l'application

## Fonctionnalites

- Recuperation des donnees via `fetch` et `async/await`
- Validation des donnees recues depuis l'API
- Comparaison de deux actions boursieres
- Choix de la periode : 7 jours, 1 mois, 3 mois, tout
- Changement du type de graphique : ligne ou barres
- Gestion des erreurs reseau, API, donnees invalides et erreurs utilisateur
- Interface generee et mise a jour dynamiquement via le DOM

## Structure du projet

- `src/models` : types et interfaces
- `src/api` : recuperation et validation des donnees
- `src/charts` : logique du graphique
- `src/ui` : interface et manipulation du DOM
- `src/utils` : fonctions utilitaires
- `dist` : version JavaScript compilee

## Choix techniques

- TypeScript avec typage strict
- Chart.js pour le graphique
- Modules ES natifs
- Architecture separee par responsabilites

## API utilisee

`https://keligmartin.github.io/api/stocks.json`

