const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  
  const result = await graphql(`
    query {
        categories: allMarkdownRemark(filter: {frontmatter: {type: {eq: "category"}}}) {
            nodes {
                fields {
                    slug
                }
                parent {
                    ... on File {
                      name
                      relativeDirectory
                    }
                  }
                }
            }
        rules: allMarkdownRemark(filter: {frontmatter: {type: {nin: ["category","top_category","main"]}}}) {
            nodes {
                fields {
                    slug
                }
                frontmatter {
                    folder
                }
            }
        }
    }
  `)

  const categoryTemplate = require.resolve(`./src/templates/category.js`)
  const ruleTemplate = require.resolve('./src/templates/rule.js')

  result.data.categories.nodes.forEach(node => {
    createPage({
        path: node.parent.name,
        component: categoryTemplate,
        context: {
            slug: node.fields.slug,
        },
    })
  })

  result.data.rules.nodes.forEach(node => {
    createPage ({
      path: node.frontmatter.folder,
      component: ruleTemplate,
      context: {
        slug: node.fields.slug,
      }
    })
  })
}