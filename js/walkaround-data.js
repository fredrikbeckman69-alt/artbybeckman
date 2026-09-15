/**
 * Curated Dataset for Walk Around Virtual Exhibition — Art by Beckman
 * Scale: 1 unit = 1.0 meter (Physical 1:1 Scale)
 * All artwork dimensions are parsed strictly from verified database records.
 */

const WALKAROUND_CURATED_ROOM = [
    {
        id: 270,
        title: "Origami",
        year: "April 2026",
        size: "100 * 120 cm",
        widthM: 1.00,
        heightM: 1.20,
        material: "Akrylfärg, glitter",
        description: "Monumentalt vertikalt verk med fasetterade geometriska plan i skimrande glitter och akryl.",
        filename: "270 ORIGAMI.jpg",
        wallPlacement: {
            position: [-4.95, 1.50, 1.20],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-2.60, 1.65, 1.20] // Optimal viewing position
        },
        zone: "Grand Salon — West Gallery Wall"
    },
    {
        id: 269,
        title: "Vertigo",
        year: "April 2026",
        size: "40 * 100 cm",
        widthM: 0.40,
        heightM: 1.00,
        material: "Akrylfärg, glitter",
        description: "Dramatiskt slankt verk i djupt skimrande glitter och akryl med stark vertikal rörelse.",
        filename: "269 VERTIGO.jpg",
        wallPlacement: {
            position: [-4.95, 1.50, -1.60],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-2.60, 1.65, -1.60]
        },
        zone: "Grand Salon — West Gallery Wall"
    },
    {
        id: 265,
        title: "My Heart Has Teeth",
        year: "2024",
        size: "160 * 100 cm",
        widthM: 1.60,
        heightM: 1.00,
        material: "Akrylfärg, resin",
        description: "Storskaligt horisontellt blickfång med djup svärta, organiska former och intensiv röd energi under glasklar resin.",
        filename: "265 MY HEART HAS TEETH.jpg",
        wallPlacement: {
            position: [2.50, 1.50, 3.95],
            rotationY: Math.PI, // Facing North (-Z)
            viewpoint: [2.50, 1.65, 1.10] // Generous 2.85m viewing distance
        },
        zone: "Grand Salon — South Lounge Wall"
    },
    {
        id: 271,
        title: "Golden Ticket",
        year: "April 2026",
        size: "40 * 100 cm",
        widthM: 0.40,
        heightM: 1.00,
        material: "Akrylfärg, glitter",
        description: "Slankt vertikalt verk i guld- och koppartoner med dramatisk textur.",
        filename: "271 GOLDEN TICKET.jpg",
        wallPlacement: {
            position: [-0.05, 1.50, 6.80],
            rotationY: -Math.PI / 2, // Facing West (-X)
            viewpoint: [-1.80, 1.65, 6.80]
        },
        zone: "Entré — East Vestibule Wall"
    },
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
        zone: "Matplats — East Dining Wall"
    },
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
            position: [-3.95, 1.50, 4.80],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-2.40, 1.65, 4.80]
        },
        zone: "Entré / Nook — West Wall"
    },
    {
        id: 256,
        title: "Unreal",
        year: "Juli 2024",
        size: "100 * 40 cm",
        widthM: 1.00,
        heightM: 0.40,
        material: "Akrylfärg, glitterspray, glitter, resin",
        description: "Drömsk panoramisk rymd i lila och guld med glitterspray och djupt resinlager.",
        filename: "256 UNREAL.jpg",
        wallPlacement: {
            position: [-3.95, 1.50, 6.80],
            rotationY: Math.PI / 2, // Facing East (+X)
            viewpoint: [-2.20, 1.65, 6.80]
        },
        zone: "Entré — West Vestibule Wall"
    }
];

const WALKAROUND_HOTSPOTS = [
    {
        id: "entry",
        label: "1. Entré & Vestibul",
        pos: [-2.0, 1.65, 7.8],
        target: [-2.0, 1.65, 0.0],
        description: "Välkommen in. Siktlinjer framåt mot vardagsrummet."
    },
    {
        id: "salon-overview",
        label: "2. Vardagsrum (Överblick)",
        pos: [-0.5, 1.65, 0.5],
        target: [-3.5, 1.65, -0.5],
        description: "Rymligt vardagsrum med fönsternischer och Starck-inredning."
    },
    {
        id: "art-my-heart",
        label: "3. Lounge (My Heart Has Teeth)",
        pos: [2.5, 1.65, 1.1],
        target: [2.5, 1.50, 3.95],
        description: "Fokusvy framför det storskaliga verket (160 × 100 cm)."
    },
    {
        id: "art-origami",
        label: "4. Gallerivägg (Origami & Vertigo)",
        pos: [-2.4, 1.65, -0.2],
        target: [-4.95, 1.50, -0.2],
        description: "Betrakta Origami (100 × 120 cm) och Vertigo (40 × 100 cm)."
    },
    {
        id: "dining",
        label: "5. Matplats (Daylight)",
        pos: [3.8, 1.65, -1.5],
        target: [5.95, 1.50, -1.5],
        description: "Matplats med Starck-matgrupp och Daylight över skänken."
    },
    {
        id: "nook",
        label: "6. Entréhörna (Warmpop & Unreal)",
        pos: [-2.2, 1.65, 5.8],
        target: [-3.95, 1.50, 5.8],
        description: "Intim hängning med mindre format och panoramiska verk."
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
    { id: 252, title: "Help Me Lose My Mind", year: "Juli 2024", size: "100 * 40 cm", material: "Akrylfärg, resin", filename: "252 HELP ME LOSE MY MIND.jpg" }
];
