/*Copyright 2020 Teemu Nieminen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
"use strict"

// Super secret math thing, please do not reveal T_T
let smash20 = (level, inc) => {
    return (level * inc) - (level / 20)
}

class Paperdoll {}

class Character {
    constructor() {
        this.starsign = undefined
        this.paperdoll = new Paperdoll()
        this.class = {"name": "beginner", "localized_name": {"en": "Beginner"}}
        this.stats = {}
        this.talents = {}
        this.stamps = {}
        this.statues = {}
        this.bubbles = {}
    }

    get savebleData() {
        return [
            this.starsign,
            this.paperdoll,
            this.class,
            this.stats,
            this.talents,
            this.stamps,
            this.statues,
            this.bubbles
        ]
    }

    loadData(data) {
        this.starsign = data[0]
        this.paperdoll = data[1]
        this.class = data[2]
        this.stats = data[3]
        this.talents = data[4]
        this.stamps = data[5]
        this.statues = data[6]
        this.bubbles = data[7]
    }

    okT(talent) {
        return (talent.class === "None") ? true : talent.class === this.class.name
    }

    talentLevelOrZero(talentName) {
        return (talentName in this.talents) ? this.talents[talentName].input : 0
    }

    talentBonusOrZero(talentName, bonusName) {
        return (talentName in this.talents) ? this.talents[talentName].bonus[bonusName] : 0
    }

    calcHP(str) {
        let initialHp = 15

        let strMultiplier = 1.24
        let stampBaseHp = 0

        let additionalStrMultiplier = 0
        let additionalHpPercentage = 0
        for (let i in this.talents) {
            if (this.okT(this.talents[i]) && Object.keys(this.talents[i].bonus)[0] === 'hp_p') {
                if (i  === 'strength-in-numbers') {
                    additionalStrMultiplier = smash20(this.talents[i].input, (this.talents[i].bonus['hp_p'] * 100)) / 100
                } else {
                    if (this.talents[i].no_math) {
                        additionalHpPercentage += this.talents[i].input
                    } else {
                        // Not in use atm. probably
                        additionalHpPercentage += this.talents[i].input * this.talents[i].bonus['hp_p']
                    }
                    
                }
            }
        }

        let baseHp = Math.round(str * (strMultiplier + additionalStrMultiplier)) + stampBaseHp + initialHp

        // HP from statues
        for (let i in this.statues) {
            if (Object.keys(this.statues[i].bonus)[0] === 'hp') {
                baseHp += this.statues[i].bonus['hp'] * this.statues[i].input
            }
        }

        return baseHp + (baseHp * additionalHpPercentage)
    }

    calcMP(wis) {
        return wis
    }

    caclAccuracy(baseAccuracy) {
        let stat = 0

        if (this.class.name === 'beginner') {
            stat = this.stats['luk']
        } else if (this.class.name === 'warrior') {
            stat = this.stats['wis']
        } else if (this.class.name == 'archer') {
            stat = this.stats['str']
        } else if (this.class.name == 'mage') {
            stat = this.stats['agi']
        }

        return ((Math.pow(stat / 4, 1.4)) + baseAccuracy + 2 + stat) * (1 + stat / 200)
    }

    calcTotalMainAttributes() {
        this.stats = {'str': 0, 'agi': 0, 'wis': 0, 'luk': 0, 'hp': 0, 'mp': 10, 'def': 0, 'accuracy': 0}
        let statsFromPaperdoll = {'str': 0, 'agi': 0, 'wis': 0, 'luk': 0, 'def': 0}

        for (let stat in this.stats) {
            // Stats from the star sign
            if (this.starsign !== undefined && stat in this.starsign.stats) {
                this.stats[stat] += this.starsign.stats[stat]
            }

            // Stats from items
            for (let i in this.paperdoll) {
                if (this.paperdoll[i] === undefined || this.paperdoll[i].stats[stat] === undefined) {
                    continue
                }

                statsFromPaperdoll[stat] += this.paperdoll[i].stats[stat]
            }

            // Gear stat talent bonuses
            for (let i in this.talents) {
                if (this.okT(this.talents[i]) && Object.keys(this.talents[i].bonus)[0] === stat + '_gear_p') {
                    statsFromPaperdoll[stat] += statsFromPaperdoll[stat] * (this.talents[i].bonus[stat + '_gear_p'] * this.talents[i].input)
                }
            }

            // Add paperdoll stats to character stats
            if (stat in statsFromPaperdoll) this.stats[stat] += statsFromPaperdoll[stat];

            // Stats from talents
            for (let i in this.talents) {
                if (this.okT(this.talents[i]) && stat in this.talents[i].bonus) {
                    this.stats[stat] += this.talents[i].bonus[stat] * this.talents[i].input
                }
            }

            // Stats from stamps
            for (let i in this.stamps) {
                if (Object.keys(this.stamps[i].bonus)[0] === stat) {
                    this.stats[stat] += this.stamps[i].bonus[stat] * this.stamps[i].input
                }
            }

            // Additional total stats from alchemy bubbles
            for (let i in this.bubbles) {
                if (Object.keys(this.bubbles[i].bonus)[0] === stat) {
                    this.stats[stat] += this.bubbles[i].input
                }
            }
        }

        // HP & MP from stats
        this.stats['hp'] = this.calcHP(this.stats['str'])
        this.stats['mp'] += this.calcMP(this.stats['wis'])

        // Defence
        let additionalDefencePercentageBonus = 0.0
        for (let i in this.talents) {
            if (this.okT(this.talents[i]) && Object.keys(this.talents[i].bonus)[0] === 'defence_p') {
                if (this.talents[i].no_math) {
                    additionalDefencePercentageBonus = this.talents[i].input * this.stats['def']
                }
            }
        }
        this.stats['def'] += additionalDefencePercentageBonus

        this.stats['accuracy'] = this.caclAccuracy(this.stats['accuracy'])

        // Round stats to two decimals
        for (let i in this.stats) {
            this.stats[i] = Math.round(this.stats[i], 2)
        }
    }

    calcMaxDamage() {
        let total = Math.round(this.calcBaseDamage() * this.calcFinalMultiplier() * this.calcExtraMultiplier())
        return total
    }

    calcMinDamage(maxDamage) {
        let minimumOfMaxPercentage = 0.35 // probably

        for (let i in this.bubbles) {
            if (Object.keys(this.bubbles[i].bonus)[0] === 'min_damage') {
                if (i === 'lil-big-damage') {
                    minimumOfMaxPercentage += (this.bubbles[i].input / 100)
                }
            }
        }

        return minimumOfMaxPercentage * maxDamage
    }

    calcBaseDamageFromStats() {
        if (this.class.name === 'beginner') {
            return this.stats['str']
        } else if (this.class.name === 'warrior') {
            let strInNum = this.talentLevelOrZero('strength-in-numbers')
            return this.stats['str'] * (1 + (smash20(strInNum, this.talentBonusOrZero('strength-in-numbers', 'damage_p') * 100)) / 100)
        } else if (this.class.name == 'archer') {
            return this.stats['agi']
        } else if (this.class.name == 'mage') {
            let knowledgeIsPwr = this.talentLevelOrZero('knowledge-is-power')
            return this.stats['wis'] * (1 + (knowledgeIsPwr * this.talentBonusOrZero('knowledge-is-power', 'damage_p')))
        }
    }

    calcWeaponPower() {
        let weaponPower = 0
        // Weapon power from items
        for (let i in this.paperdoll) {
            if (this.paperdoll[i] === undefined || this.paperdoll[i].stats['wp'] === undefined) {
                continue
            }
            weaponPower += this.paperdoll[i].stats['wp']
        }

        let talentBonus = 0
        let talentPercentageBonus = 0
        // Weapon power from talents
        for (let i in this.talents) {
            if (this.okT(this.talents[i]) && Object.keys(this.talents[i].bonus)[0] === 'wp') {
                if (i === 'sharpened-axe') {
                    talentBonus += smash20(this.talents[i]['input'], this.talents[i]['bonus']['wp'])
                }
            }
            if (this.okT(this.talents[i]) && Object.keys(this.talents[i].bonus)[0] === 'wp_p') {
                talentPercentageBonus += this.talents[i]['input'] * this.talents[i]['bonus']['wp_p']
            }
        }

        return ((weaponPower + 5) * (1 + talentPercentageBonus) + talentBonus) / 3
    }

    calcBaseWeaponDamage() {
        let baseWeaponDamage = Math.pow(this.calcWeaponPower(), 2)

        // Check for stamps
        let stampBaseWeaponDamage = 0
        for (let i in this.stamps) {
            if (Object.keys(this.stamps[i].bonus)[0] === 'damage') {
                stampBaseWeaponDamage += this.stamps[i].bonus['damage'] * this.stamps[i].input
            }
        }

        // Check for statues
        let statueBaseWeaponDamage = 0
        for (let i in this.statues) {
            if (Object.keys(this.statues[i].bonus)[0] === 'damage') {
                statueBaseWeaponDamage += this.statues[i].bonus['damage'] * this.statues[i].input
            }
        }

        return baseWeaponDamage + stampBaseWeaponDamage + statueBaseWeaponDamage
    }

    calcBaseDamage() {
        let goldFoodBaseDmg = 0
        let baseDmgFromOther = 0
        let baseDmg = this.calcBaseDamageFromStats() + this.calcBaseWeaponDamage() + goldFoodBaseDmg + baseDmgFromOther
        let newBase = 0

        let baseDmgFromBubbles = 0
        for (let i in this.bubbles) {
            if (Object.keys(this.bubbles[i].bonus)[0] === 'damage') {
                baseDmgFromBubbles += this.bubbles[i].input
            }
        }

        if (baseDmg > 2000) {
            newBase = Math.max(Math.pow(baseDmg, 0.93)) + baseDmgFromBubbles
        } else {
            newBase = baseDmg + baseDmgFromBubbles
        }

        return newBase
    }

    calcStampPercentageBonus() {
        let stampBonus = 0

        for (let i in this.stamps) {
            if (Object.keys(this.stamps[i].bonus)[0] === 'total_damage_p') {
                if (this.stamps[i].no_math) {
                    stampBonus += this.stamps[i].input
                } else {
                    stampBonus += this.stamps[i].bonus['total_damage_p'] * this.stamps[i].input
                }
            }
        }

        return stampBonus
    }

    calcMultiplierAffectingTalents() {
        if (this.class.name == 'warrior') {
            return Math.log10(this.stats['hp']) * ('meat-shank' in this.talents) ? this.talents['meat-shank'].percentage : 0.0
        } else if (this.class.name == 'mage') {
            return Math.log10(this.stats['mp']) * ('overclocked-energy' in this.talents) ? this.talents['overclocked-energy'].percentage : 0.0
        }

        return 0
    }

    calcMultiplier() {
        return 1 + Math.pow(this.calcBaseDamageFromStats(), 0.7) / 100 + this.calcStampPercentageBonus() + this.calcMultiplierAffectingTalents()
    }

    calcFinalMultiplier() {
        let veinBonus = 1
        let mageMinigameBonus = 0
        let apocalypseZow = 0
        let speedDnaPercentageBonus = 0 // dunno
        let speedTotal = 0 // dunno
        let goldenKebab = 0
        return this.calcMultiplier() * veinBonus * (1 + (mageMinigameBonus + apocalypseZow + (speedDnaPercentageBonus * Math.floor((speedTotal - 1) / 0.25)) / 100) * 1 + goldenKebab)
    }

    calcExtraMultiplier() {
        let starSignDmgPercentageBonus = (this.starsign && "total_damage" in this.starsign.bonus) ? this.starsign.bonus.total_damage : 0.0
        let gildedSwordPercentageBonus = 0

        for (let i in this.talents) {
            if (i === 'gilded-sword') {
                gildedSwordPercentageBonus = this.talents[i].bonus['damage_p'] * this.talents[i].input
            }
        }

        return (1 + 0 + starSignDmgPercentageBonus) * (1 + gildedSwordPercentageBonus)
    }
}
