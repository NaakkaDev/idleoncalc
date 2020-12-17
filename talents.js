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

class Talent {
    constructor(name, localized, bonus, percentage, tClass, nomath) {
        this.name = name
        this.localized_name = localized
        this.icon = this.getIconName(name)
        this.bonus = bonus
        this.percentages = percentage
        this.class = tClass
        this.no_math = nomath
    }

    getIconName() {
        let name = this.name.toLowerCase().replaceAll('-', '_')
        return name + ".png"
    }
}

let getTalents = (data, key) => {
    let dataObjs = []

    for (let dataItem in data[key]) {
        let item = data[key][dataItem]
        dataObjs.push(
            new Talent(
                item.name,
                item.localized_name,
                item.bonus,
                (item.bonus.percentage) ? item.percentages : [],
                (item.class) ? item.class : "None",
                (item.nomath) ? true : false
            )
        )
    }

    return dataObjs
}