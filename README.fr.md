# Meridian Drift Observatory · poste de contrôle DEMO

Langues : [English](README.md) · [Русский](README.ru.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Deutsch](README.de.md) · [Українська](README.uk.md)

**Tous les soldes, chandeliers, ordres et exécutions sont des données synthétiques DEMO.** Il s'agit d'une démonstration interactive, pas d'une application de trading, d'un backtest ou d'une preuve de rendement réel.

## Démarrage

Node.js 22+ et npm sont requis. Aucune dépendance tierce.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start
```

Ouvrez `http://localhost:4173`, puis arrêtez avec Ctrl+C. Autre port local : `PORT=4174 npm start`. Le serveur écoute uniquement sur loopback. Aucune inscription, mot de passe, clé API, compte ni fichier d'environnement. `name` et `YOUR_ACCOUNT_ID` sont des exemples.

## Parcours

1. Commencez avec READY et un prix synthétique de 100 UNIT.
2. Placez un BUY à cours limité 99, quantité 1.
3. « Следующий mock-шаг » fait passer le prix à 99, le solde à 9901 UNIT et la position à 1 DEMO : exécution simulée.
4. Placez un SELL à 101. Deux étapes donnent 98 puis 101, avec exécution simulée du SELL.
5. « Отменить mock-заявки » annule les ordres, sans fermer la position.
6. Avec STALE ou UNAVAILABLE, étapes, ordres et annulations échouent explicitement. READY permet de reprendre; « Сбросить демо » réinitialise tout.

Cinq pages sont disponibles : accueil, systèmes, opérations, événements et compte. L'état reste en mémoire dans l'onglet; un rechargement le réinitialise. Le modèle se limite à un cycle de prix fixe, des ordres fictifs et un journal. Aucun ordre réel, requête de marché, signature, clé de trading, portefeuille de trading, mode live ou calcul de rendement.

## Dons et portée

L'accueil prévoit un message en EN/RU/IT/FR/ES et l'adresse publique du propriétaire. Tant qu'aucun lien n'est configuré, la page indique clairement qu'un don ne peut pas y être envoyé. Une fois configuré, le lien ouvre un service externe; ce projet ne traite aucun paiement. Seuls les devises, cryptomonnaies, moyens et réseaux pris en charge par ce service sont disponibles. Vérifiez-les avant l'envoi.

Le concept Meridian Drift est un texte du projet source, sans maquette visuelle. La palette et la disposition adaptent le Control Room existant. Le projet possède un historique Git neuf, sans données privées ni services de production.

`npm run build` exporte sept fichiers autorisés vers `dist/`. `npm run scan` inspecte les fichiers, la construction, les métadonnées et tous les objets Git; seules la catégorie et la localisation des résultats s'affichent. Pour un hébergement statique, conservez les en-têtes de `scripts/serve.mjs` et redirigez les cinq routes vers `index.html`.

Voir [NOTICE.md](NOTICE.md) pour les droits. Le propriétaire a autorisé la démonstration publique; aucune licence libre n'a été accordée.
