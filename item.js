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

class Item {
    constructor(name, lname, type, stats, lvl) {
        this.name = name
        this.localized_name = lname
        this.type = type // weapon, hat, ring, etc
        this.stats = stats
        this.level = lvl
        this.icon = this.getIconName()
    }

    getIconName() {
        let name = this.name.toLowerCase().replaceAll('-', '_')
        return name + ".png"
    }
}

let getItems = (data) => {
    let itemObjs = {}
    
    for (let itemType in data) { // weapons
        let items = []
        for (let itemSubType in data[itemType]) { // fisticuffs
            for (let itemObj in data[itemType][itemSubType]) { // item
                let item = data[itemType][itemSubType][itemObj]
                items.push(
                    new Item(
                        item.name,
                        item.localized_name,
                        itemSubType,
                        item.stats,
                        item.lvl,
                        (item.class) ? item.class : "all"
                    )
                )
            }
        }

        itemObjs[itemType] = items
    }

    return itemObjs
}