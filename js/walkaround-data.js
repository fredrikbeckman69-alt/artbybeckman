// Authoritative Walk Around Data — Art by Beckman
// 3D Metric Scale: 1 unit = 1.0 meter

const WALKAROUND_ROOMS = {
    "entry": {
        "id": "entry",
        "name": "Entré & Vestibul",
        "roomNumber": "01",
        "tagline": "Skulptural spegel och flytande krom i kalkstensvestibul",
        "description": "En arkitektonisk entré med golv i slipad fransk kalksten, en flytande organisk konsol i borstat stål och en djup vinröd skulpturstol. På galleriväggen hänger Fredrik Beckmans originalverk Golden Ticket och Warmpop.",
        "image": "assets/walkaround/entry.webp",
        "fallback": "assets/walkaround/entry.jpg",
        "thumb": "assets/walkaround/entry_thumb.webp",
        "pos3d": {
            "x": 0.0,
            "y": 1.65,
            "z": 6.0
        },
        "minimapPos": {
            "x": 70,
            "y": 140
        },
        "initialYaw": 0.0,
        "initialPitch": 0.0,
        "walkSequence": [
            {
                "yaw": -0.05,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Entréöversikt"
            },
            {
                "yaw": 0.3,
                "pitch": 0.05,
                "zoom": 1.25,
                "duration": 4.5,
                "targetArt": 271,
                "label": "Gallerivägg — Golden Ticket & Warmpop"
            },
            {
                "yaw": -0.25,
                "pitch": -0.02,
                "zoom": 1.35,
                "duration": 4.0,
                "targetPortal": "living_room",
                "label": "Går mot portalen till Salongen"
            }
        ],
        "artworks": [
            {
                "id": 271,
                "title": "Golden Ticket",
                "size": "40 × 100 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, guldstoff",
                "zone": "Entré — Högra galleriväggen (Övre)",
                "filename": "271 GOLDEN TICKET.webp",
                "originalFilename": "271 GOLDEN TICKET.jpg",
                "description": "Slankt vertikalt originalverk av Fredrik Beckman i guld-, magenta- och koppartoner med dramatisk textur och guldglans i entréns galleribelysning.",
                "pos3d": {
                    "x": 2.2,
                    "y": 2.1,
                    "z": 4.5
                },
                "screenPos": {
                    "x": 73.2,
                    "y": 25.4,
                    "radius": 55
                }
            },
            {
                "id": 264,
                "title": "Warmpop",
                "size": "40 × 40 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, högblank resin",
                "zone": "Entré — Högra galleriväggen (Nedre)",
                "filename": "264 WARMPOP.webp",
                "originalFilename": "264 WARMPOP.jpg",
                "description": "Intim kvadratisk färgstudie under högblank resin, hängd strax under Golden Ticket.",
                "pos3d": {
                    "x": 2.3,
                    "y": 1.2,
                    "z": 4.5
                },
                "screenPos": {
                    "x": 77.7,
                    "y": 47.7,
                    "radius": 50
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "living_room",
                "label": "Gå in i Salongen",
                "dir": "east",
                "pos3d": {
                    "x": 3.2,
                    "y": 0.0,
                    "z": 4.0
                },
                "screenPos": {
                    "x": 28.0,
                    "y": 56.0
                }
            },
            {
                "targetRoom": "bedroom",
                "label": "Gå till Master Bedroom",
                "dir": "west",
                "pos3d": {
                    "x": -3.0,
                    "y": 0.0,
                    "z": 4.0
                },
                "screenPos": {
                    "x": 10.0,
                    "y": 62.0
                }
            },
            {
                "targetRoom": "office",
                "label": "Gå till Biblioteket",
                "dir": "north",
                "pos3d": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.5
                },
                "screenPos": {
                    "x": 50.0,
                    "y": 55.0
                }
            }
        ]
    },
    "living_room": {
        "id": "living_room",
        "name": "Grand Living Room",
        "roomNumber": "02",
        "tagline": "Salongens hjärta med svängd bouclésoffa och Haussmann-balkong",
        "description": "Salongens centrala sällskapsdel med en organisk bouclésoffa, flytande kromsoffbord och franska dörrar ut mot balkongen. På den stora fondväggen över den svarta skänken trånar Fredrik Beckmans mästerverk My Heart Has Teeth.",
        "image": "assets/walkaround/living_room.webp",
        "fallback": "assets/walkaround/living_room.jpg",
        "thumb": "assets/walkaround/living_room_thumb.webp",
        "pos3d": {
            "x": 8.0,
            "y": 1.65,
            "z": 2.0
        },
        "minimapPos": {
            "x": 130,
            "y": 110
        },
        "initialYaw": 0.0,
        "initialPitch": -0.02,
        "walkSequence": [
            {
                "yaw": 0.08,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 4.0,
                "label": "Salongen överblick"
            },
            {
                "yaw": 0.05,
                "pitch": 0.03,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 265,
                "label": "Studerar My Heart Has Teeth (160 × 100 cm)"
            },
            {
                "yaw": 0.32,
                "pitch": 0.0,
                "zoom": 1.15,
                "duration": 3.5,
                "targetPortal": "living_nook",
                "label": "Vandrar mot läshörnan och balkongvyn"
            }
        ],
        "artworks": [
            {
                "id": 265,
                "title": "My Heart Has Teeth",
                "size": "160 × 100 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, skyddslack",
                "zone": "Salongen — Fondvägg över skänk",
                "filename": "265 MY HEART HAS TEETH.webp",
                "originalFilename": "265 MY HEART HAS TEETH.JPG",
                "description": "Fredrik Beckmans monumentala verk med djup svärta, organiska färgfält i intensiv magenta och guld under glasklar resin.",
                "pos3d": {
                    "x": 8.5,
                    "y": 2.1,
                    "z": -1.5
                },
                "screenPos": {
                    "x": 53.8,
                    "y": 30.2,
                    "radius": 65
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "living_wide",
                "label": "Se Salongen i vidvinkel",
                "dir": "south",
                "pos3d": {
                    "x": 9.5,
                    "y": 0.0,
                    "z": 4.5
                },
                "screenPos": {
                    "x": 50.0,
                    "y": 90.0
                }
            },
            {
                "targetRoom": "living_nook",
                "label": "Gå till Läshörnan",
                "dir": "east",
                "pos3d": {
                    "x": 13.0,
                    "y": 0.0,
                    "z": 2.0
                },
                "screenPos": {
                    "x": 88.0,
                    "y": 74.0
                }
            },
            {
                "targetRoom": "dining_room",
                "label": "Gå in i Matsalen",
                "dir": "north",
                "pos3d": {
                    "x": 8.0,
                    "y": 0.0,
                    "z": -3.5
                },
                "screenPos": {
                    "x": 82.0,
                    "y": 50.0
                }
            },
            {
                "targetRoom": "entry",
                "label": "Återvänd till Entrén",
                "dir": "west",
                "pos3d": {
                    "x": 3.0,
                    "y": 0.0,
                    "z": 4.0
                },
                "screenPos": {
                    "x": 10.0,
                    "y": 62.0
                }
            }
        ]
    },
    "living_wide": {
        "id": "living_wide",
        "name": "Salong — Vidsträckt Vy",
        "roomNumber": "02B",
        "tagline": "Panorama över dubbla portaler, flytande skulpturbord och matsal",
        "description": "En vidsträckt sikt över våningens salonger som förenar entrén, salongen och matsalen. På väggarna kontrasterar Graines D'Étoiles och monumentala Black Mirror.",
        "image": "assets/walkaround/living_wide.webp",
        "fallback": "assets/walkaround/living_wide.jpg",
        "thumb": "assets/walkaround/living_wide_thumb.webp",
        "pos3d": {
            "x": 10.0,
            "y": 1.65,
            "z": 6.0
        },
        "minimapPos": {
            "x": 155,
            "y": 140
        },
        "initialYaw": 0.0,
        "initialPitch": -0.02,
        "walkSequence": [
            {
                "yaw": 0.0,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Panoramavy över salongen"
            },
            {
                "yaw": -0.28,
                "pitch": 0.02,
                "zoom": 1.25,
                "duration": 4.5,
                "targetArt": 246,
                "label": "Studerar Graines D'Étoiles"
            },
            {
                "yaw": 0.35,
                "pitch": 0.05,
                "zoom": 1.25,
                "duration": 4.5,
                "targetArt": 266,
                "label": "Studerar Black Mirror (160 × 100 cm)"
            },
            {
                "yaw": 0.0,
                "pitch": 0.0,
                "zoom": 1.2,
                "duration": 3.5,
                "targetPortal": "dining_v2",
                "label": "Blickar in mot matsalen"
            }
        ],
        "artworks": [
            {
                "id": 246,
                "title": "Graines D´Étoiles",
                "size": "100 × 120 cm",
                "year": "2024",
                "material": "Akrylfärg, glitter på duk",
                "zone": "Salong — Vänster portalvägg",
                "filename": "246 GRAINES D'ETOILE.webp",
                "originalFilename": "246 GRAINES D'ETOILE.jpg",
                "description": "Fasetterade rymdstudier i magenta, guld och djupblått som fångar salongens naturliga ljusspel.",
                "pos3d": {
                    "x": 7.0,
                    "y": 2.0,
                    "z": 4.0
                },
                "screenPos": {
                    "x": 26.2,
                    "y": 31.0,
                    "radius": 75
                }
            },
            {
                "id": 266,
                "title": "Black Mirror",
                "size": "160 × 100 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, pigment",
                "zone": "Salong — Höger fondvägg",
                "filename": "266 BLACK MIRROR.webp",
                "originalFilename": "266 BLACK MIRROR.jpg",
                "description": "Monumentalt mörkt mästerverk med pulserande djup och högblank finish.",
                "pos3d": {
                    "x": 13.5,
                    "y": 2.1,
                    "z": 4.5
                },
                "screenPos": {
                    "x": 95.0,
                    "y": 28.0,
                    "radius": 95
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "living_room",
                "label": "Gå fram till Salongsbordet",
                "dir": "north",
                "pos3d": {
                    "x": 8.0,
                    "y": 0.0,
                    "z": 2.0
                },
                "screenPos": {
                    "x": 48.0,
                    "y": 62.0
                }
            },
            {
                "targetRoom": "dining_v2",
                "label": "Gå genom portalen till Matsalen",
                "dir": "north-west",
                "pos3d": {
                    "x": 9.5,
                    "y": 0.0,
                    "z": -2.0
                },
                "screenPos": {
                    "x": 50.0,
                    "y": 48.0
                }
            },
            {
                "targetRoom": "entry",
                "label": "Gå tillbaka till Entrén",
                "dir": "west",
                "pos3d": {
                    "x": 2.0,
                    "y": 0.0,
                    "z": 6.0
                },
                "screenPos": {
                    "x": 8.0,
                    "y": 65.0
                }
            }
        ]
    },
    "living_nook": {
        "id": "living_nook",
        "name": "Salong — Läshörna & Balkong",
        "roomNumber": "02C",
        "tagline": "Vinröd skulpturfåtölj, båglampa i krom och parisiska smidesbalkonger",
        "description": "En intim läshörna i salongen med en djup vinröd fåtölj, kromad båglampa och franska dörrar ut mot de parisiska zinktaken. På väggen bakom fåtöljen hänger Fredrik Beckmans Raspberry Beret.",
        "image": "assets/walkaround/living_nook.webp",
        "fallback": "assets/walkaround/living_nook.jpg",
        "thumb": "assets/walkaround/living_nook_thumb.webp",
        "pos3d": {
            "x": 14.0,
            "y": 1.65,
            "z": 2.0
        },
        "minimapPos": {
            "x": 190,
            "y": 110
        },
        "initialYaw": 0.0,
        "initialPitch": -0.02,
        "walkSequence": [
            {
                "yaw": -0.05,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Läshörna och kupolvy"
            },
            {
                "yaw": -0.15,
                "pitch": 0.04,
                "zoom": 1.3,
                "duration": 4.5,
                "targetArt": 268,
                "label": "Studerar Raspberry Beret (40 × 100 cm)"
            },
            {
                "yaw": 0.25,
                "pitch": -0.02,
                "zoom": 1.15,
                "duration": 4.0,
                "label": "Beundrar balkongutsikten över Paris"
            },
            {
                "yaw": -0.35,
                "pitch": 0.0,
                "zoom": 1.25,
                "duration": 3.5,
                "targetPortal": "living_room",
                "label": "Går tillbaka mot Salongen"
            }
        ],
        "artworks": [
            {
                "id": 268,
                "title": "Raspberry Beret",
                "size": "40 × 100 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter",
                "zone": "Salong — Läshörna bakom fåtölj",
                "filename": "268 RASPBERRY BERET.webp",
                "originalFilename": "268 RASPBERRY BERET.jpg",
                "description": "Vertikalt originalverk med djupa hallontoner, skimrande textur och guldglans i läshörnans varma kvällsljus.",
                "pos3d": {
                    "x": 13.2,
                    "y": 2.0,
                    "z": -0.5
                },
                "screenPos": {
                    "x": 34.9,
                    "y": 35.6,
                    "radius": 55
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "living_room",
                "label": "Tillbaka till Salongens centrum",
                "dir": "west",
                "pos3d": {
                    "x": 9.0,
                    "y": 0.0,
                    "z": 2.0
                },
                "screenPos": {
                    "x": 20.0,
                    "y": 65.0
                }
            },
            {
                "targetRoom": "living_wide",
                "label": "Se Salongsvyn",
                "dir": "south",
                "pos3d": {
                    "x": 11.0,
                    "y": 0.0,
                    "z": 5.0
                },
                "screenPos": {
                    "x": 65.0,
                    "y": 75.0
                }
            }
        ]
    },
    "dining_room": {
        "id": "dining_room",
        "name": "Grand Dining Room",
        "roomNumber": "03",
        "tagline": "Carraramarmor, Philippe Starck Louis Ghost-stolar och svävande stålskänk",
        "description": "En ljus och sofistikerad matsal med ett runt matbord i vit Carraramarmor, transparenta Louis Ghost-stolar och en flytande skänk i borstat stål. På fondväggen lyser Fredrik Beckmans monumentala verk Origami.",
        "image": "assets/walkaround/dining_room.webp",
        "fallback": "assets/walkaround/dining_room.jpg",
        "thumb": "assets/walkaround/dining_room_thumb.webp",
        "pos3d": {
            "x": 8.0,
            "y": 1.65,
            "z": -6.0
        },
        "minimapPos": {
            "x": 130,
            "y": 45
        },
        "initialYaw": 0.0,
        "initialPitch": 0.0,
        "walkSequence": [
            {
                "yaw": -0.15,
                "pitch": 0.0,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Matsalens marmorbord"
            },
            {
                "yaw": -0.35,
                "pitch": 0.05,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 270,
                "label": "Studerar Daylight (60 × 140 cm)"
            },
            {
                "yaw": 0.25,
                "pitch": -0.02,
                "zoom": 1.2,
                "duration": 3.5,
                "targetPortal": "dining_v2",
                "label": "Blickar mot kökets stålytor"
            }
        ],
        "artworks": [
            {
                "id": 270,
                "title": "Origami",
                "size": "100 × 120 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, guldstoff",
                "zone": "Matsal — Fondvägg över rostfri skänk",
                "filename": "270 ORIGAMI.webp",
                "originalFilename": "270 ORIGAMI.jpg",
                "description": "Fredrik Beckmans magnifika komposition med fasetterade plan i skimrande glitter, magenta och guld monterad i perfekt harmoni över den rostfria skänken.",
                "pos3d": {
                    "x": 5.5,
                    "y": 2.1,
                    "z": -6.0
                },
                "screenPos": {
                    "x": 16.7,
                    "y": 28.1,
                    "radius": 85
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "dining_v2",
                "label": "Gå mot Kökspassagen",
                "dir": "east",
                "pos3d": {
                    "x": 12.0,
                    "y": 0.0,
                    "z": -6.0
                },
                "screenPos": {
                    "x": 82.0,
                    "y": 55.0
                }
            },
            {
                "targetRoom": "living_room",
                "label": "Gå till Salongen",
                "dir": "south",
                "pos3d": {
                    "x": 8.0,
                    "y": 0.0,
                    "z": 0.0
                },
                "screenPos": {
                    "x": 35.0,
                    "y": 75.0
                }
            },
            {
                "targetRoom": "office",
                "label": "Gå till Biblioteket",
                "dir": "west",
                "pos3d": {
                    "x": 2.0,
                    "y": 0.0,
                    "z": -6.0
                },
                "screenPos": {
                    "x": 10.0,
                    "y": 60.0
                }
            }
        ]
    },
    "dining_v2": {
        "id": "dining_v2",
        "name": "Matsal mot Kök",
        "roomNumber": "03B",
        "tagline": "Öppen siktlinje mellan marmormatsal och skulptural stålö",
        "description": "En öppen arkitektonisk vy från matsalen rakt in i det minimalistiska köket. På sidoväggarna samspelar Daylight och Pink Dress i direkt dialog med de borstade metallytorna.",
        "image": "assets/walkaround/dining_v2.webp",
        "fallback": "assets/walkaround/dining_v2.jpg",
        "thumb": "assets/walkaround/dining_v2_thumb.webp",
        "pos3d": {
            "x": 12.0,
            "y": 1.65,
            "z": -6.0
        },
        "minimapPos": {
            "x": 165,
            "y": 45
        },
        "initialYaw": 0.0,
        "initialPitch": -0.02,
        "walkSequence": [
            {
                "yaw": 0.0,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Överblick Matsal mot Kök"
            },
            {
                "yaw": -0.22,
                "pitch": 0.03,
                "zoom": 1.25,
                "duration": 4.5,
                "targetArt": 270,
                "label": "Studerar Daylight"
            },
            {
                "yaw": 0.35,
                "pitch": 0.03,
                "zoom": 1.25,
                "duration": 4.5,
                "targetArt": 267,
                "label": "Studerar Pink Dress"
            },
            {
                "yaw": 0.08,
                "pitch": 0.0,
                "zoom": 1.2,
                "duration": 3.5,
                "targetPortal": "kitchen",
                "label": "Går fram till köksön"
            }
        ],
        "artworks": [
            {
                "id": 258,
                "title": "Daylight",
                "size": "100 × 120 cm",
                "year": "April 2026",
                "material": "Akrylfärg, guldpigment",
                "zone": "Matsal — Vänster fönstervägg",
                "filename": "258 DAYLIGHT.webp",
                "originalFilename": "258 DAYLIGHT.jpg",
                "description": "Kraftfull färgexplosion i magenta och guld.",
                "pos3d": {
                    "x": 9.5,
                    "y": 2.0,
                    "z": -7.5
                },
                "screenPos": {
                    "x": 33.2,
                    "y": 32.0,
                    "radius": 75
                }
            },
            {
                "id": 267,
                "title": "Pink Dress",
                "size": "100 × 120 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, pigment",
                "zone": "Matsal — Höger fondvägg",
                "filename": "267 PINK DRESS.webp",
                "originalFilename": "267 PINK DRESS.jpg",
                "description": "Färgsprakande originalverk med skira lager och glittrande textur.",
                "pos3d": {
                    "x": 14.5,
                    "y": 2.0,
                    "z": -4.5
                },
                "screenPos": {
                    "x": 94.5,
                    "y": 26.5,
                    "radius": 80
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "kitchen",
                "label": "Gå in i Köket",
                "dir": "north",
                "pos3d": {
                    "x": 15.0,
                    "y": 0.0,
                    "z": -6.0
                },
                "screenPos": {
                    "x": 62.0,
                    "y": 52.0
                }
            },
            {
                "targetRoom": "dining_room",
                "label": "Tillbaka till Matsalsbordet",
                "dir": "west",
                "pos3d": {
                    "x": 8.0,
                    "y": 0.0,
                    "z": -6.0
                },
                "screenPos": {
                    "x": 18.0,
                    "y": 65.0
                }
            },
            {
                "targetRoom": "living_wide",
                "label": "Gå till Salongen",
                "dir": "south",
                "pos3d": {
                    "x": 10.0,
                    "y": 0.0,
                    "z": 3.0
                },
                "screenPos": {
                    "x": 45.0,
                    "y": 78.0
                }
            }
        ]
    },
    "kitchen": {
        "id": "kitchen",
        "name": "Minimalistiskt Kök",
        "roomNumber": "04",
        "tagline": "Köksö i massivt rostfritt stål, Philippe Starck-barstolar",
        "description": "Monolitisk minimalism i borstat rostfritt stål. På den ljusa fönsterväggen hänger Fredrik Beckmans färgstarka pop-art verk Chromeyellowred 1.0.",
        "image": "assets/walkaround/kitchen.webp",
        "fallback": "assets/walkaround/kitchen.jpg",
        "thumb": "assets/walkaround/kitchen_thumb.webp",
        "pos3d": {
            "x": 18.0,
            "y": 1.65,
            "z": -6.0
        },
        "minimapPos": {
            "x": 215,
            "y": 45
        },
        "initialYaw": 0.0,
        "initialPitch": -0.03,
        "walkSequence": [
            {
                "yaw": 0.0,
                "pitch": -0.03,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Kökets monolitiska stålö"
            },
            {
                "yaw": -0.32,
                "pitch": 0.04,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 271,
                "label": "Studerar Golden Ticket (40 × 100 cm)"
            },
            {
                "yaw": 0.15,
                "pitch": -0.02,
                "zoom": 1.15,
                "duration": 3.5,
                "targetPortal": "dining_v2",
                "label": "Vänder tillbaka mot matsalen"
            }
        ],
        "artworks": [
            {
                "id": 271,
                "title": "Golden Ticket (Kitchen Suite)",
                "size": "40 × 100 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, guldstoff",
                "zone": "Kök — Vänster fönstervägg",
                "filename": "271 GOLDEN TICKET.webp",
                "originalFilename": "271 GOLDEN TICKET.jpg",
                "description": "Guldskimmer och skimrande textur som fångar morgonljuset från fönstret invid köksön.",
                "pos3d": {
                    "x": 15.5,
                    "y": 1.9,
                    "z": -8.0
                },
                "screenPos": {
                    "x": 7.5,
                    "y": 33.4,
                    "radius": 65
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "dining_v2",
                "label": "Tillbaka till Matsalen",
                "dir": "west",
                "pos3d": {
                    "x": 12.0,
                    "y": 0.0,
                    "z": -6.0
                },
                "screenPos": {
                    "x": 25.0,
                    "y": 62.0
                }
            }
        ]
    },
    "office": {
        "id": "office",
        "name": "Arbetsrum & Bibliotek",
        "roomNumber": "05",
        "tagline": "Skrivbord i borstat stål, platsbyggda bokhyllor och balkong",
        "description": "Ett exekutivt arbetsrum med ett skulpturalt skrivbord i massivt borstat stål, helväggsbokhylla och balkong mot de parisiska avenyer. I bokhyllans centrala konstnisch visas Fredrik Beckmans Golden Ticket.",
        "image": "assets/walkaround/office.webp",
        "fallback": "assets/walkaround/office.jpg",
        "thumb": "assets/walkaround/office_thumb.webp",
        "pos3d": {
            "x": 0.0,
            "y": 1.65,
            "z": -6.0
        },
        "minimapPos": {
            "x": 70,
            "y": 45
        },
        "initialYaw": 0.0,
        "initialPitch": -0.02,
        "walkSequence": [
            {
                "yaw": 0.1,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Arbetsrummet och stålbordet"
            },
            {
                "yaw": 0.35,
                "pitch": 0.05,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 271,
                "label": "Studerar Golden Ticket (40 × 100 cm)"
            },
            {
                "yaw": -0.25,
                "pitch": -0.02,
                "zoom": 1.15,
                "duration": 3.5,
                "label": "Blickar ut mot Paris avenyer"
            },
            {
                "yaw": -0.1,
                "pitch": 0.0,
                "zoom": 1.2,
                "duration": 3.5,
                "targetPortal": "entry",
                "label": "Går mot vestibulen"
            }
        ],
        "artworks": [
            {
                "id": 271,
                "title": "Golden Ticket",
                "size": "40 × 100 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, guldstoff",
                "zone": "Arbetsrum — Bokhyllans konstnisch",
                "filename": "271 GOLDEN TICKET.webp",
                "originalFilename": "271 GOLDEN TICKET.jpg",
                "description": "Slank vertikal komposition i guldstoff och skimrande magenta monterad i bokhyllans skräddarsydda gallerinisch bakom stålbordet.",
                "pos3d": {
                    "x": 2.0,
                    "y": 2.0,
                    "z": -7.5
                },
                "screenPos": {
                    "x": 77.3,
                    "y": 29.2,
                    "radius": 75
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "entry",
                "label": "Gå till Entrén",
                "dir": "south",
                "pos3d": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 3.0
                },
                "screenPos": {
                    "x": 15.0,
                    "y": 68.0
                }
            },
            {
                "targetRoom": "dining_room",
                "label": "Gå till Matsalen",
                "dir": "east",
                "pos3d": {
                    "x": 5.0,
                    "y": 0.0,
                    "z": -6.0
                },
                "screenPos": {
                    "x": 88.0,
                    "y": 60.0
                }
            }
        ]
    },
    "bedroom": {
        "id": "bedroom",
        "name": "Master Bedroom Suite",
        "roomNumber": "06",
        "tagline": "Bouclésäng, skulptural metallbänk och balkong mot Paris",
        "description": "En rofylld och lyxig sovrumssvit med säng i krämfärgad bouclé och metallbänk. Över sänggaveln hänger Fredrik Beckmans monumentala mästerverk Daylight.",
        "image": "assets/walkaround/bedroom.webp",
        "fallback": "assets/walkaround/bedroom.jpg",
        "thumb": "assets/walkaround/bedroom_thumb.webp",
        "pos3d": {
            "x": -8.0,
            "y": 1.65,
            "z": 2.0
        },
        "minimapPos": {
            "x": -10,
            "y": 110
        },
        "initialYaw": 0.0,
        "initialPitch": -0.02,
        "walkSequence": [
            {
                "yaw": -0.15,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 4.0,
                "label": "Master Bedroom översikt"
            },
            {
                "yaw": -0.32,
                "pitch": 0.04,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 270,
                "label": "Studerar Daylight (60 × 140 cm)"
            },
            {
                "yaw": 0.2,
                "pitch": -0.02,
                "zoom": 1.15,
                "duration": 3.5,
                "label": "Balkongvy mot Boulevard Haussmann"
            },
            {
                "yaw": -0.1,
                "pitch": 0.0,
                "zoom": 1.25,
                "duration": 3.5,
                "targetPortal": "bathroom",
                "label": "Går mot badrumssviten"
            }
        ],
        "artworks": [
            {
                "id": 258,
                "title": "Daylight (Master Suite)",
                "size": "60 × 140 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter, guldpigment",
                "zone": "Sovrum — Huvudvägg över sänggavel",
                "filename": "258 DAYLIGHT.webp",
                "originalFilename": "258 DAYLIGHT.jpg",
                "description": "Fredrik Beckmans svepande färgexplosion i skimrande guld, magenta och djup koboltblått, skräddarsydd i ram över bouclésänggaveln.",
                "pos3d": {
                    "x": -9.5,
                    "y": 2.2,
                    "z": -0.5
                },
                "screenPos": {
                    "x": 21.4,
                    "y": 26.5,
                    "radius": 85
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "bathroom",
                "label": "Gå till Master Spa Badrum",
                "dir": "north",
                "pos3d": {
                    "x": -8.0,
                    "y": 0.0,
                    "z": -4.0
                },
                "screenPos": {
                    "x": 38.0,
                    "y": 62.0
                }
            },
            {
                "targetRoom": "entry",
                "label": "Gå till Entrén",
                "dir": "east",
                "pos3d": {
                    "x": -2.0,
                    "y": 0.0,
                    "z": 4.0
                },
                "screenPos": {
                    "x": 88.0,
                    "y": 62.0
                }
            }
        ]
    },
    "bathroom": {
        "id": "bathroom",
        "name": "Master Spa Badrum",
        "roomNumber": "07",
        "tagline": "Fristående badkar vid fönster, kalkstensdusch och flytande stålkommod",
        "description": "Ett storslaget spa-badrum i sandfärgad kalksten med ett fristående ovalt badkar framför franska balkongfönster, walk-in glasdusch och en flytande dubbelkommod i borstat stål. På den ljusa fondväggen hänger Fredrik Beckmans Vertigo.",
        "image": "assets/walkaround/bathroom.webp",
        "fallback": "assets/walkaround/bathroom.jpg",
        "thumb": "assets/walkaround/bathroom_thumb.webp",
        "pos3d": {
            "x": -8.0,
            "y": 1.65,
            "z": -6.0
        },
        "minimapPos": {
            "x": -10,
            "y": 45
        },
        "initialYaw": 0.0,
        "initialPitch": -0.02,
        "walkSequence": [
            {
                "yaw": -0.1,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Spa-badrummet och kalkstensdusch"
            },
            {
                "yaw": -0.35,
                "pitch": 0.04,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 269,
                "label": "Studerar Vertigo (40 × 100 cm)"
            },
            {
                "yaw": 0.25,
                "pitch": 0.0,
                "zoom": 1.15,
                "duration": 3.5,
                "label": "Beundrar badkaret och stålkommoden"
            },
            {
                "yaw": 0.0,
                "pitch": 0.0,
                "zoom": 1.2,
                "duration": 3.5,
                "targetPortal": "bedroom",
                "label": "Vandrar tillbaka till Sovrummet"
            }
        ],
        "artworks": [
            {
                "id": 269,
                "title": "Vertigo",
                "size": "40 × 100 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter",
                "zone": "Badrum — Vänster vägg vid badkaret",
                "filename": "269 VERTIGO.webp",
                "originalFilename": "269 VERTIGO.jpg",
                "description": "Vertikalt originalverk med djup magenta, koboltblått och guldstoff som harmonierar med badrummets varma kalkstensgolv.",
                "pos3d": {
                    "x": -10.0,
                    "y": 2.0,
                    "z": -7.0
                },
                "screenPos": {
                    "x": 14.6,
                    "y": 32.6,
                    "radius": 50
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "bedroom",
                "label": "Tillbaka till Master Bedroom",
                "dir": "south",
                "pos3d": {
                    "x": -8.0,
                    "y": 0.0,
                    "z": 0.0
                },
                "screenPos": {
                    "x": 50.0,
                    "y": 72.0
                }
            }
        ]
    }
};

const WALKAROUND_CURATED_ROOM = [
    {
        "id": 271,
        "title": "Golden Ticket",
        "size": "40 × 100 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter, guldstoff",
        "zone": "Entré — Högra galleriväggen (Övre)",
        "filename": "271 GOLDEN TICKET.webp",
        "originalFilename": "271 GOLDEN TICKET.jpg",
        "description": "Slankt vertikalt originalverk av Fredrik Beckman i guld-, magenta- och koppartoner med dramatisk textur och guldglans i entréns galleribelysning.",
        "pos3d": {
            "x": 2.2,
            "y": 2.1,
            "z": 4.5
        },
        "screenPos": {
            "x": 72.4,
            "y": 21.8,
            "radius": 65
        }
    },
    {
        "id": 264,
        "title": "Warmpop",
        "size": "40 × 40 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter, högblank resin",
        "zone": "Entré — Högra galleriväggen (Nedre)",
        "filename": "264 WARMPOP.webp",
        "originalFilename": "264 WARMPOP.jpg",
        "description": "Intim kvadratisk färgstudie under högblank resin, hängd strax under Golden Ticket.",
        "pos3d": {
            "x": 2.3,
            "y": 1.2,
            "z": 4.5
        },
        "screenPos": {
            "x": 77.7,
            "y": 47.7,
            "radius": 50
        }
    },
    {
        "id": 265,
        "title": "My Heart Has Teeth",
        "size": "160 × 100 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter, skyddslack",
        "zone": "Salongen — Fondvägg över skänk",
        "filename": "265 MY HEART HAS TEETH.webp",
        "originalFilename": "265 MY HEART HAS TEETH.JPG",
        "description": "Fredrik Beckmans monumentala verk med djup svärta, organiska färgfält i intensiv magenta och guld under glasklar resin.",
        "pos3d": {
            "x": 8.5,
            "y": 2.1,
            "z": -1.5
        },
        "screenPos": {
            "x": 53.8,
            "y": 30.9,
            "radius": 95
        }
    },
    {
        "id": 246,
        "title": "Graines D´Étoiles",
        "size": "100 × 120 cm",
        "year": "2024",
        "material": "Akrylfärg, glitter på duk",
        "zone": "Salong — Vänster portalvägg",
        "filename": "246 GRAINES D'ETOILE.webp",
        "originalFilename": "246 GRAINES D'ETOILE.jpg",
        "description": "Fasetterade rymdstudier i magenta, guld och djupblått som fångar salongens naturliga ljusspel.",
        "pos3d": {
            "x": 7.0,
            "y": 2.0,
            "z": 4.0
        },
        "screenPos": {
            "x": 26.2,
            "y": 31.0,
            "radius": 75
        }
    },
    {
        "id": 266,
        "title": "Black Mirror",
        "size": "160 × 100 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter, pigment",
        "zone": "Salong — Höger fondvägg",
        "filename": "266 BLACK MIRROR.webp",
        "originalFilename": "266 BLACK MIRROR.jpg",
        "description": "Monumentalt mörkt mästerverk med pulserande djup och högblank finish.",
        "pos3d": {
            "x": 13.5,
            "y": 2.1,
            "z": 4.5
        },
        "screenPos": {
            "x": 95.0,
            "y": 28.0,
            "radius": 95
        }
    },
    {
        "id": 268,
        "title": "Raspberry Beret",
        "size": "40 × 100 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter",
        "zone": "Salong — Läshörna bakom fåtölj",
        "filename": "268 RASPBERRY BERET.webp",
        "originalFilename": "268 RASPBERRY BERET.jpg",
        "description": "Vertikalt originalverk med djupa hallontoner, skimrande textur och guldglans i läshörnans varma kvällsljus.",
        "pos3d": {
            "x": 13.2,
            "y": 2.0,
            "z": -0.5
        },
        "screenPos": {
            "x": 35.8,
            "y": 34.0,
            "radius": 75
        }
    },
    {
        "id": 258,
        "title": "Daylight",
        "size": "100 × 120 cm",
        "year": "April 2026",
        "material": "Akrylfärg, guldpigment",
        "zone": "Matsal — Fondvägg över rostfri skänk",
        "filename": "258 DAYLIGHT.webp",
        "originalFilename": "258 DAYLIGHT.jpg",
        "description": "Fredrik Beckmans kraftfulla färgexplosion i magenta, koboltblått och skimrande guld monterad över den rostfria skänken.",
        "pos3d": {
            "x": 5.5,
            "y": 2.1,
            "z": -6.0
        },
        "screenPos": {
            "x": 17.1,
            "y": 27.0,
            "radius": 90
        }
    },
    {
        "id": 267,
        "title": "Pink Dress",
        "size": "100 × 120 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter, pigment",
        "zone": "Matsal — Höger fondvägg",
        "filename": "267 PINK DRESS.webp",
        "originalFilename": "267 PINK DRESS.jpg",
        "description": "Färgsprakande originalverk med skira lager och glittrande textur.",
        "pos3d": {
            "x": 14.5,
            "y": 2.0,
            "z": -4.5
        },
        "screenPos": {
            "x": 94.5,
            "y": 26.5,
            "radius": 80
        }
    },
    {
        "id": 22,
        "title": "Chromeyellowred 1.0",
        "size": "56 × 56 cm",
        "year": "2021",
        "material": "Akrylfärg på duk",
        "zone": "Kök — Vänster fönstervägg",
        "filename": "22. CHROMEYELLOWRED 1.0.webp",
        "originalFilename": "22. CHROMEYELLOWRED 1.0.JPG",
        "description": "Intensiv pop-art färgstudie av Fredrik Beckman som bryter av kökets strama stålytor.",
        "pos3d": {
            "x": 15.5,
            "y": 1.9,
            "z": -8.0
        },
        "screenPos": {
            "x": 7.5,
            "y": 35.2,
            "radius": 70
        }
    },
    {
        "id": 240,
        "title": "Rage In Eden",
        "size": "100 × 40 cm",
        "year": "2024",
        "material": "Akrylfärg på duk",
        "zone": "Arbetsrum — Bokhyllans konstnisch",
        "filename": "240 RAGE IN EDEN.webp",
        "originalFilename": "240 RAGE IN EDEN.jpg",
        "description": "Dramatisk vertikal komposition med intensiva kontraster monterad i bokhyllans skräddarsydda gallerinisch.",
        "pos3d": {
            "x": 2.0,
            "y": 2.0,
            "z": -7.5
        },
        "screenPos": {
            "x": 76.5,
            "y": 36.0,
            "radius": 85
        }
    },
    {
        "id": 270,
        "title": "Origami (Monumental Suite)",
        "size": "100 × 120 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter, guldstoff",
        "zone": "Sovrum — Huvudvägg över sänggavel",
        "filename": "270 ORIGAMI.webp",
        "originalFilename": "270 ORIGAMI.jpg",
        "description": "Fredrik Beckmans mästerverk med fasetterade plan i skimrande glitter, magenta och guld monterat över sänggaveln.",
        "pos3d": {
            "x": -9.5,
            "y": 2.2,
            "z": -0.5
        },
        "screenPos": {
            "x": 21.9,
            "y": 23.0,
            "radius": 95
        }
    },
    {
        "id": 269,
        "title": "Vertigo",
        "size": "40 × 100 cm",
        "year": "April 2026",
        "material": "Akrylfärg, glitter",
        "zone": "Badrum — Vänster vägg vid badkaret",
        "filename": "269 VERTIGO.webp",
        "originalFilename": "269 VERTIGO.jpg",
        "description": "Vertikalt originalverk med djup magenta, koboltblått och guldstoff som harmonierar med badrummets varma kalkstensgolv.",
        "pos3d": {
            "x": -10.0,
            "y": 2.0,
            "z": -7.0
        },
        "screenPos": {
            "x": 15.0,
            "y": 30.0,
            "radius": 85
        }
    }
];

if (typeof window !== 'undefined') {
    window.WALKAROUND_ROOMS = WALKAROUND_ROOMS;
}

