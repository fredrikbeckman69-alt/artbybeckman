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
        "minimapPos": {
            "x": 45,
            "y": 105
        },
        "initialYaw": -0.05,
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
                "yaw": 0.28,
                "pitch": 0.05,
                "zoom": 1.25,
                "duration": 4.5,
                "targetArt": 271,
                "label": "Gallerivägg — Golden Ticket & Warmpop"
            },
            {
                "yaw": -0.22,
                "pitch": -0.02,
                "zoom": 1.35,
                "duration": 4.0,
                "targetPortal": "living_room",
                "label": "Går mot portalen till Vardagsrummet"
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
                "year": "Augusti 2024",
                "material": "Akrylfärg, resin",
                "zone": "Entré — Högra galleriväggen (Nedre)",
                "filename": "264 WARMPOP.webp",
                "originalFilename": "264 WARMPOP.jpg",
                "description": "Intim kvadratisk färgstudie under högblank resin, hängd strax under Golden Ticket.",
                "screenPos": {
                    "x": 77.7,
                    "y": 47.7,
                    "radius": 50
                }
            },
            {
                "id": 270,
                "title": "Origami",
                "size": "100 × 120 cm",
                "year": "April 2026",
                "material": "Akrylfärg, glitter",
                "zone": "Vardagsrum via dörrportal",
                "filename": "270 ORIGAMI.webp",
                "originalFilename": "270 ORIGAMI.jpg",
                "description": "Monumentalt verk av Fredrik Beckman synligt genom den stora portalen in till vardagsrummet.",
                "screenPos": {
                    "x": 28.4,
                    "y": 40.9,
                    "radius": 50
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "living_room",
                "label": "Gå in i Vardagsrummet",
                "screenPos": {
                    "x": 26.5,
                    "y": 55.0
                },
                "direction": "forward"
            },
            {
                "targetRoom": "bedroom",
                "label": "Gå till Sovrummet",
                "screenPos": {
                    "x": 92.0,
                    "y": 64.0
                },
                "direction": "right"
            }
        ]
    },
    "living_room": {
        "id": "living_room",
        "name": "Grand Living Room",
        "roomNumber": "02",
        "tagline": "Svängd bouclésoffa, flytande krom och utsikt mot Paris",
        "description": "Salongens hjärta i Haussmann-stil med högt till tak, stuckatur och smidesbalkonger. Över den vita skänken tronar Fredrik Beckmans mästerverk My Heart Has Teeth.",
        "image": "assets/walkaround/living_room.webp",
        "fallback": "assets/walkaround/living_room.jpg",
        "thumb": "assets/walkaround/living_room_thumb.webp",
        "minimapPos": {
            "x": 90,
            "y": 75
        },
        "initialYaw": 0.0,
        "initialPitch": 0.0,
        "walkSequence": [
            {
                "yaw": -0.05,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration:": 3.5,
                "label": "Salongsöversikt mot bouclésoffan"
            },
            {
                "yaw": 0.12,
                "pitch": 0.04,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 265,
                "label": "Huvudvägg — My Heart Has Teeth"
            },
            {
                "yaw": 0.42,
                "pitch": -0.02,
                "zoom": 1.35,
                "duration": 4.0,
                "targetPortal": "dining_room",
                "label": "Går mot portalen till Matsalen"
            }
        ],
        "artworks": [
            {
                "id": 265,
                "title": "My Heart Has Teeth",
                "size": "160 × 100 cm",
                "year": "2024",
                "material": "Akrylfärg, resin, guldstoff",
                "zone": "Vardagsrum — Fondvägg över skänk",
                "filename": "265 MY HEART HAS TEETH.webp",
                "originalFilename": "265 MY HEART HAS TEETH.JPG",
                "description": "Fredrik Beckmans monumentala verk med djup svärta, organiska färgfält i intensiv magenta och guld under glasklar resin.",
                "screenPos": {
                    "x": 53.8,
                    "y": 30.9,
                    "radius": 95
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "dining_room",
                "label": "Gå in i Matsalen",
                "screenPos": {
                    "x": 81.5,
                    "y": 48.0
                },
                "direction": "forward"
            },
            {
                "targetRoom": "entry",
                "label": "Tillbaka till Entrén",
                "screenPos": {
                    "x": 7.5,
                    "y": 72.0
                },
                "direction": "left"
            }
        ]
    },
    "dining_room": {
        "id": "dining_room",
        "name": "Grand Dining Room",
        "roomNumber": "03",
        "tagline": "Runt marmorbord, Louis Ghost-stolar och skulptural skänk",
        "description": "En ljus och öppen matsal med bord i Carraramarmor och skulptural skänk i stål. På fondväggen hänger Fredrik Beckmans verk Daylight.",
        "image": "assets/walkaround/dining_room.webp",
        "fallback": "assets/walkaround/dining_room.jpg",
        "thumb": "assets/walkaround/dining_room_thumb.webp",
        "minimapPos": {
            "x": 135,
            "y": 55
        },
        "initialYaw": -0.1,
        "initialPitch": 0.0,
        "walkSequence": [
            {
                "yaw": -0.1,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Matsalsöversikt med marmorbordet"
            },
            {
                "yaw": -0.4,
                "pitch": 0.05,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 258,
                "label": "Fondvägg — Daylight"
            },
            {
                "yaw": 0.38,
                "pitch": -0.04,
                "zoom": 1.35,
                "duration": 4.0,
                "targetPortal": "kitchen",
                "label": "Går mot passagen till Köket"
            }
        ],
        "artworks": [
            {
                "id": 258,
                "title": "Daylight",
                "size": "100 × 120 cm",
                "year": "2024",
                "material": "Akrylfärg, mixed media, guldstoff",
                "zone": "Matsal — Fondvägg över rostfri skänk",
                "filename": "258 DAYLIGHT.webp",
                "originalFilename": "258 DAYLIGHT.jpg",
                "description": "Fredrik Beckmans kraftfulla färgexplosion i magenta, koboltblått och skimrande guld monterad över den rostfria skänken.",
                "screenPos": {
                    "x": 17.1,
                    "y": 27.0,
                    "radius": 90
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "kitchen",
                "label": "Gå in i Köket",
                "screenPos": {
                    "x": 12.0,
                    "y": 68.0
                },
                "direction": "left"
            },
            {
                "targetRoom": "living_room",
                "label": "Tillbaka till Vardagsrummet",
                "screenPos": {
                    "x": 74.0,
                    "y": 52.0
                },
                "direction": "right"
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
        "minimapPos": {
            "x": 135,
            "y": 108
        },
        "initialYaw": 0.0,
        "initialPitch": 0.0,
        "walkSequence": [
            {
                "yaw": 0.0,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Köksöversikt mot den skulpturala köksön"
            },
            {
                "yaw": -0.42,
                "pitch": 0.06,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 22,
                "label": "Fönstervägg — Chromeyellowred 1.0"
            },
            {
                "yaw": 0.38,
                "pitch": -0.03,
                "zoom": 1.35,
                "duration": 4.0,
                "targetPortal": "dining_room",
                "label": "Går mot portalen till Matsalen"
            }
        ],
        "artworks": [
            {
                "id": 22,
                "title": "Chromeyellowred 1.0",
                "size": "56 × 56 cm",
                "year": "2024",
                "material": "Övermålad IKEA-duk, akryl",
                "zone": "Kök — Vänster fönstervägg",
                "filename": "22. CHROMEYELLOWRED 1.0.webp",
                "originalFilename": "22. CHROMEYELLOWRED 1.0.JPG",
                "description": "Intensiv pop-art färgstudie av Fredrik Beckman som bryter av kökets strama stålytor.",
                "screenPos": {
                    "x": 7.5,
                    "y": 35.2,
                    "radius": 70
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "dining_room",
                "label": "Gå till Matsalen",
                "screenPos": {
                    "x": 80.0,
                    "y": 52.0
                },
                "direction": "forward"
            },
            {
                "targetRoom": "entry",
                "label": "Tillbaka mot Entrén",
                "screenPos": {
                    "x": 10.0,
                    "y": 72.0
                },
                "direction": "left"
            }
        ]
    },
    "bedroom": {
        "id": "bedroom",
        "name": "Master Bedroom",
        "roomNumber": "05",
        "tagline": "Bouclésäng, skulptural metallbänk och balkong mot Paris",
        "description": "En rofylld och lyxig sovrumssvit med säng i krämfärgad bouclé och metallbänk. Över sänggaveln hänger Fredrik Beckmans monumentala mästerverk Origami.",
        "image": "assets/walkaround/bedroom.webp",
        "fallback": "assets/walkaround/bedroom.jpg",
        "thumb": "assets/walkaround/bedroom_thumb.webp",
        "minimapPos": {
            "x": 45,
            "y": 45
        },
        "initialYaw": 0.0,
        "initialPitch": 0.0,
        "walkSequence": [
            {
                "yaw": 0.0,
                "pitch": -0.02,
                "zoom": 1.0,
                "duration": 3.5,
                "label": "Sovrumsöversikt mot bouclésängen och fönstret"
            },
            {
                "yaw": -0.32,
                "pitch": 0.08,
                "zoom": 1.3,
                "duration": 5.0,
                "targetArt": 270,
                "label": "Huvudvägg — Origami Monumental"
            },
            {
                "yaw": 0.28,
                "pitch": -0.04,
                "zoom": 1.35,
                "duration": 4.0,
                "targetPortal": "entry",
                "label": "Går mot dörren ut till Vestibulen"
            }
        ],
        "artworks": [
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
                "screenPos": {
                    "x": 21.9,
                    "y": 23.0,
                    "radius": 95
                }
            }
        ],
        "portals": [
            {
                "targetRoom": "entry",
                "label": "Tillbaka till Vestibul & Entré",
                "screenPos": {
                    "x": 8.0,
                    "y": 68.0
                },
                "direction": "left"
            },
            {
                "targetRoom": "living_room",
                "label": "Gå till Vardagsrummet",
                "screenPos": {
                    "x": 92.0,
                    "y": 65.0
                },
                "direction": "right"
            }
        ]
    }
};

const WALKAROUND_CURATED_ROOM = [
    {
        "id": 265,
        "title": "My Heart Has Teeth",
        "size": "160 × 100 cm",
        "year": "2024",
        "material": "Akrylfärg, resin, guldstoff",
        "zone": "Vardagsrum — Fondvägg över skänk",
        "filename": "265 MY HEART HAS TEETH.webp",
        "originalFilename": "265 MY HEART HAS TEETH.JPG",
        "description": "Fredrik Beckmans monumentala verk med djup svärta, organiska färgfält i intensiv magenta och guld under glasklar resin.",
        "screenPos": {
            "x": 53.8,
            "y": 30.9,
            "radius": 95
        }
    },
    {
        "id": 258,
        "title": "Daylight",
        "size": "100 × 120 cm",
        "year": "2024",
        "material": "Akrylfärg, mixed media, guldstoff",
        "zone": "Matsal — Fondvägg över rostfri skänk",
        "filename": "258 DAYLIGHT.webp",
        "originalFilename": "258 DAYLIGHT.jpg",
        "description": "Fredrik Beckmans kraftfulla färgexplosion i magenta, koboltblått och skimrande guld monterad över den rostfria skänken.",
        "screenPos": {
            "x": 17.1,
            "y": 27.0,
            "radius": 90
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
        "screenPos": {
            "x": 21.9,
            "y": 23.0,
            "radius": 95
        }
    },
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
        "year": "Augusti 2024",
        "material": "Akrylfärg, resin",
        "zone": "Entré — Högra galleriväggen (Nedre)",
        "filename": "264 WARMPOP.webp",
        "originalFilename": "264 WARMPOP.jpg",
        "description": "Intim kvadratisk färgstudie under högblank resin, hängd strax under Golden Ticket.",
        "screenPos": {
            "x": 77.7,
            "y": 47.7,
            "radius": 50
        }
    },
    {
        "id": 22,
        "title": "Chromeyellowred 1.0",
        "size": "56 × 56 cm",
        "year": "2024",
        "material": "Övermålad IKEA-duk, akryl",
        "zone": "Kök — Vänster fönstervägg",
        "filename": "22. CHROMEYELLOWRED 1.0.webp",
        "originalFilename": "22. CHROMEYELLOWRED 1.0.JPG",
        "description": "Intensiv pop-art färgstudie av Fredrik Beckman som bryter av kökets strama stålytor.",
        "screenPos": {
            "x": 7.5,
            "y": 35.2,
            "radius": 70
        }
    }
];
