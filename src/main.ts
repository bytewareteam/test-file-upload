interface ISelectAttributes {
    multiple: true,
    options: { value: string, label: string }[];
}

interface IField {
    name: string;
    type: string;
    label: string;
    value?: any;
    attributes?: ISelectAttributes | any;
}

const FIELDS: IField[] = [
    {name: 'file', type: 'file', label: 'File'},
    {name: 'campaignId', type: 'number', label: 'Campaign', value: 1},
    {name: 'sort', type: 'number', label: 'Sort', value: 1},
    {name: 'formatId', type: 'number', label: 'FormatId', value: 1},
    {name: 'dateStart', type: 'date', label: 'DateStart', value: "2020-07-25"},
    {name: 'dateEnd', type: 'date', label: 'DateEnd', value: "2020-07-25"},
    {name: 'views', type: 'number', label: 'Views', value: 5000},
    {name: 'targetUrl', type: 'text', label: 'TargetUrl', value: "http://www.example.com"},
    {
        name: 'digitalPropertiesIds',
        type: 'select',
        label: 'DigitalPropertiesIds',
        attributes: {
            multiple: true,
            options: [
                {value: 1, label: 'El Tiempo', selected: true},
                {value: 2, label: 'Portafolio', selected: true}
            ]
        }
    },
    {name: 'displayId', type: 'number', label: 'DisplayId', value: 1},
];

function send(form: FormData) {
    return fetch("http://localhost:3000/create-advertising", {
        "method": "POST",
        body: form
    })
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.error(err);
        });
}

function makeField({type, name, label, value, attributes}: IField): HTMLDivElement {
    const container = document.createElement('div');
    container.classList.add('column', 'is-4')
    const div = document.createElement('div');
    div.classList.add("field");
    container.append(div)
    const id = 'field:' + name;
    let field = '';
    switch (type) {
        case 'select':
            const options = attributes.options.map(i => {
                return `<option value="${i.value}" ${i.selected ? 'selected' : ''}>${i.label}</option>`;
            }).join('\n');
            attributes.multiple
            field = `
              <label class="label" for="${id}">${label}</label>
              <div class="control">
                <div id="${id}" class="select">
                  <select name="${name}" ${attributes.multiple ? 'multiple' : ''}>
                    ${options}
                  </select>
                </div>
              </div>
            `;
            break;
        default:
            field = `
              <label class="label" for="${id}">${label}</label>
              <div class="control">
                <input id="${id}" class="input" type="${type}" name="${name}" placeholder="${label}" 
                    ${value ? ('value='+ value) : ''}>
              </div>
            `;
            break;
    }
    div.innerHTML = field;
    return container;
}

function makeButtons() {
    const div = document.createElement('div');
    div.classList.add("field", "is-grouped");
    div.innerHTML = `
      <div class="control">
        <button class="button is-link">Submit</button>
      </div>
      <div class="control">
        <button class="button is-link is-light">Cancel</button>
      </div>
    `;
    return div;
}

function makeForm(name: string) {
    const fields = FIELDS.map(value => makeField(value));
    const form = document.createElement('form');
    form.classList.add('columns', 'is-multiline')
    form.name = name;
    fields.forEach(f => form.appendChild(f));
    form.append(makeButtons());
    return form;
}

function fileToBase64(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function dataURLtoFile(dataUrl, filename) {
    return fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => new File([blob], filename, {type: blob.type}))
}

async function submit(ev: Event) {
    try {
        ev.preventDefault();
        const formData = new FormData(ev.target as HTMLFormElement);
        formData.set('dateStart', new Date(formData.get('dateStart') as string).toISOString())
        formData.set('dateEnd', new Date(formData.get('dateEnd') as string).toISOString())
        const file = formData.get('file') as File;
        const fileB64 = await fileToBase64(file);
        const newFile = await dataURLtoFile(fileB64, file.name);
        formData.set('file', newFile, newFile.name)
        console.log(formData);
        await send(formData);
    } catch (e) {
        console.error(e);
    }
}

function init() {
    const container = document.querySelector<HTMLElement>('#app');
    const form = makeForm('upload');
    container.append(form);
    form.addEventListener('submit', submit);
}

init();