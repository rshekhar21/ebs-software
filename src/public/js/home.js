
import { initLocaldb } from './_localdb.js';
import { jq, log, doc, create, isRestricted, quickData, controlBtn, Storage} from './help.js';
import list from './home-list.js';
import { icons } from './svgs.js';
doc.addEventListener('DOMContentLoaded', function () {
    loadMenuItems(list);
    jq('#search').keyup(function () {
        let arr = filterList(list, this.value);
        loadMenuItems(arr)
    })
    initLocaldb();

    controlBtn({ 
        home: false,
        buttons: [
            {
                title: 'Refresh',
                icon: '<i class="bi bi-arrow-clockwise"></i>',
                cb: () => this.location.reload(),
            },
            {
                title: 'Signout',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>',
                cb: ()=> this.location.href = '/signout'
            }
        ]
    })

})

// list view
function showList(list) {
    try {
        jq('ul').html('');
        for (let k of list) {
            let link = create('a');
            link.href = k.url;
            jq(link).addClass('list-group-item list-group-item-action d-flex jcb aic').text(k.name);
            if (k.hidden) jq(link).addClass('d-none');
            // jq(link).append(`<span class="material-symbols-outlined">${k.icon}</span>`);
            jq(link).append(`<span class="fs-4">${k.bsicon}</span>`);
            jq('ul.menu-list').append(link);
        }
    } catch (error) {
        log(error);
    }
}

// box view
async function loadMenuItems1(list) {
    try {
        jq('div.menu-items').html('');
        let { version } = await quickData('/version'); //fetching data from api (quickData is defined in the help.js file)
        for (let k of list) {
            let icon = jq('<span></span>').addClass('fs-4').html(k.bsicon);
            let name = jq('<span></span>').addClass('fs-6').text(k.name);
            let content = jq('<div></div>').addClass('card-content d-flex flex-column jcc aic gap-1').append(icon, name);
            let card = jq('<div></div>').addClass(`ebs-card position-relative role-btn ${k.class}`).append(content);
            let padlock = jq('<span></span>').addClass('position-absolute top-0 end-0 pt-3 pe-3 fs-5').html(icons.lockDanger).prop('title', 'Available in Pro. Version only!');

            if (version !== 'pro' && k.version === 'pro') {
                jq(card).removeClass('role-btn');
                jq(content).append(padlock);
            }

            jq(card).click(async function () {
                if (k.rc) { if (await isRestricted(k.rc)) return; }
                if (version !== 'pro' && k.version === 'pro') return;
                window.location.href = k.url;
            })
            jq('div.menu-items').append(card);
        }
    } catch (error) {
        log(error);
    }
}

async function loadMenuItems(list) {
    try {
        // 1. Clear existing menu items
        jq('div.menu-items').empty(); // Use .empty() for better performance

        // 2. Fetch the app version from the API
        // const versionData = await quickData('/version'); log(versionData);
        const versionData = Storage.get('appver');
        if (!versionData || !versionData.version) {
            throw new Error("Failed to fetch app version or version is missing.");
        }
        const appVersion = versionData.version;

        // 3. Iterate through the menu item list
        for (const item of list) {
            // if(item.version == 'pro'){
            //     log(item.version, item.url)
            // }
            // 4. Create menu item elements
            const icon = jq('<span></span>').addClass('fs-4').html(item.bsicon);
            const name = jq('<span></span>').addClass('fs-6').text(item.name);
            const content = jq('<div></div>').addClass('card-content d-flex flex-column jcc aic gap-1').append(icon, name);
            const card = jq('<div></div>').addClass(`ebs-card position-relative role-btn ${item.class}`).append(content).prop('title', item.title);
            const padlock = jq('<span></span>').addClass('position-absolute top-0 end-0 pt-3 pe-3 fs-5').html(icons.lockDanger).prop('title', 'Available in Pro. Version only!');

            // 5. Apply lock logic based on app version and item version
            if (appVersion !== 'pro' && item.version === 'pro') {
                card.removeClass('role-btn');
                content.append(padlock);
            }

            // 6. Attach click event handler
            card.click(async function () {
                try {
                    // 7. Check for restrictions (if any)
                    if (item.rc && await isRestricted(item.rc)) {
                        return;
                    }

                    // 8. Check version again before navigating
                    if (appVersion !== 'pro' && item.version === 'pro') {
                        return;
                    }

                    // 9. Navigate to the item's URL
                    window.location.href = item.url;
                } catch (clickError) {
                    log(`Error handling click for ${item.name}:`, clickError);
                }
            });

            // 10. Append the card to the menu items container
            jq('div.menu-items').append(card);
        }
    } catch (error) {
        log("Error loading menu items:", error);
    }
}

function filterList(data, searchKeyword) {
    // Filter out the objects based on the search keyword
    const filteredObjects = data.filter(obj => {
        // Check if the object's key matches the search keyword
        return obj.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });

    // Extract keys from the filtered objects
    const filteredKeys = filteredObjects.map(obj => obj);

    return filteredKeys;
}

// material symbol example
{/* <span class="material-symbols-outlined">home</span> */ }
