var componentAddForm = {
    props: ['newItem', 'quantityUnits', 'showAdd'],
    template: '\
        <div class="add-form">\
            <div class="add-button-box">\
                <button class="button-base orange" v-on:click="$emit(\'local-storage-reset\')">Reset</button>\
                <button class="button-base" v-on:click="$emit(\'add-toggle\')">\
                    <span v-if="showAdd">&times; Skrýt</span>\
                    <span v-else> + Přidat</span>\
                </button>\
            </div>\
            <div class="add-form-box">\
                <transition name="slide-fade">\
                    <div v-if="showAdd" class="hidden-box" v-bind:class="{ opened: showAdd }">\
                        <input class="number" v-bind:class="{ error: newItem.notValidNumber }" type="number" v-model="newItem.number" min="1" max="999">\
                        <select v-bind:class="{ error: newItem.notValidUnitId }" v-model="newItem.unitId">\
                            <option v-for="unit in quantityUnits" v-bind:value="unit.id" v-bind:key="unit.id">\
                                {{ unit.title }} ({{ unit.shortcut }})\
                            </option>\
                        </select>\
                        <input class="title" v-bind:class="{ error: newItem.notValidTitle }" type="text" v-model="newItem.title" maxlength="30">\
                        <button class="button-base" v-on:click="$emit(\'add-item\')">Ulož</button>\
                    </div>\
                </transition>\
            </div>\
        </div>\
    '
}

var componentListItem = {
    props: ['item', 'quantityUnits'],
    template: '\
        <tr v-bind:class="{ \'item-done\': item.isChecked }">\
            <td class="col-check">\
                <span class="item-check" v-bind:class="{ checked: item.isChecked }" v-on:click="$emit(\'check-item\', item)"></span>\
            </td>\
            <td>\
                <input class="number"  v-bind:class="{ error: item.notValidNumber }" type="number" v-if="item.isEdit" v-model="item.number" min="1" max="999">\
                <span class="item-number" v-else>{{ item.number }}</span>\
            </td>\
            <td>\
                <select v-bind:class="{ error: item.notValidUnitId }" v-model="item.unitId" v-if="item.isEdit">\
                    <option v-for="unit in quantityUnits" v-bind:value="unit.id" v-bind:key="unit.id">\
                        {{ unit.title }} ({{ unit.shortcut }})\
                    </option>\
                </select>\
                <span class="item-unit" v-else>{{ quantityUnits[item.unitId].shortcut }}</span>\
            </td>\
            <td>\
                <input class="title" v-bind:class="{ error: item.notValidTitle }" type="text" v-if="item.isEdit" v-model="item.title" maxlength="30">\
                <span class="item-title" v-else>{{ item.title }}</span>\
            </td>\
            <td class="col-edit">\
                <span class="item-edit" v-bind:class="{ save: item.isEdit }" v-on:click="$emit(\'edit-item\', item)" title="Upravit"></span>\
            </td>\
            <td class="col-del">\
                <span class="item-del" v-on:click="$emit(\'delete-item\', item)" title="Smazat"></span>\
            </td>\
        </tr>\
    '
}

var componentStatBox = {
    props: ['itemsCheckedNumber' , 'itemsNumber'],
    template: '\
        <div class="stat-box">\
            <span>hotovo: {{ itemsCheckedNumber }} / {{ itemsNumber }}</span>\
        </div>\
    '
}


var shoppingList = new Vue ({
    el: '#shopping-list',
    components: {
        'add-form': componentAddForm,
        'list-item': componentListItem,
        'stat-box': componentStatBox
    },
    data: {
        showAdd: false,
        newItem: {            
            number: 0,
            unitId: 0,
            title: '',
            notValidNumber: false,
            notValidUnitId: false,
            notValidTitle: false,
        },
        quantityUnits: [
            { id: 0, title: 'Kus', shortcut: 'ks' },
            { id: 1, title: 'Balení', shortcut: 'bal' },
            { id: 2, title: 'Kilogram', shortcut: 'kg' },
            { id: 3, title: 'Gram', shortcut: 'g' },
            { id: 4, title: 'Litr', shortcut: 'l' },
            { id: 5, title: 'Mililitr', shortcut: 'ml' }
        ],
        items: [

        ],
    },
    mounted: function () {
        if (localStorage.getItem('items')) {
            try {
                this.items = JSON.parse(localStorage.getItem('items'));
            } catch (e) {
                localStorage.removeItem('items');
            }
        } else {
            this.localStorageDefData(); 
        }
    },
    computed: {
        itemsNumber: function () {
            return this.items.length;
        },
        itemsCheckedNumber: function () {
            let number = 0;

            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].isChecked === true) {
                    number++;
                }
            }

            return number;
        }
    },
    methods: {
        addToggle: function () {
            this.showAdd = !this.showAdd;
            this.newItem.number = 1;
            this.newItem.unitId = 0;            
            this.newItem.title = '';
            this.newItem.notValidNumber = false;
            this.newItem.notValidUnitId = false;
            this.newItem.notValidTitle = false;
        },
        addItem: function () {
            let item = {};

            this.newItem.notValidNumber = this.validateNumber(this.newItem.number);
            this.newItem.notValidUnitId = this.validateUnitId(this.newItem.unitId);
            this.newItem.notValidTitle = this.validateTitle(this.newItem.title);

            if (this.newItem.notValidNumber === false && this.newItem.notValidUnitId === false && this.newItem.notValidTitle === false) {
                item.id = this.items.length + 1;
                item.unitId = this.newItem.unitId;
                item.number = this.newItem.number;
                item.title = this.newItem.title;
                item.isChecked = false;
                item.isEdit = false;
                item.notValidNumber = false; 
                item.notValidUnitId = false; 
                item.notValidTitle = false;

                this.items.push(item);
                this.addToggle();        // hide and form reset
                this.localStorageSave();
            }           
        },
        checkItem: function (item) {
            item.isChecked = !item.isChecked;
            this.localStorageSave();
        },
        editItem: function (item) {
            if (item.isEdit === true) {
                // validate
                item.notValidNumber = this.validateNumber(item.number);
                item.notValidUnitId = this.validateUnitId(item.unitId);
                item.notValidTitle = this.validateTitle(item.title);
            }

            if (item.notValidNumber === false && item.notValidUnitId === false && item.notValidTitle === false) {
                item.isEdit = !item.isEdit;
                this.localStorageSave();
            }
        },        
        deleteItem: function (item) {
            let index = this.items.indexOf(item);            
            this.items.splice(index, 1);
            this.localStorageSave();          
        },
        localStorageSave: function () {
            if (this.items.length > 0) {
                let itemsJson = JSON.stringify(this.items);
                localStorage.setItem('items', itemsJson);
            }
        },
        localStorageReset: function () {            
            if (localStorage.getItem('items')) {
                try {
                    localStorage.removeItem('items');
                } catch (e) {
                    
                }
            }
            this.items.splice(0, this.items.length);
            this.localStorageDefData();
        },
        localStorageDefData: function () {
            // data from file
            let self = this;
            let myRequest = new Request("./data/data.json");
            fetch(myRequest)
                .then (function (resp) {
                    //console.log(resp);
                    return resp.json();
                })
                .then (function (data) {
                    //console.log(data);                  
                    for (item of data.items) {                        
                        self.items.push(item);
                    }
                })
        },
        validateNumber: function (number) {
            if (number <= 0 || number > 999) {
                return true;
            } else {
                return false;
            }            
        },
        validateUnitId: function (unitId) {
            if (unitId < 0) {
                return true;
            } else {
                return false;
            }  
        },
        validateTitle: function (title) {
            if (title === '') {
                return true;
            } else {
                return false;
            }  
        }

    }
})