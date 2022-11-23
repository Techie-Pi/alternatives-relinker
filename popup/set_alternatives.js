async function main() {
    let value = await browser.storage.local.get("alternatives")
    if (value == null || Object.keys(value).length === 0 || (value.alternatives != null && value.alternatives.length === 0)) {
        await setDefaultAlternatives()
        return main()
    }

    let alternatives = value.alternatives
    document.getElementById("current-alternatives").innerHTML = `
    <ul>
        ${(() => {
        let returnValue = ""
        alternatives.forEach(alternative => {
            returnValue += `
            <li class="list-element">
                <b>Name:</b> <code>${alternative.name}</code><br>
                <b>Replacement host:</b> <code>${alternative.replacementHost}</code><br>
                <b>Service hosts:</b> <code>${alternative.host.join(", ")}</code><br>
                <button class="remove remove-${alternative.replacementHost}">Remove</button>
            </li>
            `
        })
        return returnValue
        })()}
    </ul>
    `

    Array.from(document.getElementsByClassName("remove")).forEach(button => {
        button.addEventListener("click", () => {
            remove(Array.from(button.classList).filter(v => v !== "remove" && v.startsWith("remove-"))[0].replace("remove-", ""))
                .then(() => {
                    main()
                })
            button.remove()
        })
    })
}

document.getElementById("add-alternative").addEventListener("click", () => {
    let {value: name} = document.getElementById("input-name")
    let {value: serviceHosts} = document.getElementById("input-service")
    let {value: replacementHost} = document.getElementById("input-alternative")

    if (name !== "" && replacementHost !== "" && serviceHosts !== "") {
        add({
            name,
            host: serviceHosts.split(","),
            replacementHost,
        }).then(main)
    }
})

async function remove(replacementHost) {
    let value = await browser.storage.local.get("alternatives")
    let alternatives = value.alternatives

    await browser.storage.local.set({
        alternatives: alternatives.filter(v => v.replacementHost !== replacementHost)
    })
}

async function add(newValue) {
    let value = await browser.storage.local.get("alternatives")
    let alternatives = value.alternatives
    alternatives.push(newValue)

    await browser.storage.local.set({
        alternatives,
    })
}

async function setDefaultAlternatives() {
    await browser.storage.local.set({
        alternatives: [
            {
                name: "YouTube to CloudTube",
                host: ["youtube.com", "www.youtube.com"],
                replacementHost: "tube.cadence.moe",
            },
            {
                name: "Twitter to Nitter",
                host: ["www.twitter.com", "twitter.com"],
                replacementHost: "nitter.at"
            },
            {
                name: "Reddit to Libreddit",
                host: ["old.reddit.com", "reddit.com", "www.reddit.com"],
                replacementHost: "reddit.beparanoid.de"
            }
        ]
    })
}

main()
