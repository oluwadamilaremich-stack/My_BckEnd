const express = require('express')

const app = express()

app.use(express.json())

let data = [
    {"site": "Github", "username": "dev_user", "password": "supersecretpassword", "last used": "22/07/2026"},
    {"site": "Facebook", "username": "johnpaul111", "password": "password123", "last used": "2/07/2026"},
    {"site": "Twitter", "username": "adajohnson", "password": "password123456", "last used": "14/07/2026"},
]

app.get("/", checkAuth, (req, res) => {
    res.json(data)
})

function checkAuth(req, res, next) {
    const auth_Key = req.headers['x-vault-key']
    if (auth_Key === "12345") {
        next()
    } else {
        res.status(401).json({ message: "Unauthorized" })
    }
}

app.get("/:site", checkAuth, (req, res) => {
    const sitename = req.params.site

    const siteData = data.find(item => item.site.toLowerCase() === sitename.toLowerCase())

    if (siteData) {
        res.json(siteData)
    } else {
        res.status(404).json({ message: "Site not found" })
    }
})

app.put("/:site", checkAuth, (req, res) => {
    const sitename = req.params.site
    const { username, password, lastUsed } = req.body

    const siteIndex = data.findIndex(item => item.site.toLowerCase() === sitename.toLowerCase())

    if (siteIndex !== -1) {
        data[siteIndex].username = username
        data[siteIndex].password = password
        res.json({ message: "Site updated successfully" })
    } else {
        res.status(404).json({ message: "Site not found" })
    }
})

app.delete("/:site", checkAuth, (req, res) => {
    const sitename = req.params.site

    const siteIndex = data.findIndex(item => item.site.toLowerCase() === sitename.toLowerCase())

    if (siteIndex !== -1) {
        const deletedSite = data.splice(siteIndex, 1)
        res.json({ message: "Site deleted successfully", deletedSite })
    } else {
        res.status(404).json({ message: "Site not found" })
    }
})

app.post("/", addDate, (req, res) => {
    const { site, username, password } = req.body
    data.push({ site, username, password, "last used": new Date().toLocaleDateString() })
})

function addDate(req, res, next) {
    req.body["last used"] = new Date().toLocaleDateString()
    next()
}

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})