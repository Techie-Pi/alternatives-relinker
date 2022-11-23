console.log("Alternatives ReLinker: Enabled")

let alternatives = []
async function main() {
    browser.storage.local.get("alternatives").then(async (value) => {
        if (value == null || Object.keys(value).length === 0 || (value.alternatives != null && value.alternatives.length === 0)) {
            await setDefaultAlternatives()
            return main()
        }
        alternatives = value.alternatives

        let observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                let aNodes = []
                mutation.addedNodes.forEach(node => {
                    if (node.nodeName === "A") {
                        aNodes.push(node)
                    }

                    replaceWithAlternatives(aNodes, alternatives)
                })
            })
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
        })

        replaceWithAlternatives(Array.from(document.getElementsByTagName("a")), alternatives)
    })
}
main()

function replaceWithAlternatives(aArray, alternatives) {
    aArray.forEach(a => {
        let url = new URL(a.href)
        console.log(url.host)
        for (let alternative of alternatives) {
            for (let host of alternative.host) {
                if (url.host === host) {
                    url.host = alternative.replacementHost
                    a.href = url.href
                    break
                }
            }
        }
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
