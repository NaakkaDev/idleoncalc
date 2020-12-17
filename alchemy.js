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

class Cauldron {
    constructor(name, lname, type, bonus, nomath) {
        this.name = name
        this.localized_name = lname
        this.type = type
        this.bonus = bonus
        this.icon = this.getIconName()
        this.no_math = nomath
    }

    getIconName() {
        let name = this.name.toLowerCase().replaceAll('-', '_')
        return name + ".png"
    }
}

let getCauldrons = (data) => {
    let itemObjs = {}
    
    for (let itemType in data) { // power, kazam
        let items = []
        for (let itemObj in data[itemType]) { // item
            let item = data[itemType][itemObj]
            items.push(
                new Cauldron(
                    item.name,
                    item.localized_name,
                    itemType,
                    item.bonus,
                    (item.nomath) ? item.nomath : false
                )
            )
        }

        itemObjs[itemType] = items
    }

    return itemObjs
}