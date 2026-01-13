const GALLERY_IMAGES = [
    {
        "filename":  "1 BLOOD 1.0.jpg",
        "title":  "Blood 1.0",
        "id":  1,
        "size":  "52,5 * 52,5 cm",
        "material":  "Sprayfärg, kopparrör, glas, kork, vatten",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "2. WE HEAR YOU.jpg",
        "title":  "We Hear You",
        "id":  2,
        "size":  "15 * 20 cm * 3",
        "material":  "Sprayfärg, headsets",
        "year":  "2020",
        "description":  "Innefattar 2.1, 2.2 samt 2.3 tre tavlor i ett verk/triptyk"
    },
    {
        "filename":  "2. WE HEAR YOU(1).jpg",
        "title":  "We Hear You(1)",
        "id":  2,
        "size":  "15 * 20 cm * 3",
        "material":  "Sprayfärg, headsets",
        "year":  "2020",
        "description":  "Innefattar 2.1, 2.2 samt 2.3 tre tavlor i ett verk/triptyk"
    },
    {
        "filename":  "3. WHY DOES IT HURT... 1.0 backside.jpg",
        "title":  "Why Does It Hurt... 1.0 Backside",
        "id":  3,
        "size":  "75,5 * 150 cm",
        "material":  "Sprayfärg, akrylfärg, garn, trä, glas, kork, garn (UV)",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "3. WHY DOES IT HURT... 1.0 front.jpg",
        "title":  "Why Does It Hurt... 1.0 Front",
        "id":  3,
        "size":  "75,5 * 150 cm",
        "material":  "Sprayfärg, akrylfärg, garn, trä, glas, kork, garn (UV)",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "4. CRUSHED NY THE GEARS OF INDUSTRY 1.0.jpg",
        "title":  "Crushed Ny The Gears Of Industry 1.0",
        "id":  4,
        "size":  "30 * 40 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "5. CRUSHED NY THE GEARS OF INDUSTRY 1.1.jpg",
        "title":  "Crushed Ny The Gears Of Industry 1.1",
        "id":  5,
        "size":  "15 * 20 cm",
        "material":  "Sprayfärg, akrylfärg, metall, kopparrör, glas, kork, vatten",
        "year":  "2020",
        "description":  "Skänkt till Linda Hermansson 2020-12-24 Tavlan inte märkt/signerad"
    },
    {
        "filename":  "6. C-19 1.0.jpg",
        "title":  "C-19 1.0",
        "id":  6,
        "size":  "30 * 40 cm",
        "material":  "Spryfärg, akrylfärg, metall",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "7. PURPLEYELLOW 1.0.jpg",
        "title":  "Purpleyellow 1.0",
        "id":  7,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, kopparrör, glas, kork, vatten, garn (UV)",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "8. BLUE MONDAY 1.0.jpg",
        "title":  "Blue Monday 1.0",
        "id":  8,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör",
        "year":  "2020",
        "description":  "Skänkt till Ellen Beckman 2021-01-11"
    },
    {
        "filename":  "9. REDGOLDWHITESILVER 1.0.jpg",
        "title":  "Redgoldwhitesilver 1.0",
        "id":  9,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg, gran",
        "year":  "2020",
        "description":  "Övermålad. Se 157"
    },
    {
        "filename":  "10. SLYNKIS.jpg",
        "title":  "Slynkis",
        "id":  10,
        "size":  "15 * 20 cm",
        "material":  "Sprayfärg, kopparrör",
        "year":  "2020",
        "description":  "Skänkt till Anna Stjärnlöf 2021-04.02"
    },
    {
        "filename":  "12. THE YELLOW KEY 1.0.jpg",
        "title":  "The Yellow Key 1.0",
        "id":  12,
        "size":  "33 * 41 cm",
        "material":  "Sprayfärg, metall, kopparrör",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "13. MMxx.jpg",
        "title":  "Mmxx",
        "id":  13,
        "size":  "33 * 41 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör",
        "year":  "2020",
        "description":  ""
    },
    {
        "filename":  "15. EMELIES RED.jpg",
        "title":  "Emelies Red",
        "id":  15,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör, glas, kork, vatten, metall",
        "year":  "December 2020 - Januari 2021",
        "description":  "Skänkt till Emelie Lantz 2021-01-03"
    },
    {
        "filename":  "17. PINKGREEN 1.0.jpg",
        "title":  "Pinkgreen 1.0",
        "id":  17,
        "size":  "61 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, garn (UV)",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "18. BLOOD 1.1.jpg",
        "title":  "Blood 1.1",
        "id":  18,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, metall",
        "year":  "Januari 2021",
        "description":  "Övermålad duk, ursprungligen köp på Dollarstore"
    },
    {
        "filename":  "19. BLUE MONDAY 2.0.jpg",
        "title":  "Blue Monday 2.0",
        "id":  19,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "20. THE KEYS TO JAPAN 1.0.jpg",
        "title":  "The Keys To Japan 1.0",
        "id":  20,
        "size":  "41 * 33 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "21. BLUEOCEANKEYSKY 1.0.jpg",
        "title":  "Blueoceankeysky 1.0",
        "id":  21,
        "size":  "56 * 56 cm",
        "material":  "Sprayfärg, akrylfärg, metall, glas, kork, vatten",
        "year":  "Januari 2021",
        "description":  "Övermålad IKEA-duk"
    },
    {
        "filename":  "22. CHROMEYELLOWRED 1.0.JPG",
        "title":  "Chromeyellowred 1.0",
        "id":  22,
        "size":  "56 * 56 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör, glas, kork, vatten, metall",
        "year":  "Januari 2021",
        "description":  "Övermålad IKEA-duk"
    },
    {
        "filename":  "22. CHROMEYELLOWRED 1.0(1).jpg",
        "title":  "Chromeyellowred 1.0(1)",
        "id":  22,
        "size":  "56 * 56 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör, glas, kork, vatten, metall",
        "year":  "Januari 2021",
        "description":  "Övermålad IKEA-duk"
    },
    {
        "filename":  "23. NEW NATION 1.0.jpg",
        "title":  "New Nation 1.0",
        "id":  23,
        "size":  "90 * 30 cm",
        "material":  "Sprayfärg",
        "year":  "Januari 2021",
        "description":  "Övermålad. Se 190 SPLASH 1.3"
    },
    {
        "filename":  "24. WHITEGEARSREDBLACKWHITE .jpg",
        "title":  "Whitegearsredblackwhite",
        "id":  24,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, metall, kopparrör, glas, vatten",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "25. HALF THE RED CROSS 1.0.jpg",
        "title":  "Half The Red Cross 1.0",
        "id":  25,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, kopparrör, plåster",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "26. GREENGRASSSUICIDE.jpg",
        "title":  "Greengrasssuicide",
        "id":  26,
        "size":  "90 * 30 cm",
        "material":  "Sprayfärg, akruylfärg",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "27. LEVER, GEARS AND KEYES.jpg",
        "title":  "Lever, Gears And Keyes",
        "id":  27,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "28. COVID 26-31.jpg",
        "title":  "Covid 26-31",
        "id":  28,
        "size":  "40 * 40 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Januari 2021",
        "description":  "Övermålad IKEA-duk"
    },
    {
        "filename":  "29. BURNING CIRCLE 1.0.jpg",
        "title":  "Burning Circle 1.0",
        "id":  29,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör, glas, kork, vatten, metall",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "30. OEANGE IS THE NEW BLUESASTER 1.0.jpg",
        "title":  "Oeange Is The New Bluesaster 1.0",
        "id":  30,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "31. BLOOD 1.2.jpg",
        "title":  "Blood 1.2",
        "id":  31,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, metall, kopparrör, glas, kork, vatten, akrylfärg",
        "year":  "Februari 2021",
        "description":  "Se HALO 1.1"
    },
    {
        "filename":  "32. COLORESQUE 1.0.jpg",
        "title":  "Coloresque 1.0",
        "id":  32,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  "Övermålad. Se 217"
    },
    {
        "filename":  "33. THE YELLOW KEY 1.1.jpg",
        "title":  "The Yellow Key 1.1",
        "id":  33,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "34 WHY 1.0.png",
        "title":  "Why 1.0",
        "id":  34,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  "Se LIMELIGHT"
    },
    {
        "filename":  "35 KILLED BY DEATH 1.0.jpg",
        "title":  "Killed By Death 1.0",
        "id":  35,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, plast",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "36 MONEY 1.0.jpg",
        "title":  "Money 1.0",
        "id":  36,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör, lim, sedel",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "36 MONEY 1.0 (2).jpg",
        "title":  "Money 1.0 (2)",
        "id":  36,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, kopparrör, lim, sedel",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "37 YARN _ STRIPES 1.0.jpg",
        "title":  "Yarn   Stripes 1.0",
        "id":  37,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, kopparrör, garn (UV)",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "38 METALLIC SUN 1.0.jpg",
        "title":  "Metallic Sun 1.0",
        "id":  38,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, kopparrör",
        "year":  "Februari 2021",
        "description":  "Övermålad. Se 216"
    },
    {
        "filename":  "39 CARRIBEAN BLUE STRIPES 1.0.jpg",
        "title":  "Carribean Blue Stripes 1.0",
        "id":  39,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "40 CHROMED GIFT.JPG",
        "title":  "Chromed Gift",
        "id":  40,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  "Skänkt till Linda Hermansson 2021-03-24"
    },
    {
        "filename":  "41 COLORESQUE 1.1.jpg",
        "title":  "Coloresque 1.1",
        "id":  41,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "42 BLUESILVERHEAD.jpg",
        "title":  "Bluesilverhead",
        "id":  42,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  "Övermålad. Se 218"
    },
    {
        "filename":  "43 LAOWA.jpg",
        "title":  "Laowa",
        "id":  43,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  ""
    },
    {
        "filename":  "44 FLOWERS 1.0.jpg",
        "title":  "Flowers 1.0",
        "id":  44,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2021",
        "description":  "Övermålad"
    },
    {
        "filename":  "45 I HEAR YOU 1.0.jpg",
        "title":  "I Hear You 1.0",
        "id":  45,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, headsets",
        "year":  "Februari/Mars 2021",
        "description":  "Övermålad se 242"
    },
    {
        "filename":  "46 BUBBLEGUM KEY.jpg",
        "title":  "Bubblegum Key",
        "id":  46,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "47 STILL TO BE NAMNED 1.0.jpg",
        "title":  "Still To Be Namned 1.0",
        "id":  47,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "48 PURPLE PINK 1.0.jpg",
        "title":  "Purple Pink 1.0",
        "id":  48,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "49 THE BURNING BUSH 1.0.jpg",
        "title":  "The Burning Bush 1.0",
        "id":  49,
        "size":  "40 * 40 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Övernålad IKEA-tavla"
    },
    {
        "filename":  "50 SOVIET RED SPLATTER.jpg",
        "title":  "Soviet Red Splatter",
        "id":  50,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "51 COLORESQUE 1.2.jpg",
        "title":  "Coloresque 1.2",
        "id":  51,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "53 THE RUNNING PEACOCK.jpg",
        "title":  "The Running Peacock",
        "id":  53,
        "size":  "",
        "material":  "Sprayfärg, akrylfärg, kopparrör",
        "year":  "Mars 2021",
        "description":  "Övermålad IKEA-yavla + ny kilram"
    },
    {
        "filename":  "54 PROFILED MAN, THINKING STRAIGHT.jpg",
        "title":  "Profiled Man, Thinking Straight",
        "id":  54,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "55 THE DREAMS OF L.jpg",
        "title":  "The Dreams Of L",
        "id":  55,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "56 STILL TO BE NAMNED 1.1.jpg",
        "title":  "Still To Be Namned 1.1",
        "id":  56,
        "size":  "61 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Se The big chair"
    },
    {
        "filename":  "57 THE NOT SO SHY WOODS.jpg",
        "title":  "The Not So Shy Woods",
        "id":  57,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Se 224 EXPLODING WOODS"
    },
    {
        "filename":  "58 HUMAN 1.0.jpg",
        "title":  "Human 1.0",
        "id":  58,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Se 225 HUMAN 1.0"
    },
    {
        "filename":  "59 JUNGLE 1.0.jpg",
        "title":  "Jungle 1.0",
        "id":  59,
        "size":  "61 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Se JUNGLE 2.0"
    },
    {
        "filename":  "60 WORLDS APART.jpg",
        "title":  "Worlds Apart",
        "id":  60,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Såld till K-G och Birgitta Beckman 2021-05-21"
    },
    {
        "filename":  "61 COLORESQUE 1.2.jpg",
        "title":  "Coloresque 1.2",
        "id":  61,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "62 THE BIG BLUE 1.0.jpg",
        "title":  "The Big Blue 1.0",
        "id":  62,
        "size":  "61 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Se 234 WIRE"
    },
    {
        "filename":  "63 10 DISSIMILAR KEYS (2).jpg",
        "title":  "10 Dissimilar Keys (2)",
        "id":  63,
        "size":  "90 * 30 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "64 THE BURNING BUSH 1.1.jpg",
        "title":  "The Burning Bush 1.1",
        "id":  64,
        "size":  "46 * 55 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Skänkt till Per Beckman"
    },
    {
        "filename":  "65 NEW DIRECTION 1.0.jpg",
        "title":  "New Direction 1.0",
        "id":  65,
        "size":  "46 * 55 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Skänkt till Linnéa Beckam 2021-04-01"
    },
    {
        "filename":  "66 NEW DIRECTION 1.1.jpg",
        "title":  "New Direction 1.1",
        "id":  66,
        "size":  "61 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Se LIMELIGHT"
    },
    {
        "filename":  "67 BLUE VOID 1.0.jpg",
        "title":  "Blue Void 1.0",
        "id":  67,
        "size":  "139,5 * 56,5 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Övermålad IKEA-tavla"
    },
    {
        "filename":  "68 YARN _ TULIP 1.0.jpg",
        "title":  "Yarn   Tulip 1.0",
        "id":  68,
        "size":  "150 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, garn",
        "year":  "Mars 2021",
        "description":  "Övermålad MIO-tavla"
    },
    {
        "filename":  "69 THE EVIL EYE.jpg",
        "title":  "The Evil Eye",
        "id":  69,
        "size":  "46 * 55 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2021",
        "description":  "Se 229 THE EVIL EYE"
    },
    {
        "filename":  "70 ARTIFICIAL LOVE 1.0.jpg",
        "title":  "Artificial Love 1.0",
        "id":  70,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, akrylfärg, plast",
        "year":  "Mars 2021",
        "description":  ""
    },
    {
        "filename":  "71 DOWN TO EARTH 1.0.jpg",
        "title":  "Down To Earth 1.0",
        "id":  71,
        "size":  "80 * 60 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Nars/April 2021",
        "description":  "Såld till Lovisa Rydgren 2021-04-01. Duk -\u003e loppisfynd Sned"
    },
    {
        "filename":  "72 SLOWLY DYING 1.0.jpg",
        "title":  "Slowly Dying 1.0",
        "id":  72,
        "size":  "25,5 * 25,5 cm",
        "material":  "Sprayfärg, akrylfärg, garn",
        "year":  "2021",
        "description":  "Duk -\u003e loppisfynd"
    },
    {
        "filename":  "73 ARTIFICIAL LOVE 1.1.jpg",
        "title":  "Artificial Love 1.1",
        "id":  73,
        "size":  "25,5 * 25,5 cm",
        "material":  "Sprayfärg, akrylfärg, plast",
        "year":  "2021",
        "description":  "Duk -\u003e loppisfynd"
    },
    {
        "filename":  "74 ARTIFICIAL LOVE 1.2.jpg",
        "title":  "Artificial Love 1.2",
        "id":  74,
        "size":  "25,5 * 25,5 cm",
        "material":  "Sprayfärg, akrylfärg, plast",
        "year":  "2021",
        "description":  "Duk -\u003e loppisfynd"
    },
    {
        "filename":  "75 MEPHISTOPHELES 1.0.jpg",
        "title":  "Mephistopheles 1.0",
        "id":  75,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  "Duk -\u003e loppisfynd Sned"
    },
    {
        "filename":  "76 IT IS A _.jpg",
        "title":  "It Is A",
        "id":  76,
        "size":  "49 * 100 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  "Duk -\u003e loppisfynd"
    },
    {
        "filename":  "77 PURPLE SKULL.jpg",
        "title":  "Purple Skull",
        "id":  77,
        "size":  "25,5 * 25,5 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  "Duk -\u003e loppisfynd "
    },
    {
        "filename":  "78 MEPHISTOPHELES 1.1.jpg",
        "title":  "Mephistopheles 1.1",
        "id":  78,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "79 IT IS GREEN MY DEAR 1.0.jpg",
        "title":  "It Is Green My Dear 1.0",
        "id":  79,
        "size":  "25 * 30 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "80 A STRONG OPINION 1.0.jpg",
        "title":  "A Strong Opinion 1.0",
        "id":  80,
        "size":  "30 * 30 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "81 BURGUNDY MAN.jpg",
        "title":  "Burgundy Man",
        "id":  81,
        "size":  "38 * 38 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  "Duk -\u003e loppisfynd Skänkt till Linnëa Beckman 2021-05-13"
    },
    {
        "filename":  "82 UNNAMNED UNNUMBERED.jpg",
        "title":  "Unnamned Unnumbered",
        "id":  82,
        "size":  "30 * 90",
        "material":  "Sprayfärg, akrylfärg, metall, garn",
        "year":  "Januari 2021",
        "description":  ""
    },
    {
        "filename":  "83 RISE.jpg",
        "title":  "Rise",
        "id":  83,
        "size":  "30 * 90",
        "material":  "Sprayfärg, akrylfärg, garn",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "84 SHE 1.0.jpg",
        "title":  "She 1.0",
        "id":  84,
        "size":  "57 * 68,5 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  "OBS! Ramen ommålad till mörkare lila"
    },
    {
        "filename":  "85 BLOOD 1.3.jpg",
        "title":  "Blood 1.3",
        "id":  85,
        "size":  "20 * 40 cm",
        "material":  "Sprayfärg, akrylfärg, vatten, gls, kork, kopparrör",
        "year":  "2021",
        "description":  "Gåva till Otto Johansson Duk -\u003eLoppisfynd"
    },
    {
        "filename":  "86 STILL TO BE NAMNED 1.3.jpg",
        "title":  "Still To Be Namned 1.3",
        "id":  86,
        "size":  "40 * 60 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  "Se 226"
    },
    {
        "filename":  "87 BEAST FOUNDATION 1.0.jpg",
        "title":  "Beast Foundation 1.0",
        "id":  87,
        "size":  "150 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "4/1/2021 Övermålad. Se 209",
        "description":  "Övermålad MIO-duk."
    },
    {
        "filename":  "88 THE ENT 1.0.jpg",
        "title":  "The Ent 1.0",
        "id":  88,
        "size":  "46 * 55 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "89 THE FREAK 1.0.jpg",
        "title":  "The Freak 1.0",
        "id":  89,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  "Gåva till Markus Sjöö"
    },
    {
        "filename":  "90 THE BURNING BUSH 1.2.jpg",
        "title":  "The Burning Bush 1.2",
        "id":  90,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, poscapennor",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "91 BEFORE IT BECAME THE HIGHWAY TO HELL 1.0.jpg",
        "title":  "Before It Became The Highway To Hell 1.0",
        "id":  91,
        "size":  "46 * 55 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "92 ARE YOU REALLY_.jpg",
        "title":  "Are You Really",
        "id":  92,
        "size":  "55 * 46 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "93 ARTIFICIAL LOVE 2.0.jpg",
        "title":  "Artificial Love 2.0",
        "id":  93,
        "size":  "100 * 40 cm",
        "material":  "Sprayfärg, akrylfärg, plast, lim",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "94 BLUE VOID 1.1.jpg",
        "title":  "Blue Void 1.1",
        "id":  94,
        "size":  "120 * 80 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "April/Maj 2021",
        "description":  "Loppisfynd"
    },
    {
        "filename":  "95 YELLO_ REVISITED.jpg",
        "title":  "Yello  Revisited",
        "id":  95,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "April/Maj 2021",
        "description":  ""
    },
    {
        "filename":  "96 ARE YOU REALLY_ 1.1.jpg",
        "title":  "Are You Really  1.1",
        "id":  96,
        "size":  "40 * 100 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  "Gåva till Bjarne Lott Oktober 2021"
    },
    {
        "filename":  "97 ALONE.jpg",
        "title":  "Alone",
        "id":  97,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  ""
    },
    {
        "filename":  "98 PAINTING POURED ON CHAIR. BEAST FOUNDATION 2.0.jpg",
        "title":  "Painting Poured On Chair. Beast Foundation 2.0",
        "id":  98,
        "size":  "Barstol",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  "Privat"
    },
    {
        "filename":  "98 PAINTING POURED ON CHAIR. BEAST FOUNDATION 2.0(1).jpg",
        "title":  "Painting Poured On Chair. Beast Foundation 2.0(1)",
        "id":  98,
        "size":  "Barstol",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  "Privat"
    },
    {
        "filename":  "99 A BARCHAIR FOR THE CAT.jpg",
        "title":  "A Barchair For The Cat",
        "id":  99,
        "size":  "Barstol",
        "material":  "Sprayfärg",
        "year":  "Maj 2021",
        "description":  "Privat"
    },
    {
        "filename":  "100 A DREAM COME TRUE 1.0.jpg",
        "title":  "A Dream Come True 1.0",
        "id":  100,
        "size":  "40 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, poscapennor",
        "year":  "Maj 2021",
        "description":  "Gåva till Ellen Beckman 20210513"
    },
    {
        "filename":  "101 PAINTING POURED OVER RABLE_ BEAST FOUNDATION 3.0.jpg",
        "title":  "Painting Poured Over Rable  Beast Foundation 3.0",
        "id":  101,
        "size":  "Träbord",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  "Privat"
    },
    {
        "filename":  "102 INVOLUNTARY HERE 1.0.jpg",
        "title":  "Involuntary Here 1.0",
        "id":  102,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  "Loppisfynd Såld till KG \u0026 Birgitta Beckman 2021-05-21"
    },
    {
        "filename":  "103 TRAFFIC JAM.jpg",
        "title":  "Traffic Jam",
        "id":  103,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2022",
        "description":  "Övermålad"
    },
    {
        "filename":  "105 SHE 1.1.jpg",
        "title":  "She 1.1",
        "id":  105,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, Poscapenna, metall",
        "year":  "Maj 2021",
        "description":  ""
    },
    {
        "filename":  "106 IT 1.0.jpg",
        "title":  "It 1.0",
        "id":  106,
        "size":  "60 * 73 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  ""
    },
    {
        "filename":  "107 WOOLOOMOOLOOKIE 1.0.jpg",
        "title":  "Wooloomoolookie 1.0",
        "id":  107,
        "size":  "60 * 73 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Maj 2021",
        "description":  ""
    },
    {
        "filename":  "108 ALONE 1.1.jpg",
        "title":  "Alone 1.1",
        "id":  108,
        "size":  "60 * 73 cm",
        "material":  "Sprayfärg, akrylfärg, Poscapennor, garn",
        "year":  "Maj/juni 2021",
        "description":  ""
    },
    {
        "filename":  "109 ADSUM 1.0.jpg",
        "title":  "Adsum 1.0",
        "id":  109,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Juni 2021",
        "description":  "Såld till Johan Wahn åt Carl Wahn 210807"
    },
    {
        "filename":  "110 HOMMAGE_ CATITIA VON ELVIS.jpg",
        "title":  "Hommage  Catitia Von Elvis",
        "id":  110,
        "size":  "60 * 73 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juni 2021",
        "description":  ""
    },
    {
        "filename":  "111 SILVER FLOWERS 1.0.jpg",
        "title":  "Silver Flowers 1.0",
        "id":  111,
        "size":  "60 * 73 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juni 2021",
        "description":  ""
    },
    {
        "filename":  "112 ALBEDO 0.39.jpg",
        "title":  "Albedo 0.39",
        "id":  112,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juni 2021",
        "description":  "Övermålad"
    },
    {
        "filename":  "113 OLIPOP 1.0.jpg",
        "title":  "Olipop 1.0",
        "id":  113,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juni 2021",
        "description":  "Ommålad se tavla nummer 154"
    },
    {
        "filename":  "114 ALONE 1.2.jpg",
        "title":  "Alone 1.2",
        "id":  114,
        "size":  "40 * 40 cm",
        "material":  "Sprayfärg, akrylfärg, Poscapennor",
        "year":  "Juli 2021",
        "description":  "Loppisfynd IKEA-ram"
    },
    {
        "filename":  "115 CLOCKWORK CHROME.jpg",
        "title":  "Clockwork Chrome",
        "id":  115,
        "size":  "Väggur",
        "material":  "Sprayfärg",
        "year":  "Maj 2020",
        "description":  "Privat"
    },
    {
        "filename":  "116 ENDLESS BOTTLES 1.0 REVISITED.jpg",
        "title":  "Endless Bottles 1.0 Revisited",
        "id":  116,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "117 ENDLESS BOTTLES 1.1.jpg",
        "title":  "Endless Bottles 1.1",
        "id":  117,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "118 ENDLESS BOTTLES 1.2 (ICE BLUE).jpg",
        "title":  "Endless Bottles 1.2 (Ice Blue)",
        "id":  118,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "119 ENDLESS BOTTLES 2.0 (STRAWBERRY FIELDS FOREVER).jpg",
        "title":  "Endless Bottles 2.0 (Strawberry Fields Forever)",
        "id":  119,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, Akrylfärg",
        "year":  "Juli 2021",
        "description":  "Skänkt till Runo Sundberg 20210721"
    },
    {
        "filename":  "120 ENDLESS BOTTLES 1.3 (RUNNING RED).jpg",
        "title":  "Endless Bottles 1.3 (Running Red)",
        "id":  120,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, Akrylfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "121 ENDLESS BOTTLES 2.1 (BEAST FOUNDATION).jpg",
        "title":  "Endless Bottles 2.1 (Beast Foundation)",
        "id":  121,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  "Såld 20220423"
    },
    {
        "filename":  "122 ENDLESS BOTTLES 2.2 (YELLOW POLKA DOT).jpg",
        "title":  "Endless Bottles 2.2 (Yellow Polka Dot)",
        "id":  122,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, Poscapenna",
        "year":  "Juli 2021",
        "description":  "Skänkt till Siv Carlsson 20211224"
    },
    {
        "filename":  "123 EBDLESS BOTTLES 2.2 (GREEN).jpg",
        "title":  "Ebdless Bottles 2.2 (Green)",
        "id":  123,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  "Skänkt till Birgitta Beckman 20210721"
    },
    {
        "filename":  "124 ENDLESS BOTTLES 2.4 (MAGENTA GOLD).jpg",
        "title":  "Endless Bottles 2.4 (Magenta Gold)",
        "id":  124,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, akrylfärg, guldpenna",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "125 ENDLESS BOTTLES 1.4 (GREEN AND GOLD).jpg",
        "title":  "Endless Bottles 1.4 (Green And Gold)",
        "id":  125,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, guldpenna",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "126 ENDLESS BOTTLES 1.5 (GOLDEN PLUM).jpg",
        "title":  "Endless Bottles 1.5 (Golden Plum)",
        "id":  126,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  "Såld 20220423"
    },
    {
        "filename":  "127 ENDLESS BOTTLES 2.5 (SILVER GREEN).jpg",
        "title":  "Endless Bottles 2.5 (Silver Green)",
        "id":  127,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "128 ENDLESS BOTTLES 2.6 (ART DECO).jpg",
        "title":  "Endless Bottles 2.6 (Art Deco)",
        "id":  128,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  "Skänkt till Linda Hermansson 20211224"
    },
    {
        "filename":  "129 ENDLESS BOTTLES 2.7 (ORANGE).jpg",
        "title":  "Endless Bottles 2.7 (Orange)",
        "id":  129,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  "Såld 20220424"
    },
    {
        "filename":  "130 ENDLESS BOTTLES 1.6 (GREEN HEART).jpg",
        "title":  "Endless Bottles 1.6 (Green Heart)",
        "id":  130,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, sticker",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "131 ROADS 1.0.jpg",
        "title":  "Roads 1.0",
        "id":  131,
        "size":  "40 * 40 cm",
        "material":  "Sprayfärg, snörslå, Poscapennor",
        "year":  "Juli 2021",
        "description":  "Övermålad se 233"
    },
    {
        "filename":  "132 1 MINUTE BEFORE ARMAGEDDO.jpg",
        "title":  "1 Minute Before Armageddo",
        "id":  132,
        "size":  "80 * 80",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  "Övermålad . Se 158"
    },
    {
        "filename":  "133 WARM HARMONY 1.0.jpg",
        "title":  "Warm Harmony 1.0",
        "id":  133,
        "size":  "73 * 60",
        "material":  "Akrylfärg, Sprayfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "134 ENDLESS BOTTLES 2.8 _CAFÈ CREME).jpg",
        "title":  "Endless Bottles 2.8  Cafè Creme)",
        "id":  134,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "135 ENDLESS BOTTLES 1.7 (PURE METALLIC).jpg",
        "title":  "Endless Bottles 1.7 (Pure Metallic)",
        "id":  135,
        "size":  "Glasflaska",
        "material":  "Sprayfärg",
        "year":  "Juli 2021",
        "description":  ""
    },
    {
        "filename":  "136 WORDS 1.0.jpg",
        "title":  "Words 1.0",
        "id":  136,
        "size":  "60 * 73 cm",
        "material":  "Sprayfärg, akryl, poscapenna",
        "year":  "Augusti 2021",
        "description":  "Övermålad se 167"
    },
    {
        "filename":  "137 SERENDIPITY 1.0.jpg",
        "title":  "Serendipity 1.0",
        "id":  137,
        "size":  "40 * 40 cm",
        "material":  "Sprayfärg, akryl, poscapenna",
        "year":  "Augusti 2021",
        "description":  "Övermålad"
    },
    {
        "filename":  "138 ENDLESS BOTTLES 2.9 (PINK).jpg",
        "title":  "Endless Bottles 2.9 (Pink)",
        "id":  138,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Augusti 2021",
        "description":  ""
    },
    {
        "filename":  "139 WORDS 1.1.jpg",
        "title":  "Words 1.1",
        "id":  139,
        "size":  "73 * 60",
        "material":  "Sprayfärg, akrylfärg, Poscapenna, ",
        "year":  "Augusti 2021",
        "description":  "Såld till Linnéa Johansson210805"
    },
    {
        "filename":  "140 GOLDEN GRASS 1.0.jpg",
        "title":  "Golden Grass 1.0",
        "id":  140,
        "size":  "80 * 80 cm",
        "material":  "Spräfärg, akrylfärg",
        "year":  "Augusti 2021",
        "description":  "Gäva till Ellen Beckman 210829"
    },
    {
        "filename":  "141 PINK LINES 1.0.jpg",
        "title":  "Pink Lines 1.0",
        "id":  141,
        "size":  "80 * 80 cm",
        "material":  "Spräfärg, akrylfärg",
        "year":  "Augusti 2021",
        "description":  "Gåva till Linnéa Beckman 210829"
    },
    {
        "filename":  "142 ENDLESS BOTTLES 3.0 (LIMEGREEN).jpg",
        "title":  "Endless Bottles 3.0 (Limegreen)",
        "id":  142,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "143 BROWN SESSIONS 1.0 PERPETUAL.jpg",
        "title":  "Brown Sessions 1.0 Perpetual",
        "id":  143,
        "size":  "56,5 * 56,5 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Septemper 2021",
        "description":  "Övermålad Se 213"
    },
    {
        "filename":  "144 ENDLESS BOTTLESS 3.1 (ABANDONED CRIMESCENE).jpg",
        "title":  "Endless Bottless 3.1 (Abandoned Crimescene)",
        "id":  144,
        "size":  "Glasflaska",
        "material":  "Akrylfärg, metall",
        "year":  "Septemper 2021",
        "description":  ""
    },
    {
        "filename":  "145 BROWN SESSIONS 1.1 WARNING.jpg",
        "title":  "Brown Sessions 1.1 Warning",
        "id":  145,
        "size":  "56,5 * 56,5 cm",
        "material":  "Sprayfärg, akrylfärg, garn, metall",
        "year":  "Septemper 2021",
        "description":  "Övermålad IKEA-duk"
    },
    {
        "filename":  "146 DECENT PROPOSAL.jpg",
        "title":  "Decent Proposal",
        "id":  146,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, poscapennor",
        "year":  "Septemper 2021",
        "description":  "SE 235 CONNECTED DOTS"
    },
    {
        "filename":  "147 BROWN SESSIONS 1.2 BURN BABY BURN.jpg",
        "title":  "Brown Sessions 1.2 Burn Baby Burn",
        "id":  147,
        "size":  "46 * 55 CM",
        "material":  "Akrylfärg, sprayfärg",
        "year":  "Septemper 2021",
        "description":  ""
    },
    {
        "filename":  "148 ENDLESS BOTTLES 3.2 (WILDFIRE).jpg",
        "title":  "Endless Bottles 3.2 (Wildfire)",
        "id":  148,
        "size":  "Glasflaska",
        "material":  "Akrylfärg, metall",
        "year":  "Septemper 2021",
        "description":  "Såld 20220423"
    },
    {
        "filename":  "149 BROWN SESSIONS 1.3 (HUMORAL PATHOLOGY).jpg",
        "title":  "Brown Sessions 1.3 (Humoral Pathology)",
        "id":  149,
        "size":  "55 * 46 CM",
        "material":  "Akrylfärg, sprayfärg, Glas, metall, resin",
        "year":  "Septemper/Oktober 2021",
        "description":  ""
    },
    {
        "filename":  "150 ENDLESS BOTTLES 3.3 (PINKISH)).jpg",
        "title":  "Endless Bottles 3.3 (Pinkish))",
        "id":  150,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Oktober 2021",
        "description":  ""
    },
    {
        "filename":  "151 ENDLESS BOTTLES 3.4 (SKULLS).jpg",
        "title":  "Endless Bottles 3.4 (Skulls)",
        "id":  151,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, akrylfärg, metall",
        "year":  "Oktober 2021",
        "description":  "Skänkt till Emelie Lantz 2021-10-15"
    },
    {
        "filename":  "152 ALONE 1.3.jpg",
        "title":  "Alone 1.3",
        "id":  152,
        "size":  "46 * 55 cm",
        "material":  "Sprayfärg, akrylfärg, Poscapenna",
        "year":  "Oktober 2021",
        "description":  "Skänkt till välgörenhetsauktion Rotary Skövde till Kvinnohuset Tranan"
    },
    {
        "filename":  "153 WOOLOOMOOLOOKIE 1.1.jpg",
        "title":  "Wooloomoolookie 1.1",
        "id":  153,
        "size":  "56,5 * 56,5 cm",
        "material":  "Sprayfärg, akrylfärg, poscapenna",
        "year":  "Oktober 2021",
        "description":  "Övermålad IKEA-duk"
    },
    {
        "filename":  "154 BROWN SESSIONS 1.4 (OMNIBUS).jpg",
        "title":  "Brown Sessions 1.4 (Omnibus)",
        "id":  154,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, metall, garn",
        "year":  "Oktober 2021",
        "description":  "PRIVAT"
    },
    {
        "filename":  "156 ENDLESS BOTTLES 3.6 (SY).jpg",
        "title":  "Endless Bottles 3.6 (Sy)",
        "id":  156,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Oktober 2021",
        "description":  ""
    },
    {
        "filename":  "157 LAVENDER VELVET.jpg",
        "title":  "Lavender Velvet",
        "id":  157,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg, metall, garn",
        "year":  "2021",
        "description":  "PRIVAT"
    },
    {
        "filename":  "158 BROWN SESSIONS (COPPER).jpg",
        "title":  "Brown Sessions (Copper)",
        "id":  158,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, garn, poscapenna, metall",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "159 WHALE 1.0.jpg",
        "title":  "Whale 1.0",
        "id":  159,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, garn",
        "year":  "2021",
        "description":  "Såld till Tomas Weber"
    },
    {
        "filename":  "160 ENDLESS BOTTLES 3.7 (GOLDEN YARN).jpg",
        "title":  "Endless Bottles 3.7 (Golden Yarn)",
        "id":  160,
        "size":  "Glasflaska",
        "material":  "Sprayfärg, akrylfärg, metall, garn",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "161 WOOLOOMOOLOOKIE 1.2.jpg",
        "title":  "Wooloomoolookie 1.2",
        "id":  161,
        "size":  "100 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, poscapennor",
        "year":  "2021",
        "description":  ""
    },
    {
        "filename":  "162 WOOLOOMOOLOOKIE 1.3.jpg",
        "title":  "Wooloomoolookie 1.3",
        "id":  162,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, glitter, garn",
        "year":  "Decembar 2021",
        "description":  ""
    },
    {
        "filename":  "163 WARM HARMONY 1.1.jpg",
        "title":  "Warm Harmony 1.1",
        "id":  163,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Januari 2022",
        "description":  ""
    },
    {
        "filename":  "164 NON GRID 1.0.jpg",
        "title":  "Non Grid 1.0",
        "id":  164,
        "size":  "135 * 95 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Januari 2022",
        "description":  "Såld till Philip Rüdiger"
    },
    {
        "filename":  "165 NON GRID 1.1.jpg",
        "title":  "Non Grid 1.1",
        "id":  165,
        "size":  "Väggmålning",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Januari 2022",
        "description":  ""
    },
    {
        "filename":  "166 NON GRID 1.2.jpg",
        "title":  "Non Grid 1.2",
        "id":  166,
        "size":  "100 * 100 cm",
        "material":  "Sprayf\u0027ärg, akrylfärg",
        "year":  "Februari 2022",
        "description":  ""
    },
    {
        "filename":  "167 FREDENHAM 1.0.jpg",
        "title":  "Fredenham 1.0",
        "id":  167,
        "size":  "60 * 73 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Februari 2022",
        "description":  ""
    },
    {
        "filename":  "168 ENDLESS BOTTLES 3.8 (FLOUR).jpg",
        "title":  "Endless Bottles 3.8 (Flour)",
        "id":  168,
        "size":  "Glasflaska",
        "material":  "Sprayfärg (Fluorocerande)",
        "year":  "Februari 2022",
        "description":  "Krossad och slängd"
    },
    {
        "filename":  "169 FLOWER 1.1.jpg",
        "title":  "Flower 1.1",
        "id":  169,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, väggfärg, akrylfärg, glitter",
        "year":  "Mars 2022",
        "description":  ""
    },
    {
        "filename":  "170 UKRAINIAN SUNFLOWER.jpg",
        "title":  "Ukrainian Sunflower",
        "id":  170,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, limspray, glitter",
        "year":  "Mars 2022",
        "description":  "Skänkt till auktion"
    },
    {
        "filename":  "171 MONEY 1.1.jpg",
        "title":  "Money 1.1",
        "id":  171,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, Akrylfärg, glitter, sedel, spraylim",
        "year":  "Mars 2022",
        "description":  ""
    },
    {
        "filename":  "172 NON GRID 1.2.1.jpg",
        "title":  "Non Grid 1.2.1",
        "id":  172,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2022",
        "description":  ""
    },
    {
        "filename":  "173 SILVER TAPESTRY 1.0.jpg",
        "title":  "Silver Tapestry 1.0",
        "id":  173,
        "size":  "80 * 80 cm",
        "material":  "Tapet, sprayfärg, spraylim, glitter, akrylfärg",
        "year":  "Mars 2022",
        "description":  ""
    },
    {
        "filename":  "174 NON GRID 1.3.jpg",
        "title":  "Non Grid 1.3",
        "id":  174,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2022",
        "description":  "Övermålad. Se 187 SPLASH 1.1"
    },
    {
        "filename":  "175 NON GRID 1.4.jpg",
        "title":  "Non Grid 1.4",
        "id":  175,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Mars 2022",
        "description":  ""
    },
    {
        "filename":  "176 WHALE 1.1.jpg",
        "title":  "Whale 1.1",
        "id":  176,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter, garn",
        "year":  "Mars 2022",
        "description":  ""
    },
    {
        "filename":  "177 BROWN SESSIONS (CHAIR).jpg",
        "title":  "Brown Sessions (Chair)",
        "id":  177,
        "size":  "-",
        "material":  "Sprayfärg",
        "year":  "Mars 2022",
        "description":  ""
    },
    {
        "filename":  "178 UKRAINIAN SUNFLOWER 1.1.jpg",
        "title":  "Ukrainian Sunflower 1.1",
        "id":  178,
        "size":  "72,5 * 60 cm",
        "material":  "Sprayfärg, glitter",
        "year":  "2022",
        "description":  "Skänkt till auktion"
    },
    {
        "filename":  "179 NON GRID 1.5.jpg",
        "title":  "Non Grid 1.5",
        "id":  179,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "180 WOOLOOMOOLOOKIE 1.4.jpg",
        "title":  "Wooloomoolookie 1.4",
        "id":  180,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Maj 2002",
        "description":  "Övermålad. Se 188 SPLASH 1.2"
    },
    {
        "filename":  "181 SKEW 1.0.jpg",
        "title":  "Skew 1.0",
        "id":  181,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg",
        "year":  "Juni 2002",
        "description":  ""
    },
    {
        "filename":  "182 HALO 1.0.jpg",
        "title":  "Halo 1.0",
        "id":  182,
        "size":  "100 * 100 cm",
        "material":  "Aprayfärg, akrylfärg, glitter, poscapenna",
        "year":  "Juli 2022",
        "description":  ""
    },
    {
        "filename":  "183FOUR 1.0.jpg",
        "title":  "Four 1.0",
        "id":  183,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, poscapennor, garn",
        "year":  "Juli 2022",
        "description":  ""
    },
    {
        "filename":  "184 WATCHING 1.0.jpg",
        "title":  "Watching 1.0",
        "id":  184,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, poscapennor",
        "year":  "Augusti 2022",
        "description":  ""
    },
    {
        "filename":  "185 COLLABORATION 1.0.jpg",
        "title":  "Collaboration 1.0",
        "id":  185,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "September 2022",
        "description":  ""
    },
    {
        "filename":  "186 SPLASH 1.0.jpg",
        "title":  "Splash 1.0",
        "id":  186,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, garn, akrylfärg, resin",
        "year":  "Oktober 2022",
        "description":  "PRIVAT"
    },
    {
        "filename":  "187 SPLASH 1.1.jpg",
        "title":  "Splash 1.1",
        "id":  187,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akryl, glitter",
        "year":  "Oktober 2022",
        "description":  ""
    },
    {
        "filename":  "188 SPLASH 1.2.JPG",
        "title":  "Splash 1.2",
        "id":  188,
        "size":  "80 * 80 cm",
        "material":  "Spreayfärg, akryl, glitter",
        "year":  "Oktober 2022",
        "description":  ""
    },
    {
        "filename":  "189 THE LADDER 1.0.jpg",
        "title":  "The Ladder 1.0",
        "id":  189,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akryl, poscapennor, garn, glitter",
        "year":  "Oktober 2022",
        "description":  "Såld via NOA 2023-08-30"
    },
    {
        "filename":  "190 SPLASH 1.3.jpg",
        "title":  "Splash 1.3",
        "id":  190,
        "size":  "90 * 30 cm",
        "material":  "Spryfärg, akrylfärg ",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "191 SPLASH 1.4.jpg",
        "title":  "Splash 1.4",
        "id":  191,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "192 SPLASH 1.5.jpg",
        "title":  "Splash 1.5",
        "id":  192,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "193 SPLASH 1.6.jpg",
        "title":  "Splash 1.6",
        "id":  193,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter. resin",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "194 splash 1.7.jpg",
        "title":  "Splash 1.7",
        "id":  194,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "195 SPLASH 1.8.jpg",
        "title":  "Splash 1.8",
        "id":  195,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "196 SPLAH 1.9.jpg",
        "title":  "Splah 1.9",
        "id":  196,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "197 SPLASH 1.10.jpg",
        "title":  "Splash 1.10",
        "id":  197,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "2022",
        "description":  ""
    },
    {
        "filename":  "198 SPLASH 1.11.jpg",
        "title":  "Splash 1.11",
        "id":  198,
        "size":  "120 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  "Gåva till Hans-Olof Markus"
    },
    {
        "filename":  "199 FLOWER 1-2.jpg",
        "title":  "Flower 1-2",
        "id":  199,
        "size":  "100 * 70 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "200 SPLASH 2-0.jpg",
        "title":  "Splash 2-0",
        "id":  200,
        "size":  "70 * 100 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "201 SPLASH 2.1.jpg",
        "title":  "Splash 2.1",
        "id":  201,
        "size":  "100 * 70 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "202 SPLASH 2.2.jpg",
        "title":  "Splash 2.2",
        "id":  202,
        "size":  "100 * 70 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  "Gåva till Emelie Lantz 20230117"
    },
    {
        "filename":  "203 SPLASH 2.3.jpg",
        "title":  "Splash 2.3",
        "id":  203,
        "size":  "100 * 40 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "204 ETHNICOLOR 1.0.jpg",
        "title":  "Ethnicolor 1.0",
        "id":  204,
        "size":  "100 * 70 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "205 ETHNICOLOR 1.1.jpg",
        "title":  "Ethnicolor 1.1",
        "id":  205,
        "size":  "100 * 70 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "206 EQUINOXE 1.0.jpg",
        "title":  "Equinoxe 1.0",
        "id":  206,
        "size":  "100 * 70 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "207 ETHNICOLOR 1,2.jpg",
        "title":  "Ethnicolor 1,2",
        "id":  207,
        "size":  "100 * 70 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "208 ETNICOLOR 1.3.jpg",
        "title":  "Etnicolor 1.3",
        "id":  208,
        "size":  "100 * 40 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "209 ETHNICOLOR 1.4.jpg",
        "title":  "Ethnicolor 1.4",
        "id":  209,
        "size":  "150 * 50 cm",
        "material":  "Soratfärg, alrylfärg",
        "year":  "Januari 2023",
        "description":  ""
    },
    {
        "filename":  "210 OUT OF NOTHING EVERYTHING.jpg",
        "title":  "Out Of Nothing Everything",
        "id":  210,
        "size":  "50 * 50 cm",
        "material":  "Soratfärg, alrylfärg",
        "year":  "Februari 2023",
        "description":  ""
    },
    {
        "filename":  "211 ETHNICOLOR 1.5.jpg",
        "title":  "Ethnicolor 1.5",
        "id":  211,
        "size":  "90 * 30 cm",
        "material":  "Soratfärg, alrylfärg",
        "year":  "Februari 2023",
        "description":  ""
    },
    {
        "filename":  "212 ETHNICOLOR 1-6.jpg",
        "title":  "Ethnicolor 1-6",
        "id":  212,
        "size":  "40 * 40 cm",
        "material":  "Soratfärg, alrylfärg",
        "year":  "Februari 2025",
        "description":  ""
    },
    {
        "filename":  "213 OUT OF EVERYTHING SOMETHING.jpg",
        "title":  "Out Of Everything Something",
        "id":  213,
        "size":  "56,5 * 56,5 cm",
        "material":  "Soratfärg, alrylfärg, garn",
        "year":  "Februari 2026",
        "description":  ""
    },
    {
        "filename":  "214 APOCALYPSE 1.0.jpg",
        "title":  "Apocalypse 1.0",
        "id":  214,
        "size":  "150 * 50 cm",
        "material":  "Soratfärg, alrylfärg, garn, glitter",
        "year":  "Februari 2023",
        "description":  ""
    },
    {
        "filename":  "215 BROWN SESSIONS 1.1.jpg",
        "title":  "Brown Sessions 1.1",
        "id":  215,
        "size":  "56,5 * 56,5 cm",
        "material":  "Sprayfärg, akrylfärg, garn, metall",
        "year":  "Mars 2023",
        "description":  ""
    },
    {
        "filename":  "216 SPIRAL 1.0.jpg",
        "title":  "Spiral 1.0",
        "id":  216,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, glitterspray, metall",
        "year":  "2023",
        "description":  ""
    },
    {
        "filename":  "217 BLOB 1.0.jpg",
        "title":  "Blob 1.0",
        "id":  217,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2023",
        "description":  ""
    },
    {
        "filename":  "218 1000 FACES.jpg",
        "title":  "1000 Faces",
        "id":  218,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2023",
        "description":  ""
    },
    {
        "filename":  "219 EQUINOXE 1.1.jpg",
        "title":  "Equinoxe 1.1",
        "id":  219,
        "size":  "100 * 40 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2023",
        "description":  ""
    },
    {
        "filename":  "220 M;AGNETIC FIELDS 1.0.jpg",
        "title":  "M;Agnetic Fields 1.0",
        "id":  220,
        "size":  "70 * 63 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2023",
        "description":  ""
    },
    {
        "filename":  "221 FREDENHAM 1.1.jpg",
        "title":  "Fredenham 1.1",
        "id":  221,
        "size":  "70 * 63 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2023",
        "description":  ""
    },
    {
        "filename":  "222 EQUINOXE 1.1.jpg",
        "title":  "Equinoxe 1.1",
        "id":  222,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juli 2023",
        "description":  ""
    },
    {
        "filename":  "223 HALO 1.1.jpg",
        "title":  "Halo 1.1",
        "id":  223,
        "size":  "30 * 90 cm",
        "material":  "Sprayfärg, akrylfärg, metall, glas, kork",
        "year":  "Juli 2023",
        "description":  ""
    },
    {
        "filename":  "224 EXPLODING WOODS.jpg",
        "title":  "Exploding Woods",
        "id":  224,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juli 2023",
        "description":  ""
    },
    {
        "filename":  "225 HUMAN 1.0.jpg",
        "title":  "Human 1.0",
        "id":  225,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juli 2023",
        "description":  ""
    },
    {
        "filename":  "226 MOVEMENT.jpg",
        "title":  "Movement",
        "id":  226,
        "size":  "40 * 60 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Juli 2023",
        "description":  ""
    },
    {
        "filename":  "227 THE BIG CHAIR.jpg",
        "title":  "The Big Chair",
        "id":  227,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Juli 2023",
        "description":  ""
    },
    {
        "filename":  "228 LIMELIGHT.jpg",
        "title":  "Limelight",
        "id":  228,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Juli 2023",
        "description":  ""
    },
    {
        "filename":  "229 THE EVIL EYE.jpg",
        "title":  "The Evil Eye",
        "id":  229,
        "size":  "50 * 61 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "230 PEACE.OOOO.jpg",
        "title":  "Peace.Oooo",
        "id":  230,
        "size":  "61 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "231 JUNGLE 2.0.jpg",
        "title":  "Jungle 2.0",
        "id":  231,
        "size":  "61* 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "232 WIRE.jpg",
        "title":  "Wire",
        "id":  232,
        "size":  "61 * 50 cm",
        "material":  "Spratfärg, akrylfärg",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "233 CHAOS 1.0.jpg",
        "title":  "Chaos 1.0",
        "id":  233,
        "size":  "40 * 40 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "234 SIGNS.jpg",
        "title":  "Signs",
        "id":  234,
        "size":  "73 * 60 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "235 CONNECTED DOTS 1.0.jpg",
        "title":  "Connected Dots 1.0",
        "id":  235,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "236 THE WORLD IS MY OYSTER.jpg",
        "title":  "The World Is My Oyster",
        "id":  236,
        "size":  "139,5 * 56,5 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "Augusti 2023",
        "description":  ""
    },
    {
        "filename":  "237 BURN BABY BURN.jpg",
        "title":  "Burn Baby Burn",
        "id":  237,
        "size":  "50 * 50 cm",
        "material":  "Sprayfärg, akrylfärg",
        "year":  "2023",
        "description":  ""
    },
    {
        "filename":  "238 BOWS.jpg",
        "title":  "Bows",
        "id":  238,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Oktober 2023",
        "description":  ""
    },
    {
        "filename":  "238 BOWS side.jpg",
        "title":  "Bows Side",
        "id":  238,
        "size":  "80 * 80 cm",
        "material":  "Sprayfärg, akrylfärg, glitter",
        "year":  "Oktober 2023",
        "description":  ""
    },
    {
        "filename":  "239 DEATH IS EBVERYWHERE.jpg",
        "title":  "Death Is Ebverywhere",
        "id":  239,
        "size":  "150 * 50 cm",
        "material":  "Sprayfärg, akrylfärg, garn, glitter, resin",
        "year":  "2024",
        "description":  ""
    },
    {
        "filename":  "240 RAGE IN EDEN.jpg",
        "title":  "Rage In Eden",
        "id":  240,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg",
        "year":  "2024",
        "description":  ""
    },
    {
        "filename":  "241 PROTECTED FROM THE SUN 1.0.jpg",
        "title":  "Protected From The Sun 1.0",
        "id":  241,
        "size":  "80 * 80 cm",
        "material":  "Akrylfärg, poscapennor",
        "year":  "2024",
        "description":  ""
    },
    {
        "filename":  "242 ATOMIC #79.jpg",
        "title":  "Atomic #79",
        "id":  242,
        "size":  "30 * 30 cm",
        "material":  "Spackel, sprayfärg, akrylfärg, resin",
        "year":  "Maj 2024",
        "description":  "Skänkt till Tina Joon"
    },
    {
        "filename":  "243 FROZEN 1.0.jpg",
        "title":  "Frozen 1.0",
        "id":  243,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Maj 2024",
        "description":  ""
    },
    {
        "filename":  "245 FUSION 1.0.jpg",
        "title":  "Fusion 1.0",
        "id":  245,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, sprayglitter, glitter, resin",
        "year":  "Juni 2024",
        "description":  ""
    },
    {
        "filename":  "246 GRAINES D´ÉTOILES.jpg",
        "title":  "Graines D´Étoiles",
        "id":  246,
        "size":  "100 * 120 cm",
        "material":  "Akrulfärg, glitter, resin",
        "year":  "Juni 2024",
        "description":  "Såld till Peter Bodelid"
    },
    {
        "filename":  "248 LINNÈAS TRILOGI 1.jpg",
        "title":  "Linnèas Trilogi 1",
        "id":  248,
        "size":  "60 * 73 cm",
        "material":  "Spackel, akrylfärg",
        "year":  "Juli 2024",
        "description":  "Skänkt till Linnéa"
    },
    {
        "filename":  "249 LINNÈAS TRILOGI 2 .jpg",
        "title":  "Linnèas Trilogi 2",
        "id":  249,
        "size":  "60 * 73 cm",
        "material":  "Spackel, akrylfärg",
        "year":  "Juli 2024",
        "description":  "Skänkt till Linnéa"
    },
    {
        "filename":  "250 LINNÈAS TRILOGI 3 .jpg",
        "title":  "Linnèas Trilogi 3",
        "id":  250,
        "size":  "60 * 73 cm",
        "material":  "Spackel",
        "year":  "Juli 2024",
        "description":  "Skänkt till Linnéa"
    },
    {
        "filename":  "251 BRIGHT LIGHTS.jpg",
        "title":  "Bright Lights",
        "id":  251,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, glitter, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "252 HELP ME LOSE MY MIND.jpg",
        "title":  "Help Me Lose My Mind",
        "id":  252,
        "size":  "100 * 40 cm",
        "material":  "Akruylfärg, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "253 BUNGALOW.jpg",
        "title":  "Bungalow",
        "id":  253,
        "size":  "27 * 35 cm",
        "material":  "Akrylfärg, resin, glitter",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "254 LOVE IS MAGIC.jpg",
        "title":  "Love Is Magic",
        "id":  254,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "255 WAKING LIGHT.jpg",
        "title":  "Waking Light",
        "id":  255,
        "size":  "40 * 40 cm",
        "material":  "Akrylfärg, resin, glitter",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "256 UNREAL.jpg",
        "title":  "Unreal",
        "id":  256,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, glitterspray, glitter, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "257 JUNIOR B.jpg",
        "title":  "Junior B",
        "id":  257,
        "size":  "40 * 40 cm",
        "material":  "Akrylfärg, paljetter, glitter, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "258 DAYLIGHT.jpg",
        "title":  "Daylight",
        "id":  258,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "259 RED RAIN.jpg",
        "title":  "Red Rain",
        "id":  259,
        "size":  "70 * 50 cm",
        "material":  "Akrylfärg",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "260 WHO KNEW.jpg",
        "title":  "Who Knew",
        "id":  260,
        "size":  "50 * 50 cm",
        "material":  "Akrylfärg",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "261 PEARLS.jpg",
        "title":  "Pearls",
        "id":  261,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "262 GRAPEFRUIT.jpg",
        "title":  "Grapefruit",
        "id":  262,
        "size":  "40 * 40 cm",
        "material":  "Akrylfärg, sprayfärg, glitterspray, glitter, resin",
        "year":  "Juli 2024",
        "description":  ""
    },
    {
        "filename":  "263 GRAPEFRUIT.jpg",
        "title":  "Grapefruit",
        "id":  263,
        "size":  "100 * 40 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Augusti 2024",
        "description":  ""
    },
    {
        "filename":  "264 WARMPOP.jpg",
        "title":  "Warmpop",
        "id":  264,
        "size":  "40 * 40 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Augusti 2024",
        "description":  ""
    },
    {
        "filename":  "265 MY HEART HAS TEETH.JPG",
        "title":  "My Heart Has Teeth",
        "id":  265,
        "size":  "160 * 100 cm",
        "material":  "Akrylfärg, resin",
        "year":  "2024",
        "description":  ""
    },
    {
        "filename":  "266 BLACK MIRROR.jpg",
        "title":  "Black Mirror",
        "id":  266,
        "size":  "160 * 100 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Septemner 2024",
        "description":  ""
    },
    {
        "filename":  "267 PINK DRESS.jpg",
        "title":  "Pink Dress",
        "id":  267,
        "size":  "100 * 120 cm",
        "material":  "Akrylfärg, resin",
        "year":  "Deceber 2025",
        "description":  ""
    },
    {
        "filename":  "268 RASPBERRY BERET.jpg",
        "title":  "Raspberry Beret",
        "id":  268,
        "size":  "40 * 100 cm",
        "material":  "Akrylfärg, lim, glitter, smycken",
        "year":  "Januari 2026",
        "description":  ""
    }
];
