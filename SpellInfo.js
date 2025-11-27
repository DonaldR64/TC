

    const SpellInfo = {

        "Ray of Frost": {
            level: 0,
            range: 60,
            autoHit: false,
            base: '1d8',
            cLevel: {5: '2d8', 11: '3d8'},
            damageType: "cold",
            savingThrow: false,
            note: "Target's Speed is reduced by 10 for a turn",
            sound: "Laser",
            emote: "A frigid beam of blue-white light streaks toward the target",
            fx: "missile-frost",
        },
        "Acid Splash": {
            cat: "Spell",
            level: 0,
            range: 60,
            autoHit: false,
            base: '1d6',
            cLevel: {5: '2d6', 11: '3d6'},
            damageType: "acid",
            savingThrow: "dexterity",
            saveEffect: "No Damage",
            sound: "",
        },
        "Burning Hands": {
            cat: "Spell",
            level: 1,
            range: 15,
            autoHit: true,
            base: '3d6',
            sLevel: ['3d6',"4d6","5d6","6d6","7d6","8d6"],
            damageType: "fire",
            savingThrow: "dexterity",
            saveEffect: "Half Damage",
            emote: "A thin sheet of flame shoots forth from %%C%%'s fingertips",
            sound: "Inferno",
        },
        "Magic Missile": {
            cat: "Spell",
            level: 1,
            range: 120,
            autoHit: true,
            base: '3d4+3',
            sLevel: ['3d4+4','4d4+4','5d4+5','6d4+6','7d4+7'],
            damageType: "force",
            savingThrow: false,
            emote: "%%C%% creates glowing darts of magical force which strike the target",
            sound: "Splinter2",
            fx: "missile-magic",
        },
        "Sleep": {
            emote: "Using a pinch of fine sand, %%C%% sends creatures into a magical slumber",
            level: 1,
            range: 90,
        },
        "Entangle": {
            level: 1,
            range: 90,
        },
        "Faerie Fire": {
            level: 1,
            range: 60,
        },
        "Thunderwave": {
            level: 1,
            range: 5,
        },
        "Fog Cloud": {
            level: 1,
            range: 120,
        },
        "Shield of Faith": {
            level: 1,
            range: 60,
        },
        "Produce Flame": {
            cat: "Spell",
            level: 0,
            range: 30,
            autoHit: false,
            base: '1d8',
            cLevel: {5: '2d8', 11: '3d8'},
            damageType: "fire",
            savingThrow: false,
            sound: "Plasma",
            emote: "%%C%% hurls a ball of flame at the target",
            fx: "missile-frost",
        },


    }

