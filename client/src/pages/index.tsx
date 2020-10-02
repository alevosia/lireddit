import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { Layout } from '../components/Layout'
import { useAllPostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index: NextPage = () => {
    const [{ fetching, data }] = useAllPostsQuery()

    return (
        <Layout>
            {fetching ? (
                <div>Loading...</div>
            ) : data ? (
                data.posts.map((p) => <div key={p.id}>{p.title}</div>)
            ) : null}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
