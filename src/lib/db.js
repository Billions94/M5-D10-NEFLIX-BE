import fs from 'fs-extra'
import { fileURLToPath } from "url";
import { dirname, join, } from 'path'

const { readJSON, writeJSON, writeFile, createReadStream } = fs 

export const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), '../data')

// export const publicFolderPath = join(process.cwd(), './public/img/post')
// console.log(publicFolderPath)



export const mediaJSONPath = join(dataFolderPath, 'media.json')
console.log(mediaJSONPath)

// READING THE PATH OF OUR JSON FILE ON THE DISK
export const getMedia = () => readJSON(mediaJSONPath)
// WRITING BACK TO OUR JSON FILE ON THE DISK
export const writeMedia = content => writeJSON(mediaJSONPath, content)
// WRITING TO OUR LOCAL PUBLIC FOLDER WHERE WE WANT TO SAVE THE IMAGE
export const savePostImg = (fileName, contentAsBuffer) => writeFile(join(publicFolderPath, fileName), contentAsBuffer)
// CREATING A READABLE STREAM FROM OUR JSON FILE ON THE DISK 
export const getMediaReadableStream = () => createReadStream(mediaJSONPath)