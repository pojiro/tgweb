import assert from "node:assert/strict"
import { getSiteData, updateSiteData } from "../../lib/tgweb/get_site_data.mjs"
import { fileURLToPath } from "url";
import * as PATH from "path"

const __dirname = PATH.dirname(fileURLToPath(import.meta.url))

describe("getSiteData", () => {
  it("should interpret the front matter correctly", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_0")
    const siteData = getSiteData(wd)

    const page = siteData.pages.find(page => page.path == "index.html")

    assert.equal(page.frontMatter["layout"], "home")
    assert.equal(page.frontMatter["title"], "Home")
    assert.equal(page.frontMatter["property-fb:app_id"], "0123456789abced")

    assert.equal(page.frontMatter["property-og:image"],
      "http://localhost:3000/images/icons/default.png")
  })

  it("should make the page front matter inherit site and wrapper properties", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    const page = siteData.pages.find(page => page.path == "index.html")

    assert.equal(page.frontMatter["layout"], "home")
    assert.equal(page.frontMatter["title"], "FizzBuzz")
    assert.equal(page.frontMatter["data-current-year"], 2023)
  })

  it("should interpret the class aliases correctly", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_2")
    const siteData = getSiteData(wd)

    const page = siteData.pages.find(page => page.path == "index.html")

    assert.equal(page.frontMatter["class-h3"], "font-bold text-lg ml-2")
    assert.equal(page.frontMatter["class-three-cols"],
      "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3")
  })

  it("should return the site data with articles", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    assert.equal(siteData.articles.length, 7)
  })

  it("should make the article front matter inherit site and wrapper properties", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    const article = siteData.articles.find(article => article.path == "blog/a.html")

    assert.equal(article.frontMatter["layout"], "blog_article")
    assert.equal(article.frontMatter["title"], "Y")
    assert.equal(article.frontMatter["data-current-year"], 2023)
    assert.equal(article.frontMatter["property-og:image"],
      "http://localhost:3000/images/red_square.png")
  })

  it("should return the site data with dependencies", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    const layout = siteData.layouts.find(layout => layout.path == "home.html")
    assert.equal(layout.dependencies.length, 3)

    const page = siteData.pages.find(page => page.path == "index.html")

    assert.equal(page.dependencies.length, 5)
    assert(page.dependencies.includes("pages/_wrapper"))
    assert(page.dependencies.includes("layouts/home"))
    assert(page.dependencies.includes("components/nav"))
    assert(page.dependencies.includes("components/hello"))
    assert(page.dependencies.includes("components/i_am"))

    const article = siteData.articles.find(article => article.path == "blog/a.html")

    assert.equal(article.dependencies.length, 3)
    assert(article.dependencies.includes("articles/blog/_wrapper"))
    assert(article.dependencies.includes("layouts/blog_article"))
    assert(article.dependencies.includes("components/blog_nav"))
  })

  it("should return the site data with wrappers", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    assert.equal(siteData.wrappers.length, 2)

    const wrapper = siteData.wrappers[0]
    assert.equal(wrapper.frontMatter["data-current-year"], 2023)
  })

  it("should return the site data with site properties", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    assert.equal(siteData.properties["title"], "No Title")
    assert.equal(siteData.properties["data-current-year"], 2023)
  })

  it("should return the site data with Japanese text", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_2")
    const siteData = getSiteData(wd)

    const page = siteData.pages.find(page => page.path == "index_ja.html")
    assert.equal(page.frontMatter["title"], "ホーム")

    const comp = siteData.components.find(comp => comp.path == "world.html")

    assert(comp.dom.window.document.body.outerHTML.includes("世界"))
  })
})

describe("updateSiteData", () => {
  it("should update the site date of an article", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    process.chdir(wd + "a")

    updateSiteData(siteData, "src/articles/culture.html")

    const article = siteData.articles.find(a => a.path === "culture.html")
    assert(article)
    assert(article.dom)

    assert.equal(article.frontMatter["class-div1"], "bg-red-100 py-2")
  })

  it("should update the site date of a wrapper", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    process.chdir(wd + "a")

    updateSiteData(siteData, "src/pages/_wrapper.html")

    const wrapper = siteData.wrappers.find(w => w.path === "pages/_wrapper.html")
    assert(wrapper)
    assert(wrapper.dom)

    assert.equal(wrapper.frontMatter["class-div1"], "bg-blue-100 py-2")
  })

  it("should update the site date of a component", () => {
    const wd = PATH.resolve(__dirname, "../examples/site_1")
    const siteData = getSiteData(wd)

    process.chdir(wd + "a")

    updateSiteData(siteData, "src/components/hello.html")

    const component = siteData.components.find(c => c.path === "hello.html")
    assert(component)
    assert(component.dom)

    assert.equal(component.frontMatter["class-div1"], "bg-blue-100 p-2")
  })
})
