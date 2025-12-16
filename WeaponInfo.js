

    const WeaponInfo = {
        Longsword: {
            base1: '1d8,slashing',
            properties: "Versatile",
            type: "Melee",
            sound: "Sword",
        },
        Dagger: {
            base1: '1d4,slashing',
            properties: "Finesse, Thrown",
            type: "Melee,Ranged",
            range: [20,60],
            sound: "Club",
        },
        Acornbringer: {
            base1: '1d1,piercing',
            properties: "Finesse",
            type: "Melee",
            sound: "Sword",
        },
        'Quarterstaff (2H)': {
            base1: '1d8,bludgeoning',
            type: "Melee",
            sound: "Staff",
        },
        'Scimitar': {
            base1: "1d6,slashing",
            properties: "Finesse",
            type: "Melee",
            sound: "Sword",
        },
        'Dire Wolf Bite': {
            base1: "2d6,piercing",
            sound: "Beast",
            type: "Melee",
            text: "If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone.",
        },
        "Bear Bite": {
            base1: "1d8,piercing",
            type: "Melee",
            sound: "Beast",
        },
        "Bear Claws": {
            base1: "2d6,slashing",
            type: "Melee",
            sound: "Beast",
        },
        "Hand Crossbow": {
            base1: "1d6,piercing",
            type: "Ranged",
            range: [30,120],
            sound: "Arrow",
        },
        "Light Crossbow": {
            base1: "1d8,piercing",
            type: "Ranged",
            range: [80,320],
            sound: "Arrow",
        },
        'Spear (2H)': {
            base1: "1d8,piercing",
            type: "Melee",
            sound: "Sword",
        },
        'Mace': {
            base1: "1d6,bludgeoning",
            type: "Melee",
            sound: "Staff",
        },
        'Shortsword': {
            base1: "1d6,piercing",
            properties: "Finesse",
            type: "Melee",
            sound: "Sword",
        },
        "Fire Bottle": {
            base1: "1d4,fire",
            type: "Ranged",
            range: [20,20],
            sound: "Glass",
            text: "Damage is 1d4 each turn, until put out. DC10 Dex to put out as an action",
        },
        'Flame Blade': {
            base1: "3d6,fire",
            properties: "Spell",
            type: "Melee",
            sound: "Woosh",
        },




    }
