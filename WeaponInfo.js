

    const WeaponInfo = {
        Longsword: {
            base: '1d8,slashing',
            properties: "Versatile",
            type: "Melee",
            sound: "Sword",
        },
        Dagger: {
            base: '1d4,slashing',
            properties: "Finesse, Thrown",
            type: "Melee,Ranged",
            range: [20,60],
            sound: "Club",
        },
        Acornbringer: {
            base: '1d1,piercing',
            properties: "Finesse",
            type: "Melee",
            sound: "Sword",
        },
        'Quarterstaff (2H)': {
            base: '1d8,bludgeoning',
            type: "Melee",
            sound: "Staff",
        },
        'Scimitar': {
            base: "1d6,slashing",
            properties: "Finesse",
            type: "Melee",
            sound: "Sword",
        },
        'Dire Wolf Bite': {
            base: "2d6,piercing",
            type: "Melee",
            sound: "Beast",
            text: "If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone.",
        },
        "Bear Bite": {
            base: "1d8,piercing",
            type: "Melee",
            sound: "Beast",
        },
        "Bear Claws": {
            base: "2d6,slashing",
            type: "Melee",
            sound: "Beast",
            text: "If the target is a Large or smaller creature, it is knocked Prone",
        },
        "Hand Crossbow": {
            base: "1d6,piercing",
            type: "Ranged",
            range: [30,120],
            sound: "Arrow",
        },
        "Light Crossbow": {
            base: "1d8,piercing",
            type: "Ranged",
            range: [80,320],
            sound: "Arrow",
        },
        'Spear (2H)': {
            base: "1d8,piercing",
            type: "Melee",
            sound: "Sword",
        },
        'Mace': {
            base: "1d6,bludgeoning",
            type: "Melee",
            sound: "Staff",
        },



    }
