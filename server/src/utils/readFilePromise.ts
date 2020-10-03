import fs from 'fs'

export const readFilePromise = (path: string) =>
    new Promise<string>((resolve, reject) => {
        fs.readFile(path, (error, data) => {
            if (error) {
                return reject(error)
            }

            if (!data) {
                return reject(new Error('No data'))
            }

            console.log({ data })

            resolve(data.toString())
        })
    })
