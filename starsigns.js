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

class StarSign {
    constructor(name, localized, stats, bonus) {
        this.name = name
        this.localized_name = localized
        this.stats = stats
        this.bonus = bonus
    }
}

let getStarSigns = (data) => {
    let dataObjs = []
    
    for (let dataItem in data) {
        dataObjs.push(
            new StarSign(
                data[dataItem].name,
                data[dataItem].localized_name,
                data[dataItem].stats,
                data[dataItem].bonus
            )
        )
    }
    
    dataObjs.sort((a, b) => {
        if (a.type > b.type) {
            return 1
        } else {
            return -1
        }
        return 0
    })

    return dataObjs
}