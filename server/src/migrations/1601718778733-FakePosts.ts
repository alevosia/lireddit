import { MigrationInterface, QueryRunner } from 'typeorm'
import { readFilePromise } from '../utils/readFilePromise'

import path from 'path'

export class FakePosts1601718778733 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const sqlPath = path.join(__dirname, './post.sql')

            console.log({ sqlPath })

            const sql = await readFilePromise(sqlPath)
            queryRunner.query(sql)
        } catch (error) {
            console.error(error)
        }
    }

    public async down(_: QueryRunner): Promise<void> {}
}
