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

class Statue {
    constructor(name, lname, bonus) {
        this.name = name
        this.localized_name = lname
        this.bonus = bonus
        this.icon = this.getIconName()
    }

    getIconName() {
        let name = this.name.toLowerCase().replaceAll('-', '_')
        return name + ".png"
    }
}

let getStatues = (data) => {
    let itemObjs = []
    
    for (let itemType in data['statue']) { // all
        let items = []
        for (let itemObj in data['statue'][itemType]) { // item
            let item = data['statue'][itemType][itemObj]
            itemObjs.push(
                new Statue(
                    item.name,
                    item.localized_name,
                    item.bonus
                )
            )
        }

    }

    return itemObjs
}