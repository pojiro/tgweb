import { slash } from "./slash.mjs"
import { updateSiteData } from "./update_site_data.mjs"
import getType from "./get_type.mjs"
import { updateHTML } from "./update_html.mjs"
import { dbg, pp } from "./debugging.mjs"
import * as PATH from "path"
import fs from "fs"
import { generateTailwindConfig } from "./generate_tailwind_config.mjs"

// Prevent warnings when functions dbg and pp are not used.
if (dbg === undefined) { dbg() }
if (pp === undefined) { pp() }

const update = (path, siteData) => {
  updateSiteData(siteData, path)

  const type = getType(path)

  if (type === "page") {
    updateHTML(path, siteData)
  }
  else if (type === "article") {
    updateHTML(path, siteData)

    const name = slash(path).replace(/^src\//, "").replace(/\.html$/, "")

    siteData.pages
      .filter(page => page.dependencies.includes(name))
      .forEach(page => updateHTML("src/pages/" + page.path, siteData))
  }
  else if (type == "site.yml") {
    siteData.pages.forEach(page => updateHTML("src/pages/" + page.path, siteData))
    siteData.articles.forEach(article => updateHTML("src/articles/" + article.path, siteData))
  }
  else if (type == "color_scheme.yml") {
    const tailwindConfig = generateTailwindConfig(PATH.dirname(path))
    if (tailwindConfig) fs.writeFileSync("tailwind.config.js", tailwindConfig)
    if (process.env.VERBOSE) console.log(`Updated tailwind.config.js`)
  }
  else {
    const name = slash(path).replace(/^src\//, "").replace(/\.html$/, "")

    siteData.pages
      .filter(page => page.dependencies.includes(name))
      .forEach(page => updateHTML("src/pages/" + page.path, siteData))

    siteData.articles
      .filter(article => article.dependencies.includes(name))
      .forEach(article => updateHTML("src/articles/" + article.path, siteData))
  }
}

export { update }
