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

let character;

let _items;
let _starsigns;
let _talents;
let _classTalents;
let _classSpecificTalents;
let _classes;
let _stamps;
let _statues;
let _cauldrons;

let dataLoaded = false
let populatedSearchContainers = []
let renderedClassTalents = []

// Contains the search container element if open, else undefined
let openSearchContainer

let closeSearch = () => {
    openSearchContainer.style.display = "none"
    openSearchContainer = undefined
}


let loadData = async () => {
    let classesRes = await fetch('data/classes.json')
    let itemsRes = await fetch('data/items.json')
    let starSignsRes = await fetch('data/star_signs.json')
    let talentsRes = await fetch('data/talents.json')
    let bonusesRes = await fetch('data/bonuses.json')
    let alchemyRes = await fetch('data/alchemy.json')

    let classData = await classesRes.json()
    let starSignsData = await starSignsRes.json()
    let itemData = await itemsRes.json()
    let talentData = await talentsRes.json()
    let bonusData = await bonusesRes.json()
    let alchemyData = await alchemyRes.json()

    _classes = getClasses(classData)
    _items = getItems(itemData)
    _starsigns = getStarSigns(starSignsData)
    _talents = getTalents(talentData, 'main-talents')
    _classTalents = getTalents(talentData, 'class-talents')
    _classSpecificTalents = getTalents(talentData, 'class-specific-talents')
    _stamps = getStamps(bonusData)
    _statues = getStatues(bonusData)
    _cauldrons = getCauldrons(alchemyData)

    populateClasses(_classes)
    renderStarSigns()
    populateTalents(_talents)
    renderStatues(_statues)
    renderStamps(_stamps)
    renderCauldrons(_cauldrons)
}

let toggleActiveClass = (className, targetElem) => {
    let activeElem = document.querySelector('.' + className + '--active')
    if (activeElem) {
        activeElem.classList.remove(className + '--active')
    }

    targetElem.classList.add(className + '--active')
}

let activateClass = (elem, classObj) => {
    toggleActiveClass('class__slot', elem)
    // Hide the funny class text
    document.getElementById('classJokeText_' + character.class.name).style.display = 'none'
    character.class = classObj
    // Set data-class attr for talents container
    mainTalentContainer.setAttribute('data-class', character.class.name)
    classTalentContainer.setAttribute('data-class', character.class.name)
    // Display the funny class text
    document.getElementById('classJokeText_' + character.class.name).style.display = 'block'

    updateTotalStats()

    // Do nothing else if the class talents have already been
    // rendered once
    if (renderedClassTalents.indexOf(character.class.name) > -1) {
        return
    }

    for (let key in _classTalents) {
        if (_classTalents[key].class === character.class.name) {
            renderTalent(mainTalentContainer, _classTalents[key], key, 'classTalents')
        }
    }

    for (let key in _classSpecificTalents) {
        if (_classSpecificTalents[key].class == character.class.name) {
            renderTalent(classTalentContainer, _classSpecificTalents[key], key, 'classSpecificTalents')
        }
    }

    renderedClassTalents.push(character.class.name)
}

let populateClasses = (classes) => {
    let classContainer = document.getElementById('classContainer')
    let mainTalentContainer = document.getElementById('mainTalentContainer')
    let classTalentContainer = document.getElementById('classTalentContainer')

    for (let key in classes) {
        let classSlot = document.createElement('div')
        let item = classes[key]

        classSlot.classList.add('class__slot')
        classSlot.setAttribute('data-id', key)
        classSlot.setAttribute('data-name', item.name)
        if (character.class.name === item.name) {
            classSlot.classList.add('class__slot--active')
            document.getElementById('classJokeText_' + character.class.name).style.display = 'block'
        }
        classSlot.style.backgroundImage = "url('images/classes/" + item.icon + "')"

        classContainer.appendChild(classSlot)
    }
}

let cauldronEvent = (e, bubble) => {
    let lvl = e.target.value
    if (lvl > 0) {
        character.bubbles[bubble.name] = {
            'input': Number(e.target.value),
            'bonus': bubble.bonus
        }
    } else {
        (bubble.name in character.bubbles) ? delete character.bubbles[bubble.name] : undefined
    }

    updateTotalStats()
}

let renderCauldrons = (cauldrons) => {
    let cauldronContainer = document.getElementById('cauldrons')

    for (let c in cauldrons) {
        let cauldron = cauldrons[c]
        let divCauldron = document.createElement('div')
        divCauldron.classList.add('cauldron--' + c)

        for (let bubble in cauldron) {
            let divBubble = document.createElement('div')
            divBubble.classList.add('cauldron__bubble')
            divBubble.style.backgroundImage = "url('images/alchemy/" + cauldron[bubble].icon + "')"

            let inputTitle = document.createElement('strong')
            inputTitle.textContent = cauldron[bubble].localized_name.en

            let inputText = document.createElement('div')
            inputText.textContent = "Bonus:"

            let input = document.createElement('input')
            input.setAttribute('data-type', 'bubble')
            input.setAttribute('data-value', c)
            input.setAttribute('data-id', bubble)
            input.name = cauldron[bubble].name
            input.type = 'number'
            input.min = '0'
            input.value = (bubble.name in character.bubbles) ? character.bubbles[bubble.name] : 0

            divBubble.appendChild(inputTitle)
            divBubble.appendChild(inputText).appendChild(input)

            divCauldron.appendChild(divBubble)
        }

        cauldronContainer.appendChild(divCauldron)
    }
}

let statueEvent = (e, statue) => {
    let lvl = e.target.value
    if (lvl > 0) {
        character.statues[statue.name] = {
            'input': (statue.no_math) ? Number(e.target.value) / 100 : Number(e.target.value),
            'bonus': statue.bonus
        }
    } else {
        (statue.name in character.statues) ? delete character.statues[statue.name] : undefined
    }

    updateTotalStats()
}

let renderStatues = (statues) => {
    let statueContainer = document.getElementById('statues')
    let statueInfoContainer = document.getElementById('statuesInfo')

    for (let key in statues) {
        let statue = statues[key]

        let info = document.createElement('div')
        info.classList.add('statue__info-item')
        let infoName = document.createElement('strong')
        let infoLevel = document.createElement('div')

        infoName.textContent = statue.localized_name.en
        infoLevel.textContent = "Level: "
        let input = document.createElement('input')
        input.setAttribute('data-type', 'statue')
        input.setAttribute('data-id', key)
        input.name = statue.name
        input.type = 'number'
        input.value = (statue.name in character.statues) ? character.statues[statue.name] : 0

        infoLevel.appendChild(input)

        let icon = document.createElement('div')
        icon.classList.add('icon72')
        if (Object.keys(statue.bonus).length === 0) {
            icon.classList.add('icon72--disabled')
        }
        icon.style.backgroundImage = "url('images/statues/" + statue.icon + "')"

        icon.addEventListener('click', (e) => {
            toggleActiveClass('icon72', e.target)
            toggleActiveClass('statue__info-item', info)
        })

        statueContainer.appendChild(icon)
        info.appendChild(infoName).appendChild(infoLevel)
        statueInfoContainer.appendChild(info)
    }
}

let stampEvent = (e, stamp) => {
    let lvl = e.target.value
    if (lvl > 0) {
        character.stamps[stamp.name] = {
            'input': (stamp.no_math) ? Number(e.target.value) / 100 : Number(e.target.value),
            'bonus': stamp.bonus,
            'no_math': stamp.no_math,
        }
    } else {
        (stamp.name in character.stamps) ? delete character.stamps[stamp.name] : undefined
    }

    updateTotalStats()
}

let renderStamps = (stamps) => {
    let stampContainer = document.getElementById('stamps')
    let stampInfoContainer = document.getElementById('stampsInfo')

    for (let key in stamps['combat']) {
        let stamp = stamps['combat'][key]

        let info = document.createElement('div')
        info.classList.add('stamp__info-item')
        let infoName = document.createElement('strong')
        let infoLevel = document.createElement('div')
        let infoBonus = document.createElement('div')

        infoName.textContent = stamp.localized_name.en
        infoLevel.textContent = (stamp.no_math) ? "Bonus percentage" : "Level: "
        infoBonus.textContent = JSON.stringify(stamp.bonus)
        let input = document.createElement('input')
        input.setAttribute('data-type', 'stamp')
        input.setAttribute('data-id', key)
        input.name = stamp.name
        input.type = 'number'
        input.min = 0
        input.value = (stamp.name in character.stamps) ? character.stamps[stamp.name] : 0

        infoLevel.appendChild(input)

        if (stamp.no_math) {
            infoLevel.appendChild(document.createTextNode('%'))
        }

        let icon = document.createElement('div')
        icon.classList.add('icon72')
        if (Object.keys(stamp.bonus).length === 0) {
            icon.classList.add('icon72--disabled')
        }
        icon.style.backgroundImage = "url('images/stamps/" + stamp.icon + "')"

        icon.addEventListener('click', (e) => {
            toggleActiveClass('icon72', e.target)
            toggleActiveClass('stamp__info-item', info)
        })

        stampContainer.appendChild(icon)
        info.appendChild(infoName)
        info.appendChild(infoLevel)
        // info.appendChild(infoBonus)
        stampInfoContainer.appendChild(info)
    }
}

let talentEvent = (e, talent) => {
    let lvl = e.target.value
    if (lvl > 0) {
        character.talents[talent.name] = {
            'input': (talent.no_math) ? Number(e.target.value) / 100 : Number(e.target.value),
            'class': talent.class,
            'bonus': talent.bonus,
            'no_math': talent.no_math,
            'percentage': talent.percentages[Number(e.target.value)]
        }
    } else {
        (talent.name in character.talents) ? delete character.talents[talent.name] : undefined
    }

    updateTotalStats()
}

let renderTalent = (talentContainer, talent, talentId, arrName) => {
    let mainTalentInfo = document.getElementById('mainTalentInfo')
    let info = document.createElement('div')
    info.classList.add('talent__info-item')
    let infoName = document.createElement('strong')
    let infoLevel = document.createElement('div')

    infoName.textContent = talent.localized_name.en
    infoLevel.textContent = (talent.no_math) ? "Bonus percentage" : "Level: "
    let input = document.createElement('input')
    input.setAttribute('data-type', arrName)
    input.setAttribute('data-id', talentId)
    input.name = talent.name
    input.type = 'number'
    input.min = '0'
    input.value = (talent.name in character.talents) ? character.talents[talent.name] : 0

    infoLevel.appendChild(input)
    if (talent.no_math) {
        input.step = '0.01'
        infoLevel.appendChild(document.createTextNode('%'))
    }

    let icon = document.createElement('div')
    icon.classList.add('talent__icon')
    icon.classList.add('talent__icon--' + talent.class)
    // Disable is bonus is missing from the data
    if (Object.keys(talent.bonus).length === 0) {
        icon.classList.add('talent__icon--disabled')
    } else {
        icon.addEventListener('click', (e) => {
            toggleActiveClass('talent__icon', e.target)
            toggleActiveClass('talent__info-item', info)
        })
    }
    icon.style.backgroundImage = "url('images/talents/" + talent.icon + "')"

    talentContainer.appendChild(icon)
    info.appendChild(infoName)
    info.appendChild(infoLevel)
    mainTalentInfo.appendChild(info)
}

let populateTalents = (talents) => {
    let mainTalentContainer = document.getElementById('mainTalentContainer')

    for (let key in talents) {
        renderTalent(mainTalentContainer, talents[key], key, 'talents')
    }
}

let populateClassTalents = () => {
    let classTalentContainer = document.getElementById('classTalentContainer')

    for (let key in _classTalents) {
        renderTalent(classTalentContainer, talents[key], key, 'classTalents')
    }
}

let renderStarSigns = () => {
    let starSignSelectorContainer = document.getElementById('starSignSelectorContainer')
    let starSignSelector = document.createElement('select')
    starSignSelector.id = "starSignSelector"
    for (let key in _starsigns) {
        // Set the first star sign as current one and update the totals
        if (character.starsign === undefined) {
            character.starsign = _starsigns[key]
            updateTotalStats()
        }

        starSignSelector.options.add(
            new Option(
                _starsigns[key].localized_name.en,
                key
            )
        )
    }

    starSignSelector.addEventListener('change', (e) => {
        character.starsign = _starsigns[e.target.value]
        updateTotalStats()
    })

    starSignSelectorContainer.appendChild(starSignSelector)   
}

let updateTotalStats = () => {
    character.calcTotalMainAttributes()

    for (let key in character.stats) {
        let valueElem = document.getElementById('value-' + key)
        valueElem.textContent = character.stats[key]
    }

    let maxDamage = character.calcMaxDamage()
    let minDamage = character.calcMinDamage(maxDamage)
    let valueDmgElem = document.getElementById('value-damage')
    valueDmgElem.textContent = Math.round(minDamage) + "~" + Math.round(maxDamage)
}

let updatePaperdollStatContainer = (paperdollSlotId, item) => {
    // Populate the item stats container
    let paperdollStats = document.getElementById(paperdollSlotId + '_stats')
    let statsTable = document.createElement('table')
    let row = statsTable.insertRow()
    for (let key in item.stats) {
        let cellTitle = row.insertCell()
        cellTitle.appendChild(document.createTextNode(key + ':'))
        cellTitle.style.width = '50px'

        let cellValue = row.insertCell()
        let text = document.createTextNode(item.stats[key])
        cellValue.appendChild(text)

        if (item.stats[key] === 0) {
            row.style.color = '#777'
        }

        let cellButtons = row.insertCell()
        let buttonPlus = document.createElement('button')
        let buttonMinus = document.createElement('button')
        buttonPlus.textContent = '+'
        buttonPlus.setAttribute('data-attr', key)
        buttonMinus.textContent = '-'
        buttonMinus.setAttribute('data-attr', key)
        cellButtons.appendChild(buttonPlus)
        cellButtons.appendChild(buttonMinus)

        buttonPlus.addEventListener('click', (e) => {
            let attr = e.target.dataset.attr
            character.paperdoll[paperdollSlotId].stats[attr]++

            updatePaperdollStatContainer(paperdollSlotId, item)
            updateTotalStats()
        })

        buttonMinus.addEventListener('click', (e) => {
            let attr = e.target.dataset.attr
            character.paperdoll[paperdollSlotId].stats[attr]--

            updatePaperdollStatContainer(paperdollSlotId, item)
            updateTotalStats()
        })

        row = statsTable.insertRow()
    }

    let itemNameElem = document.createElement('strong')
    itemNameElem.appendChild(document.createTextNode(item.localized_name.en))

    paperdollStats.textContent = ''
    paperdollStats.appendChild(itemNameElem)
    paperdollStats.appendChild(statsTable)
}

let populatePaperdoll = (paperdollSlotId, item) => {
    // Populate the paperdoll icon slot
    let paperdollSlot = document.getElementById(paperdollSlotId)
    paperdollSlot.style.backgroundImage = "url('images/items/" + item.icon + "')"

    updatePaperdollStatContainer(paperdollSlotId, item)
}

let clearPaperdollSlot = (paperdollSlotId) => {
    let paperdollSlot = document.getElementById(paperdollSlotId)
    let paperdollStats = document.getElementById(paperdollSlotId + '_stats')

    paperdollSlot.style.backgroundImage = '';
    paperdollStats.textContent = ''
}

let populateOpenSearchContainer = (openSearchContainer, paperdollSlotId, itemCategory, itemType) => {
    // Only populate if it hasn't been before
    if (populatedSearchContainers.indexOf(paperdollSlotId) == -1) {
        let emptyButton = document.createElement('button')
        emptyButton.setAttribute('data-id', paperdollSlotId)
        emptyButton.classList.add("paperdoll__empty-button")
        emptyButton.textContent = 'Empty me'
        openSearchContainer.appendChild(emptyButton)

        let prevType = undefined
        for (let key in _items[itemCategory]) {
            let item = _items[itemCategory][key]

            if (itemType !== 'all' && item.type !== itemType) continue;

            let divItem = document.createElement('div')
            divItem.classList.add('item-icon')
            
            // Add hr if weapon type changes
            if (prevType !== item.type) {
                openSearchContainer.appendChild(document.createElement('hr'))
            }

            divItem.style.backgroundImage = "url('images/items/" + item.icon + "')"
            divItem.setAttribute('data-name', item.name)
            
            prevType = item.type

            // Click a thing to select it
            divItem.addEventListener('click', (e) => {
                character.paperdoll[paperdollSlotId] = item

                populatePaperdoll(paperdollSlotId, item)
                updateTotalStats()
                closeSearch()
            })
            // Append the weapon icon div into the open search container
            openSearchContainer.appendChild(divItem)
        }
        // Push the category to populated array so this isn't done multiple times
        populatedSearchContainers.push(paperdollSlotId)
    }
}

let clearPaperdoll = () => {
    document.querySelectorAll('.paperdoll__slot').forEach((e) => {
        clearPaperdollSlot(e.id)
    })

    character.paperdoll = new Paperdoll()
}

let resetAll = () => {
    character = new Character()

    if (_starsigns) character.starsign = _starsigns[0];
    if (_classes) {
        character.class = _classes[0];
        toggleActiveClass('class__slot', document.querySelector('.class__slot'))

        document.querySelectorAll('.class__funny').forEach((e) => {
            e.style.display = 'none'
        })

        document.getElementById('classJokeText_' + character.class.name).style.display = 'block'

        mainTalentContainer.setAttribute('data-class', character.class.name)
        classTalentContainer.setAttribute('data-class', character.class.name)
    }

    clearPaperdoll()

    document.querySelectorAll('input').forEach((e) => {
        e.value = 0
    })

    document.querySelectorAll('select').forEach((e) => {
        e.selectedIndex = 0
    })

    updateTotalStats()
}

let init = () => {
    character = new Character()

    loadData().then(() => {
        // Create initial profiles into the localStorage
        if (!profileExists(1)) {
            saveProfile(1)
        }
        if (!profileExists(2)) {
            saveProfile(2)
        }
        if (!profileExists(3)) {
            saveProfile(3)
        }
        if (!profileExists(4)) {
            saveProfile(4)
        }
    })

    let paperdollElem = document.getElementById("paperdoll")

    // Click events
    document.addEventListener('click', (e) => {
        if (e.target.id === 'resetButton') {
            resetAll()
        }

        if (e.target.id === 'saveProfile') {
            saveProfile(e.target.dataset.id)
        }

        if (e.target.id === 'loadProfile') {
            loadProfile(e.target.dataset.id)
        }

        if (e.target.dataset.button === 'setProfile') {
            document.getElementById('saveProfile').setAttribute('data-id', e.target.dataset.id)
            document.getElementById('loadProfile').setAttribute('data-id', e.target.dataset.id)

            toggleActiveClass('btn', e.target)
        }

        if (e.target.id === 'resetPaperdollButton') {
            clearPaperdoll()
            updateTotalStats()
        }

        if (e.target.matches('.class__slot')) {
            let classObj = _classes[e.target.dataset.id]
            activateClass(e.target, classObj)
        }

        if (e.target.matches('.paperdoll__slot')) {
            // Add click event listener to each paperdoll slot
            let searchContainer = e.target.firstElementChild

            // Do nothing if already open or clicking the search container
            if (openSearchContainer == searchContainer || e.target == openSearchContainer) {
                return
            }

            // Close open search container if any
            if (openSearchContainer !== undefined) {
                closeSearch()
            }

            populateOpenSearchContainer(searchContainer, e.target.id, e.target.dataset.category, e.target.dataset.type, e.target.dataset.paperdoll)

            searchContainer.style.display = "block"
            openSearchContainer = searchContainer
        }

        if (e.target.matches('.paperdoll__empty-button')) {
            let paperdollSlotId = e.target.dataset.id

            character.paperdoll[paperdollSlotId] = undefined
            clearPaperdollSlot(paperdollSlotId)
            updateTotalStats()
        }

        // Do nothing if search container is not visible
        if (openSearchContainer === undefined) {
            return
        }

        let insideClick = paperdollElem.contains(e.target)
        if (!insideClick) {
            closeSearch()
        }
    })

    // Input events
    let timeoutEventId
    document.addEventListener('input', (e) => {
        if (e.target.matches('[data-type="talents"]')) {
            let talent = _talents[e.target.dataset.id]

            clearTimeout(timeoutEventId)
            timeoutEventId = setTimeout(() => { talentEvent(e, talent) }, 400)
        }

        if (e.target.matches('[data-type="classTalents"]')) {
            let talent = _classTalents[e.target.dataset.id]

            clearTimeout(timeoutEventId)
            timeoutEventId = setTimeout(() => { talentEvent(e, talent) }, 400)
        }

        if (e.target.matches('[data-type="classSpecificTalents"]')) {
            let talent = _classSpecificTalents[e.target.dataset.id]

            clearTimeout(timeoutEventId)
            timeoutEventId = setTimeout(() => { talentEvent(e, talent) }, 400)
        }

        if (e.target.matches('[data-type="stamp"]')) {
            let stamp = _stamps['combat'][e.target.dataset.id]

            clearTimeout(timeoutEventId)
            timeoutEventId = setTimeout(() => { stampEvent(e, stamp) }, 400)
        }

        if (e.target.matches('[data-type="statue"]')) {
            let statue = _statues[e.target.dataset.id]

            clearTimeout(timeoutEventId)
            timeoutEventId = setTimeout(() => { statueEvent(e, statue) }, 400)
        }

        if (e.target.matches('[data-type="bubble"]')) {
            let cauldron = _cauldrons[e.target.dataset.value][e.target.dataset.id]

            clearTimeout(timeoutEventId)
            timeoutEventId = setTimeout(() => { cauldronEvent(e, cauldron) }, 400)
        }
    })
}