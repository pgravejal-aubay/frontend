// frontend/constants/policyContent.js

// L'objet centralise les textes légaux sous forme de contenu structuré.
// Chaque élément du tableau "content" a un "type" qui déterminera son style.

export const policyContent = {
  'Politique de confidentialité': {
    title: 'Politique de Confidentialité',
    content: [
      { type: 'metadata', text: 'Dernière mise à jour : Juin 2025' },
      { type: 'paragraph', text: "La protection de votre vie privée est la priorité absolue pour l'équipe de Hands Up. Cette politique de confidentialité détaille avec transparence la manière dont nous collectons, utilisons, partageons et protégeons vos données." },
      { type: 'subtitle', text: '1. Responsable du Traitement et DPO' },
      {
        type: 'rich_text',
        content: [
          { text: 'Le responsable du traitement de vos données est la société ', style: 'normal' },
          { text: 'Les Mains Agiles SAS', style: 'bold' },
          { text: '.\n', style: 'normal' },
          { text: 'Adresse', style: 'bold' },
          { text: ' : 159 Rue de Silly, 92100 Boulogne-Billancourt, France\n', style: 'normal' },
          { text: 'Email', style: 'bold' },
          { text: ' : contact@lesmainsagiles.app', style: 'normal' },
        ],
      },
      {
        type: 'rich_text',
        content: [
          { text: "Notre Délégué à la Protection des Données (DPO), Mme. Cléa Donnée, est votre point de contact dédié pour toute question relative à vos données personnelles. Vous pouvez la joindre à l'adresse ", style: 'normal' },
          { text: 'dpo@lesmainsagiles.app', style: 'bold' },
          { text: '.', style: 'normal' },
        ],
      },
      { type: 'subtitle', text: '2. Données collectées et Finalités' },
      { type: 'paragraph', text: "Nous collectons uniquement les données strictement nécessaires à la fourniture et à l'amélioration de nos services." },
      { type: 'definition_item', term: 'Accès à la caméra et flux vidéo', definition: "Indispensable pour la traduction. Ce flux est traité en temps réel dans la mémoire vive de votre appareil. Il n'est JAMAIS stocké, enregistré ou transmis à nos serveurs. Il est définitivement effacé dès que la traduction est générée." },
      { type: 'definition_item', term: 'Données de compte', definition: "Pour créer un compte, nous collectons une adresse e-mail et un mot de passe (chiffré de manière irréversible via un algorithme de hachage salé) sont requis pour la création de votre compte." },
      { type: 'definition_item', term: 'Historique des traductions', definition: "Si vous êtes connecté, nous sauvegardons le texte et l'audio générés (mais jamais la vidéo source) pour que vous puissiez les retrouver. Vous avez le contrôle total sur cet historique et pouvez le supprimer à tout moment depuis l'application." },
      { type: 'definition_item', term: 'Données techniques et de diagnostic', definition: "De manière anonyme, nous collectons des rapports de crash et des données de performance (ex: temps de traduction) pour identifier les bugs et optimiser l'application. Ces données ne permettent pas de vous identifier." },
      { type: 'subtitle', text: '3. Base Légale du Traitement (RGPD)' },
      { type: 'paragraph', text: "Chaque traitement de données que nous effectuons repose sur une base légale valide, conformément au Règlement Général sur la Protection des Données (RGPD)." },
      { type: 'definition_item', term: 'Exécution du contrat (Art. 6.1.b)', definition: "Nous traitons les données indispensables pour fournir les services auxquels vous souscrivez en créant un compte. Cela inclut la gestion de votre login, le stockage de votre historique et la maintenance de votre compte." },
      { type: 'definition_item', term: 'Intérêt légitime (Art. 6.1.f)', definition: "Nous traitons certaines données pour des finalités qui sont dans notre intérêt légitime, tout en respectant vos droits et libertés. Cela concerne la sécurité de nos systèmes, l'analyse anonyme des performances pour améliorer l'application et la fourniture de la fonctionnalité de traduction de base qui ne requiert pas de compte." },
      { type: 'definition_item', term: 'Consentement (Art. 6.1.a)', definition: "Pour toute utilisation de données non couverte par les bases précédentes (par exemple, pour de futures notifications marketing), nous solliciterons votre consentement libre, spécifique, éclairé et univoque." },
      { type: 'subtitle', text: '4. Durée de Conservation' },
      { type: 'paragraph', text: "Les données de votre compte et votre historique sont conservés tant que votre compte existe. Si vous supprimez votre compte, ces données sont définitivement effacées de nos bases de données de production dans un délai de 30 jours. Les données de diagnostic anonymes sont conservées pour une durée maximale de 18 mois." },
      { type: 'subtitle', text: '5. Partage des Données et Services Tiers' },
      { type: 'paragraph', text: "Nous ne vendons ni ne louons vos données personnelles. Nous faisons appel à un nombre limité de partenaires techniques, sélectionnés pour leur haut niveau de sécurité et leur conformité au RGPD, avec qui nous avons des accords de traitement des données (DPA)." },
      { type: 'definition_item', term: 'Hébergement', definition: "Nos serveurs et bases de données sont hébergés au sein de l'Union Européenne par notre partenaire Serveurs Sereins SARL. Ils n'ont pas d'accès aux données non chiffrées." },
      { type: 'definition_item', term: 'Analyse et Diagnostic', definition: "Nous utilisons un outil d'analyse de crash (de type Sentry/Firebase Crashlytics) pour recevoir des rapports de bugs anonymisés. Cela nous permet de corriger les problèmes sans jamais accéder à vos informations personnelles." },
      { type: 'paragraph', text: "Aucun transfert de données personnelles n'est effectué en dehors de l'Union Européenne." },
      { type: 'subtitle', text: '6. Protection des Mineurs' },
      { type: 'paragraph', text: "Notre service n'est pas destiné aux personnes de moins de 15 ans. Nous ne collectons pas sciemment de données auprès des mineurs. Si nous apprenons qu'un mineur nous a fourni des informations personnelles, nous les supprimons immédiatement." },
      { type: 'subtitle', text: '7. Vos Droits et Comment les Exercer' },
      { type: 'paragraph', text: "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. La plupart de ces actions peuvent être effectuées directement dans l'application. Pour toute autre demande, l'adresse de notre DPO, Mme. Cléa Donnée (dpo@lesmainsagiles.app), est votre canal privilégié." },
    ]
  },
  'Conditions générales': {
    title: 'Conditions Générales d\'Utilisation',
    content: [
      { type: 'metadata', text: 'Dernière mise à jour : Juin 2025' },
      { type: 'paragraph', text: "Bienvenue sur Hands Up ! L'utilisation de notre application emporte acceptation pleine et entière des présentes Conditions Générales d’Utilisation (CGU)." },
      { type: 'subtitle', text: 'Article 1 : Définitions' },
      { type: 'definition_item', term: 'Application', definition: 'Le logiciel Hands Up, propriété de la société Les Mains Agiles SAS.' },
      { type: 'definition_item', term: 'Utilisateur', definition: 'Toute personne physique utilisant l\'Application.' },
      { type: 'definition_item', term: 'Service', definition: 'L\'ensemble des fonctionnalités de traduction et d\'historique.' },
      { type: 'definition_item', term: 'Contenu Utilisateur', definition: 'Les textes et fichiers audio générés par l\'Utilisateur et sauvegardés dans son historique.' },
      { type: 'subtitle', text: 'Article 2 : Objet et Licence d’Utilisation' },
      { type: 'paragraph', text: "L'Application a pour objet de fournir un outil de traduction de la langue des signes. Nous vous concédons une licence personnelle, non-exclusive, non-transférable et révocable pour utiliser l'Application à des fins personnelles et non commerciales." },
      { type: 'subtitle', text: 'Article 3 : Conduite de l\'Utilisateur' },
      { type: 'paragraph', text: "L'Utilisateur s'engage à ne pas utiliser le Service à des fins illégales ou interdites par ces CGU. Il est notamment interdit de :\n  • Tenter de contourner les mesures de sécurité.\n  • Effectuer de l'ingénierie inverse sur l'Application.\n  • Utiliser le Service pour harceler, abuser ou nuire à autrui." },
      { type: 'subtitle', text: 'Article 4 : Propriété Intellectuelle' },
      { type: 'paragraph', text: "Les Mains Agiles SAS est propriétaire de tous les droits de propriété intellectuelle sur l'Application. L'Utilisateur est et demeure propriétaire de son Contenu Utilisateur. Vous nous accordez cependant une licence mondiale et non-exclusive pour héberger, stocker et afficher votre Contenu Utilisateur dans le seul but de vous fournir le Service (notamment l'affichage de votre historique)." },
      { type: 'subtitle', text: 'Article 5 : Limitation de Responsabilité' },
      { type: 'paragraph', text: "L'Application est fournie \"en l'état\". Nous nous efforçons d'offrir une technologie fiable, mais ne pouvons garantir l'exactitude absolue des traductions. En aucun cas, Les Mains Agiles SAS ne pourra être tenu responsable des dommages indirects, y compris la perte de données ou les dommages moraux, résultant de l'utilisation de l'Application." },
      { type: 'subtitle', text: 'Article 6 : Modification et Interruption du Service' },
      { type: 'paragraph', text: "Nous nous réservons le droit de modifier ou d'interrompre, temporairement ou de manière permanente, tout ou partie du Service, avec ou sans préavis. Vous convenez que nous ne serons pas responsables envers vous ou un tiers de toute modification ou interruption du Service." },
      { type: 'subtitle', text: 'Article 7 : Indemnisation' },
      { type: 'paragraph', text: "L'Utilisateur s'engage à indemniser et à dégager de toute responsabilité Les Mains Agiles SAS, ses dirigeants et ses employés contre toute réclamation ou demande, y compris les honoraires d'avocat raisonnables, formulée par un tiers en raison de votre violation des présentes CGU ou de votre utilisation du Service." },
      { type: 'subtitle', text: 'Article 8 : Divisibilité et Intégralité du Contrat' },
      { type: 'paragraph', text: "Si une stipulation des présentes CGU est jugée illégale ou inapplicable, cette stipulation sera supprimée sans affecter la validité des autres dispositions. Ces CGU constituent l'intégralité de l'accord entre vous et nous." },
      { type: 'subtitle', text: 'Article 9 : Droit Applicable et Juridiction' },
      { type: 'paragraph', text: "Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation et/ou à leur exécution relève de la compétence exclusive des tribunaux de Nanterre (France)." },
    ]
  },
  'Mentions légales': {
    title: 'Mentions Légales',
    content: [
      { type: 'paragraph', text: "Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., il est porté à la connaissance des utilisateurs de l'application Hands Up les présentes mentions légales." },
      { type: 'subtitle', text: '1. Éditeur de l\'Application' },
      
      // --- MODIFICATION ICI : Passage en 'rich_text' et ajout des numéros ---
      { 
        type: 'rich_text', 
        content: [
            { text: 'Dénomination sociale', style: 'bold' },
            { text: ' : Les Mains Agiles SAS\n', style: 'normal' },
            { text: 'Forme juridique', style: 'bold' },
            { text: ' : Société par Actions Simplifiée\n', style: 'normal' },
            { text: 'Capital social', style: 'bold' },
            { text: ' : 1 000,00 €\n', style: 'normal' },
            { text: 'Adresse du siège social', style: 'bold' },
            { text: ' : 159 Rue de Silly, 92100 Boulogne-Billancourt, France\n', style: 'normal' },
            { text: 'Numéro SIREN', style: 'bold' },
            { text: ' : 987 654 321\n', style: 'normal' },
            { text: 'Immatriculée au RCS de Nanterre sous le numéro', style: 'bold' },
            { text: ' : 987 654 321\n', style: 'normal' },
            { text: 'Numéro de TVA intracommunautaire', style: 'bold' },
            { text: ' : FR42987654321\n', style: 'normal' },
            { text: 'Adresse e-mail de contact', style: 'bold' },
            { text: ' : contact@lesmainsagiles.app', style: 'normal' },
        ]
      },

      { type: 'subtitle', text: '2. Directeur de la Publication' },
      { type: 'paragraph', text: "Le Directeur de la publication est Monsieur Manu Signe, en sa qualité de Président de la société Les Mains Agiles SAS." },
      { type: 'subtitle', text: '3. Hébergement de l\'Application' },
      { type: 'paragraph', text: "Le service est hébergé par la société :\nServeurs Sereins SARL\n2 rue Kellermann, 59100 Roubaix, France\nSite Web : www.serveurs-sereins.fr\nTéléphone : +33 9 72 10 10 07" },
      { type: 'subtitle', text: '4. Contact pour réclamation sur le contenu' },
      { type: 'paragraph', text: "Pour toute réclamation concernant le contenu de l'application, l'utilisateur est invité à contacter l'éditeur à l'adresse suivante : reclamation@lesmainsagiles.app" },
    ]
  },
  // --- NOUVELLE SECTION ---
  'Guide utilisateur': {
    title: 'Guide Utilisateur',
    content: [
      { type: 'paragraph', text: "Bienvenue sur HandsUp ! Voici comment traduire une vidéo en quelques étapes simples :" },
      { type: 'definition_item', term: '1. Capturer ou Importer', definition: "Utilisez le bouton d'enregistrement sur l'écran d'accueil pour filmer. Pour de meilleurs résultats, assurez-vous que le signataire est bien éclairé, visible de face (visage, torse et mains), et que la vidéo est stable. Alternativement, appuyez sur l'icône d'importation pour choisir une vidéo depuis votre galerie (taille max 100 Mo)." },
      { type: 'definition_item', term: '2. Lancer la Traduction', definition: "Une fois la vidéo enregistrée ou sélectionnée, le traitement commence automatiquement. Cela peut prendre un petit moment." },
      { type: 'definition_item', term: '3. Découvrir le Résultat', definition: "Le texte traduit s'affiche à l'écran. Vous pouvez alors écouter la traduction (🔊), la sauvegarder dans votre historique (💾) ou la partager (🔗)." },
      { type: 'paragraph', text: "\nBonnes traductions !" },
    ]
  },
  // --- NOUVELLE SECTION ---
  'Centre d\'assistance': {
    title: 'Centre d\'Assistance',
    content: [
      { type: 'paragraph', text: "Vous rencontrez un problème ? Voici quelques solutions aux questions fréquentes." },
      { type: 'definition_item', term: 'La traduction est incorrecte ou vide ?', definition: "La qualité de la vidéo est essentielle. Essayez de filmer à nouveau avec un meilleur éclairage et un cadrage plus large. Vous pouvez aussi essayer l'autre modèle de traduction (V1/V2) sur l'écran d'accueil. Si le problème persiste, utilisez l'icône \"drapeau\" 🚩 sur l'écran de résultat pour nous signaler l'erreur." },
      { type: 'definition_item', term: "L'application est lente ?", definition: "Le traitement vidéo demande beaucoup de ressources. Assurez-vous d'avoir une bonne connexion internet, surtout pour l'importation de vidéos." },
      { type: 'definition_item', term: "Besoin de plus d'aide ?", definition: "Si votre problème n'est pas résolu, contactez notre support par email à : support@handsup.app" },
      { type: 'paragraph', text: "\nMerci de nous aider à améliorer l'application !" },
    ]
  }
};