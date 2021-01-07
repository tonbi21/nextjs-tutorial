import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'

// 外部API取得のためのモジュール
import fetch from 'node-fetch'
const base64 = require('js-base64').Base64;

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as { date: string; title: string })
    }
  })

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

// ローカルディレクトリのファイルから取得する場合
// export function getAllPostIds() {
//   const fileNames = fs.readdirSync(postsDirectory)

//   // Returns an array that looks like this:
//   // [
//   //   {
//   //     params: {
//   //       id: 'ssg-ssr'
//   //     }
//   //   },
//   //   {
//   //     params: {
//   //       id: 'pre-rendering'
//   //     }
//   //   }
//   // ]
//   return fileNames.map(fileName => {
//     return {
//       params: {
//         id: fileName.replace(/\.md$/, '')
//       }
//     }
//   })
// }


// ローカルディレクトリのファイルから取得する場合
// export async function getPostData(id: string) {
//   const fullPath = path.join(postsDirectory, `${id}.md`)
//   const fileContents = fs.readFileSync(fullPath, 'utf8')

//   // Use gray-matter to parse the post metadata section
//   const matterResult = matter(fileContents)

//   // Use remark to convert markdown into HTML string
//   const processedContent = await remark()
//     .use(html)
//     .process(matterResult.content)
//   const contentHtml = processedContent.toString()

//   // Combine the data with the id and contentHtml
//   return {
//     id,
//     contentHtml,
//     ...(matterResult.data as { date: string; title: string })
//   }
// }



// 外部APIから取得する方法
export async function getAllPostIds() {
  // URLの取得
  const repoUrl ="https://api.github.com/repos/tonbi21/nextjs-tutorial/contents/posts"
  
  // URLの実行
  const response = await fetch(repoUrl)
  // ファイルの読み取り
  const files = await response.json()
  // console.log(files)
  
  // ファイルの名前を取り出す
  const fileNames = files.map((file: { name: string }) => file.name)
  
  return fileNames.map((fileName: string) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}






export async function getPostData(id: string) {
  // 取得したidのURLを取得
  const repoUrl =`https://api.github.com/repos/tonbi21/nextjs-tutorial/contents/posts/${id}.md`

  // URLの実行
  const response = await fetch(repoUrl)
  // ファイルの読み取り
  const file = await response.json()
  const fileContents = base64.decode(file.content)

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string })
  }
}


