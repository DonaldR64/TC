

    const WeaponInfo = {
        Longsword: {
            base: '1d8',
            damageType: "slashing",
            properties: "Versatile",
            type: "Melee",
            sound: "Sword",
        },
        Dagger: {
            base: '1d4',
            damageType: "slashing",
            properties: "Finesse, Thrown",
            type: "Melee,Ranged",
            range: [20,60],
            sound: "Club",
        },
        Acornbringer: {
            base: '1d1',
            damageType: 'piercing',
            properties: "Finesse",
            type: "Melee",
            sound: "Sword",
        },
        'Quarterstaff (2H)': {
            base: '1d8',
            damageType: 'bludgeoning',
            type: "Melee",
            sound: "Staff",
        },
        'Scimitar': {
            base: "1d6",
            damageType: 'slashing',
            properties: "Finesse",
            type: "Melee",
            sound: "Sword",
        },
        'Dire Wolf Bite': {
            base: "2d6",
            damageType: 'piercing',
            sound: "Beast",
            type: "Melee",
            text: "If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone.",
        },
        "Bear Bite": {
            base: "1d8",
            damageType: "piercing",
            type: "Melee",
            sound: "Beast",
        },
        "Bear Claws": {
            base: "2d6",
            damageType: "slashing",
            type: "Melee",
            sound: "Beast",
        },
        "Hand Crossbow": {
            base: "1d6",
            damageType: "piercing",
            type: "Ranged",
            range: [30,120],
            sound: "Arrow",
        },
        "Light Crossbow": {
            base: "1d8",
            damageType: "piercing",
            type: "Ranged",
            range: [80,320],
            sound: "Arrow",
        },
        'Spear (2H)': {
            base: "1d8",
            damageType: "piercing",
            type: "Melee",
            sound: "Sword",
        },
        'Mace': {
            base: "1d6,bludgeoning",
            type: "Melee",
            damageType: "bludgeoning",
            sound: "Staff",
        },
        'Shortsword': {
            base: "1d6",
            properties: "Finesse",
            type: "Melee",
            damageType: "piercing",
            sound: "Sword",
        },
        "Fire Bottle": {
            base: "1d4",
            damageType: "fire",
            type: "Ranged",
            range: [20,20],
            sound: "Glass",
            text: "Damage is 1d4 each turn, until put out. DC10 Dex to put out as an action",
        },
        'Flame Blade': {
            base: "3d6",
            damageType: 'fire',
            properties: "Spell",
            type: "Melee",
            sound: "Woosh",
        },




    }
