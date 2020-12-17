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

let profileExists = (profileId) => {
    return (localStorage.getItem('profile-' + profileId)) ? true : false
}

let loadProfile = (profileId) => {
    let parsedData = JSON.parse(localStorage.getItem('profile-' + profileId))
    if (parsedData) {
        character.loadData(parsedData)

        updateClass()
        updateTotalStats()
        updateInputs()
        updatePaperdoll()
    }
}

let saveProfile = (profileId) => {
    let dataToSave = character.savebleData

    localStorage.setItem('profile-' + profileId, JSON.stringify(dataToSave))
}

let updateInputs = () => {
    document.querySelectorAll('input[type="number"]').forEach((e) => {
        e.value = 0
    })

    for (let i in character.talents) {
        let talent = character.talents[i]
        document.querySelector('[name="'+ i +'"]').value = talent.input
    }

    for (let i in character.stamps) {
        let stamp = character.stamps[i]
        document.querySelector('[name="'+ i +'"]').value = stamp.input
    }

    for (let i in character.statues) {
        let statue = character.statues[i]
        document.querySelector('[name="'+ i +'"]').value = statue.input
    }
}

let updatePaperdoll = () => {
    document.querySelectorAll('.paperdoll__slot').forEach((e) => {
        clearPaperdollSlot(e.id)
    })

    for (let i in character.paperdoll) {
        populatePaperdoll(i, character.paperdoll[i])
    }
}

let updateClass = () => {
    let classObj = character.class

    document.querySelectorAll('.class__funny').forEach((e) => { e.style.display = 'none' })

    activateClass(document.querySelector('[data-name="'+ classObj.name +'"]'), classObj)
}