/**
 * Curated Dataset for Walk Around Virtual Exhibition — Art by Beckman
 * Scale: 1 unit = 1.0 meter (Physical 1:1 Scale)
 * All artwork dimensions are parsed strictly from verified database records.
 */

const WALKAROUND_CURATED_ROOM = [
    // --- 1. GRAND SALON / VARDAGSRUM (KVALITETSREFERENS) ---
    {
        id: 265,
        title: "My Heart Has Teeth",
        year: "2024",
        size: "160 * 100 cm",
        widthM: 1.60,
        heightM: 1.00,
        material: "Akrylfärg, resin",
        description: "Storskaligt horisontellt blickfång med djup svärta, organiska former och intensiv röd energi under glasklar resin. Centrerat ovanför den skräddarsydda loungemodulsoffan.",
        filename: "265 MY HEART HAS TEETH.jpg",
        wallPlacement: {
            position: [0.60, 1.65, 3.12],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [0.60, 1.62, 0.90]
        },
        zone: "Vardagsrum — Huvudvägg över Loungesoffa"
    },
    {
        id: 270,
        title: "Origami",
        year: "April 2026",
        size: "100 * 120 cm",
        widthM: 1.00,
        heightM: 1.20,
        material: "Akrylfärg, glitter",
        description: "Monumentalt vertikalt verk med fasetterade geometriska plan i skimrande glitter och akryl. Hängt i perfekt ögonhöjd på vardagsrummets västra gallerivägg.",
        filename: "270 ORIGAMI.jpg",
        wallPlacement: {
            position: [-3.72, 1.55, -0.80],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-1.80, 1.62, -0.80]
        },
        zone: "Vardagsrum — Västra Galleriväggen"
    },
    {
        id: 269,
        title: "Vertigo",
        year: "April 2026",
        size: "40 * 100 cm",
        widthM: 0.40,
        heightM: 1.00,
        material: "Akrylfärg, glitter",
        description: "Dramatiskt slankt verk i djupt skimrande glitter och akryl med stark vertikal rörelse vid passagen mot vestibulen.",
        filename: "269 VERTIGO.jpg",
        wallPlacement: {
            position: [-3.72, 1.55, 1.40],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-1.80, 1.62, 1.40]
        },
        zone: "Vardagsrum — Västra Väggen / Passage"
    },

    // --- 2. ENTRÉ & VESTIBUL ---
    {
        id: 264,
        title: "Warmpop",
        year: "Augusti 2024",
        size: "40 * 40 cm",
        widthM: 0.40,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Intim kvadratisk färgstudie med varma pop-konstiga kontraster.",
        filename: "264 WARMPOP.jpg",
        wallPlacement: {
            position: [-1.48, 1.55, 4.40],
            rotationY: -Math.PI / 2, // Facing West (-X)
            viewpoint: [-2.40, 1.62, 4.40]
        },
        zone: "Vestibul & Entré — Nisch"
    },
    {
        id: 271,
        title: "Golden Ticket",
        year: "April 2026",
        size: "40 * 100 cm",
        widthM: 0.40,
        heightM: 1.00,
        material: "Akrylfärg, glitter",
        description: "Slankt vertikalt verk i guld- och koppartoner med dramatisk textur vid entrédörren.",
        filename: "271 GOLDEN TICKET.jpg",
        wallPlacement: {
            position: [-2.40, 1.55, 6.42],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [-2.40, 1.62, 5.00]
        },
        zone: "Vestibul & Entré — Fondvägg"
    },

    // --- 3. MATPLATS / DINING ---
    {
        id: 258,
        title: "Daylight",
        year: "Juli 2024",
        size: "100 * 40 cm",
        widthM: 1.00,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Horisontell panoramisk komposition i ljusa gula och vita toner som reflekterar dagsljuset över matsalens skänk.",
        filename: "258 DAYLIGHT.jpg",
        wallPlacement: {
            position: [5.95, 1.50, -1.50],
            rotationY: -Math.PI / 2, // Facing West (-X)
            viewpoint: [3.80, 1.65, -1.50]
        },
        zone: "Matplats — Östra Matsalsväggen"
    },

    // --- 4. KÖK & BAR (KITCHEN STUDIO) ---
    {
        id: 263,
        title: "Grapefruit",
        year: "Augusti 2024",
        size: "100 * 40 cm",
        widthM: 1.00,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Färgstarkt panoramagrafiskt verk i varma citrus- och koralltoner.",
        filename: "263 GRAPEFRUIT.jpg",
        wallPlacement: {
            position: [3.20, 1.50, 8.45],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [3.20, 1.65, 6.20]
        },
        zone: "Kök & Studio — Södra Väggen"
    },
    {
        id: 261,
        title: "Pearls",
        year: "Juli 2024",
        size: "100 * 40 cm",
        widthM: 1.00,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Pärlemorskimrande lager och glasklar resin med subtila reflektioner.",
        filename: "261 PEARLS.jpg",
        wallPlacement: {
            position: [4.80, 1.50, 8.45],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [4.80, 1.65, 6.20]
        },
        zone: "Kök & Studio — Södra Väggen"
    },
    {
        id: 257,
        title: "Junior B",
        year: "Juli 2024",
        size: "40 * 40 cm",
        widthM: 0.40,
        heightM: 0.40,
        material: "Akrylfärg, paljetter, glitter, resin",
        description: "Kompakt lekfull kvadrat med paljetter, glitter och djup resinfinish.",
        filename: "257 JUNIOR B.jpg",
        wallPlacement: {
            position: [5.95, 1.50, 6.50],
            rotationY: -Math.PI / 2, // Facing West (-X)
            viewpoint: [4.20, 1.65, 6.50]
        },
        zone: "Kök & Studio — Östra Väggen"
    },

    // --- 5. LINNÉA GALLERY CORRIDOR ---
    {
        id: 266,
        title: "Black Mirror",
        year: "September 2024",
        size: "160 * 100 cm",
        widthM: 1.60,
        heightM: 1.00,
        material: "Akrylfärg, resin",
        description: "Monumentalt systerverk till My Heart Has Teeth med djup obsidian resin och expressiv rörelse.",
        filename: "266 BLACK MIRROR.jpg",
        wallPlacement: {
            position: [-10.45, 1.50, -1.50],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-7.80, 1.65, -1.50]
        },
        zone: "Linnéa Gallerigång — Västra Fondväggen"
    },
    {
        id: 246,
        title: "Graines D'étoiles",
        year: "2024",
        size: "100 * 120 cm",
        widthM: 1.00,
        heightM: 1.20,
        material: "Akrylfärg, glitter",
        description: "Storskalig kosmisk färgexplosion i akryl och stjärnlikt glitter.",
        filename: "246 GRAINES D'ETOILE.jpg",
        wallPlacement: {
            position: [-10.45, 1.50, 0.80],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-8.00, 1.65, 0.80]
        },
        zone: "Linnéa Gallerigång — Västra Väggen"
    },
    {
        id: 254,
        title: "Love Is Magic",
        year: "Juli 2024",
        size: "100 * 40 cm",
        widthM: 1.00,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Panoramisk magisk komposition med resinfinish.",
        filename: "254 LOVE IS MAGIC.jpg",
        wallPlacement: {
            position: [-10.45, 1.50, -3.20],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-8.00, 1.65, -3.20]
        },
        zone: "Linnéa Gallerigång — Västra Väggen"
    },
    {
        id: 262,
        title: "Love In Lo-fi",
        year: "Juli 2024",
        size: "40 * 40 cm",
        widthM: 0.40,
        heightM: 0.40,
        material: "Akrylfärg, sprayfärg, glitterspray, glitter, resin",
        description: "Intim kvadrat med sprayfärg och glimmer.",
        filename: "262 LOVE IN LO-FI.jpg",
        wallPlacement: {
            position: [-5.55, 1.50, 0.80],
            rotationY: -Math.PI / 2, // Facing West (-X)
            viewpoint: [-7.80, 1.65, 0.80]
        },
        zone: "Linnéa Gallerigång — Östra Väggen"
    },
    {
        id: 255,
        title: "Waking Light",
        year: "Juli 2024",
        size: "40 * 40 cm",
        widthM: 0.40,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Ljus, skimrande kvadrat i morgonljusets toner.",
        filename: "255 WAKING LIGHT.jpg",
        wallPlacement: {
            position: [-5.55, 1.50, -1.50],
            rotationY: -Math.PI / 2, // Facing West (-X)
            viewpoint: [-7.80, 1.65, -1.50]
        },
        zone: "Linnéa Gallerigång — Östra Väggen"
    },
    {
        id: 252,
        title: "Help Me Lose My Mind",
        year: "Juli 2024",
        size: "100 * 40 cm",
        widthM: 1.00,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Intensiv panoramisk färgrymd med resinöverdrag.",
        filename: "252 HELP ME LOSE MY MIND.jpg",
        wallPlacement: {
            position: [-5.55, 1.50, -3.20],
            rotationY: -Math.PI / 2, // Facing West (-X)
            viewpoint: [-7.80, 1.65, -3.20]
        },
        zone: "Linnéa Gallerigång — Östra Väggen"
    },

    // --- 6. MASTER SUITE (SOVRUM & PRIVAT GALLERI) ---
    {
        id: 248,
        title: "Linnéas Trilogi 1",
        year: "2024",
        size: "60 * 73 cm",
        widthM: 0.60,
        heightM: 0.73,
        material: "Akrylfärg",
        description: "Första delen i Linnéas Trilogi. Mjuk och uttrycksfull komposition.",
        filename: "248 LINNEAS TRILOGI 1.jpg",
        wallPlacement: {
            position: [-9.20, 1.50, 8.45],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [-9.20, 1.65, 6.20]
        },
        zone: "Master Suite — Södra Huvudväggen"
    },
    {
        id: 241,
        title: "Protected From The Sun 1.0",
        year: "2024",
        size: "80 * 80 cm",
        widthM: 0.80,
        heightM: 0.80,
        material: "Akrylfärg, resin",
        description: "Harmonisk kvadrat i dämpade solskyddande toner.",
        filename: "241 PROTECTED FROM THE SUN 1.0.jpg",
        wallPlacement: {
            position: [-7.80, 1.50, 8.45],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [-7.80, 1.65, 6.20]
        },
        zone: "Master Suite — Södra Huvudväggen"
    },
    {
        id: 250,
        title: "Linnéas Trilogi 3",
        year: "2024",
        size: "60 * 73 cm",
        widthM: 0.60,
        heightM: 0.73,
        material: "Akrylfärg",
        description: "Tredje delen i Linnéas Trilogi. Avslutande färgackord.",
        filename: "250 LINNEAS TRILOGI 3.jpg",
        wallPlacement: {
            position: [-6.40, 1.50, 8.45],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [-6.40, 1.65, 6.20]
        },
        zone: "Master Suite — Södra Huvudväggen"
    },
    {
        id: 253,
        title: "Bungalow",
        year: "Juli 2024",
        size: "27 * 35 cm",
        widthM: 0.27,
        heightM: 0.35,
        material: "Akrylfärg, metall",
        description: "Intimt litet konstverk med metallinslag monterat i privat svit.",
        filename: "253 BUNGALOW.jpg",
        wallPlacement: {
            position: [-10.45, 1.50, 5.50],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-8.80, 1.65, 5.50]
        },
        zone: "Master Suite — Västra Sängväggen"
    },
    {
        id: 233,
        title: "Chaos 1.0",
        year: "2024",
        size: "40 * 40 cm",
        widthM: 0.40,
        heightM: 0.40,
        material: "Akrylfärg, resin",
        description: "Kvadratisk dynamisk explosion av färg och linjer.",
        filename: "233 CHAOS 1.0.jpg",
        wallPlacement: {
            position: [-10.45, 1.50, 4.00],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-8.80, 1.65, 4.00]
        },
        zone: "Master Suite — Västra Sängväggen"
    }
];

const WALKAROUND_HOTSPOTS = [
    {
        id: "entry",
        label: "1. Entré & Vestibul",
        pos: [-2.40, 1.62, 4.80],
        target: [-2.40, 1.62, 1.00],
        description: "Välkommen in via vestibulen med fri siktlinje in mot vardagsrummet."
    },
    {
        id: "salon-overview",
        label: "2. Vardagsrum (Översikt)",
        pos: [-2.20, 1.62, 1.90],
        target: [0.60, 1.10, 1.40],
        description: "Överblick över vardagsrummet, den platsbyggda soffgruppen, Starck-fåtöljen och fönsternischerna."
    },
    {
        id: "art-my-heart",
        label: "3. Loungesoffa (My Heart Has Teeth)",
        pos: [0.60, 1.62, -0.60],
        target: [0.60, 1.55, 3.12],
        description: "Fokusvy framför sittgruppen med My Heart Has Teeth (160 × 100 cm) centrerat över soffan."
    },
    {
        id: "art-origami",
        label: "4. Gallerivägg (Origami & Vertigo)",
        pos: [-1.40, 1.62, 0.20],
        target: [-3.72, 1.55, 0.20],
        description: "Betrakta Origami (100 × 120 cm) och Vertigo (40 × 100 cm) på den västra galleriväggen."
    },
    {
        id: "window-niche",
        label: "5. Fönsternisch & Utsikt",
        pos: [0.00, 1.62, 0.60],
        target: [0.00, 1.55, -3.20],
        description: "Djup fönsternisch i borstat stål med panoramautsikt mot staden och takterrassen."
    }
];

// Full pool of top 50 artworks available for 2D gallery fallback and search
const WALKAROUND_TOP50_POOL = [
    { id: 271, title: "Golden Ticket", year: "April 2026", size: "40 * 100 cm", material: "Akrylfärg, glitter", filename: "271 GOLDEN TICKET.jpg" },
    { id: 270, title: "Origami", year: "April 2026", size: "100 * 120 cm", material: "Akrylfärg, glitter", filename: "270 ORIGAMI.jpg" },
    { id: 269, title: "Vertigo", year: "April 2026", size: "40 * 100 cm", material: "Akrylfärg, glitter", filename: "269 VERTIGO.jpg" },
    { id: 268, title: "Raspberry Beret", year: "Januari 2026", size: "40 * 100 cm", material: "Akrylfärg, lim, glitter, smycken", filename: "268 RASPBERRY BERET.jpg" },
    { id: 267, title: "Pink Dress", year: "December 2025", size: "100 * 120 cm", material: "Akrylfärg, resin", filename: "267 PINK DRESS.jpg" },
    { id: 266, title: "Black Mirror", year: "September 2024", size: "160 * 100 cm", material: "Akrylfärg, resin", filename: "266 BLACK MIRROR.jpg" },
    { id: 265, title: "My Heart Has Teeth", year: "2024", size: "160 * 100 cm", material: "Akrylfärg, resin", filename: "265 MY HEART HAS TEETH.jpg" },
    { id: 264, title: "Warmpop", year: "Augusti 2024", size: "40 * 40 cm", material: "Akrylfärg, resin", filename: "264 WARMPOP.jpg" },
    { id: 263, title: "Grapefruit", year: "Augusti 2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "263 GRAPEFRUIT.jpg" },
    { id: 262, title: "Love In Lo-fi", year: "Juli 2024", size: "40 * 40 cm", material: "Akrylfärg, sprayfärg, glitterspray, glitter, resin", filename: "262 LOVE IN LO-FI.jpg" },
    { id: 261, title: "Pearls", year: "Juli 2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "261 PEARLS.jpg" },
    { id: 260, title: "Who Knew", year: "Juli 2024", size: "50 * 50 cm", material: "Akrylfärg", filename: "260 WHO KNEW.jpg" },
    { id: 259, title: "Red Rain", year: "Juli 2024", size: "70 * 50 cm", material: "Akrylfärg", filename: "259 RED RAIN.jpg" },
    { id: 258, title: "Daylight", year: "Juli 2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "258 DAYLIGHT.jpg" },
    { id: 257, title: "Junior B", year: "Juli 2024", size: "40 * 40 cm", material: "Akrylfärg, paljetter, glitter, resin", filename: "257 JUNIOR B.jpg" },
    { id: 256, title: "Unreal", year: "Juli 2024", size: "100 * 40 cm", material: "Akrylfärg, glitterspray, glitter, resin", filename: "256 UNREAL.jpg" },
    { id: 255, title: "Waking Light", year: "Juli 2024", size: "40 * 40 cm", material: "Akrylfärg, resin", filename: "255 WAKING LIGHT.jpg" },
    { id: 254, title: "Love Is Magic", year: "Juli 2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "254 LOVE IS MAGIC.jpg" },
    { id: 253, title: "Bungalow", year: "Juli 2024", size: "27 * 35 cm", material: "Akrylfärg, metall", filename: "253 BUNGALOW.jpg" },
    { id: 252, title: "Help Me Lose My Mind", year: "Juli 2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "252 HELP ME LOSE MY MIND.jpg" },
    { id: 250, title: "Linnéas Trilogi 3", year: "2024", size: "60 * 73 cm", material: "Akrylfärg", filename: "250 LINNEAS TRILOGI 3.jpg" },
    { id: 248, title: "Linnéas Trilogi 1", year: "2024", size: "60 * 73 cm", material: "Akrylfärg", filename: "248 LINNEAS TRILOGI 1.jpg" },
    { id: 246, title: "Graines D'étoiles", year: "2024", size: "100 * 120 cm", material: "Akrylfärg, glitter", filename: "246 GRAINES D'ETOILE.jpg" },
    { id: 245, title: "Fusion 1.0", year: "2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "245 FUSION 1.0.jpg" },
    { id: 243, title: "Flute 1.0", year: "2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "243 FLUTE 1.0.jpg" },
    { id: 241, title: "Protected From The Sun 1.0", year: "2024", size: "80 * 80 cm", material: "Akrylfärg, resin", filename: "241 PROTECTED FROM THE SUN 1.0.jpg" }
];
