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

class Class {
    constructor(name, localized) {
        this.name = name
        this.localized_name = localized
        this.icon = this.getIconName(name)
    }

    getIconName() {
        let name = this.name.toLowerCase().replaceAll('-', '_')
        return name + ".png"
    }
}

let getClasses = (data) => {
    let dataObjs = []

    for (let dataItem in data) {
        let item = data[dataItem]
        dataObjs.push(
            new Class(
                item.name,
                item.localized_name
            )
        )
    }

    return dataObjs
}